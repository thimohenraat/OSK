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
    const indexButton = document.getElementById('index-button');
    const indexSection = document.querySelector('.index-section');
    const statusElement = document.getElementById('index-status');
    const nav = document.querySelector('.nav');

    locationInput.addEventListener('input', function () {
        const location = this.value;

        if (location) {
            fetch('/check-index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.indexed) {
                        indexButton.disabled = true;
                        statusElement.textContent = `Map ${location} is al geïndexeerd.`;

                        // Maak het formulier klein als de map al is geïndexeerd
                        nav.classList.add('index-form-small');
                    } else {
                        indexButton.disabled = false;
                        statusElement.textContent = `Map ${location} is nog niet geïndexeerd.`;

                        // Formulier blijft groot als de map niet is geïndexeerd
                        nav.classList.remove('index-form-small');
                    }
                })
                .catch(error => {
                    console.error("Fout bij het controleren van de indexeerstatus:", error);
                    statusElement.textContent = "Fout ij het controleren van de indexstatus.";b
                });
        } else {
            // Reset status en formulierpositie als het invoerveld leeg is
            indexButton.disabled = false;
            statusElement.textContent = '';
            nav.classList.remove('index-form-small');
        }
    });
}