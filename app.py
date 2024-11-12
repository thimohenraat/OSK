from flask import Flask, request, jsonify, render_template
from whoosh.index import create_in, open_dir
from whoosh.fields import Schema, TEXT, ID
from whoosh.qparser import QueryParser
import os
from docx import Document
import fitz   
import re
import logging
import subprocess
import platform
import time

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
        with fitz.open(pdf_path) as doc:
            return [(page.number + 1, page.get_text()) for page in doc]
    except Exception as e:
        logging.error(f"Error extracting text from PDF {pdf_path}: {e}")
        return []

def search_in_text(content, query, is_pdf=False):
    matches = []
    query_lower = query.lower()

    def process_sentences(sentences, page_num=None):
        for sentence_num, sentence in enumerate(sentences, 1):
            sentence_lower = sentence.lower()
            if query_lower in sentence_lower:
                start_index = sentence_lower.index(query_lower)
                end_index = start_index + len(query_lower)
                context_start = max(0, start_index - 30)
                context_end = min(len(sentence), end_index + 30)
                match_fragment = sentence[context_start:context_end]
                
                if page_num:
                    matches.append(f"Pagina {page_num}, Regel {sentence_num}: ...{match_fragment}...")
                else:
                    matches.append(f"Regel {sentence_num}: ...{match_fragment}...")

    if is_pdf:
        for page_num, page_content in content:
            sentences = re.split(r'(?<=[.!?])\s+', page_content)
            print(page_num)
            process_sentences(sentences, page_num)
    else:
        sentences = re.split(r'(?<=[.!?])\s+', content)
        process_sentences(sentences)

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
                # Voor PDF's, combineer alle pagina-inhoud tot één string
                pdf_content = extract_text_from_pdf(filepath)
                content = "\n".join([page_content for _, page_content in pdf_content])
            else:
                continue

            if content:
                # Zorg ervoor dat content een string is
                if isinstance(content, str):
                    writer.add_document(path=filepath, content=content)
                    logging.info(f"Indexed: {filepath}")
                else:
                    logging.warning(f"Skipped indexing {filepath}: content is not a string")
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
        parser = QueryParser("content", ix.schema)
        query = parser.parse(query_str)
        results = searcher.search(query)

        for result in results:
            filepath = os.path.abspath(result['path'])  # Het absolute pad
            filename = os.path.basename(filepath)

            # Haal de modificatiedatum van het bestand op
            mod_time = os.path.getmtime(filepath)
            date_modified = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(mod_time))

            is_pdf = filepath.lower().endswith('.pdf')

            if is_pdf:
                content = extract_text_from_pdf(filepath)
            elif filepath.lower().endswith('.docx'):
                content = extract_text_from_docx(filepath)
            else:
                content = result.get('content', '')

            matches = search_in_text(content, query_str, is_pdf)
            if matches:
                results_data.append({"path": filepath, "filename": filename, "matches": matches, "date_modified": date_modified})

    return jsonify(results_data)

@app.route('/open-file-location', methods=['POST'])
def open_file_location():
    data = request.json
    filepath = data.get('filepath')
    
    if filepath:
        try:
            if platform.system() == "Windows":
                os.startfile(os.path.dirname(filepath))
            elif platform.system() == "Darwin":  # macOS
                subprocess.Popen(["open", os.path.dirname(filepath)])
            else:  # Linux
                subprocess.Popen(["xdg-open", os.path.dirname(filepath)])
            return jsonify({"success": True})
        except Exception as e:
            logging.error(f"Error opening file location: {e}")
            return jsonify({"success": False, "error": str(e)}), 500
    else:
        return jsonify({"success": False, "error": "No filepath provided"}), 400
    
@app.route('/open-file', methods=['POST'])
def open_file():
    data = request.json
    filepath = data.get('filepath')
    
    if filepath:
        try:
            if platform.system() == "Windows":
                os.startfile(filepath)  # Dit opent het bestand in de standaard applicatie
            elif platform.system() == "Darwin":  # macOS
                subprocess.call(('open', filepath))
            else:  # Linux
                subprocess.call(('xdg-open', filepath))
            return jsonify({"success": True, "message": "Bestand geopend"})
        except Exception as e:
            logging.error(f"Error opening file: {e}")
            return jsonify({"success": False, "error": str(e)}), 500
    else:
        return jsonify({"success": False, "error": "Geen bestandspad opgegeven"}), 400
    
if __name__ == '__main__':
    root_dir = os.path.join(os.path.dirname(__file__), 'documents')
    create_index(root_dir)
    app.run(debug=True)


