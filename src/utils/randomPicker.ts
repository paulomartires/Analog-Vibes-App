import { VinylRecord } from '../data/vinylRecords'

export type SuggestionMode =
  | 'feeling-lucky'
  | 'mood-match'
  | 'deep-cuts'
  | 'time-travel'
  | 'genre-safari'

interface RandomPickerOptions {
  mode: SuggestionMode
  records: VinylRecord[]
  currentGenre?: string | null
  currentDecade?: string | null
  excludeRecent?: boolean
}

interface SuggestionResult {
  record: VinylRecord
  mode: SuggestionMode
  reason: string
  message: string
}

// Local storage key for tracking suggestion history
const HISTORY_KEY = 'analog-vibes-suggestion-history'
const MAX_HISTORY = 10

// Get suggestion history from localStorage
function getSuggestionHistory(): string[] {
  try {
    const history = localStorage.getItem(HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

// Add record to suggestion history
function addToHistory(recordId: string): void {
  try {
    let history = getSuggestionHistory()
    // Remove if already exists and add to beginning
    history = history.filter(id => id !== recordId)
    history.unshift(recordId)
    // Keep only last MAX_HISTORY items
    history = history.slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // Ignore localStorage errors
  }
}

// Get records excluding recently suggested ones
function excludeRecentRecords(records: VinylRecord[]): VinylRecord[] {
  const history = getSuggestionHistory()
  if (history.length === 0) return records

  const recentIds = new Set(history.slice(0, Math.min(5, history.length)))
  return records.filter(record => !recentIds.has(record.id))
}

// Get random record from array
function getRandomRecord(records: VinylRecord[]): VinylRecord {
  return records[Math.floor(Math.random() * records.length)]
}

// Get decade from year
function getDecade(year: string): string {
  const yearNum = parseInt(year)
  const decade = Math.floor(yearNum / 10) * 10
  return `${decade}s`
}

// Get unique decades from records
function getUniqueDecades(records: VinylRecord[]): string[] {
  const decades = new Set(records.map(record => getDecade(record.year)))
  return Array.from(decades).sort()
}

// Get unique genres from records
function getUniqueGenres(records: VinylRecord[]): string[] {
  const genres = new Set(records.map(record => record.genre))
  return Array.from(genres).sort()
}

// Cocktail-themed messages for each mode
const MESSAGES = {
  'feeling-lucky': [
    'The cosmic forces have chosen your next listen... 🎲',
    'Lady Luck just dropped the needle on something special 🍸',
    'Your jazz oracle suggests this sonic gem 🔮',
    'The vinyl spirits whisper: play this one 👻',
  ],
  'mood-match': [
    'Staying in the groove with your current vibe... 🎭',
    'Another perfect match for your refined taste 🥃',
    'The curator doubles down on excellence 🎯',
    'More of what moves your soul, coming right up ☕',
  ],
  'deep-cuts': [
    'Time to dust off this overlooked treasure... 💎',
    "Your collection's hidden gem awaits discovery 🔍",
    'This beauty has been waiting patiently for attention ⏰',
    'Uncharted territory in your own collection 🗺️',
  ],
  'time-travel': [
    'Stepping into the time machine for this era... ⏰',
    'A sonic journey to musical golden years 🚀',
    'When music had that special something... ✨',
    'Vintage vibes for your discerning ears 🍷',
  ],
  'genre-safari': [
    'Exploring uncharted musical territories... 🧭',
    'Your taste adventure continues here 🌍',
    'Expanding horizons, one genre at a time 🎨',
    'Bold new flavors for your musical palate 🌶️',
  ],
}

export function getRandomSuggestion(options: RandomPickerOptions): SuggestionResult | null {
  const { mode, records, currentGenre, currentDecade, excludeRecent } = options

  if (records.length === 0) return null

  let availableRecords = records
  let reason = ''

  // Apply mode-specific filtering
  switch (mode) {
    case 'feeling-lucky':
      if (excludeRecent) {
        availableRecords = excludeRecentRecords(records)
        if (availableRecords.length === 0) availableRecords = records
      }
      reason = 'Pure random selection from your entire collection'
      break

    case 'mood-match':
      if (currentGenre || currentDecade) {
        availableRecords = records.filter(record => {
          const matchesGenre =
            !currentGenre || record.genre.toLowerCase() === currentGenre.toLowerCase()
          const matchesDecade = !currentDecade || getDecade(record.year) === currentDecade
          return matchesGenre && matchesDecade
        })

        if (availableRecords.length === 0) {
          // Fallback to genre only, then decade only, then all
          if (currentGenre) {
            availableRecords = records.filter(
              r => r.genre.toLowerCase() === currentGenre.toLowerCase()
            )
          }
          if (availableRecords.length === 0 && currentDecade) {
            availableRecords = records.filter(r => getDecade(r.year) === currentDecade)
          }
          if (availableRecords.length === 0) {
            availableRecords = records
          }
        }

        reason = `Random ${currentGenre || ''}${currentGenre && currentDecade ? ' • ' : ''}${currentDecade || ''} selection`
      } else {
        // No active filters, default behavior
        if (excludeRecent) {
          availableRecords = excludeRecentRecords(records)
          if (availableRecords.length === 0) availableRecords = records
        }
        reason = 'Random selection matching your current mood'
      }
      break

    case 'deep-cuts':
      availableRecords = excludeRecentRecords(records)
      if (availableRecords.length === 0) {
        // If all records have been suggested recently, pick from older history
        const history = getSuggestionHistory()
        const olderIds = new Set(history.slice(5)) // Exclude only most recent 5
        availableRecords = records.filter(record => !olderIds.has(record.id))
        if (availableRecords.length === 0) availableRecords = records
      }
      reason = "Focusing on albums you haven't explored recently"
      break

    case 'time-travel': {
      const decades = getUniqueDecades(records)
      const randomDecade = decades[Math.floor(Math.random() * decades.length)]
      availableRecords = records.filter(record => getDecade(record.year) === randomDecade)
      reason = `Time traveling to the ${randomDecade}`
      break
    }

    case 'genre-safari': {
      const genres = getUniqueGenres(records)
      // If user has current genre, try different genres first
      let targetGenres = currentGenre
        ? genres.filter(g => g.toLowerCase() !== currentGenre.toLowerCase())
        : genres

      if (targetGenres.length === 0) targetGenres = genres

      const randomGenre = targetGenres[Math.floor(Math.random() * targetGenres.length)]
      availableRecords = records.filter(record => record.genre === randomGenre)
      reason = `Exploring your ${randomGenre} collection`
      break
    }
  }

  if (availableRecords.length === 0) return null

  const selectedRecord = getRandomRecord(availableRecords)

  // Add to history
  addToHistory(selectedRecord.id)

  // Get random message for this mode
  const modeMessages = MESSAGES[mode]
  const message = modeMessages[Math.floor(Math.random() * modeMessages.length)]

  return {
    record: selectedRecord,
    mode,
    reason,
    message,
  }
}

// Get all available suggestion modes with descriptions
export function getSuggestionModes(): Array<{
  mode: SuggestionMode
  label: string
  description: string
  emoji: string
}> {
  return [
    {
      mode: 'feeling-lucky',
      label: 'Feeling Lucky',
      description: 'Pure random selection from your entire collection',
      emoji: '🎲',
    },
    {
      mode: 'mood-match',
      label: 'Mood Match',
      description: 'Random selection matching your current filters',
      emoji: '🎭',
    },
    {
      mode: 'deep-cuts',
      label: 'Deep Cuts',
      description: "Discover albums you haven't explored recently",
      emoji: '💎',
    },
    {
      mode: 'time-travel',
      label: 'Time Travel',
      description: 'Random journey to a specific musical era',
      emoji: '⏰',
    },
    {
      mode: 'genre-safari',
      label: 'Genre Safari',
      description: 'Adventure into unexplored musical territories',
      emoji: '🧭',
    },
  ]
}

// Clear suggestion history (for settings/preferences)
export function clearSuggestionHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    // Ignore localStorage errors
  }
}
