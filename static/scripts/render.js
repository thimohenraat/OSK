import { highlightSearchTerm } from './utils.js';
import { openFileOrLocation } from './fileActions.js';

const MAX_INITIAL_MATCHES = 2;
const SHOW_MORE_TEXT = 'Toon meer resultaten';
const SHOW_LESS_TEXT = 'Toon minder resultaten';

export function renderResults(searchResults) {
    const resultsDiv = document.getElementById("results");
    const sortButton = document.getElementById("sort-button");

    if (!resultsDiv) {
        console.error("Element with id 'results' not found");
        return;
    }
    if (!sortButton) {
        console.error("Element with id 'sort-button' not found");
        return;
    }

    resultsDiv.innerHTML = "";

    if (!searchResults || searchResults.length === 0) {
        resultsDiv.innerHTML = "<p>No results found.</p>";
        return;
    }

    searchResults.forEach(searchResult => {
        const resultItem = createResultItem(searchResult);
        resultsDiv.appendChild(resultItem);
    });
}

function createResultItem(searchResult) {
    const resultItem = document.createElement("div");
    resultItem.classList.add("result-item");

    const resultHeader = createResultHeader(searchResult);
    resultItem.appendChild(resultHeader);

    const matchesContainer = createMatchesContainer(searchResult.matches);
    resultItem.appendChild(matchesContainer);

    return resultItem;
}

function createResultHeader(searchResult) {
    const resultHeader = document.createElement("div");
    resultHeader.classList.add("result-header");

    // Bestand
    resultHeader.appendChild(
        createHeaderItem("Bestand:", searchResult.filename, () =>
            openFileOrLocation(searchResult.path, "file")
        )
    );

    // Path
    resultHeader.appendChild(
        createHeaderItem("Path:", searchResult.path, () =>
            openFileOrLocation(searchResult.path, "location")
        )
    );

    // Laatst gewijzigd
    resultHeader.appendChild(
        createHeaderItem("Laatst gewijzigd:", searchResult.date_modified)
    );

    return resultHeader;
}

function createHeaderItem(labelText, valueText, onClick) {
    const headerItem = document.createElement("div");
    headerItem.classList.add("result-header-item");

    const label = document.createElement("span");
    label.classList.add("result-header-label");
    label.textContent = labelText;

    const value = document.createElement("span");
    value.textContent = valueText;
    if (onClick) {
        value.classList.add("result-header-clickable");
        value.addEventListener("click", onClick);
    }

    headerItem.appendChild(label);
    headerItem.appendChild(value);

    return headerItem;
}

function createMatchesContainer(matches) {
    const matchesContainer = document.createElement("div");
    matchesContainer.classList.add("matches-container");

    const initialMatches = matches.slice(0, MAX_INITIAL_MATCHES);
    const additionalMatches = matches.slice(MAX_INITIAL_MATCHES);

    // Voeg de eerste matches toe
    initialMatches.forEach(match => {
        matchesContainer.appendChild(createMatchParagraph(match));
    });

    // Voeg "Toon meer" functionaliteit toe als er extra matches zijn
    if (additionalMatches.length > 0) {
        const toggleMatchesButton = document.createElement("button");
        toggleMatchesButton.classList.add("toggle-matches-btn");
        toggleMatchesButton.textContent = SHOW_MORE_TEXT;

        const additionalMatchesContainer = document.createElement("div");
        additionalMatchesContainer.classList.add("additional-matches");
        additionalMatchesContainer.style.display = 'none';

        additionalMatches.forEach(match => {
            additionalMatchesContainer.appendChild(createMatchParagraph(match));
        });

        toggleMatchesButton.addEventListener("click", () => {
            const isHidden = additionalMatchesContainer.style.display === 'none';
            additionalMatchesContainer.style.display = isHidden ? 'block' : 'none';
            toggleMatchesButton.textContent = isHidden
                ? SHOW_LESS_TEXT
                : SHOW_MORE_TEXT;
        });

        matchesContainer.appendChild(toggleMatchesButton);
        matchesContainer.appendChild(additionalMatchesContainer);
    }

    return matchesContainer;
}

function createMatchParagraph(match) {
    const matchParagraph = document.createElement("p");
    matchParagraph.classList.add("match-paragraph");
    matchParagraph.innerHTML = highlightSearchTerm(match, document.getElementById("query").value);
    return matchParagraph;
}