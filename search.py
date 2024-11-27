from whoosh.index import open_dir
from whoosh.qparser import QueryParser, OrGroup, AndGroup
from whoosh.query import FuzzyTerm, Term, Or, And
from extractor import search_in_text
import os
import time
from extractor import extract_text_from_docx, extract_text_from_pdf

def search_files(query, file_extensions, directory, search_type):
    index = open_dir("indexdir")
    search_results = []
    print(search_type)

    with index.searcher() as searcher:
        # exacte tekst wordt gezocht
        if search_type == "exact":
            parser = QueryParser("content", index.schema)
            parsed_query = parser.parse(f'"{query}"')
        # alle termen moeten aanwezig zijn
        elif search_type == "all_terms": 
            parser = QueryParser("content", index.schema, group=AndGroup)
            parsed_query = parser.parse(query)
        # tenminste één term moet aanwezig zijn
        elif search_type == "any_term":
            parser = QueryParser("content", index.schema, group=OrGroup)
            parsed_query = parser.parse(query)
        else:
            raise ValueError("Ongeldig zoektype")

        found_results = searcher.search(parsed_query, limit=None)

        for result in found_results:
            file_path = os.path.abspath(result['path'])
            file_name = os.path.basename(file_path)

            if not file_path.startswith(os.path.abspath(directory)):
                continue

            ext = os.path.splitext(file_path)[-1].lower()
            if file_extensions and ext not in file_extensions:
                continue

            modification_time = os.path.getmtime(file_path)
            last_modified = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(modification_time))

            is_pdf = file_path.lower().endswith('.pdf')

            if is_pdf:
                content = extract_text_from_pdf(file_path)
            elif file_path.lower().endswith('.docx'):
                content = extract_text_from_docx(file_path)
            else:
                content = result.get('content', '')

            text_matches = search_in_text(content, query, is_pdf, search_type)
            if text_matches:
                search_results.append({
                    "path": file_path,
                    "filename": file_name,
                    "matches": text_matches,
                    "date_modified": last_modified
                })

    return search_results
