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

    // Maak reset-knop dynamisch
    let resetButton = null;

    locationInput.addEventListener('input', function () {
        const location = this.value;

        if (location) {
            fetch('/check-index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Server Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.indexed) {
                        indexButton.disabled = true;
                        statusElement.textContent = `Map ${location} is al geïndexeerd.`;

                        // Maak het formulier klein en schakel interactie uit
                        nav.classList.add('index-form-small');
                        locationInput.disabled = true;

                        // Voeg reset-knop toe als deze nog niet bestaat
                        if (!resetButton) {
                            resetButton = document.createElement('button');
                            resetButton.textContent = 'Reset';
                            resetButton.className = 'reset-button';
                            resetButton.addEventListener('click', resetForm);
                            indexSection.appendChild(resetButton);
                        }
                    } else {
                        indexButton.disabled = false;
                        statusElement.textContent = `Map ${location} is nog niet geïndexeerd.`;

                        // Herstel de interactie en verwijder de reset-knop
                        nav.classList.remove('index-form-small');
                        locationInput.disabled = false;
                        if (resetButton) {
                            resetButton.remove();
                            resetButton = null;
                        }
                    }
                })
                .catch(error => {
                    console.error("Fout bij het controleren van de indexeerstatus:", error);
                    statusElement.textContent = "Fout bij het controleren van de indexstatus.";
                });
        } else {
            // Reset status en formulierpositie als het invoerveld leeg is
            indexButton.disabled = false;
            statusElement.textContent = '';
            nav.classList.remove('index-form-small');
            locationInput.disabled = false;
            if (resetButton) {
                resetButton.remove();
                resetButton = null;
            }
        }
    });

    // Reset-functionaliteit
    function resetForm() {
        locationInput.value = '';
        locationInput.disabled = false;
        nav.classList.remove('index-form-small');
        indexButton.disabled = false;
        statusElement.textContent = '';
        if (resetButton) {
            resetButton.remove();
            resetButton = null;
        }
    }
}
