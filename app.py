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
    lines = content.splitlines()
    query_lower = query.lower()

    # Splits de tekst in zinnen met een eenvoudige regel voor punten en vraagtekens
    sentences = re.split(r'(?<=[.!?])\s+', content) if not is_pdf else content


    # Voor PDF, loop per pagina door; voor andere bestanden, doorloop elke zin
    for page_num, page_content in enumerate(sentences if not is_pdf else content):
        context_sentences = page_content if not is_pdf else page_content.splitlines()
        
        for sentence_num, sentence in enumerate(context_sentences):
            # Check of het zoekwoord in de zin voorkomt (case-insensitive)
            if query_lower in sentence.lower():
                # Zoek naar de positie van het zoekwoord en geef een fragment rondom het woord
                start_index = max(sentence.lower().find(query_lower) - 30, 0)
                end_index = min(len(sentence), start_index + len(query) + 60)
                match_fragment = sentence[start_index:end_index].strip()

                # Voeg een match toe met pagina- of regelnummers voor PDF en DOCX
                if is_pdf:
                    matches.append(f"Pagina {page_num + 1}, regel {sentence_num + 1}: {match_fragment}")
                else:
                    matches.append(f"Regel {sentence_num + 1}: {match_fragment}")

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

