let currentResults = []; // Globale variabele om de huidige resultaten bij te houden
let sortDirection = 'desc'; // 'desc' voor nieuw naar oud, 'asc' voor oud naar nieuw

document.getElementById("search-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const query = e.target.query.value;

    // Verzamel geselecteerde bestandstypen
    const selectedFileTypes = Array.from(
        document.querySelectorAll('input[name="file-type"]:checked')
    ).map(checkbox => checkbox.value);

    fetch("/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `query=${query}&file_types=${encodeURIComponent(selectedFileTypes.join(','))}`
    })
    .then(response => response.json())
    .then(data => {
        currentResults = data; // Sla de resultaten op
        sortDirection = 'desc'; // Reset de sorteerrichting
        renderResults();
    });
});

function renderResults() {
    const resultsDiv = document.getElementById("results");
    const sortButton = document.getElementById("sort-button");
    
    resultsDiv.innerHTML = "";
    
    if (currentResults.length === 0) {
        resultsDiv.innerHTML = "<p>No results found.</p>";
        sortButton.style.display = "none";
    } else {
        sortButton.style.display = "block";
        updateSortButtonText(); // Update de tekst op de sorteerknop
        currentResults.forEach(result => {
            const resultItem = document.createElement("div");
            resultItem.classList.add("result-item");

            const path = document.createElement("h3");
            path.textContent = `File: ${result.path}`;
            path.addEventListener("click", function() {
                openFileOrLocation(result.path, "location");
            });
            resultItem.appendChild(path);

            const bestand = document.createElement("h4");
            bestand.textContent = `Bestand: ${result.filename}`;
            bestand.addEventListener("click", function() {
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
    }
}

document.getElementById("sort-button").addEventListener("click", function() {
    sortByDate();
});

function sortByDate() {
    currentResults.sort((a, b) => {
        const dateA = new Date(a.date_modified);
        const dateB = new Date(b.date_modified);
        if (sortDirection === 'desc') {
            return dateB - dateA; // nieuw naar oud
        } else {
            return dateA - dateB; // oud naar nieuw
        }
    });
    
    // Wissel de sorteerrichting
    sortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    
    // Update de tekst op de sorteerknop
    updateSortButtonText();
    
    renderResults();
}

function updateSortButtonText() {
    const sortButton = document.getElementById("sort-button");
    sortButton.textContent = sortDirection === 'desc' ? 
        "Sorteer op datum (nieuw naar oud)" : 
        "Sorteer op datum (oud naar nieuw)";
}

function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function openFileOrLocation(filepath, action = 'file') {
    const endpoint = action === 'file' ? '/open-file' : '/open-file-location';
    const successMessage = action === 'file' ? 'Bestand geopend!' : 'Bestandslocatie geopend!';
    const errorMessage = action === 'file' ? 'Kon het bestand niet openen:' : 'Kon de bestandslocatie niet openen:';

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({filepath: filepath}),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(successMessage);
        } else {
            alert(`${errorMessage} ${data.error || 'Onbekende fout'}`);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert(`Er is een fout opgetreden bij het openen van ${action === 'file' ? 'het bestand' : 'de bestandslocatie'}.`);
    });
}