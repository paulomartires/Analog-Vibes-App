import { useState, useEffect, useCallback } from 'react'
import { VinylRecord } from '../data/vinylRecords'
import { supabaseService, CollectionSyncLog } from '../services/supabaseService'
import { useAuth } from '../contexts/AuthContext'
import { discogsService } from '../services/discogsService'
import { transformDiscogsToVinylRecord, filterValidRecords } from '../services/dataTransform'

export interface SupabaseCollectionState {
  records: VinylRecord[]
  isLoading: boolean
  error: string | null
  syncProgress: SyncProgress | null
  lastSync: Date | null
  isOnline: boolean
  stats: CollectionStats | null
}

export interface SyncProgress {
  phase: 'connecting' | 'fetching' | 'transforming' | 'saving' | 'complete' | 'error'
  progress: number // 0-100
  message: string
  recordsProcessed?: number
  totalRecords?: number
  currentSyncId?: string
}

export interface CollectionStats {
  totalRecords: number
  favoritesCount: number
  averageRating: number
  totalPlays: number
  collectionStarted: string
  lastAddition: string
  topGenres: Array<{ genre: string; count: number }>
  decadeDistribution: Array<{ decade: string; count: number }>
}

export interface SupabaseCollectionActions {
  syncCollection: (forceRefresh?: boolean) => Promise<void>
  addRecord: (record: VinylRecord, collectionData?: any) => Promise<void>
  updateRecord: (recordId: string, updates: any) => Promise<void>
  removeRecord: (recordId: string) => Promise<void>
  toggleFavorite: (recordId: string) => Promise<void>
  updatePlayCount: (recordId: string) => Promise<void>
  rateRecord: (recordId: string, rating: number) => Promise<void>
  cancelSync: () => void
  refreshCollection: () => Promise<void>
  getStats: () => Promise<CollectionStats | null>
}

