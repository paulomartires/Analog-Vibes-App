// Date formatting utility (removed unused import)
import { VinylRecord, Track, MasterRelease, VinylRelease } from '../data/vinylRecords'
import { DiscogsRelease, DiscogsMasterRelease } from './discogsService'

/**
 * Transform Discogs master release to our MasterRelease format
 */
export function transformDiscogsMasterRelease(discogsMaster: DiscogsMasterRelease): MasterRelease {
  // Extract artist name (handle multiple artists)
  const artist =
    discogsMaster.artists && discogsMaster.artists.length > 0
      ? discogsMaster.artists.map(a => a.name).join(', ')
      : 'Unknown Artist'

  // Extract genres only (not styles) from Discogs
  const genres = discogsMaster.genres || []
  // Filter out empty or invalid genres
  const validGenres = genres.filter(g => g && g.trim() && g !== 'Unknown')

  // Extract producer from extraartists
  const producer = discogsMaster.extraartists?.find(
    artist => artist.role && artist.role.toLowerCase().includes('producer')
  )?.name

  // Handle master year with validation and logging
  let masterYear: string | undefined
  if (discogsMaster.year && discogsMaster.year > 0) {
    masterYear = discogsMaster.year.toString()
  } else {
    console.warn(`Master release ${discogsMaster.id} has invalid/missing year:`, discogsMaster.year)
    masterYear = undefined
  }

  return {
    id: discogsMaster.id.toString(),
    title: discogsMaster.title || 'Unknown Title',
    artist,
    genres: validGenres.length > 0 ? validGenres : ['Unknown'],
    description: discogsMaster.notes
      ? cleanText(discogsMaster.notes)
      : `A classic release by ${artist}${masterYear ? ` from ${masterYear}` : ''}.`,
    producer,
    recordingDate: masterYear,
  }
}

/**
 * Transform Discogs release to our VinylRelease format
 */
export function transformDiscogsVinylRelease(
  discogsRelease: DiscogsRelease,
  masterId: string,
  index: number = 0
): VinylRelease {
  // Use basic_information if available (from collection), otherwise use main release data
  const releaseData = discogsRelease.basic_information || discogsRelease

  // Extract label and catalog number
  const label =
    releaseData.labels && releaseData.labels.length > 0
      ? releaseData.labels[0].name
      : 'Unknown Label'

  const catalogNumber =
    releaseData.labels && releaseData.labels.length > 0
      ? releaseData.labels[0].catno || 'N/A'
      : 'N/A'

  // Extract cover image
  let coverUrl = ''
  const fullRelease = discogsRelease as any // Type assertion for additional properties
  if (fullRelease.images && fullRelease.images.length > 0) {
    // Prefer primary image, fallback to first image
    const primaryImage =
      fullRelease.images.find((img: any) => img.type === 'primary') || fullRelease.images[0]
    coverUrl = primaryImage.uri500 || primaryImage.uri || primaryImage.uri150 || ''
  } else if (discogsRelease.basic_information?.cover_image) {
    coverUrl = discogsRelease.basic_information.cover_image
  } else if (discogsRelease.basic_information?.thumb) {
    coverUrl = discogsRelease.basic_information.thumb
  }

  // Fallback to a generic vinyl image if no cover found
  if (!coverUrl) {
    coverUrl = `https://images.unsplash.com/photo-1571974599782-87624638275d?w=400&h=400&fit=crop&auto=format&q=80&hue=${(index * 30) % 360}&sat=70`
  }

  // Transform tracklist
  const tracks: Track[] = []

  if (discogsRelease.tracklist && discogsRelease.tracklist.length > 0) {
    discogsRelease.tracklist.forEach((track, trackIndex) => {
      // Skip empty tracks or non-track items (like headers)
      if (track.title && track.title.trim()) {
        tracks.push({
          number: trackIndex + 1,
          title: track.title.trim(),
          duration: track.duration || formatDuration(getRandomDuration()),
        })
      }
    })
  }

  // If no tracks available, create some placeholder tracks with music-appropriate names
  if (tracks.length === 0) {
    const genericTrackNames = [
      'Opening',
      'Melody',
      'Interlude',
      'Rhythm',
      'Finale',
      'Theme',
      'Variation',
      'Coda',
    ]

    // Create 4-6 tracks typically found on albums
    const trackCount = 4 + Math.floor(Math.random() * 3) // 4-6 tracks
    for (let i = 1; i <= trackCount; i++) {
      tracks.push({
        number: i,
        title: genericTrackNames[i - 1] || `Movement ${i}`,
        duration: formatDuration(getRandomDuration()),
      })
    }
  }

  return {
    id: releaseData.id ? releaseData.id.toString() : `generated-${Date.now()}-${index}`,
    releaseDate: releaseData.year ? releaseData.year.toString() : 'Unknown',
    label,
    catalogNumber,
    coverUrl,
    tracks,
    masterId,
  }
}

/**
 * Transform both Discogs release and master data to our combined VinylRecord format
 */
