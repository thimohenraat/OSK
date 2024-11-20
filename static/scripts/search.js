import { setCurrentResults } from './state.js';
import { renderResults } from './render.js';

export function handleSearchFormSubmit(e) {
    e.preventDefault();
    const query = e.target.query.value;

    // Verzamel geselecteerde bestandstypen
    const selectedFileTypes = Array.from(
        document.querySelectorAll('input[name="file-type"]:checked')
    ).map((checkbox) => checkbox.value);

    fetch("/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `query=${query}&file_types=${encodeURIComponent(selectedFileTypes.join(','))}`
    })
    .then(response => response.json())
    .then(data => {
        setCurrentResults(data); // Sla de resultaten op via state.js
        renderResults(data);
    });
}