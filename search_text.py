import re


def search_in_text(content, query, is_pdf=False, search_type="exact"):
    matches = []
    query_terms = query.lower().split() if search_type != "exact" else [query.lower()]

    def process_sentences(sentences, page_num=None):
        for sentence_num, sentence in enumerate(sentences, 1):
            sentence_lower = sentence.lower()

        if search_type == "exact":
            if query_terms[0] in sentence_lower:
                short_fragment, full_fragment = get_match_fragment(sentence, sentence_lower, query_terms[0])
                add_match(short_fragment, full_fragment, page_num, sentence_num)
        elif search_type == "all_terms":
            if all(term in sentence_lower for term in query_terms):
                short_fragment, full_fragment = get_match_fragment(sentence, sentence_lower, query_terms[0])
                add_match(short_fragment, full_fragment, page_num, sentence_num)
        elif search_type == "any_term":
            for term in query_terms:
                if term in sentence_lower:
                    short_fragment, full_fragment = get_match_fragment(sentence, sentence_lower, term)
                    add_match(short_fragment, full_fragment, page_num, sentence_num)
                    break

    def get_match_fragment(sentence, sentence_lower, term):
        start_index = sentence_lower.index(term)
        end_index = start_index + len(term)
        # Korte weergave (30 karakters vóór en na)
        short_context_start = max(0, start_index - 30)
        short_context_end = min(len(sentence), end_index + 30)
        short_fragment = sentence[short_context_start:short_context_end]

        # Volledige context (de hele zin)
        full_fragment = sentence.strip()

        return short_fragment, full_fragment
    
    def add_match(short_fragment, full_fragment, page_num, sentence_num):
        match_entry = {
            "short": f"...{short_fragment}...",
            "full": full_fragment,
            "page": page_num,
            "line": sentence_num
        }
        if match_entry not in matches:
            matches.append(match_entry)

    if is_pdf:
        for page_num, page_content in content:
            sentences = re.split(r'(?<=[.!?])\s+', page_content)
            process_sentences(sentences, page_num)
    else:
        sentences = re.split(r'(?<=[.!?])\s+', content)
        process_sentences(sentences)

    return matches