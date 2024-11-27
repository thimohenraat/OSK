export function handleIndexingFormSubmit(event, callback) {
    event.preventDefault();

    const locationInput = event.target.querySelector("#index-location");
    const location = locationInput.value;

    if (!location) {
        alert("Geef een locatie op om te indexeren.");
        return;
    }

    fetch("/index", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ location }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message || "Indexering voltooid.");
                if (callback) callback(data);
            } else {
                alert(`Fout bij indexering: ${data.error || "Onbekende fout"}`);
            }
        })
        .catch(error => alert("Er is een fout opgetreden bij het indexeren."));
}

export function checkIndexStatus() {
    const locationInput = document.getElementById('index-location');
    locationInput.addEventListener('input', function() {
        const location = this.value;
        const indexButton = document.getElementById('index-button');
        if (location) {
            fetch('/check-index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location })
            })
            .then(response => response.json())
            .then(data => {
                const statusElement = document.getElementById('index-status');
                if (data.indexed) {
                    indexButton.disabled = true;
                    statusElement.textContent = `Map ${location} is al geïndexeerd.`;
                } else {
                    indexButton.disabled = false;
                    statusElement.textContent = `Map ${location} is nog niet geïndexeerd.`;
                }
            })
            .catch(error => {
                console.error("Fout bij het controleren van de indexeerstatus:", error);
            });
        }
    });
}
