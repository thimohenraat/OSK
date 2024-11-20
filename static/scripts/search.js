import { setCurrentResults } from './state.js';
import { renderResults } from './render.js';

export function handleSearchFormSubmit(e) {
    e.preventDefault();
    const query = e.target.query.value;

    // Haal de geselecteerde bestandstypen op en voeg een punt toe als dat nodig is
    const selectedFileTypes = Array.from(
        document.querySelectorAll('input[name="file-type"]:checked')
    ).map(checkbox => {
        let value = checkbox.value.trim();
        if (!value.startsWith('.')) {
            value = '.' + value;  // Voeg punt toe als dit niet al is toegevoegd
        }
        return value;
    });

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