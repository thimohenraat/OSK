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
                    openFileLocation(result.path);
                });
                resultItem.appendChild(path);

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

function openFileLocation(filepath) {
    fetch('/open-file-location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({filepath: filepath}),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Bestandslocatie geopend!');
        } else {
            alert('Kon de bestandslocatie niet openen: ' + (data.error || 'Onbekende fout'));
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Er is een fout opgetreden bij het openen van de bestandslocatie.');
    });
}