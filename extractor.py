from docx import Document
import fitz
import logging
import re

def extract_text_from_docx(docx_file_path):
    try:
        document = Document(docx_file_path)
        paragraph_texts = [paragraph.text for paragraph in document.paragraphs]
        full_text = "\n".join(paragraph_texts)
        return full_text
    except Exception as error:
        logging.error(f"Failed to extract text from DOCX at {docx_file_path}: {error}")
        return ""

def extract_text_from_pdf(pdf_path):
    try:
        with fitz.open(pdf_path) as pdf_document:
            page_texts = [(page.number + 1, page.get_text()) for page in pdf_document]
            return page_texts
    except Exception as error:
        logging.error(f"Failed to extract text from PDF at {pdf_path}: {error}")
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
            process_sentences(sentences, page_num)
    else:
        sentences = re.split(r'(?<=[.!?])\s+', content)
        process_sentences(sentences)

    return matches