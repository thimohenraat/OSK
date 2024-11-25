import { setCurrentResults } from './state.js';
import { renderResults } from './render.js';

export function handleSearchFormSubmit(e, callback) {
    e.preventDefault();
    const query = e.target.query.value.trim();

    // Haal de geselecteerde bestandstypen op en voeg een punt toe als dat nodig is
    const selectedFileTypes = Array.from(
        document.querySelectorAll('input[name="file-type"]:checked')
    ).map(checkbox => {
        let value = checkbox.value.trim().toLowerCase();
        if (!value.startsWith('.')) {
            value = '.' + value;  // Voeg punt toe als dit niet al is toegevoegd
        }
        return value;
    });

    // Als geen bestandstypen zijn geselecteerd, gebruik een lege string
    const fileTypes = selectedFileTypes.length > 0 ? selectedFileTypes.join(',') : '';

    // Haal de zoeklocatie op van het invoerveld
    const searchLocation = document.getElementById("index-location").value.trim();

    const body = new URLSearchParams({
        query,
        file_types: fileTypes,
        search_location: searchLocation
    });

    console.log('Request Body:', body);

    fetch("/search", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body
    })
    .then(async response => {
        console.log('Response Status:', response.status);
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (err) {
            console.error('Failed to parse response:', text);
            throw new Error('Invalid JSON response');
        }
    })
    .then(data => {
        console.log('Response Data:', data);
        
        setCurrentResults(data); // Sla de resultaten op via state.js
        renderResults(data);
    })
    .catch(error => {
        console.error("Error during search:", error);
        alert("Er is een fout opgetreden bij de zoekopdracht.");
    });
}