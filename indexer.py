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
    try:
        if not os.path.exists(root_dir) or not os.path.isdir(root_dir):
            raise FileNotFoundError(f"Directory '{root_dir}' does not exist")

        index_dir = "indexdir"

        if not os.path.exists(index_dir):
            os.mkdir(index_dir)

        schema = Schema(path=ID(stored=True, unique=True), content=TEXT)

        # Create or open the index directory
        if not os.path.exists(os.path.join(index_dir, "MAIN_WRITELOCK")):
            index = create_in(index_dir, schema)
        else:
            index = open_dir(index_dir)

        # Start writing to the index
        writer = index.writer()
        searcher = index.searcher()

        try:
            for dirpath, _, filenames in os.walk(root_dir):
                for filename in filenames:
                    if filename.startswith('~$'):
                        continue

                    file_path = os.path.abspath(os.path.join(dirpath, filename))

                    # Skip files already in the index
                    if searcher.document(path=file_path):
                        logging.info(f"Skipping already indexed: {file_path}")
                        continue

                    content = None
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
            searcher.close()
            logging.info("Indexing complete.")
            return True

        except Exception as e:
            writer.cancel()
            logging.error(f"An error occurred during indexing: {e}")
            return False
        
    except Exception as e:
        logging.error(f"Critical error: {e}")
        return False

