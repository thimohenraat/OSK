export function handleIndexingFormSubmit(event, callback) {
    event.preventDefault(); // Voorkom de standaardformulieractie

    const form = event.target;
    const location = form.querySelector("#index-location").value;

    if (!location) {
        alert("Geef een locatie op om te indexeren.");
        return;
    }

    fetch('/index', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
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
    .catch(error => {
        console.error('Fout bij indexeren:', error);
        alert('Er is een fout opgetreden bij het indexeren.');
    });
}