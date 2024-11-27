import os
import time
from whoosh.index import create_in, open_dir
from whoosh.fields import Schema, TEXT, ID
from extractor import extract_text_from_docx, extract_text_from_pdf
import logging

logging.basicConfig(level=logging.INFO)

def create_index(root_dir: str) -> bool:
    """
    Create a full-text search index of all documents in the given directory tree.
    """
    if not os.path.exists(root_dir) or not os.path.isdir(root_dir):
        raise FileNotFoundError(f"Directory '{root_dir}' does not exist")

    index_dir = "indexdir"

    if not os.path.exists(index_dir):
        os.mkdir(index_dir)

    schema = Schema(path=ID(stored=True, unique=True), content=TEXT)
    index = create_in(index_dir, schema)

    writer = index.writer()

    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.startswith('~$'):
                continue

            file_path = os.path.abspath(os.path.join(dirpath, filename))

            if index.doc_count() > 0:
                existing_docs = list(index.searcher().documents(path=file_path))
                if existing_docs:
                    continue

            if filename.endswith(".docx"):
                content = extract_text_from_docx(file_path)
            elif filename.endswith(".pdf"):
                content = "\n".join([page_content for _, page_content in extract_text_from_pdf(file_path)])
            else:
                continue

            if content:
                writer.add_document(path=file_path, content=content)
            else:
                logging.warning(f"Failed to index: {file_path}")

    writer.commit()
    return True

