import { useMemo } from 'react'
import { VinylRecord } from '../data/vinylRecords'
import { getFilterStats } from '../utils/filterUtils'

interface FilterState {
  genre: string | null
  decade: string | null
}

interface UseCollectionStatsProps {
  records: VinylRecord[]
  filteredRecords: VinylRecord[]
  filters: FilterState
  selectedRecord: VinylRecord | null
}

interface CollectionStats {
  totalRecords: number
  artists: number
  genres: number
  labels: number
}

interface FilterStats {
  totalRecords: number
  artists: number
  genres: number
  filterText: string
  hasActiveFilters: boolean
}

interface UseCollectionStatsReturn {
  collectionStats: CollectionStats
  filterStats: FilterStats
  otherAlbumsByArtist: VinylRecord[]
}

export function useCollectionStats({
  records,
  filteredRecords,
  filters,
  selectedRecord,
}: UseCollectionStatsProps): UseCollectionStatsReturn {
  // Calculate overall collection statistics
  const collectionStats = useMemo(() => {
    const uniqueArtists = new Set(records.map(record => record.artist)).size
    const uniqueGenres = new Set(records.map(record => record.genre)).size
    const uniqueLabels = new Set(records.map(record => record.label)).size

    return {
      totalRecords: records.length,
      artists: uniqueArtists,
      genres: uniqueGenres,
      labels: uniqueLabels,
    }
  }, [records])

  // Calculate filter-specific statistics
  const filterStats = useMemo(() => {
    return getFilterStats(records, filteredRecords, filters.genre, filters.decade)
  }, [records, filteredRecords, filters])

  // Get other albums by the same artist for the detail page
  const otherAlbumsByArtist = useMemo(() => {
    if (!selectedRecord) return []

    return records
      .filter(
        record =>
          record.artist.toLowerCase() === selectedRecord.artist.toLowerCase() &&
          record.id !== selectedRecord.id
      )
      .sort((a, b) => parseInt(a.year) - parseInt(b.year)) // Sort by year
  }, [selectedRecord, records])

  return {
    collectionStats,
    filterStats,
    otherAlbumsByArtist,
  }
}
