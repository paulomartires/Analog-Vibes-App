import { VinylRecord } from '../../data/vinylRecords'
import { ColorScheme } from '../../constants/colorSchemes'
import { VinylCardGeometry } from './VinylCardGeometry'

interface VinylCardOverlayProps {
  record: VinylRecord
  colors: ColorScheme
  disableOverlay?: boolean
}

export function VinylCardOverlay({
  record,
  colors,
  disableOverlay = false,
}: VinylCardOverlayProps) {
  if (disableOverlay) return null

  return (
    <div
      className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 transform translate-y-full group-hover:translate-y-0 transition-all duration-500 ease-out overflow-hidden"
      style={{
        borderRadius: '2px',
        background: `
          linear-gradient(135deg, 
            rgba(15, 15, 15, 0.55) 0%, 
            rgba(15, 15, 15, 0.45) 50%, 
            rgba(15, 15, 15, 0.55) 100%
          )
        `,
      }}
    >
      {/* Duotone Effect Layer - Slides with content */}
      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          background: colors.accent,
          mixBlendMode: 'multiply',
          opacity: 0.8,
          borderRadius: '2px',
        }}
      />

      {/* Duotone Highlight Layer - Slides with content */}
      <div
        className="absolute inset-0 transition-all duration-500 ease-out delay-75"
        style={{
          background: `linear-gradient(135deg, ${colors.accent} 0%, transparent 70%)`,
          mixBlendMode: 'color-dodge',
          opacity: 0.4,
          borderRadius: '2px',
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
        {/* Dynamic Geometric Elements - 6 variations */}
        <VinylCardGeometry recordId={record.id} colors={colors} />

        {/* Album Information */}
        <div className="space-y-6 z-10 relative">
          {/* Album Title */}
          <div className="space-y-3">
            <h3
              className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-white"
              style={{
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              {record.title.toUpperCase()}
            </h3>

            <div
              className="w-24 h-1 mx-auto rounded-full"
              style={{ backgroundColor: colors.accent }}
            />
          </div>

          {/* Artist */}
          <p
            className="text-xl md:text-2xl font-bold tracking-wide text-white"
            style={{
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
            }}
          >
            {record.artist.toUpperCase()}
          </p>

          {/* Year and Genre */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div
              className="px-4 py-2 text-sm font-black tracking-[0.15em] uppercase rounded-sm"
              style={{
                backgroundColor: colors.accent,
                color: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {record.year}
            </div>

            <div
              className="px-4 py-2 text-sm font-black tracking-[0.15em] uppercase rounded-sm max-w-[200px]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                color: 'white',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
            >
              <span className="truncate block">
                {record.genres.length > 2 
                  ? `${record.genres.slice(0, 2).join(', ')}...`
                  : record.genres.join(', ')
                }
              </span>
            </div>
          </div>
        </div>

        {/* Corner accent lines - positioned at absolute edges */}
        <div
          className="absolute top-0 left-0 w-16 h-1"
          style={{
            backgroundColor: colors.accent,
            borderTopLeftRadius: '2px',
          }}
        />
        <div
          className="absolute top-0 left-0 w-1 h-16"
          style={{
            backgroundColor: colors.accent,
            borderTopLeftRadius: '2px',
          }}
        />

        <div
          className="absolute bottom-0 right-0 w-16 h-1"
          style={{
            backgroundColor: colors.accent,
            borderBottomRightRadius: '2px',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-1 h-16"
          style={{
            backgroundColor: colors.accent,
            borderBottomRightRadius: '2px',
          }}
        />
      </div>
    </div>
  )
}
