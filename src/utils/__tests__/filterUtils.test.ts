import { describe, it, expect } from 'vitest'
import {
  getDecade,
  getUniqueGenres,
  getUniqueDecades,
  recordMatchesDecade,
  getFilterStats,
} from '../filterUtils'
import { VinylRecord } from '../../data/vinylRecords'

// Mock vinyl records for testing
const mockRecords: VinylRecord[] = [
  {
    id: '1',
    title: 'Blue Train',
    artist: 'John Coltrane',
    year: '1957',
    genre: 'Jazz',
    label: 'Blue Note',
    coverUrl: 'test.jpg',
    catalogNumber: 'BLP 4001',
    tracks: [],
  },
  {
    id: '2',
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    year: '1959',
    genre: 'Jazz',
    label: 'Columbia',
    coverUrl: 'test2.jpg',
    catalogNumber: 'CL 1355',
    tracks: [],
  },
  {
    id: '3',
    title: 'Pet Sounds',
    artist: 'The Beach Boys',
    year: '1966',
    genre: 'Pop',
    label: 'Capitol',
    coverUrl: 'test3.jpg',
    catalogNumber: 'T 2458',
    tracks: [],
  },
  {
    id: '4',
    title: 'Abbey Road',
    artist: 'The Beatles',
    year: '1969',
    genre: 'Rock',
    label: 'Apple',
    coverUrl: 'test4.jpg',
    catalogNumber: 'PCS 7088',
    tracks: [],
  },
  {
    id: '5',
    title: 'Unknown Album',
    artist: 'Unknown Artist',
    year: 'invalid',
    genre: 'Jazz',
    label: 'Unknown',
    coverUrl: 'test5.jpg',
    catalogNumber: 'UNK 001',
    tracks: [],
  },
]

describe('filterUtils', () => {
  describe('getDecade', () => {
    it('should return correct decade for valid years', () => {
      expect(getDecade('1957')).toBe('1950s')
      expect(getDecade('1959')).toBe('1950s')
      expect(getDecade('1966')).toBe('1960s')
      expect(getDecade('1969')).toBe('1960s')
      expect(getDecade('1980')).toBe('1980s')
      expect(getDecade('1999')).toBe('1990s')
      expect(getDecade('2000')).toBe('2000s')
    })

    it('should return "Unknown" for invalid years', () => {
      expect(getDecade('invalid')).toBe('Unknown')
      expect(getDecade('')).toBe('Unknown')
      expect(getDecade('abc')).toBe('Unknown')
    })
  })

  describe('getUniqueGenres', () => {
    it('should return unique genres sorted alphabetically', () => {
      const genres = getUniqueGenres(mockRecords)
      expect(genres).toEqual(['Jazz', 'Pop', 'Rock'])
    })

    it('should handle empty array', () => {
      const genres = getUniqueGenres([])
      expect(genres).toEqual([])
    })

    it('should deduplicate genres', () => {
      const duplicateRecords = [
        ...mockRecords,
        { ...mockRecords[0], id: '6' }, // Another jazz record
      ]
      const genres = getUniqueGenres(duplicateRecords)
      expect(genres).toEqual(['Jazz', 'Pop', 'Rock'])
    })
  })

  describe('getUniqueDecades', () => {
    it('should return unique decades sorted chronologically', () => {
      const decades = getUniqueDecades(mockRecords)
      expect(decades).toEqual(['1950s', '1960s'])
    })

    it('should filter out "Unknown" decades', () => {
      const decades = getUniqueDecades(mockRecords)
      expect(decades).not.toContain('Unknown')
    })

    it('should handle empty array', () => {
      const decades = getUniqueDecades([])
      expect(decades).toEqual([])
    })

    it('should sort decades chronologically', () => {
      const mixedRecords = [
        { ...mockRecords[0], year: '1980' },
        { ...mockRecords[1], year: '1950' },
        { ...mockRecords[2], year: '1970' },
        { ...mockRecords[3], year: '1960' },
      ]
      const decades = getUniqueDecades(mixedRecords)
      expect(decades).toEqual(['1950s', '1960s', '1970s', '1980s'])
    })
  })

  describe('recordMatchesDecade', () => {
    it('should return true when record matches decade', () => {
      expect(recordMatchesDecade(mockRecords[0], '1950s')).toBe(true)
      expect(recordMatchesDecade(mockRecords[2], '1960s')).toBe(true)
    })

    it('should return false when record does not match decade', () => {
      expect(recordMatchesDecade(mockRecords[0], '1960s')).toBe(false)
      expect(recordMatchesDecade(mockRecords[2], '1950s')).toBe(false)
    })

    it('should handle invalid years', () => {
      expect(recordMatchesDecade(mockRecords[4], '1950s')).toBe(false)
      expect(recordMatchesDecade(mockRecords[4], 'Unknown')).toBe(true)
    })
  })

  describe('getFilterStats', () => {
    const jazzRecords = mockRecords.filter(r => r.genre === 'Jazz')
    const sixtyRecords = mockRecords.filter(r => getDecade(r.year) === '1960s')

    it('should calculate correct stats for unfiltered collection', () => {
      const stats = getFilterStats(mockRecords, mockRecords)
      expect(stats.totalRecords).toBe(5)
      expect(stats.artists).toBe(5) // All unique artists
      expect(stats.genres).toBe(3) // Jazz, Pop, Rock
      expect(stats.filterText).toBe('')
      expect(stats.hasActiveFilters).toBe(false)
    })

    it('should calculate correct stats with genre filter', () => {
      const stats = getFilterStats(mockRecords, jazzRecords, 'Jazz')
      expect(stats.totalRecords).toBe(3) // 3 jazz records including invalid year
      expect(stats.artists).toBe(3) // John Coltrane, Miles Davis, Unknown Artist
      expect(stats.genres).toBe(1) // Only Jazz
      expect(stats.filterText).toBe('JAZZ VIBES')
      expect(stats.hasActiveFilters).toBe(true)
    })

    it('should calculate correct stats with decade filter', () => {
      const stats = getFilterStats(mockRecords, sixtyRecords, null, '1960s')
      expect(stats.totalRecords).toBe(2)
      expect(stats.artists).toBe(2) // Beach Boys, Beatles
      expect(stats.filterText).toBe('1960s VIBES')
      expect(stats.hasActiveFilters).toBe(true)
    })

    it('should calculate correct stats with both filters', () => {
      const bothFiltersRecords = mockRecords.filter(
        r => r.genre === 'Jazz' && getDecade(r.year) === '1950s'
      )
      const stats = getFilterStats(mockRecords, bothFiltersRecords, 'Jazz', '1950s')
      expect(stats.totalRecords).toBe(2)
      expect(stats.filterText).toBe('JAZZ + 1950s')
      expect(stats.hasActiveFilters).toBe(true)
    })

    it('should handle empty filtered results', () => {
      const stats = getFilterStats(mockRecords, [], 'Electronic')
      expect(stats.totalRecords).toBe(0)
      expect(stats.artists).toBe(0)
      expect(stats.genres).toBe(0)
      expect(stats.filterText).toBe('ELECTRONIC VIBES')
      expect(stats.hasActiveFilters).toBe(true)
    })

    it('should format decade properly in filter text', () => {
      const stats1 = getFilterStats(mockRecords, [], null, '1980S')
      expect(stats1.filterText).toBe('1980s VIBES')

      const stats2 = getFilterStats(mockRecords, [], 'Rock', '1970S')
      expect(stats2.filterText).toBe('ROCK + 1970s')
    })
  })
})
