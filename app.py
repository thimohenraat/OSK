from flask import Flask, request, jsonify, render_template
from whoosh.index import create_in, open_dir
from whoosh.fields import Schema, TEXT, ID
from whoosh.qparser import QueryParser
import os
from docx import Document
import PyPDF2
import re

app = Flask(__name__, template_folder='templates', static_folder='static')

def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return '\n'.join(full_text)

def extract_text_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        full_text = []
        for page in reader.pages:
            full_text.append(page.extract_text())
        return '\n'.join(full_text)

def search_in_text(content, query, is_pdf):
    matches = []
    query_lower = query.lower()

    def process_sentences(sentences, page_num=None):
        for sentence_num, sentence in enumerate(sentences):
            sentence_lower = sentence.lower()
            if query_lower in sentence_lower:
                start_index = sentence_lower.index(query_lower)
                end_index = start_index + len(query_lower)
                context_start = max(0, start_index - 30)
                context_end = min(len(sentence), end_index + 30)
                match_fragment = sentence[context_start:context_end]

                if page_num is not None:
                    matches.append(f"Pagina {page_num + 1}, regel {sentence_num + 1}: ...{match_fragment}...")
                else:
                    matches.append(f"Regel {sentence_num + 1}: ...{match_fragment}...")

    if is_pdf:
        # Split PDF content into pages if it's a single string
        if isinstance(content, str):
            content = content.split('\f')  # Form feed character often separates PDF pages
        
        for page_num, page_content in enumerate(content):
            sentences = re.split(r'(?<=[.!?])\s+', page_content)
            process_sentences(sentences, page_num=page_num)
    else:
        # For DOCX and other files, treat entire content as one text block
        sentences = re.split(r'(?<=[.!?])\s+', content)
        process_sentences(sentences)

    return matches

# Whoosh-schema voor bestandsnaam en inhoud
schema = Schema(path=ID(stored=True), content=TEXT)

# Indexdirectory aanmaken als die nog niet bestaat
if not os.path.exists("indexdir"):
    os.mkdir("indexdir")
ix = create_in("indexdir", schema)

# Indexeer de documenten in de `documents/` map
writer = ix.writer()
root_dir = os.path.join(os.path.dirname(__file__), 'documents')  # Map met door te zoeken documenten

for dirpath, _, filenames in os.walk(root_dir):
    for filename in filenames:
        filepath = os.path.join(dirpath, filename)
        if filename.startswith('~$'):  # Negeer tijdelijke bestanden
            continue
        
        if filename.endswith(".docx"):
            content = extract_text_from_docx(filepath)
            writer.add_document(path=filepath, content=content)
        elif filename.endswith(".pdf"):
            content = extract_text_from_pdf(filepath)
            writer.add_document(path=filepath, content=content)
        else:
            continue  # Negeer andere bestandstypen

writer.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query_str = request.form.get("query")
    ix = open_dir("indexdir")
    results_data = []

    with ix.searcher() as searcher:
        parser = QueryParser("content", ix.schema)
        query = parser.parse(query_str)
        results = searcher.search(query)

        for result in results:
            filepath = result['path']
            if filepath.endswith(".docx"):
                content = extract_text_from_docx(filepath)
                is_pdf = False
            elif filepath.endswith(".pdf"):
                content = extract_text_from_pdf(filepath)
                is_pdf = True
            else:
                continue
            
            matches = search_in_text(content, query_str, is_pdf)
            results_data.append({"path": filepath, "matches": matches})
    
    return jsonify(results_data)

if __name__ == '__main__':
    app.run(debug=True)

