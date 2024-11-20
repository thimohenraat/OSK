export let currentResults = [];
export let sortDirection = 'desc'; // 'desc' voor nieuw naar oud, 'asc' voor oud naar nieuw

export function setCurrentResults(results) {
    currentResults = results;
}

export function getCurrentResults() {
    return currentResults;
}

// Haal de huidige sorteerrichting op
export function getSortDirection() {
    return sortDirection;
}

// Stel de sorteerrichting in (asc of desc)
export function setSortDirection(direction) {
    sortDirection = direction;
}

