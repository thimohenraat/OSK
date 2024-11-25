import { getCurrentResults, setCurrentResults, sortDirection, setSortDirection } from './state.js';

export function sortByDate(results = getCurrentResults()) {
    results.sort((a, b) =>
        new Date(b.dateModified) - new Date(a.dateModified)
    );

    const newSortDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    setSortDirection(newSortDirection);

    setCurrentResults(results);
    return results;
}
