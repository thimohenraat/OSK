import { setCurrentResults } from './state.js';
import { renderResults } from './render.js';
import { renderFileTree } from './fileTree.js';

export function handleSearchFormSubmit(event, callback) {
    event.preventDefault();
    const searchQuery = event.target.query.value.trim();

    const selectedFileTypes = Array.from(
        document.querySelectorAll('input[name="file-type"]:checked')
    ).map(checkbox => {
        let type = checkbox.value.trim().toLowerCase();
        return type.startsWith('.') ? type : `.${type}`;
    });

    const fileTypesParam = selectedFileTypes.length ? selectedFileTypes.join(',') : '';
    const searchLocation = document.getElementById("index-location").value.trim();

    const requestBody = new URLSearchParams({
        query: searchQuery,
        file_types: fileTypesParam,
        search_location: searchLocation
    });

    fetch("/search", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody
    })
    .then(response => response.text())
    .then(text => {
        try {
            return JSON.parse(text);
        } catch {
            throw new Error('Invalid JSON response');
        }
    })
    .then(data => {
        callback(data.results, data.file_structure);
        // setCurrentResults(data.results);
        // renderResults(data.results);
        // renderFileTree(data.file_structure); 
    })
    .catch(error => {
        console.error("Error during search:", error);
        alert("An error occurred during the search.");
    });
}
