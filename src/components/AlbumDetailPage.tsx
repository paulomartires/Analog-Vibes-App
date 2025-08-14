import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { VinylRecord } from '../data/vinylRecords'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { Button } from './ui/button'
import { VinylCard } from './VinylCard'
import { GenreTags } from './ui/GenreTag'

type FilterType = 'genre' | 'artist' | 'label' | 'year'

interface AlbumDetailPageProps {
  record: VinylRecord
  onBack: () => void
  onFilter: (type: FilterType, value: string) => void
  otherAlbumsByArtist: VinylRecord[]
  onRecordClick: (record: VinylRecord) => void
}

export function AlbumDetailPage({
  record,
  onBack,
  onFilter,
  otherAlbumsByArtist,
  onRecordClick,
}: AlbumDetailPageProps) {
  // Expanded color schemes matching VinylCard
  const getOverlayColors = (record: VinylRecord) => {
    const colorSchemes = [
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
      // New color schemes with expanded palette
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

    const schemeIndex = parseInt(record.id.toString()) % colorSchemes.length
    return colorSchemes[schemeIndex]
  }

  const colors = getOverlayColors(record)

  const totalDuration = record.tracks.reduce((total, track) => {
    const [minutes, seconds] = track.duration.split(':').map(Number)
    return total + minutes * 60 + seconds
  }, 0)

  const formatTotalDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleFilterClick = (type: FilterType, value: string) => {
    onFilter(type, value)
    onBack() // Return to collection view with filter applied
  }

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [record.id]) // Re-scroll when record changes

  // Determine if we should show separate release date
  const masterYear = record.year // This comes from master release
  const releaseYear = record.releaseDate || record.year // Your specific pressing
  const showSeparateReleaseDate = masterYear !== releaseYear

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          var(--bn-navy) 0%, 
          var(--bn-deep-blue) 25%, 
          #1a2847 50%, 
          var(--bn-navy) 75%, 
          #0f1729 100%)`,
      }}
    >
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-32 w-64 h-64 rounded-full opacity-8"
          style={{ backgroundColor: colors.primary }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute bottom-1/4 -right-32 w-48 h-48 opacity-6"
          style={{ backgroundColor: colors.accent }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center space-x-3 px-6 py-3 font-black tracking-wide uppercase border-2 text-white hover:text-bn-electric-teal hover:border-bn-electric-teal transition-colors duration-300"
          style={{
            background: 'rgba(30, 58, 138, 0.2)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Collection</span>
        </Button>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 pb-20 pt-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Album Cover & Vinyl */}
          <div className="relative">
            <div className="relative w-full max-w-2xl mx-auto overflow-visible">
              {/* Vinyl Record - CSS created, positioned to extend dramatically to the right */}
              <motion.div
                className="absolute top-0 left-44 w-96 h-96 z-10"
                initial={{ x: -60, opacity: 0 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  rotate: 360,
                }}
                transition={{
                  x: { duration: 1.2, delay: 0.5 },
                  opacity: { duration: 1.2, delay: 0.5 },
                  rotate: {
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: 1.5,
                  },
                }}
                style={{
                  filter: 'drop-shadow(0 12px 32px rgba(0, 0, 0, 0.5))',
                }}
              >
                {/* Main vinyl disc */}
                <div
                  className="w-full h-full rounded-full relative"
                  style={{
                    background: `
                      radial-gradient(circle at center, 
                        #1a1a1a 0%, 
                        #0a0a0a 30%, 
                        #1a1a1a 31%, 
                        #0a0a0a 60%, 
                        #1a1a1a 61%, 
                        #000000 100%
                      )
                    `,
                    boxShadow:
                      'inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 15px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Vinyl grooves effect */}
                  <div
                    className="absolute inset-0 rounded-full opacity-20"
                    style={{
                      background: `
                        repeating-conic-gradient(
                          from 0deg at center,
                          transparent 0deg,
                          rgba(255, 255, 255, 0.1) 1deg,
                          transparent 2deg
                        )
                      `,
                    }}
                  />

                  {/* Center label */}
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
                    style={{
                      width: '30%',
                      height: '30%',
                      background: colors.accent,
                      boxShadow:
                        '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {/* Center hole */}
                    <div
                      className="w-4 h-4 rounded-full bg-black"
                      style={{
                        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.8)',
                      }}
                    />
                  </div>

                  {/* Label text */}
                  <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-full px-2"
                    style={{ marginTop: '0px' }}
                  >
                    <div className="space-y-1">
                      {/* Record Label */}
                      <div className="text-xs font-black text-black opacity-90 tracking-wider">
                        {record.label.toUpperCase()}
                      </div>

                      {/* Divider line */}
                      <div
                        className="w-8 h-px mx-auto opacity-60"
                        style={{ backgroundColor: 'var(--bn-deep-black)' }}
                      />

                      {/* Album Title */}
                      <div className="text-xs font-bold text-black opacity-75 leading-tight">
                        {record.title.length > 20
                          ? `${record.title.substring(0, 20)}...`
                          : record.title.toUpperCase()}
                      </div>

                      {/* Artist */}
                      <div className="text-xs font-medium text-black opacity-60 leading-tight">
                        {record.artist.length > 15
                          ? `${record.artist.substring(0, 15)}...`
                          : record.artist}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Album Cover - positioned in front and to the left */}
              <div className="relative z-20 w-96 h-96">
                <ImageWithFallback
                  src={record.coverUrl}
                  alt={`${record.title} by ${record.artist}`}
                  className="w-full h-full object-cover bn-high-contrast rounded-sm"
                  style={{
                    boxShadow:
                      '0 20px 80px rgba(0, 0, 0, 0.6), 0 16px 48px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Album Information */}
          <div className="space-y-12">
            {/* Title & Artist */}
            <div className="space-y-6">
              <div className="space-y-4">
                <motion.h1
                  className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight"
                  style={{ textShadow: '0 4px 16px rgba(0, 0, 0, 0.5)' }}
                >
                  {record.title.toUpperCase()}
                </motion.h1>

                <div className="w-32 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold tracking-wide text-white">
                {record.artist.toUpperCase()}
              </h2>
            </div>

            {/* Album Details - All clickable for filtering */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-black tracking-wide uppercase text-white/60 mb-2">
                    Year
                  </div>
                  <div
                    className="text-2xl font-black text-white hover:text-bn-electric-teal transition-colors duration-300 cursor-pointer"
                    onClick={() => handleFilterClick('year', record.year)}
                    title={`View all ${record.year} records`}
                  >
                    {masterYear}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-black tracking-wide uppercase text-white/60 mb-2">
                    Label
                  </div>
                  <div className="text-xl font-bold text-white">{record.label}</div>
                </div>

                <div>
                  <div className="text-sm font-black tracking-wide uppercase text-white/60 mb-2">
                    Tracks
                  </div>
                  <div className="text-xl font-bold text-white">{record.tracks.length}</div>
                </div>
              </div>

              <div className="space-y-6">
                {showSeparateReleaseDate && (
                  <div>
                    <div className="text-sm font-black tracking-wide uppercase text-white/60 mb-2">
                      This Release
                    </div>
                    <div className="text-xl font-bold text-white">{releaseYear}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-black tracking-wide uppercase text-white/60 mb-2">
                    Genre
                  </div>
                  <GenreTags 
                    genres={record.genres}
                    onGenreClick={(genre) => handleFilterClick('genre', genre)}
                    size="lg"
                    className="mt-2"
                  />
                </div>

                <div>
                  <div className="text-sm font-black tracking-wide uppercase text-white/60 mb-2">
                    Duration
                  </div>
                  <div className="text-xl font-bold text-white">
                    {formatTotalDuration(totalDuration)}
                  </div>
                </div>
              </div>
            </div>

            {/* About this album */}
            {record.description && (
              <div className="space-y-4">
                <h3 className="text-xl font-black tracking-wide uppercase text-white">
                  About this album
                </h3>
                <p className="text-lg leading-relaxed text-white/80 font-medium">
                  {record.description}
                </p>
              </div>
            )}

            {/* Production Info */}
            <div className="grid grid-cols-2 gap-6">
              {record.producer && (
                <div>
                  <div className="text-sm font-black tracking-wide uppercase text-white/60 mb-2">
                    Producer
                  </div>
                  <div className="text-lg font-bold text-white">{record.producer}</div>
                </div>
              )}

              {record.recordingDate && (
                <div>
                  <div className="text-sm font-black tracking-wide uppercase text-white/60 mb-2">
                    Recorded
                  </div>
                  <div className="text-lg font-bold text-white">{record.recordingDate}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Track Listing */}
        <div className="mt-24 space-y-8">
          <div className="flex items-center space-x-6">
            <h3 className="text-3xl font-black tracking-wide uppercase text-white">
              Track Listing
            </h3>
            <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: colors.accent }} />
          </div>

          <div className="grid gap-4">
            {record.tracks.map((track, _index) => (
              <div
                key={track.number}
                className="flex items-center justify-between p-6 rounded-sm cursor-pointer transition-colors duration-300 hover:text-bn-electric-teal"
                style={{
                  background: 'rgba(30, 58, 138, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-center space-x-6">
                  <div className="w-8 text-2xl font-black text-white/60">
                    {track.number.toString().padStart(2, '0')}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white transition-colors duration-300">
                      {track.title}
                    </h4>
                  </div>
                </div>

                <div className="text-lg font-bold text-white/60 transition-colors duration-300">
                  {track.duration}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Albums from Artist Section */}
        {otherAlbumsByArtist.length > 0 && (
          <div className="mt-32 space-y-12">
            <div className="flex items-center space-x-6">
              <h3 className="text-3xl font-black tracking-wide uppercase text-white">
                Other Albums from {record.artist.toUpperCase()}
              </h3>
              <div
                className="flex-1 h-1 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
            </div>

            {/* Artist Albums Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 lg:gap-24">
              {otherAlbumsByArtist.map((albumRecord, index) => (
                <VinylCard
                  key={albumRecord.id}
                  record={albumRecord}
                  index={index}
                  onClick={() => onRecordClick(albumRecord)}
                  onFilter={onFilter}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
