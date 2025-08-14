import { useState, lazy, Suspense } from 'react'
import { VinylRecord } from '../data/vinylRecords'
import { CollectionHeader } from './CollectionHeader'
import { LoadingScreen } from './LoadingScreen'
import { ErrorScreen } from './ErrorScreen'
import { SyncButton } from './SyncButton'
import { ErrorBoundary } from './ErrorBoundary'
import { SplashScreen } from './SplashScreen'
import { VinylGrid } from './VinylGrid'
import { RandomPicker } from './RandomPicker'
import { AuthModal } from './auth/AuthModal'
import { useAuth } from '../contexts/AuthContext'
import { useSupabaseCollection } from '../hooks/useSupabaseCollection'
import { useFiltering } from '../hooks/useFiltering'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useCollectionStats } from '../hooks/useCollectionStats'
import { Button } from './ui/button'
import { User, LogOut, Settings } from 'lucide-react'

// Lazy load heavy components
const AlbumDetailPage = lazy(() =>
  import('./AlbumDetailPage').then(module => ({ default: module.AlbumDetailPage }))
)

export function AppWithAuth() {
  const { user, isAuthenticated, isLoading: authLoading, signOut, profile } = useAuth()
  const [selectedRecord, setSelectedRecord] = useState<VinylRecord | null>(null)
  const [showRandomPicker, setShowRandomPicker] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  // Use Supabase collection hook instead of the old one
  const [collectionState, collectionActions] = useSupabaseCollection()
  const { records, isLoading, error, syncProgress, lastSync, isOnline, stats } = collectionState
  const { syncCollection, refreshCollection, cancelSync } = collectionActions

  // Filtering and stats hooks work the same
  const filtering = useFiltering({ records })
  const { collectionStats, filterStats, otherAlbumsByArtist } = useCollectionStats({
    records,
    filteredRecords: filtering.filteredAndSortedRecords,
    filters: filtering.filters,
    selectedRecord,
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRandomPick: () => setShowRandomPicker(true),
    onEscape: () => {
      if (selectedRecord) {
        setSelectedRecord(null)
      } else if (showRandomPicker) {
        setShowRandomPicker(false)
      } else if (showAuthModal) {
        setShowAuthModal(false)
      }
    }
  })

  // Show auth loading
  if (authLoading) {
    return <SplashScreen />
  }

  // Show authentication screen if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome to Analog Vibes
            </h1>
            <p className="text-white/70 text-lg mb-8">
              Your personal vinyl collection in the cloud
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => {
                  setAuthMode('login')
                  setShowAuthModal(true)
                }}
                className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  setAuthMode('signup')
                  setShowAuthModal(true)
                }}
                variant="outline"
                className="w-full max-w-xs border-white/20 text-white hover:bg-white/10"
              >
                Create Account
              </Button>
            </div>
          </div>

          <div className="text-center text-white/60 text-sm max-w-md">
            <p>
              Sign up to sync your Discogs collection, access it from any device, 
              and enjoy real-time updates with friends.
            </p>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode={authMode}
        />
      </div>
    )
  }

  // Main authenticated app
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        
        {/* Header with Auth Info */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-white">Analog Vibes</h1>
              
              <div className="flex items-center space-x-4">
                {/* Online Status */}
                <div className={`flex items-center space-x-2 text-sm ${
                  isOnline ? 'text-green-400' : 'text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm">
                    {profile?.full_name || profile?.username || user?.email}
                  </span>
                </div>

                {/* Settings & Logout */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Collection Header */}
        <CollectionHeader
          records={records}
          collectionStats={collectionStats}
          filterStats={filterStats}
          filters={filtering.filters}
          searchTerm={filtering.searchTerm}
          sortBy={filtering.sortBy}
          onSearchChange={filtering.setSearchTerm}
          onFilterChange={filtering.setFilters}
          onSortChange={filtering.setSortBy}
          onRandomPick={() => setShowRandomPicker(true)}
          onClearFilters={filtering.clearAllFilters}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Sync Button */}
          <div className="mb-6">
            <SyncButton
              onSync={() => syncCollection(true)}
              isLoading={isLoading}
              syncProgress={syncProgress}
              lastSync={lastSync}
              onCancel={cancelSync}
              error={error}
              onRetry={() => syncCollection(true)}
              isConfigured={isAuthenticated} // Always true when authenticated
              onRefresh={refreshCollection}
            />
          </div>

          {/* Error State */}
          {error && !isLoading && (
            <ErrorScreen 
              message={error} 
              onRetry={() => syncCollection(true)}
            />
          )}

          {/* Loading State */}
          {isLoading && records.length === 0 && (
            <LoadingScreen 
              message={syncProgress?.message || "Loading your collection..."}
              progress={syncProgress?.progress}
            />
          )}

          {/* Empty State */}
          {!isLoading && records.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="text-white/70 text-lg mb-4">
                No records in your collection yet
              </div>
              <Button 
                onClick={() => syncCollection(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sync from Discogs
              </Button>
            </div>
          )}

          {/* Collection Grid */}
          {records.length > 0 && (
            <VinylGrid
              records={filtering.filteredAndSortedRecords}
              onRecordClick={setSelectedRecord}
              isLoading={isLoading && showLoadingOverlay}
            />
          )}

        </main>

        {/* Album Detail Modal */}
        {selectedRecord && (
          <Suspense fallback={<LoadingScreen message="Loading album details..." />}>
            <AlbumDetailPage
              record={selectedRecord}
              otherAlbums={otherAlbumsByArtist}
              onClose={() => setSelectedRecord(null)}
              onNavigate={setSelectedRecord}
            />
          </Suspense>
        )}

        {/* Random Picker Modal */}
        {showRandomPicker && (
          <RandomPicker
            records={filtering.filteredAndSortedRecords}
            filters={filtering.filters}
            onClose={() => setShowRandomPicker(false)}
            onRecordSelect={setSelectedRecord}
          />
        )}

        {/* Collection Stats Display */}
        {stats && (
          <div className="fixed bottom-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg p-3 text-white/70 text-xs">
            <div className="flex space-x-4">
              <span>Total: {stats.totalRecords}</span>
              <span>⭐ {stats.favoritesCount}</span>
              {stats.averageRating > 0 && (
                <span>Avg: {stats.averageRating.toFixed(1)}/5</span>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default AppWithAuth