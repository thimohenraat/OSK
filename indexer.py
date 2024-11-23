import os
import time
from whoosh.index import create_in, open_dir
from whoosh.fields import Schema, TEXT, ID
from extractor import extract_text_from_docx, extract_text_from_pdf
import logging

logging.basicConfig(level=logging.INFO)

def create_index(root_dir):
    if not os.path.exists(root_dir) or not os.path.isdir(root_dir):
        logging.error(f"De opgegeven map '{root_dir}' bestaat niet of is geen geldige map.")
        raise FileNotFoundError(f"De opgegeven map '{root_dir}' bestaat niet.")
    
    logging.info(f"Begin met indexeren van documenten in: {root_dir}")
    
    schema = Schema(path=ID(stored=True, unique=True), content=TEXT)

    index_dir = "indexdir"

    if not os.path.exists(index_dir):
        os.mkdir(index_dir)
        ix = create_in(index_dir, schema)
    else:
        ix = open_dir(index_dir)

    writer = ix.writer()

    with ix.searcher() as searcher:  # Open een zoekfunctie om duplicaten te controleren
        for dirpath, _, filenames in os.walk(root_dir):
            for filename in filenames:
                if filename.startswith('~$'):  # Sla tijdelijke bestanden over
                    continue
                
                filepath = os.path.abspath(os.path.join(dirpath, filename))
                
                # Controleer of dit bestand al in de index staat
                existing_docs = list(searcher.documents(path=filepath))
                if existing_docs:
                    logging.info(f"Skipped: {filepath} (already indexed)")
                    continue

                # Verwerk alleen relevante bestandstypen
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
    return True
