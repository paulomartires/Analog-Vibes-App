import { VinylRecord } from '../data/vinylRecords';

/**
 * Convert a year to its decade representation
 * @param year - Year as string (e.g., "1963") 
 * @returns Decade string (e.g., "1960s")
 */
export function getDecade(year: string): string {
  const yearNum = parseInt(year);
  if (isNaN(yearNum)) return "Unknown";
  
  const decadeStart = Math.floor(yearNum / 10) * 10;
  return `${decadeStart}s`;
}

/**
 * Get all unique genres from a collection of records
 * @param records - Array of vinyl records
 * @returns Array of unique genres sorted alphabetically
 */
export function getUniqueGenres(records: VinylRecord[]): string[] {
  const genres = new Set(records.map(record => record.genre));
  return Array.from(genres).sort();
}

/**
 * Get all unique decades from a collection of records
 * @param records - Array of vinyl records  
 * @returns Array of unique decades sorted chronologically
 */
export function getUniqueDecades(records: VinylRecord[]): string[] {
  const decades = new Set(records.map(record => getDecade(record.year)));
  return Array.from(decades)
    .filter(decade => decade !== "Unknown")
    .sort((a, b) => {
      // Sort chronologically: "1950s" comes before "1960s"
      const yearA = parseInt(a.replace('s', ''));
      const yearB = parseInt(b.replace('s', ''));
      return yearA - yearB;
    });
}

/**
 * Check if a record matches the decade filter
 * @param record - Vinyl record to check
 * @param targetDecade - Decade to match against (e.g., "1960s")
 * @returns True if record's year falls within the target decade
 */
export function recordMatchesDecade(record: VinylRecord, targetDecade: string): boolean {
  const recordDecade = getDecade(record.year);
  return recordDecade === targetDecade;
}

/**
 * Get filter statistics for display
 * @param records - Full collection of records
 * @param filteredRecords - Records after filtering applied
 * @param activeGenre - Currently active genre filter
 * @param activeDecade - Currently active decade filter
 * @returns Statistics object for UI display
 */
export function getFilterStats(
  _records: VinylRecord[], 
  filteredRecords: VinylRecord[],
  activeGenre?: string | null,
  activeDecade?: string | null
) {
  // Calculate unique artists and genres in filtered results
  const uniqueArtists = new Set(filteredRecords.map(record => record.artist)).size;
  const uniqueGenres = new Set(filteredRecords.map(record => record.genre)).size;
  
  // Determine filter display text
  let filterText = "";
  if (activeGenre && activeDecade) {
    // Format decade properly: "1980s" not "1980S"
    const formattedDecade = activeDecade.slice(0, -1) + activeDecade.slice(-1).toLowerCase();
    filterText = `${activeGenre.toUpperCase()} + ${formattedDecade}`;
  } else if (activeGenre) {
    filterText = `${activeGenre.toUpperCase()} VIBES`;
  } else if (activeDecade) {
    // Format decade properly: "1980s VIBES" not "1980S VIBES"
    const formattedDecade = activeDecade.slice(0, -1) + activeDecade.slice(-1).toLowerCase();
    filterText = `${formattedDecade} VIBES`;
  }
  
  return {
    totalRecords: filteredRecords.length,
    artists: uniqueArtists,
    genres: uniqueGenres,
    filterText,
    hasActiveFilters: Boolean(activeGenre || activeDecade)
  };
}