import { useState, useEffect, useCallback } from 'react';
import { VinylRecord } from '../data/vinylRecords';
import { syncService } from '../services/syncService';
import { SyncProgress } from '../services/cacheService';

export interface CollectionState {
  records: VinylRecord[];
  isLoading: boolean;
  error: string | null;
  syncProgress: SyncProgress | null;
  lastSync: Date | null;
  hasCache: boolean;
  isConfigured: boolean;
}

export interface CollectionActions {
  syncCollection: (forceRefresh?: boolean) => Promise<void>;
  cancelSync: () => void;
  clearCache: () => Promise<void>;
  testConnection: () => Promise<{ success: boolean; message: string }>;
  updateRecord: (recordId: string, updatedRecord: VinylRecord) => Promise<void>;
  addRecord: (record: VinylRecord) => Promise<void>;
  removeRecord: (recordId: string) => Promise<void>;
  retrySync: () => Promise<void>;
  getCacheInfo: () => Promise<any>;
  exportCollection: () => Promise<any>;
}

export function useVinylCollection(): [CollectionState, CollectionActions] {
  const [state, setState] = useState<CollectionState>({
    records: [],
    isLoading: false,
    error: null,
    syncProgress: null,
    lastSync: null,
    hasCache: false,
    isConfigured: false
  });

  // Check configuration status
  useEffect(() => {
    try {
      const config = syncService.getConfigurationStatus();
      setState(prev => ({
        ...prev,
        isConfigured: config.isConfigured
      }));
    } catch (error) {
      console.error('Error checking configuration status:', error);
      setState(prev => ({
        ...prev,
        isConfigured: false,
        error: 'Configuration check failed'
      }));
    }
  }, []);

  // Check cache status on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkCacheStatus = async () => {
      try {
        const cacheInfo = await syncService.getCacheInfo();
        // Only update state if component is still mounted
        if (isMounted) {
          setState(prev => ({
            ...prev,
            hasCache: cacheInfo.hasCache,
            lastSync: cacheInfo.lastSync || null
          }));
        }
      } catch (error) {
        console.error('Error checking cache status:', error);
        // Set safe fallback state on error, only if still mounted
        if (isMounted) {
          setState(prev => ({
            ...prev,
            hasCache: false,
            lastSync: null,
            error: 'Failed to check cache status'
          }));
        }
      }
    };

    // Wrap in additional try-catch for extra safety
    try {
      checkCacheStatus();
    } catch (error) {
      console.error('Failed to initialize cache check:', error);
      if (isMounted) {
        setState(prev => ({
          ...prev,
          hasCache: false,
          lastSync: null,
          error: 'Cache initialization failed'
        }));
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Progress callback for sync operations
  const handleSyncProgress = useCallback((progress: SyncProgress) => {
    setState(prev => ({
      ...prev,
      syncProgress: progress,
      error: progress.phase === 'error' ? progress.message : null
    }));
  }, []);

  // Sync collection
  const syncCollection = useCallback(async (forceRefresh: boolean = false) => {
    setState(prev => {
      if (prev.isLoading) {
        console.warn('Sync already in progress');
        return prev;
      }
      return {
        ...prev,
        isLoading: true,
        error: null,
        syncProgress: null
      };
    });

    try {
      const { records, result } = await syncService.getVinylRecords({
        forceRefresh,
        onProgress: handleSyncProgress
      });

      setState(prev => ({
        ...prev,
        records,
        isLoading: false,
        error: result.success ? null : (result.errors.join(', ') || 'Sync failed'),
        syncProgress: null,
        lastSync: new Date(),
        hasCache: true
      }));

      // Log sync result
      if (result.success) {
        console.log(`Sync completed: ${result.recordsProcessed} records ${result.fromCache ? 'from cache' : 'from Discogs'}`);
      } else {
        console.error('Sync failed:', result.errors);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync collection';
      console.error('Sync error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        syncProgress: null
      }));
    }
  }, [handleSyncProgress]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      await syncService.clearCache();
      setState(prev => ({
        ...prev,
        records: [],
        hasCache: false,
        lastSync: null,
        error: null
      }));
      console.log('Cache cleared successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cache';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
    }
  }, []);

  // Test connection
  const testConnection = useCallback(async () => {
    try {
      return await syncService.testConnection();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection test failed';
      return { success: false, message: errorMessage };
    }
  }, []);

  // Update record
  const updateRecord = useCallback(async (recordId: string, updatedRecord: VinylRecord) => {
    try {
      await syncService.updateRecord(recordId, updatedRecord);
      
      setState(prev => ({
        ...prev,
        records: prev.records.map(record => 
          record.id === recordId ? updatedRecord : record
        )
      }));
      
      console.log(`Record ${recordId} updated successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update record';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Add record
  const addRecord = useCallback(async (record: VinylRecord) => {
    try {
      await syncService.addRecord(record);
      
      setState(prev => {
        const existingIndex = prev.records.findIndex(r => r.id === record.id);
        if (existingIndex !== -1) {
          // Update existing record
          const updatedRecords = [...prev.records];
          updatedRecords[existingIndex] = record;
          return { ...prev, records: updatedRecords };
        } else {
          // Add new record
          return { ...prev, records: [...prev.records, record] };
        }
      });
      
      console.log(`Record ${record.id} added successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add record';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Remove record
  const removeRecord = useCallback(async (recordId: string) => {
    try {
      await syncService.removeRecord(recordId);
      
      setState(prev => ({
        ...prev,
        records: prev.records.filter(record => record.id !== recordId)
      }));
      
      console.log(`Record ${recordId} removed successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove record';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Retry sync (clears error and tries again)
  const retrySync = useCallback(async () => {
    setState(prev => ({ ...prev, error: null }));
    await syncCollection(false);
  }, [syncCollection]);

  // Auto-load collection on mount if configured and has cache
  useEffect(() => {
    let isMounted = true;
    
    const autoLoad = async () => {
      if (state.isConfigured && !state.isLoading && state.records.length === 0 && isMounted) {
        try {
          const cacheInfo = await syncService.getCacheInfo();
          if (cacheInfo.hasCache && cacheInfo.isValid && isMounted) {
            console.log('Auto-loading from cache...');
            await syncCollection(false);
          }
        } catch (error) {
          console.error('Auto-load failed:', error);
          // Don't set error state for auto-load failures to avoid blocking UI
        }
      }
    };

    autoLoad();
    
    return () => {
      isMounted = false;
    };
  }, [state.isConfigured, state.isLoading, state.records.length, syncCollection]);

  // Get cache info
  const getCacheInfo = useCallback(async () => {
    return await syncService.getCacheInfo();
  }, []);

  // Cancel sync
  const cancelSync = useCallback(() => {
    syncService.cancelCurrentSync();
    setState(prev => ({
      ...prev,
      isLoading: false,
      syncProgress: null,
      error: 'Sync cancelled by user'
    }));
  }, []);

  // Export collection data
  const exportCollection = useCallback(async () => {
    return await syncService.exportCollection();
  }, []);

  const actions: CollectionActions = {
    syncCollection,
    cancelSync,
    clearCache,
    testConnection,
    updateRecord,
    addRecord,
    removeRecord,
    retrySync,
    getCacheInfo,
    exportCollection
  };

  return [state, actions];
}