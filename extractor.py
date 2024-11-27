from docx import Document
import fitz
import logging
import re

def extract_text_from_docx(docx_file_path):
    try:
        document = Document(docx_file_path)
        paragraph_texts = [paragraph.text for paragraph in document.paragraphs]
                # Voeg ook tekst uit tabellen toe
        for table in document.tables:
            for row in table.rows:
                for cell in row.cells:
                    paragraph_texts.append(cell.text)

        full_text = "\n".join(paragraph_texts)
        return full_text
    except Exception as error:
        logging.error(f"Failed to extract text from DOCX at {docx_file_path}: {error}")
        return ""

def extract_text_from_pdf(pdf_path):
    try:
        with fitz.open(pdf_path) as pdf_document:
            page_texts = []
            for page in pdf_document:
                page_text = page.get_text("text")  # Haalt platte tekst op
                page_texts.append((page.number + 1, page_text))
            return page_texts
    except Exception as error:
        logging.error(f"Failed to extract text from PDF at {pdf_path}: {error}")
        return []

def search_in_text(content, query, is_pdf=False, search_type="exact"):
    matches = []
    query_terms = query.lower().split() if search_type != "exact" else [query.lower()]

    def process_sentences(sentences, page_num=None):
        for sentence_num, sentence in enumerate(sentences, 1):
            sentence_lower = sentence.lower()

            if search_type == "exact":
                if query_terms[0] in sentence_lower:
                    match_fragment = get_match_fragment(sentence, sentence_lower, query_terms[0])
                    add_match(match_fragment, page_num, sentence_num)
            elif search_type == "all_terms":
                if all(term in sentence_lower for term in query_terms):
                    match_fragment = get_match_fragment(sentence, sentence_lower, query_terms[0])
                    add_match(match_fragment, page_num, sentence_num)
            elif search_type == "any_term":
                for term in query_terms:
                    if term in sentence_lower:
                        match_fragment = get_match_fragment(sentence, sentence_lower, term)
                        add_match(match_fragment, page_num, sentence_num)
                        break

    def get_match_fragment(sentence, sentence_lower, term):
        start_index = sentence_lower.index(term)
        end_index = start_index + len(term)
        context_start = max(0, start_index - 30)
        context_end = min(len(sentence), end_index + 30)
        return sentence[context_start:context_end]
        
    def add_match(match_fragment, page_num, sentence_num):
        # Bepaal de match-string
        if page_num:
            match_str = f"Pagina {page_num}, Regel {sentence_num}: ...{match_fragment}..."
        else:
            match_str = f"Regel {sentence_num}: ...{match_fragment}..."

        # Controleer of de match al bestaat in de matches-lijst
        if match_str not in matches:
            matches.append(match_str)

    if is_pdf:
        for page_num, page_content in content:
            sentences = re.split(r'(?<=[.!?])\s+', page_content)
            process_sentences(sentences, page_num)
    else:
        sentences = re.split(r'(?<=[.!?])\s+', content)
        process_sentences(sentences)

    return matches