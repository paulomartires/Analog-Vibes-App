import { motion } from 'framer-motion'
import { memo } from 'react'
import { VinylRecord } from '../../data/vinylRecords'
import { useVinylCardColors } from './VinylCardColors'
import { VinylCardOverlay } from './VinylCardOverlay'

type FilterType = 'genre' | 'artist' | 'label' | 'year'

interface VinylCardBaseProps {
  record: VinylRecord
  index: number
  onClick: () => void
  onFilter: (type: FilterType, value: string) => void
  disableOverlay?: boolean
}

function VinylCardBaseComponent({
  record,
  index: _index,
  onClick,
  onFilter: _onFilter,
  disableOverlay = false,
}: VinylCardBaseProps) {
  const colors = useVinylCardColors(record.id)

  return (
    <motion.div
      className="group cursor-pointer relative"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background glow effect */}
      <div
        className="absolute inset-0 rounded-sm opacity-40 group-hover:opacity-60 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${colors.primary}20 0%, ${colors.primary}10 40%, transparent 70%)`,
          transform: 'scale(1.1)',
          filter: 'blur(20px)',
          zIndex: -1,
        }}
      />

      {/* Album Cover Container */}
      <div
        className="relative w-full aspect-square overflow-hidden"
        style={{ borderRadius: '2px' }}
      >
        {/* Album Cover Image */}
        <img
          src={record.coverUrl}
          alt={`${record.title} by ${record.artist}`}
          className="w-full h-full object-cover bn-high-contrast transition-all duration-500"
          style={{
            borderRadius: '2px',
            boxShadow: `
              0 30px 120px rgba(0, 0, 0, 0.8),
              0 20px 60px rgba(0, 0, 0, 0.6),
              0 12px 35px rgba(255, 255, 255, 0.2),
              0 8px 25px rgba(255, 255, 255, 0.15),
              0 4px 20px ${colors.primary}60,
              0 2px 12px ${colors.primary}40,
              0 1px 8px rgba(255, 255, 255, 0.1)
            `,
          }}
        />

        {/* Content Overlay */}
        <VinylCardOverlay record={record} colors={colors} disableOverlay={disableOverlay} />
      </div>
    </motion.div>
  )
}

// Memoized component with custom comparison
export const VinylCardBase = memo(VinylCardBaseComponent, (prevProps, nextProps) => {
  return (
    prevProps.record.id === nextProps.record.id &&
    prevProps.disableOverlay === nextProps.disableOverlay
  )
})
