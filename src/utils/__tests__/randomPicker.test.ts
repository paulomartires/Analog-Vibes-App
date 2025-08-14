import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getRandomSuggestion,
  getSuggestionModes,
  clearSuggestionHistory,
  type SuggestionMode,
} from '../randomPicker'
import { VinylRecord } from '../../data/vinylRecords'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock Math.random for predictable tests
const mockMath = Object.create(global.Math)
mockMath.random = vi.fn(() => 0.5)
global.Math = mockMath

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
]

describe('randomPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(Math.random as any).mockReturnValue(0.5) // Always return middle value for predictability
  })

  describe('getRandomSuggestion', () => {
    it('should return null for empty records array', () => {
      const result = getRandomSuggestion({
        mode: 'feeling-lucky',
        records: [],
      })
      expect(result).toBeNull()
    })

    describe('feeling-lucky mode', () => {
      it('should return a random record from entire collection', () => {
        ;(Math.random as any).mockReturnValue(0.5) // Should select index 2 (Pet Sounds)

        const result = getRandomSuggestion({
          mode: 'feeling-lucky',
          records: mockRecords,
        })

        expect(result).toBeTruthy()
        expect(result!.record).toBe(mockRecords[2])
        expect(result!.mode).toBe('feeling-lucky')
        expect(result!.reason).toBe('Pure random selection from your entire collection')
        expect(typeof result!.message).toBe('string')
        expect(result!.message.length).toBeGreaterThan(0)
      })

      it('should exclude recent records when specified', () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(['3', '4'])) // Recent IDs
        ;(Math.random as any).mockReturnValue(0.5) // Should select from remaining records

        const result = getRandomSuggestion({
          mode: 'feeling-lucky',
          records: mockRecords,
          excludeRecent: true,
        })

        expect(result).toBeTruthy()
        expect(['1', '2']).toContain(result!.record.id) // Should be from non-recent records
      })
    })

    describe('mood-match mode', () => {
      it('should match current genre filter', () => {
        ;(Math.random as any).mockReturnValue(0.5) // Select middle of jazz records

        const result = getRandomSuggestion({
          mode: 'mood-match',
          records: mockRecords,
          currentGenre: 'Jazz',
        })

        expect(result).toBeTruthy()
        expect(result!.record.genre).toBe('Jazz')
        expect(result!.reason).toContain('Jazz')
      })

      it('should match current decade filter', () => {
        ;(Math.random as any).mockReturnValue(0) // Select first of 1950s records

        const result = getRandomSuggestion({
          mode: 'mood-match',
          records: mockRecords,
          currentDecade: '1950s',
        })

        expect(result).toBeTruthy()
        expect(['1957', '1959']).toContain(result!.record.year)
        expect(result!.reason).toContain('1950s')
      })

      it('should match both genre and decade filters', () => {
        const result = getRandomSuggestion({
          mode: 'mood-match',
          records: mockRecords,
          currentGenre: 'Jazz',
          currentDecade: '1950s',
        })

        expect(result).toBeTruthy()
        expect(result!.record.genre).toBe('Jazz')
        expect(['1957', '1959']).toContain(result!.record.year)
        expect(result!.reason).toContain('Jazz • 1950s')
      })

      it('should fall back to all records when no matches found', () => {
        const result = getRandomSuggestion({
          mode: 'mood-match',
          records: mockRecords,
          currentGenre: 'Electronic', // Genre not in collection
        })

        expect(result).toBeTruthy()
        expect(mockRecords).toContain(result!.record)
      })
    })

    describe('deep-cuts mode', () => {
      it('should exclude recently suggested records', () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(['1', '2', '3']))
        ;(Math.random as any).mockReturnValue(0) // Select first available

        const result = getRandomSuggestion({
          mode: 'deep-cuts',
          records: mockRecords,
        })

        expect(result).toBeTruthy()
        expect(result!.record.id).toBe('4') // Only non-recent record
        expect(result!.reason).toContain("haven't explored recently")
      })

      it('should fall back to all records when all are recent', () => {
        localStorageMock.getItem.mockReturnValue(JSON.stringify(['1', '2', '3', '4']))

        const result = getRandomSuggestion({
          mode: 'deep-cuts',
          records: mockRecords,
        })

        expect(result).toBeTruthy()
        expect(mockRecords).toContain(result!.record)
      })
    })

    describe('time-travel mode', () => {
      it('should select from a random decade', () => {
        ;(Math.random as any)
          .mockReturnValueOnce(0) // Select first decade (1950s)
          .mockReturnValueOnce(0.5) // Select middle record from that decade

        const result = getRandomSuggestion({
          mode: 'time-travel',
          records: mockRecords,
        })

        expect(result).toBeTruthy()
        expect(['1957', '1959']).toContain(result!.record.year) // 1950s records
        expect(result!.reason).toContain('1950s')
      })
    })

    describe('genre-safari mode', () => {
      it('should select from a random genre', () => {
        ;(Math.random as any)
          .mockReturnValueOnce(0) // Select first genre (Jazz)
          .mockReturnValueOnce(0.5) // Select middle record from that genre

        const result = getRandomSuggestion({
          mode: 'genre-safari',
          records: mockRecords,
        })

        expect(result).toBeTruthy()
        expect(result!.record.genre).toBe('Jazz')
        expect(result!.reason).toContain('Jazz collection')
      })

      it('should avoid current genre when possible', () => {
        ;(Math.random as any)
          .mockReturnValueOnce(0) // Select first non-current genre
          .mockReturnValueOnce(0) // Select first record from that genre

        const result = getRandomSuggestion({
          mode: 'genre-safari',
          records: mockRecords,
          currentGenre: 'Jazz',
        })

        expect(result).toBeTruthy()
        expect(result!.record.genre).not.toBe('Jazz')
      })
    })

    it('should add selected record to history', () => {
      getRandomSuggestion({
        mode: 'feeling-lucky',
        records: mockRecords,
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'analog-vibes-suggestion-history',
        expect.stringContaining('"3"') // Record ID should be in history
      )
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const result = getRandomSuggestion({
        mode: 'feeling-lucky',
        records: mockRecords,
      })

      expect(result).toBeTruthy() // Should still work despite localStorage error
    })
  })

  describe('getSuggestionModes', () => {
    it('should return all available modes with descriptions', () => {
      const modes = getSuggestionModes()

      expect(modes).toHaveLength(5)
      expect(modes.map(m => m.mode)).toEqual([
        'feeling-lucky',
        'mood-match',
        'deep-cuts',
        'time-travel',
        'genre-safari',
      ])

      modes.forEach(mode => {
        expect(mode).toHaveProperty('label')
        expect(mode).toHaveProperty('description')
        expect(mode).toHaveProperty('emoji')
        expect(typeof mode.label).toBe('string')
        expect(typeof mode.description).toBe('string')
        expect(typeof mode.emoji).toBe('string')
      })
    })
  })

  describe('clearSuggestionHistory', () => {
    it('should remove history from localStorage', () => {
      clearSuggestionHistory()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('analog-vibes-suggestion-history')
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      expect(() => clearSuggestionHistory()).not.toThrow()
    })
  })

  describe('message generation', () => {
    it('should return different messages for each mode', () => {
      const modes: SuggestionMode[] = [
        'feeling-lucky',
        'mood-match',
        'deep-cuts',
        'time-travel',
        'genre-safari',
      ]

      modes.forEach(mode => {
        const result = getRandomSuggestion({
          mode,
          records: mockRecords,
        })

        expect(result).toBeTruthy()
        expect(typeof result!.message).toBe('string')
        expect(result!.message.length).toBeGreaterThan(0)
      })
    })
  })
})
