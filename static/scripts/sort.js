import { getCurrentResults, setCurrentResults, sortDirection, setSortDirection } from './state.js';

export function sortByDate() {
    const results = getCurrentResults();
    results.sort((a, b) => {
        const dateA = new Date(a.date_modified);
        const dateB = new Date(b.date_modified);
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    // Wissel de sorteerstand (van 'desc' naar 'asc' of omgekeerd)
    const newSortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    setSortDirection(newSortDirection);

    setCurrentResults(results); // Werk de resultaten bij
    return results;
}