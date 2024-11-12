document.getElementById("search-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const query = e.target.query.value;

    fetch("/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `query=${query}`
    })
    .then(response => response.json())
    .then(data => {
        const resultsDiv = document.getElementById("results");
        
        resultsDiv.innerHTML = "";
        
        if (data.length === 0) {
            resultsDiv.innerHTML = "<p>No results found.</p>";
        } else {
            data.forEach(result => {
                console.log(result);
                
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

                result.matches.forEach(match => {
                    const matchPara = document.createElement("p");
                    matchPara.textContent = match;
                    resultItem.appendChild(matchPara);
                });

                resultsDiv.appendChild(resultItem);
            });
        }
    });
});

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