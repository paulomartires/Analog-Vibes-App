import { useState, useEffect, useCallback } from 'react'
import { VinylRecord } from '../data/vinylRecords'
import { publicCollectionService, CollectionStats } from '../services/publicCollectionService'
import { discogsService } from '../services/discogsService'
import { SyncProgress } from '../services/cacheService' // Reuse existing type

export interface PublicCollectionState {
  records: VinylRecord[]
  isLoading: boolean
  error: string | null
  syncProgress: SyncProgress | null
  lastSync: Date | null
  stats: CollectionStats | null
  isOnline: boolean
}

export interface PublicCollectionActions {
  syncFromDiscogs: () => Promise<void>
  refreshCollection: () => Promise<void>
  searchCollection: (query: string) => Promise<VinylRecord[]>
  clearCollection: () => Promise<void>
  cancelSync: () => void
  testConnection: () => Promise<{ success: boolean; message: string }>
}

export function usePublicCollection(): [PublicCollectionState, PublicCollectionActions] {
  const [state, setState] = useState<PublicCollectionState>({
    records: [],
    isLoading: false,
    error: null,
    syncProgress: null,
    lastSync: null,
    stats: null,
    isOnline: navigator.onLine
  })

  const [isSyncing, setIsSyncing] = useState(false)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load collection on mount
  useEffect(() => {
    loadCollection()
    loadStats()
  }, [])

  const loadCollection = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const records = await publicCollectionService.getCollection()
      setState(prev => ({
        ...prev,
        records,
        isLoading: false,
        lastSync: new Date()
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load collection'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }))
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const stats = await publicCollectionService.getStats()
      setState(prev => ({ ...prev, stats }))
    } catch (error) {
      console.error('Failed to load collection stats:', error)
    }
  }, [])

  const syncFromDiscogs = useCallback(async () => {
    if (!state.isOnline) {
      setState(prev => ({ ...prev, error: 'Cannot sync while offline' }))
      return
    }

    if (isSyncing) return

    setIsSyncing(true)
    setState(prev => ({ ...prev, isLoading: true, error: null, syncProgress: null }))

    try {
      setState(prev => ({
        ...prev,
        syncProgress: {
          phase: 'connecting',
          progress: 10,
          message: 'Connecting to Discogs...'
        }
      }))

      // Test Discogs connection
      const connectionTest = await discogsService.testConnection()
      if (!connectionTest.success) {
        throw new Error(connectionTest.message)
      }

      setState(prev => ({
        ...prev,
        syncProgress: {
          phase: 'fetching',
          progress: 30,
          message: 'Fetching collection from Discogs...'
        }
      }))

      // Get Discogs collection
      const discogsReleases = await discogsService.getAllUserCollection(false)

      setState(prev => ({
        ...prev,
        syncProgress: {
          phase: 'transforming',
          progress: 60,
          message: `Processing ${discogsReleases.length} releases...`,
          recordsProcessed: 0,
          totalRecords: discogsReleases.length
        }
      }))

      // Sync to database
      const syncResult = await publicCollectionService.syncFromDiscogs(discogsReleases)

      setState(prev => ({
        ...prev,
        syncProgress: {
          phase: 'complete',
          progress: 100,
          message: `Sync complete! Added ${syncResult.recordsAdded} records${
            syncResult.errors.length > 0 ? ` (${syncResult.errors.length} errors)` : ''
          }`
        }
      }))

      // Refresh collection and stats
      await loadCollection()
      await loadStats()

      // Clear progress after a delay
      setTimeout(() => {
        setState(prev => ({ ...prev, syncProgress: null }))
      }, 3000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed'
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        syncProgress: {
          phase: 'error',
          progress: 0,
          message: `Sync failed: ${errorMessage}`
        }
      }))
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
      setIsSyncing(false)
    }
  }, [state.isOnline, isSyncing, loadCollection, loadStats])

  const refreshCollection = useCallback(async () => {
    await loadCollection()
    await loadStats()
  }, [loadCollection, loadStats])

  const searchCollection = useCallback(async (query: string): Promise<VinylRecord[]> => {
    try {
      return await publicCollectionService.searchCollection(query)
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }, [])

  const clearCollection = useCallback(async () => {
    try {
      await publicCollectionService.clearCollection()
      await loadCollection()
      await loadStats()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear collection'
      setState(prev => ({ ...prev, error: errorMessage }))
    }
  }, [loadCollection, loadStats])

  const cancelSync = useCallback(() => {
    setIsSyncing(false)
    setState(prev => ({
      ...prev,
      isLoading: false,
      syncProgress: {
        phase: 'error',
        progress: 0,
        message: 'Sync cancelled by user'
      }
    }))

    // Clear progress after a delay
    setTimeout(() => {
      setState(prev => ({ ...prev, syncProgress: null }))
    }, 2000)
  }, [])

  const testConnection = useCallback(async () => {
    return await publicCollectionService.testConnection()
  }, [])

  const actions: PublicCollectionActions = {
    syncFromDiscogs,
    refreshCollection,
    searchCollection,
    clearCollection,
    cancelSync,
    testConnection
  }

  return [state, actions]
}