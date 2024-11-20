import { handleSearchFormSubmit } from './search.js';
import { sortByDate } from './sort.js';
import { renderResults } from './render.js';
import { getCurrentResults, setCurrentResults  } from './state.js';

document.getElementById("search-form").addEventListener("submit", (e) => {
    handleSearchFormSubmit(e, (results) => {
        setCurrentResults(results);
        renderResults(results);
    });
});

document.getElementById("sort-button").addEventListener("click", () => {
    const sortedResults = sortByDate(getCurrentResults());
    renderResults(sortedResults);
});