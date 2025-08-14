import { useMemo } from 'react'
import { ColorScheme } from '../../constants/colorSchemes'

interface VinylCardGeometryProps {
  recordId: string
  colors: ColorScheme
}

export function VinylCardGeometry({ recordId, colors }: VinylCardGeometryProps) {
  const graphicVariation = useMemo(() => {
    const variationIndex = parseInt(recordId) % 6

    switch (variationIndex) {
      case 0: // Classic Rectangle + Circle
        return (
          <>
            <div
              className="absolute top-6 left-6 w-16 h-16 opacity-40"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full opacity-35"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute top-1/2 right-8 w-2 h-20 opacity-50"
              style={{ backgroundColor: colors.accent }}
            />
          </>
        )

      case 1: // Diagonal Stripes
        return (
          <>
            <div
              className="absolute top-4 right-4 w-20 h-2 opacity-45 transform rotate-45"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute top-8 right-2 w-16 h-1 opacity-35 transform rotate-45"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute bottom-16 left-4 w-24 h-1 opacity-40 transform rotate-45"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute bottom-20 left-2 w-12 h-2 opacity-30 transform rotate-45"
              style={{ backgroundColor: colors.accent }}
            />
          </>
        )

      case 2: // Triangular Pattern
        return (
          <>
            <div
              className="absolute top-6 right-6 w-0 h-0 opacity-45"
              style={{
                borderLeft: '20px solid transparent',
                borderRight: '20px solid transparent',
                borderBottom: `24px solid ${colors.accent}`,
              }}
            />
            <div
              className="absolute bottom-8 left-8 w-0 h-0 opacity-40"
              style={{
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent',
                borderTop: `20px solid ${colors.accent}`,
              }}
            />
            <div
              className="absolute top-1/2 left-4 w-1 h-16 opacity-35 transform -translate-y-1/2 rotate-30"
              style={{ backgroundColor: colors.accent }}
            />
          </>
        )

      case 3: // Concentric Circles
        return (
          <>
            <div
              className="absolute top-8 left-8 w-16 h-16 rounded-full opacity-25 border-2"
              style={{ borderColor: colors.accent }}
            />
            <div
              className="absolute top-10 left-10 w-12 h-12 rounded-full opacity-35 border-2"
              style={{ borderColor: colors.accent }}
            />
            <div
              className="absolute bottom-12 right-12 w-8 h-8 rounded-full opacity-45"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute bottom-8 right-8 w-16 h-1 opacity-40"
              style={{ backgroundColor: colors.accent }}
            />
          </>
        )

      case 4: // Grid Pattern
        return (
          <>
            <div
              className="absolute top-6 left-6 w-3 h-3 opacity-40"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute top-6 left-12 w-3 h-3 opacity-35"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute top-12 left-6 w-3 h-3 opacity-30"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute bottom-6 right-6 w-1 h-24 opacity-45"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute bottom-6 right-10 w-1 h-16 opacity-35"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute bottom-6 right-14 w-1 h-12 opacity-25"
              style={{ backgroundColor: colors.accent }}
            />
          </>
        )

      case 5: // Modernist Composition
        return (
          <>
            <div
              className="absolute top-4 right-4 w-20 h-8 opacity-40 transform rotate-12"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute top-8 right-12 w-2 h-16 opacity-45 transform -rotate-12"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute bottom-8 left-6 w-12 h-3 opacity-35"
              style={{ backgroundColor: colors.accent }}
            />
            <div
              className="absolute bottom-4 left-8 w-6 h-6 rounded-full opacity-40"
              style={{ backgroundColor: colors.accent }}
            />
          </>
        )

      default:
        return null
    }
  }, [recordId, colors])

  return <>{graphicVariation}</>
}
