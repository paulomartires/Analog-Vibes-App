import { useState, useMemo, useCallback } from 'react'
import { VinylRecord } from '../data/vinylRecords'
import { recordMatchesDecade, getDecade } from '../utils/filterUtils'

interface FilterState {
  genre: string | null
  decade: string | null
}

interface UseFilteringProps {
  records: VinylRecord[]
}

interface UseFilteringReturn {
  searchTerm: string
  setSearchTerm: (term: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  filters: FilterState
  filteredAndSortedRecords: VinylRecord[]
  handleGenreFilter: (genre: string) => void
  handleDecadeFilter: (decade: string) => void
  handleClearFilters: () => void
  handleFilter: (type: string, value: string) => void
  getNoRecordsText: () => string
}

export function useFiltering({ records }: UseFilteringProps): UseFilteringReturn {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('dateAdded')
  const [filters, setFilters] = useState<FilterState>({ genre: null, decade: null })

  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records

    // Apply genre filter (check if any genre in the array matches)
    if (filters.genre) {
      filtered = filtered.filter(
        record => record.genres.some(genre => 
          genre.toLowerCase() === (filters.genre || '').toLowerCase()
        )
      )
    }

    // Apply decade filter
    if (filters.decade) {
      filtered = filtered.filter(record => recordMatchesDecade(record, filters.decade || ''))
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        record =>
          record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'artist':
          return a.artist.localeCompare(b.artist)
        case 'album':
          return a.title.localeCompare(b.title)
        case 'year':
          return parseInt(b.year) - parseInt(a.year) // Newest first
        case 'genre': {
          // Sort by first genre in the array
          const aGenre = a.genres.length > 0 ? a.genres[0] : 'Unknown'
          const bGenre = b.genres.length > 0 ? b.genres[0] : 'Unknown'
          return aGenre.localeCompare(bGenre)
        }
        case 'dateAdded':
        default: {
          // Sort by actual collection date (newest first)
          const aDate = a.dateAdded ? new Date(a.dateAdded).getTime() : 0
          const bDate = b.dateAdded ? new Date(b.dateAdded).getTime() : 0
          return bDate - aDate // Newest additions first
        }
      }
    })

    return sorted
  }, [records, searchTerm, sortBy, filters])

  const handleGenreFilter = useCallback((genre: string) => {
    setFilters(prev => ({ ...prev, genre: genre === 'all' ? null : genre }))
    // Reset search when applying filter for cleaner UX
    setSearchTerm('')
  }, [])

  const handleDecadeFilter = useCallback((decade: string) => {
    setFilters(prev => ({ ...prev, decade: decade === 'all' ? null : decade }))
    // Reset search when applying filter for cleaner UX
    setSearchTerm('')
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters({ genre: null, decade: null })
  }, [])

  // Compatibility function for components that still use the old filter interface
  const handleFilter = useCallback(
    (type: string, value: string) => {
      if (type === 'genre') {
        handleGenreFilter(value)
      } else if (type === 'decade' || type === 'year') {
        // For year, convert to decade
        const decade = type === 'year' ? getDecade(value) : value
        handleDecadeFilter(decade)
      }
      // Ignore other filter types for now (artist, label) since we're simplifying
    },
    [handleGenreFilter, handleDecadeFilter]
  )

  const getNoRecordsText = useCallback(() => {
    if (filters.genre && filters.decade) {
      return `NO ${filters.genre.toUpperCase()} • ${filters.decade.toUpperCase()} RECORDS FOUND`
    } else if (filters.genre) {
      return `NO ${filters.genre.toUpperCase()} RECORDS FOUND`
    } else if (filters.decade) {
      return `NO ${filters.decade.toUpperCase()} RECORDS FOUND`
    }
    return 'NO RECORDS FOUND'
  }, [filters])

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filters,
    filteredAndSortedRecords,
    handleGenreFilter,
    handleDecadeFilter,
    handleClearFilters,
    handleFilter,
    getNoRecordsText,
  }
}
