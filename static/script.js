document.getElementById("search-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const query = e.target.query.value;
    console.log(query)

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
                const resultItem = document.createElement("div");
                resultItem.classList.add("result-item");

                const path = document.createElement("h3");
                path.textContent = `File: ${result.path}`;
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