export function transformDiscogsToVinylRecord(
  discogsRelease: DiscogsRelease,
  discogsMaster?: DiscogsMasterRelease,
  index: number = 0
): VinylRecord {
  // Transform the separate parts
  const masterId =
    (discogsRelease.basic_information?.master_id || discogsRelease.master_id)?.toString() ||
    'unknown'
  const vinylRelease = transformDiscogsVinylRelease(discogsRelease, masterId, index)

  // Use master data if available, otherwise fall back to release data
  let masterRelease: MasterRelease
  if (discogsMaster) {
    masterRelease = transformDiscogsMasterRelease(discogsMaster)
  } else {
    // Create fallback master data from release data
    const releaseData = discogsRelease.basic_information || discogsRelease
    const artist =
      releaseData.artists && releaseData.artists.length > 0
        ? releaseData.artists.map(a => a.name).join(', ')
        : 'Unknown Artist'

    const genres = releaseData.genres || []
    // Filter out empty or invalid genres (only use genres, not styles)
    const validGenres = genres.filter(g => g && g.trim() && g !== 'Unknown')

    masterRelease = {
      id: masterId,
      title: releaseData.title || 'Unknown Title',
      artist,
      genres: validGenres.length > 0 ? validGenres : ['Unknown'],
      description: createDescription(releaseData, discogsRelease),
      producer: extractProducer(discogsRelease),
      recordingDate: extractRecordingDate(discogsRelease),
    }
  }

  // Smart fallback: use release year when master year is missing
  const finalYear = masterRelease.recordingDate || vinylRelease.releaseDate || 'Unknown'

  // Debug logging for year resolution
  if (!masterRelease.recordingDate && vinylRelease.releaseDate) {
    console.log(
      `📅 Using release year (${vinylRelease.releaseDate}) for "${masterRelease.title}" (master year missing)`
    )
  } else if (finalYear === 'Unknown') {
    console.warn(
      `⚠️ No year available for "${masterRelease.title}" (master: ${masterRelease.recordingDate}, release: ${vinylRelease.releaseDate})`
    )
  }

  // Combine into VinylRecord format for UI compatibility
  return {
    id: vinylRelease.id,
    title: masterRelease.title, // From master
    artist: masterRelease.artist, // From master
    year: finalYear, // Smart fallback: master year || release year || 'Unknown'
    label: vinylRelease.label, // From your release
    genres: masterRelease.genres, // From master (now array)
    catalogNumber: vinylRelease.catalogNumber, // From your release
    coverUrl: vinylRelease.coverUrl, // From your release
    tracks: vinylRelease.tracks, // From your release
    description: masterRelease.description, // From master (Release Notes)
    producer: masterRelease.producer, // From master
    recordingDate: masterRelease.recordingDate, // From master (can be undefined)
    releaseDate: vinylRelease.releaseDate, // From your release (NEW: This Release date)

    // Internal references for future use
    _masterRelease: masterRelease,
    _vinylRelease: vinylRelease,
  }
}

/**
 * Transform an array of Discogs releases to VinylRecord array (legacy support)
 */
export function transformDiscogsCollection(discogsReleases: DiscogsRelease[]): VinylRecord[] {
  return discogsReleases.map((release, index) =>
    transformDiscogsToVinylRecord(release, undefined, index)
  )
}

/**
 * Create a description based on available Discogs data
 */
function createDescription(releaseData: any, fullRelease: DiscogsRelease): string {
  const parts: string[] = []
  const extendedRelease = fullRelease as any // Type assertion for extended properties

  // Add format information
  if (releaseData.formats && releaseData.formats.length > 0) {
    const format = releaseData.formats[0]
    const formatText = format.name || 'Vinyl'
    const descriptions = format.descriptions ? format.descriptions.join(', ') : ''
    parts.push(`${formatText}${descriptions ? ` (${descriptions})` : ''}`)
  }

  // Add style information
  if (releaseData.styles && releaseData.styles.length > 0) {
    parts.push(`Style: ${releaseData.styles.join(', ')}`)
  }

  // Add country if available
  if (extendedRelease.country) {
    parts.push(`Released in ${extendedRelease.country}`)
  }

  // Add notes if available (cleaned of Discogs markup)
  if (extendedRelease.notes && typeof extendedRelease.notes === 'string') {
    parts.push(cleanText(extendedRelease.notes))
  }

  // Create a basic description if we don't have much info
  if (parts.length === 0) {
    const artist = releaseData.artists?.[0]?.name || 'Unknown Artist'
    const year = releaseData.year || 'Unknown Year'
    parts.push(`A classic release by ${artist} from ${year}.`)
  }

  return `${parts.join('. ')}.`
}

/**
 * Extract producer information from credits
 */
function extractProducer(release: DiscogsRelease): string | undefined {
  const extendedRelease = release as any
  if (!extendedRelease.extraartists) return undefined

  const producer = extendedRelease.extraartists.find(
    (artist: any) => artist.role && artist.role.toLowerCase().includes('producer')
  )

  return producer?.name
}

/**
 * Extract recording date from release data
 */
