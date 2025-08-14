export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
}

// Blue Note color palette for mapping
const BLUE_NOTE_COLORS = {
  // Cool colors
  cool: [
    { name: 'electric-teal', value: 'var(--bn-electric-teal)', hex: '#00d4aa' },
    { name: 'deep-blue', value: 'var(--bn-deep-blue)', hex: '#1e3a8a' },
    { name: 'classic-blue', value: 'var(--bn-classic-blue)', hex: '#3b82f6' },
    { name: 'turquoise', value: 'var(--bn-turquoise)', hex: '#06b6d4' },
    { name: 'royal-purple', value: 'var(--bn-royal-purple)', hex: '#7c3aed' },
  ],
  // Warm colors
  warm: [
    { name: 'vibrant-orange', value: 'var(--bn-vibrant-orange)', hex: '#ea580c' },
    { name: 'sunset-orange', value: 'var(--bn-sunset-orange)', hex: '#f97316' },
    { name: 'coral-red', value: 'var(--bn-coral-red)', hex: '#ef4444' },
    { name: 'bright-yellow', value: 'var(--bn-bright-yellow)', hex: '#eab308' },
    { name: 'golden-yellow', value: 'var(--bn-golden-yellow)', hex: '#f59e0b' },
  ],
  // Rich/Deep colors
  rich: [
    { name: 'rich-purple', value: 'var(--bn-rich-purple)', hex: '#6b21a8' },
    { name: 'forest-green', value: 'var(--bn-forest-green)', hex: '#166534' },
    { name: 'magenta', value: 'var(--bn-magenta)', hex: '#db2777' },
  ],
}

// Cache for extracted colors
const colorCache = new Map<string, ColorScheme>()

/**
 * Convert hex color to HSL values
 */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}

/**
 * Convert RGB values to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map(x => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? `0${hex}` : hex
    })
    .join('')}`
}

/**
 * Calculate color distance between two hex colors
 */
function colorDistance(hex1: string, hex2: string): number {
  const [h1, s1, l1] = hexToHsl(hex1)
  const [h2, s2, l2] = hexToHsl(hex2)

  // Weight hue difference more heavily
  const hueDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2))
  const satDiff = Math.abs(s1 - s2)
  const lightDiff = Math.abs(l1 - l2)

  return hueDiff * 2 + satDiff + lightDiff
}

/**
 * Extract colors from Discogs image URL using heuristics (CORS-free approach)
 */
function extractColorsFromUrl(imageUrl: string): string[] {
  // Generate pseudo-random but consistent colors based on URL
  const url = imageUrl.toLowerCase()

  // Use URL hash for consistent color generation
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Generate 3 colors based on the hash
  const baseHue = Math.abs(hash) % 360
  const colors = [
    hslToHex(baseHue, 65, 45), // Primary color
    hslToHex((baseHue + 120) % 360, 70, 50), // Complementary color
    hslToHex((baseHue + 240) % 360, 60, 55), // Triadic color
  ]

  console.log(`🎨 Generated colors from URL hash: ${colors} (hue: ${baseHue})`)
  return colors
}

/**
 * Convert HSL to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Extract dominant colors - tries Canvas first, falls back to URL analysis
 */
export async function extractDominantColors(imageUrl: string): Promise<string[]> {
  // First try URL-based extraction (always works, no CORS)
  const urlColors = extractColorsFromUrl(imageUrl)

  // Try Canvas extraction as enhancement (may fail due to CORS)
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const timeout = setTimeout(() => {
      console.log(`⚡ Using URL-based colors for: ${imageUrl.slice(-30)}`)
      resolve(urlColors)
    }, 2000) // Shorter timeout

    img.onload = () => {
      clearTimeout(timeout)

      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          console.log(`⚡ Canvas failed, using URL colors for: ${imageUrl.slice(-30)}`)
          resolve(urlColors)
          return
        }

        // Scale down for performance
        const maxSize = 150
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const canvasColors = analyzeImageColors(imageData)

        console.log(`🎨 Canvas extraction successful for: ${imageUrl.slice(-30)}`)
        resolve(canvasColors.length > 0 ? canvasColors : urlColors)
      } catch (error) {
        console.log(`⚡ Canvas failed, using URL colors: ${error}`)
        resolve(urlColors)
      }
    }

    img.onerror = () => {
      clearTimeout(timeout)
      console.log(`⚡ Image load failed, using URL colors for: ${imageUrl.slice(-30)}`)
      resolve(urlColors)
    }

    img.src = imageUrl
  })
}

/**
 * Analyze image data to extract dominant colors
 */
function analyzeImageColors(imageData: ImageData): string[] {
  const data = imageData.data
  const colorCounts = new Map<string, number>()

  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // Skip transparent or very dark/light pixels
    if (a < 128 || r + g + b < 50 || r + g + b > 720) continue

    // Quantize colors to reduce noise
    const quantR = Math.round(r / 32) * 32
    const quantG = Math.round(g / 32) * 32
    const quantB = Math.round(b / 32) * 32

    const hex = rgbToHex(quantR, quantG, quantB)
    colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1)
  }

  // Sort by frequency and return top colors
  return Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color)
}

/**
 * Map extracted colors to Blue Note palette
 */
