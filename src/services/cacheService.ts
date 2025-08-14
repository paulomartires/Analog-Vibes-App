import localforage from 'localforage'
import { VinylRecord } from '../data/vinylRecords'

export interface CacheMetadata {
  lastSync: number
  version: string
  totalRecords: number
  syncDuration: number
  errors?: string[]
}

export interface CachedCollection {
  records: VinylRecord[]
  metadata: CacheMetadata
}

export interface SyncProgress {
  phase: 'connecting' | 'fetching' | 'transforming' | 'caching' | 'complete' | 'error'
  progress: number // 0-100
  message: string
  currentPage?: number
  totalPages?: number
  recordsProcessed?: number
  totalRecords?: number
}

class CacheService {
  private static readonly COLLECTION_KEY = 'vinyl_collection'
  private static readonly METADATA_KEY = 'collection_metadata'
  private static readonly CACHE_VERSION = '1.0.0'
  private static readonly CACHE_EXPIRY_HOURS = 24 // Cache expires after 24 hours

  private store: LocalForage

  constructor() {
    // Configure localforage for better performance
    this.store = localforage.createInstance({
      name: 'AnalogVibesApp',
      storeName: 'vinyl_cache',
      version: 1.0,
      description: 'Vinyl collection cache storage',
    })
  }

  /**
   * Check if cached data exists and is still valid
   */
  async isCacheValid(): Promise<boolean> {
    try {
      const metadata = await this.getMetadata()
      if (!metadata) return false

      const now = Date.now()
      const cacheAge = now - metadata.lastSync
      const maxAge = CacheService.CACHE_EXPIRY_HOURS * 60 * 60 * 1000

      return cacheAge < maxAge
    } catch (error) {
      console.error('Error checking cache validity:', error)
      return false
    }
  }

  /**
   * Get cached collection
   */
  async getCachedCollection(): Promise<VinylRecord[] | null> {
    try {
      const records = await this.store.getItem<VinylRecord[]>(CacheService.COLLECTION_KEY)
      return records || null
    } catch (error) {
      console.error('Error retrieving cached collection:', error)
      return null
    }
  }

  /**
   * Cache the collection with metadata
   */
  async cacheCollection(
    records: VinylRecord[],
    syncDuration: number,
    errors: string[] = []
  ): Promise<void> {
    try {
      const metadata: CacheMetadata = {
        lastSync: Date.now(),
        version: CacheService.CACHE_VERSION,
        totalRecords: records.length,
        syncDuration,
        errors: errors.length > 0 ? errors : undefined,
      }

      // Store records and metadata separately for better performance
      await Promise.all([
        this.store.setItem(CacheService.COLLECTION_KEY, records),
        this.store.setItem(CacheService.METADATA_KEY, metadata),
      ])

      console.log(`Cached ${records.length} records successfully`)
    } catch (error) {
      console.error('Error caching collection:', error)
      throw new Error('Failed to cache collection data')
    }
  }

  /**
   * Get cache metadata
   */
  async getMetadata(): Promise<CacheMetadata | null> {
    try {
      return await this.store.getItem<CacheMetadata>(CacheService.METADATA_KEY)
    } catch (error) {
      console.error('Error retrieving cache metadata:', error)
      return null
    }
  }

