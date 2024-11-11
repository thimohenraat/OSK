from flask import Flask, request, jsonify, render_template
from whoosh.index import create_in, open_dir
from whoosh.fields import Schema, TEXT, ID
from whoosh.qparser import QueryParser
import os
from docx import Document
import PyPDF2
import re
import logging

app = Flask(__name__, template_folder='templates', static_folder='static')
logging.basicConfig(level=logging.INFO)

def extract_text_from_docx(docx_path):
    try:
        doc = Document(docx_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return '\n'.join(full_text)
    except Exception as e:
        logging.error(f"Error extracting text from DOCX {docx_path}: {e}")
        return ""

def extract_text_from_pdf(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            full_text = []
            for page in reader.pages:
                full_text.append(page.extract_text())
            return '\n'.join(full_text)
    except Exception as e:
        logging.error(f"Error extracting text from PDF {pdf_path}: {e}")
        return ""

def search_in_text(content, query):
    matches = []
    query_lower = query.lower()
    sentences = re.split(r'(?<=[.!?])\s+', content)

    for sentence_num, sentence in enumerate(sentences, 1):
        sentence_lower = sentence.lower()
        if query_lower in sentence_lower:
            start_index = sentence_lower.index(query_lower)
            end_index = start_index + len(query_lower)
            context_start = max(0, start_index - 30)
            context_end = min(len(sentence), end_index + 30)
            match_fragment = sentence[context_start:context_end]
            matches.append(f"Regel {sentence_num}: ...{match_fragment}...")

    return matches

def create_index(root_dir):
    schema = Schema(path=ID(stored=True), content=TEXT)
    if not os.path.exists("indexdir"):
        os.mkdir("indexdir")
    ix = create_in("indexdir", schema)
    writer = ix.writer()

    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.startswith('~$'):
                continue
            
            filepath = os.path.join(dirpath, filename)
            if filename.endswith(".docx"):
                content = extract_text_from_docx(filepath)
            elif filename.endswith(".pdf"):
                content = extract_text_from_pdf(filepath)
            else:
                continue

            if content:
                writer.add_document(path=filepath, content=content)
                logging.info(f"Indexed: {filepath}")
            else:
                logging.warning(f"Failed to index: {filepath}")

    writer.commit()
    logging.info("Indexing completed")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query_str = request.form.get("query")
    if not query_str:
        return jsonify({"error": "No query provided"}), 400

    ix = open_dir("indexdir")
    results_data = []

    with ix.searcher() as searcher:
        query = QueryParser("content", ix.schema).parse(query_str)
        results = searcher.search(query)

        for result in results:
            filepath = result['path']
            content = result.get('content', '')
            if not content:
                if filepath.endswith(".docx"):
                    content = extract_text_from_docx(filepath)
                elif filepath.endswith(".pdf"):
                    content = extract_text_from_pdf(filepath)
                else:
                    continue

            matches = search_in_text(content, query_str)
            if matches:
                results_data.append({"path": filepath, "matches": matches})

    return jsonify(results_data)

if __name__ == '__main__':
    root_dir = os.path.join(os.path.dirname(__file__), 'documents')
    create_index(root_dir)
    app.run(debug=True)
