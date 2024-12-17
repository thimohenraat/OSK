import re


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