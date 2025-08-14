import { useMemo } from 'react'
import { VINYL_CARD_COLOR_SCHEMES, ColorScheme } from '../../constants/colorSchemes'

export function useVinylCardColors(recordId: string): ColorScheme {
  return useMemo(() => {
    const schemeIndex = parseInt(recordId) % VINYL_CARD_COLOR_SCHEMES.length
    return VINYL_CARD_COLOR_SCHEMES[schemeIndex]
  }, [recordId])
}
