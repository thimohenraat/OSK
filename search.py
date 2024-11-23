from whoosh.index import open_dir
from whoosh.qparser import QueryParser
from extractor import search_in_text
import os
import time
from extractor import extract_text_from_docx, extract_text_from_pdf

def search_files(query_str, file_types, search_location):
    ix = open_dir("indexdir")
    results_data = []

    with ix.searcher() as searcher:
        parser = QueryParser("content", ix.schema)
        query = parser.parse(query_str)
        results = searcher.search(query, limit=20)  # Geen limiet op het aantal resultaten

        for result in results:
            filepath = os.path.abspath(result['path'])  
            filename = os.path.basename(filepath)

            # Controleer of het bestand in de opgegeven map ligt
            if not filepath.startswith(os.path.abspath(search_location)):
                continue

            # Controleer bestandstypefilter
            file_extension = os.path.splitext(filepath)[-1].lower()
            # Print debugging informatie
            print(f"File Extension: {file_extension}, Selected File Types: {file_types}")

            if file_types and file_extension not in file_types:
                continue

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

    return results_data