export function mapToBlueNotePalette(extractedColors: string[]): ColorScheme {
  if (extractedColors.length === 0) {
    // Fallback to default scheme
    return {
      primary: 'var(--bn-electric-teal)',
      secondary: 'var(--bn-deep-blue)',
      accent: 'var(--bn-bright-yellow)',
    }
  }

  const dominantColor = extractedColors[0]
  const [hue, , lightness] = hexToHsl(dominantColor)

  // Find closest Blue Note color
  const allColors = [...BLUE_NOTE_COLORS.cool, ...BLUE_NOTE_COLORS.warm, ...BLUE_NOTE_COLORS.rich]
  let closestColor = allColors[0]
  let minDistance = colorDistance(dominantColor, closestColor.hex)

  for (const color of allColors) {
    const distance = colorDistance(dominantColor, color.hex)
    if (distance < minDistance) {
      minDistance = distance
      closestColor = color
    }
  }

  // Determine color temperature and create complementary scheme
  const isWarm = hue >= 30 && hue <= 210 // Rough warm color range
  const isBright = lightness > 60

  const primary = closestColor.value
  let secondary: string
  let accent: string

  if (isWarm) {
    // Warm dominant color - use cool secondary
    secondary =
      BLUE_NOTE_COLORS.cool[Math.floor(Math.random() * BLUE_NOTE_COLORS.cool.length)].value
    accent = isBright ? 'var(--bn-deep-blue)' : 'var(--bn-bright-yellow)'
  } else {
    // Cool dominant color - use warm secondary
    secondary =
      BLUE_NOTE_COLORS.warm[Math.floor(Math.random() * BLUE_NOTE_COLORS.warm.length)].value
    accent = isBright ? 'var(--bn-rich-purple)' : 'var(--bn-golden-yellow)'
  }

  return { primary, secondary, accent }
}

/**
 * Get dynamic overlay colors with caching and fallback
 */
export async function getDynamicOverlayColors(
  imageUrl: string,
  fallbackId: string
): Promise<ColorScheme> {
  console.log(`🔍 Attempting color extraction for: ${imageUrl.slice(-30)}`)

  // Check cache first
  if (colorCache.has(imageUrl)) {
    console.log(`📋 Using cached colors for: ${imageUrl.slice(-30)}`)
    return colorCache.get(imageUrl)!
  }

  try {
    console.log(`🎨 Extracting colors from: ${imageUrl.slice(-30)}`)
    const extractedColors = await extractDominantColors(imageUrl)
    console.log(`✅ Extracted colors:`, extractedColors)

    const colorScheme = mapToBlueNotePalette(extractedColors)
    console.log(`🎯 Mapped to Blue Note palette:`, colorScheme)

    // Cache the result
    colorCache.set(imageUrl, colorScheme)

    return colorScheme
  } catch (error) {
    console.warn(`❌ Color extraction failed for ${imageUrl.slice(-30)}:`, error)
    console.log(`🔄 Using fallback colors for ID: ${fallbackId}`)

    // Enhanced fallback schemes with more variety
    const fallbackSchemes = [
      {
        primary: 'var(--bn-electric-teal)',
        secondary: 'var(--bn-deep-blue)',
        accent: 'var(--bn-bright-yellow)',
      },
      {
        primary: 'var(--bn-vibrant-orange)',
        secondary: 'var(--bn-rich-purple)',
        accent: 'var(--bn-electric-teal)',
      },
      {
        primary: 'var(--bn-deep-blue)',
        secondary: 'var(--bn-vibrant-orange)',
        accent: 'var(--bn-bright-yellow)',
      },
      {
        primary: 'var(--bn-rich-purple)',
        secondary: 'var(--bn-electric-teal)',
        accent: 'var(--bn-vibrant-orange)',
      },
      {
        primary: 'var(--bn-bright-yellow)',
        secondary: 'var(--bn-deep-blue)',
        accent: 'var(--bn-electric-teal)',
      },
      {
        primary: 'var(--bn-magenta)',
        secondary: 'var(--bn-classic-blue)',
        accent: 'var(--bn-golden-yellow)',
      },
      {
        primary: 'var(--bn-forest-green)',
        secondary: 'var(--bn-royal-purple)',
        accent: 'var(--bn-coral-red)',
      },
      {
        primary: 'var(--bn-turquoise)',
        secondary: 'var(--bn-sunset-orange)',
        accent: 'var(--bn-magenta)',
      },
      {
        primary: 'var(--bn-coral-red)',
        secondary: 'var(--bn-forest-green)',
        accent: 'var(--bn-golden-yellow)',
      },
      {
        primary: 'var(--bn-classic-blue)',
        secondary: 'var(--bn-coral-red)',
        accent: 'var(--bn-turquoise)',
      },
      {
        primary: 'var(--bn-royal-purple)',
        secondary: 'var(--bn-turquoise)',
        accent: 'var(--bn-sunset-orange)',
      },
      {
        primary: 'var(--bn-sunset-orange)',
        secondary: 'var(--bn-magenta)',
        accent: 'var(--bn-forest-green)',
      },
    ]

    const fallbackIndex = parseInt(fallbackId) % fallbackSchemes.length
    const fallbackScheme = fallbackSchemes[fallbackIndex]
    console.log(`📌 Fallback scheme selected:`, fallbackScheme)

    return fallbackScheme
  }
}

/**
 * Clear color cache (useful for development)
 */
export function clearColorCache(): void {
  colorCache.clear()
  console.log('🧹 Color cache cleared')
}
