import { useState, lazy, Suspense, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { VinylRecord } from './data/vinylRecords'
import { CollectionHeader } from './components/CollectionHeader'
import { LoadingScreen } from './components/LoadingScreen'
import { ErrorScreen } from './components/ErrorScreen'
import { SyncButton } from './components/SyncButton'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SplashScreen } from './components/SplashScreen'
import { VinylGrid } from './components/VinylGrid'
import { RandomPicker } from './components/RandomPicker'
import { usePublicCollection } from './hooks/usePublicCollection'
import { useFiltering } from './hooks/useFiltering'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useCollectionStats } from './hooks/useCollectionStats'

// Lazy load heavy components
const AlbumDetailPage = lazy(() =>
  import('./components/AlbumDetailPage').then(module => ({ default: module.AlbumDetailPage }))
)

export default function App() {
  const [selectedRecord, setSelectedRecord] = useState<VinylRecord | null>(null)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [showRandomPicker, setShowRandomPicker] = useState(false)

  // Use the public collection hook
  const [collectionState, collectionActions] = usePublicCollection()
  const { records, isLoading, error, syncProgress, lastSync } = collectionState
  const { syncFromDiscogs, refreshCollection } = collectionActions

  // Handler functions
  const handleRandomPick = () => {
    setShowRandomPicker(true)
  }

  const handleRandomPickerClose = () => {
    setShowRandomPicker(false)
  }

  // Use custom hooks for filtering and stats
  const filtering = useFiltering({ records })
  const { collectionStats, filterStats, otherAlbumsByArtist } = useCollectionStats({
    records,
    filteredRecords: filtering.filteredAndSortedRecords,
    filters: filtering.filters,
    selectedRecord,
  })

  // Show loading overlay when starting a full sync with cached records
  const handleSyncCollection = useCallback(
    async (forceRefresh: boolean = true) => {
      if (forceRefresh && records.length > 0) {
        setShowLoadingOverlay(true)
      }
      await syncFromDiscogs()
    },
    [records.length, syncFromDiscogs]
  )

  // Reset loading overlay when sync completes
  useEffect(() => {
    if (!isLoading) {
      setShowLoadingOverlay(false)
    }
  }, [isLoading])

  // Handle keyboard shortcuts
  useKeyboardShortcuts({
    showRandomPicker,
    selectedRecord,
    onRandomPick: handleRandomPick,
  })

  // Debug function disabled for stability
  // const debugCache = async () => {
  //   try {
  //     const cacheInfo = await collectionActions.getCacheInfo();
  //     const cacheData = await collectionActions.exportCollection();
  //     console.log('=== CACHE DEBUG ===');
  //     console.log('Cache Info:', cacheInfo);
  //     console.log('Cache Data Records:', cacheData?.records?.length || 0);
  //     console.log('First 3 cached records:', cacheData?.records?.slice(0, 3));
  //     console.log('=================');
  //   } catch (error) {
  //     console.error('Cache debug failed:', error);
  //   }
  // };

  const handleRecordClick = (record: VinylRecord) => {
    setSelectedRecord(record)
  }

  const handleBackToCollection = () => {
    setSelectedRecord(null)
  }

  // Show error screen if there's an error and no cached records
  if (error && records.length === 0) {
    return (
      <ErrorScreen
        error={error}
        onRetry={syncFromDiscogs}
        onClearCache={refreshCollection}
        showConfigHelp={false}
      />
    )
  }

  // Show loading screen during initial sync (no cached records)
  if (isLoading && records.length === 0) {
    return <LoadingScreen progress={syncProgress} />
  }

  // For full sync with cached records, show collection with optional loading screen overlay
  const showBackToCollectionButton = isLoading && records.length > 0

  // Show loading overlay if user is syncing with cached records and hasn't dismissed it
  if (showBackToCollectionButton && showLoadingOverlay) {
    return (
      <LoadingScreen
        progress={syncProgress}
        onBackToCollection={() => setShowLoadingOverlay(false)}
        showBackButton={true}
      />
    )
  }

  // If a record is selected, show the detail page
  if (selectedRecord) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<SplashScreen message="Loading album details..." />}>
          <AlbumDetailPage
            record={selectedRecord}
            onBack={handleBackToCollection}
            onFilter={filtering.handleFilter}
            otherAlbumsByArtist={otherAlbumsByArtist}
            onRecordClick={handleRecordClick}
          />
        </Suspense>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
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
        {/* Sophisticated geometric background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Large electric teal circle - inspired by classic Blue Note covers */}
          <motion.div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-12"
            style={{ backgroundColor: 'var(--bn-electric-teal)' }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
              x: [0, 20, 0],
              y: [0, -10, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Vibrant orange geometric shape */}
          <motion.div
            className="absolute top-1/4 -left-48 w-96 h-96 bn-geometric-angle opacity-15"
            style={{ backgroundColor: 'var(--bn-vibrant-orange)' }}
            animate={{
              rotate: [0, 5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Subtle yellow accent */}
          <motion.div
            className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full opacity-8"
            style={{ backgroundColor: 'var(--bn-bright-yellow)' }}
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Deep blue rectangular accent */}
          <motion.div
            className="absolute top-1/2 right-10 w-32 h-48 opacity-20"
            style={{ backgroundColor: 'var(--bn-electric-teal)' }}
            animate={{
              rotate: [0, 10, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Subtle texture overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, var(--bn-electric-teal) 2px, transparent 2px),
                              radial-gradient(circle at 75% 75%, var(--bn-vibrant-orange) 1px, transparent 1px)`,
              backgroundSize: '60px 60px, 40px 40px',
            }}
          />
        </div>

        {/* Background sync indicator */}
        {showBackToCollectionButton && !showLoadingOverlay && (
          <div className="fixed top-0 left-0 right-0 z-40 p-4">
            <div className="max-w-md mx-auto">
              <motion.div
                className="bg-black/60 backdrop-blur-lg rounded-lg px-4 py-3 border border-white/10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-bn-electric-teal"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-sm font-medium text-white">Syncing in background...</span>
                  </div>
                  <button
                    onClick={() => setShowLoadingOverlay(true)}
                    className="text-xs font-bold text-bn-electric-teal hover:text-white transition-colors px-2 py-1 rounded"
                  >
                    VIEW
                  </button>
                </div>
                {syncProgress && syncProgress.progress > 0 && (
                  <div className="mt-2 w-full bg-white/10 rounded-full h-1 overflow-hidden">
                    <motion.div
                      className="h-1 bg-bn-electric-teal rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${syncProgress.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* Main content with refined styling */}
        <main className="max-w-7xl mx-auto px-8 py-20 relative z-10">
          <CollectionHeader
            records={records}
            searchTerm={filtering.searchTerm}
            onSearchChange={filtering.setSearchTerm}
            totalRecords={filtering.filteredAndSortedRecords.length}
            sortBy={filtering.sortBy}
            onSortChange={filtering.setSortBy}
            filters={filtering.filters}
            filterStats={filterStats}
            collectionStats={collectionStats}
            onGenreFilter={filtering.handleGenreFilter}
            onDecadeFilter={filtering.handleDecadeFilter}
            onRandomPick={handleRandomPick}
          />

          {/* Records grid */}
          <div className="mt-24">
            {filtering.filteredAndSortedRecords.length > 0 ? (
              <VinylGrid
                records={filtering.filteredAndSortedRecords}
                onRecordClick={handleRecordClick}
                onFilter={filtering.handleFilter}
              />
            ) : (
              <div className="text-center py-24">
                <p className="text-2xl font-bold text-white hover:text-bn-electric-teal transition-colors duration-300 cursor-pointer">
                  {filtering.getNoRecordsText()}
                </p>
                <p className="mt-4 text-lg text-white/60 hover:text-bn-electric-teal transition-colors duration-300 cursor-pointer">
                  {filtering.filters.genre || filtering.filters.decade
                    ? 'No records match your filter criteria.'
                    : 'Try searching for a different artist or album.'}
                </p>
                {(filtering.filters.genre || filtering.filters.decade) && (
                  <motion.button
                    onClick={filtering.handleClearFilters}
                    className="mt-6 px-6 py-3 rounded-sm font-black tracking-wide uppercase transition-colors duration-300 hover:text-bn-electric-teal"
                    style={{
                      backgroundColor: 'var(--bn-electric-teal)',
                      color: 'var(--bn-deep-black)',
                    }}
                    whileHover={{
                      backgroundColor: 'var(--bn-vibrant-orange)',
                    }}
                  >
                    Show All Records
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Refined footer */}
          <footer className="mt-40 pt-20 border-t border-white/20">
            <div className="grid md:grid-cols-2 gap-16 text-center md:text-left">
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-6 text-white hover:text-bn-electric-teal transition-colors duration-300 cursor-pointer">
                  BEHIND THE SCENES
                </h3>
                <p className="leading-relaxed font-medium text-white/70 hover:text-bn-electric-teal transition-colors duration-300 cursor-pointer">
                  Born from curiosity, shaped by design, debugged with determination by Paulo
                  Mártires × Figma Make × Claude Code × Supabase × Vercel
                </p>
              </div>
              <div className="flex flex-col items-center md:items-end">
                <SyncButton
                  onSync={handleSyncCollection}
                  isLoading={isLoading}
                  lastSync={lastSync}
                  hasCache={records.length > 0}
                />

                {/* Error indicator */}
                {error && records.length > 0 && (
                  <motion.p
                    className="mt-4 text-sm text-bn-crimson bg-red-900/20 px-4 py-2 rounded border border-red-800/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ⚠️ {error}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Centered "Powered by Discogs" as closing element */}
            <div className="mt-16 pt-8 border-t border-white/10 text-center">
              <a
                href="https://www.discogs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm font-medium text-white/60 hover:text-bn-electric-teal transition-colors duration-300"
              >
                <span>Powered by</span>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Discogs_logo_black.svg/1024px-Discogs_logo_black.svg.png"
                  alt="Discogs"
                  className="h-6"
                  style={{ filter: 'brightness(0) invert(1) opacity(0.6)' }}
                />
              </a>
            </div>
          </footer>
        </main>
      </div>

      {/* Random Picker Modal */}
      <RandomPicker
        records={records}
        currentGenre={filtering.filters.genre}
        currentDecade={filtering.filters.decade}
        onRecordSelect={handleRecordClick}
        onFilter={filtering.handleFilter}
        onClose={handleRandomPickerClose}
        isOpen={showRandomPicker}
      />
    </ErrorBoundary>
  )
}
