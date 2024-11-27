export function renderFileTree(structure, matchingFiles = []) {
    const fileTree = document.getElementById('file-tree');
    fileTree.innerHTML = '';

    function createTreeHTML(obj, path = '') {
        if (obj === null) return '';

        let html = '<ul>';

        for (const [key, value] of Object.entries(obj)) {
            // Sla ongewenste items zoals '.' en '..' over
            if (key === '.' || key === '..') {
                continue;
            }

            const fullPath = path ? `${path}/${key}` : key;
            let additionalClass = '';

            if (value === null) { // It's a file
                console.log(matchingFiles.some(file => key.includes(file)));
                console.log(matchingFiles);
                // Controleer of het bestand een substring bevat in matchingFiles
                if (matchingFiles.some(file => file.includes(key))) {
                    additionalClass = ' highlight';
                }
                html += `<li><span class="file${additionalClass}">${key}</span></li>`;
            } else { // It's a folder
                html += `<li><span class="folder">${key}</span>`;
                html += createTreeHTML(value, fullPath);
                html += '</li>';
            }
        }

        html += '</ul>';
        return html;
    }

    fileTree.innerHTML = createTreeHTML(structure);

    // Voeg klikgebeurtenissen toe aan mappen
    document.querySelectorAll('.folder').forEach(folder => {
        folder.addEventListener('click', function() {
            const subTree = this.nextElementSibling;
            if (subTree) {
                subTree.style.display = subTree.style.display === 'none' ? 'block' : 'none';
            }
        });
    });
}