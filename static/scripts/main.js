import { handleSearchFormSubmit } from './search.js';
import { sortByDate, sortByRelevance } from './sort.js';
import { renderResults } from './render.js';
import { getCurrentResults, setCurrentResults } from './state.js';
import { handleIndexingFormSubmit, checkIndexStatus  } from './index.js';
import { renderFileTree } from './fileTree.js';

document.addEventListener('DOMContentLoaded', () => {
    // Handle zoekformulier
    document.getElementById("search-form").addEventListener("submit", (e) => {
        handleSearchFormSubmit(e, (results, fileStructure) => {
            setCurrentResults(results); // Sla resultaten op
            renderResults(results); // Render zoekresultaten

            // const matchingFiles = results.map(result => result.path);
            // renderFileTree(fileStructure, matchingFiles); // Toon alleen bestanden met resultaten
        });
    });

    // Sorteeropties
    document.getElementById("sort-select").addEventListener("change", () => {
        const sortOption = document.getElementById("sort-select").value;
        let sortedResults = [...getCurrentResults()]; // Haal huidige resultaten op

        if (sortOption === "date") {
            sortedResults = sortByDate(sortedResults);
        } else if (sortOption === "relevance") {
            sortedResults = sortByRelevance(sortedResults);
        }

        renderResults(sortedResults); // Render gesorteerde resultaten
    });

    // Indexeerfunctionaliteit
    document.getElementById("index-form").addEventListener("submit", (e) => {
        handleIndexingFormSubmit(e, (data) => {
            console.log("Indexering voltooid:", data);
        });
    });

    // Controleer indexstatus
    checkIndexStatus();
});