  /**
   * Get cache status information
   */
  async getCacheStatus(): Promise<{
    hasCache: boolean
    isValid: boolean
    lastSync?: Date
    totalRecords?: number
    cacheSize?: string
    age?: string
  }> {
    try {
      const metadata = await this.getMetadata()
      const hasCache = metadata !== null
      const isValid = hasCache && (await this.isCacheValid())

      let age: string | undefined
      let lastSync: Date | undefined

      if (metadata) {
        lastSync = new Date(metadata.lastSync)
        const ageMs = Date.now() - metadata.lastSync
        age = this.formatDuration(ageMs)
      }

      // Estimate cache size
      let cacheSize: string | undefined
      if (hasCache) {
        try {
          const records = await this.getCachedCollection()
          if (records) {
            const sizeBytes = new Blob([JSON.stringify(records)]).size
            cacheSize = this.formatBytes(sizeBytes)
          }
        } catch (error) {
          cacheSize = 'Unknown'
        }
      }

      return {
        hasCache,
        isValid,
        lastSync,
        totalRecords: metadata?.totalRecords,
        cacheSize,
        age,
      }
    } catch (error) {
      console.error('Error getting cache status:', error)
      return { hasCache: false, isValid: false }
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    try {
      await Promise.all([
        this.store.removeItem(CacheService.COLLECTION_KEY),
        this.store.removeItem(CacheService.METADATA_KEY),
      ])
      console.log('Cache cleared successfully')
    } catch (error) {
      console.error('Error clearing cache:', error)
      throw new Error('Failed to clear cache')
    }
  }

  /**
   * Update a single record in the cache
   */
  async updateCachedRecord(recordId: string, updatedRecord: VinylRecord): Promise<void> {
    try {
      const records = await this.getCachedCollection()
      if (!records) {
        throw new Error('No cached collection found')
      }

      const index = records.findIndex(r => r.id === recordId)
      if (index === -1) {
        throw new Error(`Record with ID ${recordId} not found in cache`)
      }

      records[index] = updatedRecord
      await this.store.setItem(CacheService.COLLECTION_KEY, records)

      console.log(`Updated record ${recordId} in cache`)
    } catch (error) {
      console.error('Error updating cached record:', error)
      throw error
    }
  }

  /**
   * Add a new record to the cache
   */
  async addCachedRecord(newRecord: VinylRecord): Promise<void> {
    try {
      const records = (await this.getCachedCollection()) || []

      // Check if record already exists
      const existingIndex = records.findIndex(r => r.id === newRecord.id)
      if (existingIndex !== -1) {
        records[existingIndex] = newRecord // Update existing
      } else {
        records.push(newRecord) // Add new
      }

      await this.store.setItem(CacheService.COLLECTION_KEY, records)

      // Update metadata
      const metadata = await this.getMetadata()
      if (metadata) {
        metadata.totalRecords = records.length
        await this.store.setItem(CacheService.METADATA_KEY, metadata)
      }

      console.log(`Added/updated record ${newRecord.id} in cache`)
    } catch (error) {
      console.error('Error adding record to cache:', error)
      throw error
    }
  }

  /**
   * Remove a record from the cache
   */
  async removeCachedRecord(recordId: string): Promise<void> {
    try {
      const records = await this.getCachedCollection()
      if (!records) {
        throw new Error('No cached collection found')
      }

      const filteredRecords = records.filter(r => r.id !== recordId)
      if (filteredRecords.length === records.length) {
        throw new Error(`Record with ID ${recordId} not found in cache`)
      }

      await this.store.setItem(CacheService.COLLECTION_KEY, filteredRecords)

      // Update metadata
      const metadata = await this.getMetadata()
      if (metadata) {
        metadata.totalRecords = filteredRecords.length
        await this.store.setItem(CacheService.METADATA_KEY, metadata)
      }

      console.log(`Removed record ${recordId} from cache`)
    } catch (error) {
      console.error('Error removing record from cache:', error)
      throw error
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    usage: number
    quota: number
    usagePercentage: number
    available: number
  }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        const quota = estimate.quota || 0

        return {
          usage,
          quota,
          usagePercentage: quota > 0 ? (usage / quota) * 100 : 0,
          available: quota - usage,
        }
      }
    } catch (error) {
      console.warn('Storage estimation not available:', error)
    }

    return {
      usage: 0,
      quota: 0,
      usagePercentage: 0,
      available: 0,
    }
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Format duration to human readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`
  }

  /**
   * Export cache data for backup
   */
  async exportCache(): Promise<CachedCollection | null> {
    try {
      const [records, metadata] = await Promise.all([
        this.getCachedCollection(),
        this.getMetadata(),
      ])

      if (!records || !metadata) return null

      return { records, metadata }
    } catch (error) {
      console.error('Error exporting cache:', error)
      return null
    }
  }

  /**
   * Import cache data from backup
   */
  async importCache(data: CachedCollection): Promise<void> {
    try {
      await this.cacheCollection(data.records, data.metadata.syncDuration, data.metadata.errors)
      console.log('Cache imported successfully')
    } catch (error) {
      console.error('Error importing cache:', error)
      throw new Error('Failed to import cache data')
    }
  }
}

// Create and export singleton instance
export const cacheService = new CacheService()
export default CacheService
