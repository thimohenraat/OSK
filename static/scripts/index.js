export function handleIndexingFormSubmit(event, callback) {
    event.preventDefault();

    const locationInput = event.target.querySelector("#index-location");
    const location = locationInput.value;

    if (!location) {
        alert("Geef een locatie op om te indexeren.");
        return;
    }

    return fetch("/index", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ location }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (callback) callback(data);
                return data;
            } else {
                throw new Error(data.error || "Onbekende fout");
            }
        })
        .catch(error => {
            console.error("Indexering fout:", error);
            throw error;
        });
}

export function checkIndexStatus() {
    const locationInput = document.getElementById('index-location');
    const indexButton = document.getElementById('index-button');
    const indexSection = document.querySelector('.index-section');
    const statusElement = document.getElementById('index-status');
    const nav = document.querySelector('.nav');
    const resultsDiv = document.getElementById('results');
    const queryInput = document.getElementById('query');

    let resetButton = null;
    let isProcessing = false;

    indexButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (isProcessing) return;
        
        const location = locationInput.value;

        if (!location) {
            resetUI();
            return;
        }

        try {
            isProcessing = true;
            indexButton.disabled = true;
            
            // First check if it's already indexed
            const checkResponse = await fetch('/check-index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location })
            });

            if (!checkResponse.ok) {
                throw new Error(`Server Error: ${checkResponse.status}`);
            }

            const checkData = await checkResponse.json();

            if (checkData.indexed) {
                updateUIForIndexed(location);
            } else {
                // Start indexing process
                statusElement.textContent = "De map wordt nu geïndexeerd...";
                locationInput.disabled = true;
                
                try {
                    await handleIndexingFormSubmit({ 
                        preventDefault: () => {}, 
                        target: indexButton.closest("form") 
                    });
                    
                    updateUIForIndexed(location);
                } catch (indexError) {
                    statusElement.textContent = `Fout bij indexering: ${indexError.message}`;
                    completeReset();
                }
            }
        } catch (error) {
            console.error("Error:", error);
            statusElement.textContent = "Er is een fout opgetreden.";
            completeReset();
        } finally {
            isProcessing = false;
        }
    });

    function completeReset() {
        isProcessing = false;
        indexButton.disabled = false;
        locationInput.disabled = false;
        nav.classList.remove("index-form-small");
        if (resetButton) {
            resetButton.remove();
            resetButton = null;
        }
    }

    function resetUI() {
        completeReset();
        locationInput.value = "";
        statusElement.textContent = "";

        // Reset zoekresultaten
        if (resultsDiv) {
            resultsDiv.innerHTML = "";
        }

        // Reset zoekveld
        if (queryInput) {
            queryInput.value = "";
        }

        // Reset state
        import('./state.js').then(state => {
            state.setCurrentResults([]);
            state.setSortDirection('desc');
        });
    }

    function updateUIForIndexed(location) {
        // Ensure location input retains its value
        locationInput.value = location;
        locationInput.disabled = true;
        indexButton.disabled = true;
        statusElement.textContent = `De map is geïndexeerd.`;
        nav.classList.add("index-form-small");

        if (!resetButton) {
            resetButton = document.createElement("button");
            resetButton.textContent = "Reset";
            resetButton.className = "reset-button";
            resetButton.addEventListener("click", resetUI);
            indexSection.appendChild(resetButton);
        }
    }
}