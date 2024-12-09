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
        const resultItem = document.createElement("div");
        resultItem.classList.add("result-item");

        // Create a header container for result metadata
        const resultHeader = document.createElement("div");
        resultHeader.classList.add("result-header");

        // Bestand (File Name)
        const fileNameElement = document.createElement("div");
        fileNameElement.classList.add("result-header-item");
        const fileNameLabel = document.createElement("span");
        fileNameLabel.classList.add("result-header-label");
        fileNameLabel.textContent = "Bestand:";
        const fileNameValue = document.createElement("span");
        fileNameValue.textContent = searchResult.filename;
        fileNameValue.classList.add("result-header-clickable");
        fileNameValue.addEventListener("click", () => {
            openFileOrLocation(searchResult.path, "file");
        });
        fileNameElement.appendChild(fileNameLabel);
        fileNameElement.appendChild(fileNameValue);
        resultHeader.appendChild(fileNameElement);

        // File Path
        const pathElement = document.createElement("div");
        pathElement.classList.add("result-header-item");
        const pathLabel = document.createElement("span");
        pathLabel.classList.add("result-header-label");
        pathLabel.textContent = "Path:";
        const pathValue = document.createElement("span");
        pathValue.textContent = searchResult.path;
        pathValue.classList.add("result-header-clickable");
        pathValue.addEventListener("click", () => {
            openFileOrLocation(searchResult.path, "location");
        });
        pathElement.appendChild(pathLabel);
        pathElement.appendChild(pathValue);
        resultHeader.appendChild(pathElement);

        // Last Modified
        const dateModifiedElement = document.createElement("div");
        dateModifiedElement.classList.add("result-header-item");
        const dateLabel = document.createElement("span");
        dateLabel.classList.add("result-header-label");
        dateLabel.textContent = "Laatst gewijzigd:";
        const dateValue = document.createElement("span");
        dateValue.textContent = searchResult.date_modified;
        dateModifiedElement.appendChild(dateLabel);
        dateModifiedElement.appendChild(dateValue);
        resultHeader.appendChild(dateModifiedElement);

        // Append header to result item
        resultItem.appendChild(resultHeader);

        // Container for match paragraphs
        const matchesContainer = document.createElement("div");
        matchesContainer.classList.add("matches-container");

        // Slice matches to initial number
        const initialMatches = searchResult.matches.slice(0, MAX_INITIAL_MATCHES);
        const additionalMatches = searchResult.matches.slice(MAX_INITIAL_MATCHES);

        // Render initial matches
        initialMatches.forEach(match => {
            const matchParagraph = document.createElement("p");
            matchParagraph.classList.add("match-paragraph");
            matchParagraph.innerHTML = highlightSearchTerm(match, document.getElementById("query").value);
            matchesContainer.appendChild(matchParagraph);
        });

        // Add show more/less buttons if there are additional matches
        if (additionalMatches.length > 0) {
            const toggleMatchesButton = document.createElement("button");
            toggleMatchesButton.classList.add("toggle-matches-btn");
            toggleMatchesButton.textContent = SHOW_MORE_TEXT;

            // Create a container for additional matches (initially hidden)
            const additionalMatchesContainer = document.createElement("div");
            additionalMatchesContainer.classList.add("additional-matches");
            additionalMatchesContainer.style.display = 'none';

            // Populate additional matches container
            additionalMatches.forEach(match => {
                const matchParagraph = document.createElement("p");
                matchParagraph.classList.add("match-paragraph");
                matchParagraph.innerHTML = highlightSearchTerm(match, document.getElementById("query").value);
                additionalMatchesContainer.appendChild(matchParagraph);
            });

            toggleMatchesButton.addEventListener("click", () => {
                if (toggleMatchesButton.textContent === SHOW_MORE_TEXT) {
                    // Show additional matches
                    matchesContainer.appendChild(additionalMatchesContainer);
                    additionalMatchesContainer.style.display = 'block';
                    toggleMatchesButton.textContent = SHOW_LESS_TEXT;
                } else {
                    // Hide additional matches
                    additionalMatchesContainer.style.display = 'none';
                    matchesContainer.removeChild(additionalMatchesContainer);
                    toggleMatchesButton.textContent = SHOW_MORE_TEXT;
                }
            });

            matchesContainer.appendChild(toggleMatchesButton);
        }

        resultItem.appendChild(matchesContainer);
        resultsDiv.appendChild(resultItem);
    });
}
