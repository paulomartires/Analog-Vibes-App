import { Search, ArrowUpDown, Shuffle, X } from 'lucide-react'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { getUniqueGenres, getUniqueDecades } from '../utils/filterUtils'
import { VinylRecord } from '../data/vinylRecords'

interface FilterState {
  genre: string | null
  decade: string | null
}

interface CollectionHeaderProps {
  records: VinylRecord[]
  searchTerm: string
  onSearchChange: (term: string) => void
  totalRecords: number
  sortBy: string
  onSortChange: (sort: string) => void
  filters: FilterState
  filterStats: {
    totalRecords: number
    artists: number
    genres: number
    filterText: string
    hasActiveFilters: boolean
  }
  collectionStats: {
    totalRecords: number
    artists: number
    genres: number
    labels: number
  }
  onGenreFilter: (genre: string) => void
  onDecadeFilter: (decade: string) => void
  onRandomPick?: () => void
}

export function CollectionHeader({
  records,
  searchTerm,
  onSearchChange,
  totalRecords,
  sortBy,
  onSortChange,
  filters,
  filterStats,
  collectionStats,
  onGenreFilter,
  onDecadeFilter,
  onRandomPick,
}: CollectionHeaderProps) {
  // Get available filter options from the collection
  const availableGenres = getUniqueGenres(records)
  const availableDecades = getUniqueDecades(records)

  // Helper function to display sort options

  const getSortDisplayName = (sortValue: string) => {
    switch (sortValue) {
      case 'artist':
        return 'Artist A-Z'
      case 'album':
        return 'Album A-Z'
      case 'year':
        return 'Year (Newest)'
      case 'genre':
        return 'Genre A-Z'
      case 'dateAdded':
      default:
        return 'Date Added'
    }
  }

  return (
    <>
      {/* Main header with Swiss Design precision meets Blue Note bold typography */}
      <div className="space-y-6">
        {/* Vinyl Collection Subtitle - Swiss minimal approach */}
        <div className="flex items-center space-x-4">
          <div
            className="w-16 h-1 rounded-full"
            style={{
              backgroundColor: 'var(--bn-electric-teal)',
            }}
          />
          <div className="text-sm font-black tracking-[0.25em] uppercase text-white/90">
            VINYL COLLECTION
          </div>
        </div>

        {/* PAULO'S Title */}
        <div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none">
            PAULO&apos;S
          </h1>
        </div>

        {/* Dynamic Title with aligned statistics - Swiss grid precision */}
        <div className="flex items-end justify-between">
          {/* Main Title - Shows filtered view title */}
          <div className="flex-1">
            <h2
              className="text-7xl md:text-9xl font-black leading-none whitespace-nowrap"
              style={{
                color: 'var(--bn-electric-teal)',
                letterSpacing: '-0.05em',
                transform: 'scaleX(0.85)',
                transformOrigin: 'left center',
                fontStretch: 'condensed',
                fontWeight: '900',
              }}
            >
              {filterStats.hasActiveFilters ? filterStats.filterText : 'ANALOG VIBES'}
            </h2>
          </div>

          {/* Statistics aligned to title baseline */}
          <div className="flex items-end space-x-12 lg:space-x-16 pb-2">
            {/* Total Records */}
            <div className="text-right">
              <div
                className="text-5xl md:text-6xl font-black leading-none"
                style={{ color: 'var(--bn-bright-yellow)' }}
              >
                {filterStats.hasActiveFilters
                  ? filterStats.totalRecords
                  : collectionStats.totalRecords}
              </div>
              <div className="text-xs font-black tracking-[0.1em] uppercase text-white/80 mt-2">
                RECORDS
              </div>
            </div>

            {/* Dynamic second stat based on filter type */}
            <div className="text-right">
              <div
                className="text-5xl md:text-6xl font-black leading-none"
                style={{ color: 'var(--bn-vibrant-orange)' }}
              >
                {filterStats.hasActiveFilters ? filterStats.artists : collectionStats.genres}
              </div>
              <div className="text-xs font-black tracking-[0.1em] uppercase text-white/80 mt-2">
                {filterStats.hasActiveFilters ? 'ARTISTS' : 'GENRES'}
              </div>
            </div>

            {/* Dynamic third stat */}
            <div className="text-right">
              <div
                className="text-5xl md:text-6xl font-black leading-none"
                style={{ color: 'var(--bn-electric-teal)' }}
              >
                {filterStats.hasActiveFilters
                  ? `'${totalRecords.toString().slice(-2)}`
                  : collectionStats.artists}
              </div>
              <div className="text-xs font-black tracking-[0.1em] uppercase text-white/80 mt-2">
                {filterStats.hasActiveFilters ? 'FILTERED' : 'ARTISTS'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refined Search and Controls Section */}
      <div className="relative mt-32">
        {/* Sophisticated background panel */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(30, 58, 138, 0.12) 0%, 
                rgba(0, 196, 204, 0.08) 50%, 
                rgba(30, 58, 138, 0.12) 100%
              )
            `,
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(0, 196, 204, 0.15)',
            boxShadow: `
              0 32px 64px rgba(0, 0, 0, 0.25),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
          }}
        />

        {/* Accent corner elements - refined */}
        <div
          className="absolute top-0 left-0 w-20 h-1 rounded-full"
          style={{
            backgroundColor: 'var(--bn-electric-teal)',
            boxShadow: '0 0 20px var(--bn-electric-teal)40',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-12 h-1 rounded-full"
          style={{
            backgroundColor: 'var(--bn-bright-yellow)',
            boxShadow: '0 0 16px var(--bn-bright-yellow)40',
          }}
        />

        {/* Controls content with improved layout */}
        <div className="relative z-10 p-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search Input - Enhanced design with consistent teal hover */}
              <div className="flex-1 relative min-w-0">
                <Search
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 z-10 transition-colors duration-300"
                  style={{
                    color: searchTerm ? 'var(--bn-electric-teal)' : 'rgba(255, 255, 255, 0.5)',
                  }}
                />
                <Input
                  type="text"
                  placeholder="Search artists, albums, labels..."
                  value={searchTerm}
                  onChange={e => onSearchChange(e.target.value)}
                  className="pl-14 pr-14 py-4 text-white placeholder:text-white font-medium bg-transparent transition-all duration-300 hover:border-bn-electric-teal focus:text-bn-electric-teal focus:border-bn-electric-teal"
                  style={{
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    height: '56px',
                  }}
                />
                {/* Clear search button */}
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 hover:text-bn-electric-teal transition-colors duration-300 z-10 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filter and Control Section */}
              <div className="flex items-center gap-4">
                {/* Genre Filter Dropdown */}
                <div className="min-w-[160px]">
                  <Select value={filters.genre || 'all'} onValueChange={onGenreFilter}>
                    <SelectTrigger
                      className="w-full px-5 py-4 font-bold text-white transition-all duration-300 hover:text-bn-electric-teal data-[state=open]:text-bn-electric-teal"
                      style={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(12px)',
                        border: 'none',
                        borderRadius: '8px',
                        height: '56px',
                        fontSize: '14px',
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="border-2 rounded-lg overflow-hidden"
                      style={{
                        background: 'var(--bn-navy)',
                        borderColor: 'var(--bn-electric-teal)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-bn-electric-teal hover:text-black font-bold transition-colors duration-200 px-4 py-3"
                      >
                        All Genres
                      </SelectItem>
                      {availableGenres.map(genre => (
                        <SelectItem
                          key={genre}
                          value={genre}
                          className="text-white hover:bg-bn-electric-teal hover:text-black font-bold transition-colors duration-200 px-4 py-3"
                        >
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year/Decade Filter Dropdown */}
                <div className="min-w-[160px]">
                  <Select value={filters.decade || 'all'} onValueChange={onDecadeFilter}>
                    <SelectTrigger
                      className="w-full px-5 py-4 font-bold text-white transition-all duration-300 hover:text-bn-electric-teal data-[state=open]:text-bn-electric-teal"
                      style={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(12px)',
                        border: 'none',
                        borderRadius: '8px',
                        height: '56px',
                        fontSize: '14px',
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="border-2 rounded-lg overflow-hidden"
                      style={{
                        background: 'var(--bn-navy)',
                        borderColor: 'var(--bn-electric-teal)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-bn-electric-teal hover:text-black font-bold transition-colors duration-200 px-4 py-3"
                      >
                        All Years
                      </SelectItem>
                      {availableDecades.map(decade => (
                        <SelectItem
                          key={decade}
                          value={decade}
                          className="text-white hover:bg-bn-electric-teal hover:text-black font-bold transition-colors duration-200 px-4 py-3"
                        >
                          {decade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Dropdown - Positioned Last, Same Size as Others */}
                <div className="min-w-[160px] relative group">
                  <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger
                      className="w-full px-5 py-4 font-bold text-white transition-all duration-300 hover:text-bn-electric-teal data-[state=open]:text-bn-electric-teal"
                      style={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(12px)',
                        border: 'none',
                        borderRadius: '8px',
                        height: '56px',
                        fontSize: '14px',
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{getSortDisplayName(sortBy)}</span>
                        <ArrowUpDown className="w-4 h-4 ml-2 transition-colors duration-300" />
                      </div>
                    </SelectTrigger>
                    <SelectContent
                      className="border-2 rounded-lg overflow-hidden min-w-[180px]"
                      style={{
                        background: 'var(--bn-navy)',
                        borderColor: 'var(--bn-electric-teal)',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <SelectItem
                        value="dateAdded"
                        className="text-white hover:bg-bn-electric-teal hover:text-black font-bold transition-colors duration-200 px-4 py-3"
                      >
                        Date Added
                      </SelectItem>
                      <SelectItem
                        value="artist"
                        className="text-white hover:bg-bn-electric-teal hover:text-black font-bold transition-colors duration-200 px-4 py-3"
                      >
                        Artist A-Z
                      </SelectItem>
                      <SelectItem
                        value="album"
                        className="text-white hover:bg-bn-electric-teal hover:text-black font-bold transition-colors duration-200 px-4 py-3"
                      >
                        Album A-Z
                      </SelectItem>
                      <SelectItem
                        value="year"
                        className="text-white hover:bg-bn-electric-teal hover:text-black font-bold transition-colors duration-200 px-4 py-3"
                      >
                        Year (Newest)
                      </SelectItem>
                      <SelectItem
                        value="genre"
                        className="text-white hover:bg-bn-electric-teal hover:text-black font-bold transition-colors duration-200 px-4 py-3"
                      >
                        Genre A-Z
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Suggest Vibe Button - Teal Focus */}
                {onRandomPick && (
                  <button
                    onClick={onRandomPick}
                    className="px-6 py-4 font-black tracking-wide uppercase transition-all duration-300 group"
                    style={{
                      background: 'var(--bn-electric-teal)',
                      borderRadius: '8px',
                      height: '56px',
                      fontSize: '14px',
                      color: 'white',
                      border: '2px solid var(--bn-electric-teal)',
                      boxShadow: `
                        0 0 20px var(--bn-electric-teal)40,
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--bn-deep-blue)'
                      e.currentTarget.style.borderColor = 'var(--bn-deep-blue)'
                      e.currentTarget.style.boxShadow = `
                        0 0 30px var(--bn-deep-blue)60,
                        0 12px 40px rgba(0, 0, 0, 0.6),
                        inset 0 1px 0 rgba(255, 255, 255, 0.3)
                      `
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--bn-electric-teal)'
                      e.currentTarget.style.borderColor = 'var(--bn-electric-teal)'
                      e.currentTarget.style.boxShadow = `
                        0 0 20px var(--bn-electric-teal)40,
                        0 8px 32px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.2)
                      `
                    }}
                    title="Discover a random album from your collection"
                  >
                    <div className="flex items-center space-x-2">
                      <Shuffle className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                      <span>SUGGEST VIBE</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
