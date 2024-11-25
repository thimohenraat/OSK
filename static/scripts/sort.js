import { getCurrentResults, setCurrentResults, getSortDirection, setSortDirection } from './state.js';

export function sortByDate(results = getCurrentResults()) {
    const currentSortDirection = getSortDirection();
    const isDescending = currentSortDirection === 'desc';
    
    results.sort((a, b) => {
        const dateA = new Date(a.date_modified);
        const dateB = new Date(b.date_modified);
        
        return isDescending ? dateB - dateA : dateA - dateB;
    });


    // Wissel de sorteerrichting voor de volgende keer
    const newSortDirection = isDescending ? 'asc' : 'desc';
    setSortDirection(newSortDirection);

    setCurrentResults(results);
    return results;
}
