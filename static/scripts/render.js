import { highlightSearchTerm } from './utils.js';
import { openFileOrLocation } from './fileActions.js';


export function renderResults(searchResults) {
    const resultsDiv = document.getElementById("results");
    const sortButton = document.getElementById("sort-button");
    
    resultsDiv.innerHTML = "";

    if (!searchResults || searchResults.length === 0) {
        resultsDiv.innerHTML = "<p>No results found.</p>";
        sortButton.style.display = "none";
        return;
    }
    
    sortButton.style.display = "block";

    searchResults.forEach(searchResult => {
        const resultItem = document.createElement("div");
        resultItem.classList.add("result-item");

        const pathElement = document.createElement("h1");
        pathElement.classList.add("result-title");
        pathElement.textContent = `File: ${searchResult.path}`;
        pathElement.addEventListener("click", () => {
            openFileOrLocation(searchResult.path, "location");
        });
        resultItem.appendChild(pathElement);

        const fileNameElement = document.createElement("p");
        fileNameElement.classList.add("result-path");
        fileNameElement.textContent = `Bestand: ${searchResult.filename}`;
        fileNameElement.addEventListener("click", () => {
            openFileOrLocation(searchResult.path, "file");
        });
        resultItem.appendChild(fileNameElement);

        const dateModifiedElement = document.createElement("p");
        dateModifiedElement.classList.add("result-snippet");
        dateModifiedElement.textContent = `Laatst gewijzigd: ${searchResult.date_modified}`;
        resultItem.appendChild(dateModifiedElement);

        searchResult.matches.forEach(match => {
            const matchParagraph = document.createElement("p");
            matchParagraph.innerHTML = highlightSearchTerm(match, document.getElementById("query").value);
            resultItem.appendChild(matchParagraph);
        });

        resultsDiv.appendChild(resultItem);
    });
}
