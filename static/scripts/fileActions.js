export function openFileOrLocation(filepath, action = 'file') {
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