import { handleSearchFormSubmit } from './search.js';
import { sortByDate } from './sort.js';
import { renderResults } from './render.js';
import { getCurrentResults, setCurrentResults  } from './state.js';
import { handleIndexingFormSubmit, checkIndexStatus } from './index.js';
import { renderFileTree } from './fileTree.js';

document.getElementById("search-form").addEventListener("submit", (e) => {
    handleSearchFormSubmit(e, (results, fileStructure) => {
        setCurrentResults(results);
        renderResults(results);

        const matchingFiles = results.map(result => result.path);

        renderFileTree(fileStructure, matchingFiles);  // Geef ook matchingFiles door
        
    });
});

document.getElementById("sort-button").addEventListener("click", () => {
    const sortedResults = sortByDate(getCurrentResults());
    renderResults(sortedResults);
});

// Indexeerfunctionaliteit
document.getElementById("index-form").addEventListener("submit", (e) => {
    handleIndexingFormSubmit(e, (data) => {
        console.log("Indexering voltooid:", data);
    });
});

// Roep de functie aan om de indexstatus te controleren
checkIndexStatus();

document.getElementById('search-form').addEventListener('submit', handleSearchFormSubmit);