import { highlightSearchTerm } from './utils.js';
import { openFileOrLocation } from './fileActions.js';


export function renderResults(results) {
    const resultsDiv = document.getElementById("results");
    const sortButton = document.getElementById("sort-button");
    
    resultsDiv.innerHTML = "";

    if (!results || results.length === 0) {
        resultsDiv.innerHTML = "<p>No results found.</p>";
        sortButton.style.display = "none";
        return;
    }

    sortButton.style.display = "block";

    // Log de resultaten om te zien wat er precies wordt doorgegeven
    console.log('Search results:', results);

    if (Array.isArray(results)) {  // Zorg ervoor dat we werken met een array
        results.forEach(result => {
            const resultItem = document.createElement("div");
            resultItem.classList.add("result-item");

            const path = document.createElement("h3");
            path.textContent = `File: ${result.path}`;
            path.addEventListener("click", () => {
                openFileOrLocation(result.path, "location");
            });
            resultItem.appendChild(path);

            const bestand = document.createElement("h4");
            bestand.textContent = `Bestand: ${result.filename}`;
            bestand.addEventListener("click", () => {
                openFileOrLocation(result.path, "file");
            });
            resultItem.appendChild(bestand);

            const dateModified = document.createElement("p");
            dateModified.textContent = `Laatst gewijzigd: ${result.date_modified}`;
            resultItem.appendChild(dateModified);

            result.matches.forEach(match => {
                const matchPara = document.createElement("p");
                matchPara.innerHTML = highlightSearchTerm(match, document.getElementById("query").value);
                resultItem.appendChild(matchPara);
            });

            resultsDiv.appendChild(resultItem);
        });
    } else {
        // Als de resultaten geen array zijn, geef dan een foutmelding
        console.error("De resultaten zijn geen array:", results);
        resultsDiv.innerHTML = "<p>Er is een probleem met de zoekresultaten.</p>";
    }
}