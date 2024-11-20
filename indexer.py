import os
import time
from whoosh.index import create_in, open_dir
from whoosh.fields import Schema, TEXT, ID
from extractor import extract_text_from_docx, extract_text_from_pdf
import logging

logging.basicConfig(level=logging.INFO)

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
                pdf_content = extract_text_from_pdf(filepath)
                content = "\n".join([page_content for _, page_content in pdf_content])
            else:
                continue

            if content:
                if isinstance(content, str):
                    writer.add_document(path=filepath, content=content)
                    logging.info(f"Indexed: {filepath}")
                else:
                    logging.warning(f"Skipped indexing {filepath}: content is not a string")
            else:
                logging.warning(f"Failed to index: {filepath}")

    writer.commit()
    logging.info("Indexing completed")