export function useSupabaseCollection(): [SupabaseCollectionState, SupabaseCollectionActions] {
  const { user, isAuthenticated } = useAuth()
  const [state, setState] = useState<SupabaseCollectionState>({
    records: [],
    isLoading: false,
    error: null,
    syncProgress: null,
    lastSync: null,
    isOnline: navigator.onLine,
    stats: null
  })

  const [currentSyncId, setCurrentSyncId] = useState<string | null>(null)

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

  // Load collection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadCollection()
      loadStats()
    } else {
      setState(prev => ({
        ...prev,
        records: [],
        stats: null,
        error: null
      }))
    }
  }, [isAuthenticated, user])

  // Real-time subscription to collection changes
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const channel = supabaseService.subscribeToCollection(user.id, (payload) => {
      console.log('Collection change detected:', payload)
      // Refresh collection on changes
      loadCollection()
    })

    return () => {
      supabaseService.getClient().removeChannel(channel)
    }
  }, [isAuthenticated, user])

  const loadCollection = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const records = await supabaseService.getUserCollection()
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
  }, [isAuthenticated, user])

  const loadStats = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      const stats = await supabaseService.getCollectionStats()
      setState(prev => ({ ...prev, stats }))
    } catch (error) {
      console.error('Failed to load collection stats:', error)
    }
  }, [isAuthenticated, user])

  const syncCollection = useCallback(async (forceRefresh: boolean = false) => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }))
      return
    }

    if (!state.isOnline) {
      setState(prev => ({ ...prev, error: 'Cannot sync while offline' }))
      return
    }

    if (state.isLoading) return

    setState(prev => ({ ...prev, isLoading: true, error: null, syncProgress: null }))

    try {
      // Start sync log
      const syncLog = await supabaseService.startSync('manual')
      setCurrentSyncId(syncLog.id)

      setState(prev => ({
        ...prev,
        syncProgress: {
          phase: 'connecting',
          progress: 10,
          message: 'Connecting to Discogs...',
          currentSyncId: syncLog.id
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
          message: 'Fetching collection from Discogs...',
          currentSyncId: syncLog.id
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
          totalRecords: discogsReleases.length,
          currentSyncId: syncLog.id
        }
      }))

      // Transform and save records
      let recordsAdded = 0
      let recordsUpdated = 0
      const errors: string[] = []

      for (let i = 0; i < discogsReleases.length; i++) {
        const release = discogsReleases[i]

        try {
          // Transform to VinylRecord format
          const vinylRecord = transformDiscogsToVinylRecord(release, undefined, i)
          
          // Add to collection
          await supabaseService.addToCollection(vinylRecord)
          recordsAdded++

          // Update progress
          setState(prev => ({
            ...prev,
            syncProgress: {
              ...prev.syncProgress!,
              progress: 60 + (i / discogsReleases.length) * 30,
              message: `Processing ${i + 1}/${discogsReleases.length} releases...`,
              recordsProcessed: i + 1
            }
          }))

        } catch (error) {
          console.warn(`Failed to process release ${release.id}:`, error)
          errors.push(`Release ${release.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Complete sync
      await supabaseService.completeSync(syncLog.id, {
        records_processed: discogsReleases.length,
        records_added: recordsAdded,
        records_updated: recordsUpdated,
        records_removed: 0,
        errors,
        discogs_api_calls: discogsReleases.length + 1 // Rough estimate
      })

      setState(prev => ({
        ...prev,
        syncProgress: {
          phase: 'complete',
          progress: 100,
          message: `Sync complete! Added ${recordsAdded} records${errors.length > 0 ? ` (${errors.length} errors)` : ''}`,
          recordsProcessed: discogsReleases.length,
          totalRecords: discogsReleases.length
        }
      }))

      // Refresh collection and stats
      await loadCollection()
      await loadStats()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed'
      
      if (currentSyncId) {
        await supabaseService.updateSync(currentSyncId, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          errors: [errorMessage]
        })
      }

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
      setCurrentSyncId(null)
    }
  }, [isAuthenticated, user, state.isOnline, state.isLoading, currentSyncId, loadCollection, loadStats])

  const addRecord = useCallback(async (record: VinylRecord, collectionData?: any) => {
    if (!isAuthenticated) throw new Error('User not authenticated')

    try {
      await supabaseService.addToCollection(record, collectionData)
      await loadCollection()
      await loadStats()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add record'
      setState(prev => ({ ...prev, error: errorMessage }))
      throw error
    }
  }, [isAuthenticated, loadCollection, loadStats])

  const updateRecord = useCallback(async (recordId: string, updates: any) => {
    if (!isAuthenticated) throw new Error('User not authenticated')

    try {
      await supabaseService.updateCollectionRecord(recordId, updates)
      await loadCollection()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update record'
      setState(prev => ({ ...prev, error: errorMessage }))
      throw error
    }
  }, [isAuthenticated, loadCollection])

  const removeRecord = useCallback(async (recordId: string) => {
    if (!isAuthenticated) throw new Error('User not authenticated')

    try {
      await supabaseService.removeFromCollection(recordId)
      await loadCollection()
      await loadStats()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove record'
      setState(prev => ({ ...prev, error: errorMessage }))
      throw error
    }
  }, [isAuthenticated, loadCollection, loadStats])

  const toggleFavorite = useCallback(async (recordId: string) => {
    const record = state.records.find(r => r.id === recordId)
    if (!record) return

    const newFavoriteStatus = !record._collectionData?.isFavorite
    await updateRecord(recordId, { is_favorite: newFavoriteStatus })
  }, [state.records, updateRecord])

  const updatePlayCount = useCallback(async (recordId: string) => {
    const record = state.records.find(r => r.id === recordId)
    if (!record) return

    const newPlayCount = (record._collectionData?.playCount || 0) + 1
    await updateRecord(recordId, { 
      play_count: newPlayCount,
      last_played: new Date().toISOString()
    })
  }, [state.records, updateRecord])

  const rateRecord = useCallback(async (recordId: string, rating: number) => {
    if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5')
    await updateRecord(recordId, { rating })
  }, [updateRecord])

  const cancelSync = useCallback(() => {
    if (currentSyncId) {
      supabaseService.updateSync(currentSyncId, {
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      setCurrentSyncId(null)
    }

    setState(prev => ({
      ...prev,
      isLoading: false,
      syncProgress: {
        phase: 'error',
        progress: 0,
        message: 'Sync cancelled by user'
      }
    }))
  }, [currentSyncId])

  const refreshCollection = useCallback(async () => {
    await loadCollection()
    await loadStats()
  }, [loadCollection, loadStats])

  const getStats = useCallback(async () => {
    if (!isAuthenticated || !user) return null
    
    try {
      const stats = await supabaseService.getCollectionStats()
      setState(prev => ({ ...prev, stats }))
      return stats
    } catch (error) {
      console.error('Failed to get collection stats:', error)
      return null
    }
  }, [isAuthenticated, user])

  const actions: SupabaseCollectionActions = {
    syncCollection,
    addRecord,
    updateRecord,
    removeRecord,
    toggleFavorite,
    updatePlayCount,
    rateRecord,
    cancelSync,
    refreshCollection,
    getStats
  }

  return [state, actions]
}