import { getCurrentResults, setCurrentResults, sortDirection, setSortDirection } from './state.js';

export function sortByDate(results = getCurrentResults()) {
    const currentSortDirection = sortDirection();
    const isDescending = currentSortDirection === 'desc';
    
    results.sort((a, b) => {
        const dateA = new Date(a.dateModified);
        const dateB = new Date(b.dateModified);
        
        return isDescending ? dateB - dateA : dateA - dateB;
    });


    // Wissel de sorteerrichting voor de volgende keer
    const newSortDirection = isDescending ? 'asc' : 'desc';
    setSortDirection(newSortDirection);

    setCurrentResults(results);
    return results;
}
