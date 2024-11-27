export function openFileOrLocation(filepath, action = 'file') {
    const isFile = action === 'file';
    const endpoint = isFile ? '/open-file' : '/open-file-location';
    const successMessage = isFile ? 'Bestand geopend!' : 'Bestandslocatie geopend!';
    const errorMessagePrefix = isFile ? 'Kon het bestand niet openen:' : 'Kon de bestandslocatie niet openen:';
    const errorMessageSuffix = `Er is een fout opgetreden bij het openen van ${isFile ? 'het bestand' : 'de bestandslocatie'}.`;

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filepath }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.success ? successMessage : `${errorMessagePrefix} ${data.error || 'Onbekende fout'}`);
    })
    .catch(() => {
        alert(errorMessageSuffix);
    });
}