function extractRecordingDate(release: DiscogsRelease): string | undefined {
  const extendedRelease = release as any
  // Try to extract from notes or other fields (clean markup first)
  if (extendedRelease.notes && typeof extendedRelease.notes === 'string') {
    const cleanedNotes = cleanDiscogsMarkup(extendedRelease.notes)
    const dateMatch = cleanedNotes.match(/recorded\s+in\s+(\w+\s+\d{4})/i)
    if (dateMatch) {
      return dateMatch[1]
    }
  }

  // Fallback to release year if available
  if (extendedRelease.year) {
    return extendedRelease.year.toString()
  }

  return undefined
}

/**
 * Generate a random duration for tracks without duration info
 */
function getRandomDuration(): number {
  // Generate random duration between 2:30 and 8:30 (150-510 seconds)
  return Math.floor(Math.random() * (510 - 150 + 1)) + 150
}

/**
 * Format duration from seconds to MM:SS format
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Parse duration string to seconds (for existing MM:SS format)
 */
export function parseDuration(duration: string): number {
  if (!duration || duration === '') return 0

  const parts = duration.split(':')
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10) || 0
    const seconds = parseInt(parts[1], 10) || 0
    return minutes * 60 + seconds
  }

  return 0
}

/**
 * Clean Discogs markup tags from text
 * Converts [l=Label], [a=Artist], [r=Release], [m=Master] to plain text
 */
export function cleanDiscogsMarkup(text: string): string {
  if (!text) return ''

  return (
    text
      // Clean label references: [l=Blue Note] → Blue Note
      .replace(/\[l=([^\]]+)\]/g, '$1')
      // Clean artist references: [a=John Coltrane] → John Coltrane
      .replace(/\[a=([^\]]+)\]/g, '$1')
      // Clean release references: [r=Album Title] → Album Title
      .replace(/\[r=([^\]]+)\]/g, '$1')
      // Clean master references: [m=Master Title] → Master Title
      .replace(/\[m=([^\]]+)\]/g, '$1')
      // Clean any other bracketed references: [x=Something] → Something
      .replace(/\[\w+=([^\]]+)\]/g, '$1')
      // Clean standalone brackets that might be left
      .replace(/\[\]/g, '')
  )
}

/**
 * Clean and normalize text fields
 */
export function cleanText(text: string): string {
  if (!text) return ''

  return cleanDiscogsMarkup(text)
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\-.,!?()&"']/g, '') // Remove special characters except common punctuation and quotes
    .substring(0, 1000) // Limit length
}

/**
 * Generate a fallback cover image URL with color variation
 */
export function generateFallbackCover(id: string, title: string): string {
  const hash = simpleHash(id + title)
  const hue = hash % 360
  const sat = 60 + (hash % 40) // 60-100% saturation
  const brightness = hash % 2 === 0 ? 0 : -20 // Vary brightness

  return `https://images.unsplash.com/photo-1571974599782-87624638275d?w=400&h=400&fit=crop&auto=format&q=80&hue=${hue}&sat=${sat}&brightness=${brightness}`
}

/**
 * Simple hash function for generating consistent values
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Validate that a VinylRecord has all required fields
 */
export function validateVinylRecord(record: VinylRecord): boolean {
  return !!(
    record.id &&
    record.title &&
    record.artist &&
    record.year &&
    record.label &&
    record.genres && record.genres.length > 0 &&
    record.coverUrl &&
    record.tracks &&
    record.tracks.length > 0
  )
}

/**
 * Filter out invalid records
 */
export function filterValidRecords(records: VinylRecord[]): VinylRecord[] {
  return records.filter(validateVinylRecord)
}

/**
 * Test function for Discogs markup cleaning
 */
export function testDiscogsMarkupCleaning(): void {
  const testCases = [
    {
      input:
        'Coltrane\'s third session as a leader, recorded on 15 September 1957 for [l=Blue Note], although he was still under contract of [l=Prestige] (that is why the rear jacket has: "John Coltrane performs by courtesy of Prestige Records"). The sextet includes [a=Lee Morgan] (tp), [a=Curtis Fuller] (tb), [a=Kenny Drew] (p), [a=Paul Chambers (3)] (b) and [a="Philly" Joe Jones] (d).',
      expected:
        'Coltrane\'s third session as a leader, recorded on 15 September 1957 for Blue Note, although he was still under contract of Prestige (that is why the rear jacket has: "John Coltrane performs by courtesy of Prestige Records"). The sextet includes Lee Morgan (tp), Curtis Fuller (tb), Kenny Drew (p), Paul Chambers (3) (b) and "Philly" Joe Jones (d).',
    },
    {
      input: 'Released by [l=Impulse!] featuring [a=John Coltrane] on [r=A Love Supreme]',
      expected: 'Released by Impulse! featuring John Coltrane on A Love Supreme',
    },
    {
      input: 'No markup here, just plain text',
      expected: 'No markup here, just plain text',
    },
  ]

  console.log('🧪 Testing Discogs markup cleaning...')

  testCases.forEach((testCase, index) => {
    const result = cleanText(testCase.input)
    const passed = result === testCase.expected

    console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`)
    if (!passed) {
      console.log('  Input:', testCase.input)
      console.log('  Expected:', testCase.expected)
      console.log('  Got:', result)
    }
  })

  console.log('🧪 Markup cleaning tests complete!')
}
