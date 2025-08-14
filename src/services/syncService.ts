import { discogsService, DiscogsRelease } from './discogsService';
import { cacheService, SyncProgress } from './cacheService';
import { transformDiscogsToVinylRecord, filterValidRecords } from './dataTransform';
import { VinylRecord } from '../data/vinylRecords';

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  duration: number;
  fromCache: boolean;
}

export interface SyncOptions {
  forceRefresh?: boolean;
  onProgress?: (progress: SyncProgress) => void;
  skipMasterData?: boolean; // Skip master data enrichment for ultra-fast sync
}

class SyncService {
  private isSync = false;
  private cancelSync = false;

  /**
   * Get vinyl records - from cache if valid, otherwise sync from Discogs
   */
  async getVinylRecords(options: SyncOptions = {}): Promise<{ records: VinylRecord[]; result: SyncResult }> {
    const { forceRefresh = false, onProgress, skipMasterData = false } = options;

    // Check if we should use cache
    if (!forceRefresh) {
      const isValid = await cacheService.isCacheValid();
      if (isValid) {
        const cachedRecords = await cacheService.getCachedCollection();
        if (cachedRecords && cachedRecords.length > 0) {
          console.log(`Using cached collection: ${cachedRecords.length} records`);
          
          onProgress?.({
            phase: 'complete',
            progress: 100,
            message: `Loaded ${cachedRecords.length} records from cache`,
            recordsProcessed: cachedRecords.length,
            totalRecords: cachedRecords.length
          });

          return {
            records: cachedRecords,
            result: {
              success: true,
              recordsProcessed: cachedRecords.length,
              errors: [],
              duration: 0,
              fromCache: true
            }
          };
        }
      }
    }

    // Sync from Discogs
    return this.syncFromDiscogs(onProgress, skipMasterData);
  }

  /**
   * Force sync from Discogs API
   */
  async syncFromDiscogs(onProgress?: (progress: SyncProgress) => void, skipMasterData: boolean = false): Promise<{ records: VinylRecord[]; result: SyncResult }> {
    if (this.isSync) {
      throw new Error('Sync already in progress');
    }

    this.isSync = true;
    this.cancelSync = false;
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Check for cancellation at start
      if (this.cancelSync) {
        throw new Error('Sync cancelled by user');
      }
      // Test connection
      onProgress?.({
        phase: 'connecting',
        progress: 0,
        message: 'Connecting to Discogs API...'
      });

      const connectionTest = await discogsService.testConnection();
      if (!connectionTest.success) {
        throw new Error(connectionTest.message);
      }

      onProgress?.({
        phase: 'connecting',
        progress: 10,
        message: `Connected as ${connectionTest.userInfo?.username || 'Unknown User'}`
      });

      // Fetch collection
      onProgress?.({
        phase: 'fetching',
        progress: 20,
        message: 'Fetching collection from Discogs...'
      });

      const discogsReleases = await discogsService.getAllUserCollection(false); // Disable track details for speed

      // Check for cancellation after collection fetch
      if (this.cancelSync) {
        throw new Error('Sync cancelled by user');
      }

      if (discogsReleases.length === 0) {
        throw new Error('No releases found in your Discogs collection');
      }

      onProgress?.({
        phase: 'fetching',
        progress: 40,
        message: `Fetched ${discogsReleases.length} releases`
      });

      // Conditionally fetch master data for each release
      let enrichedReleases: Array<{ release: DiscogsRelease; master?: any }>;
      
      if (skipMasterData) {
        onProgress?.({
          phase: 'fetching',
          progress: 60,
          message: 'Skipping master data for faster sync...'
        });
        
        // Create enriched releases without master data
        enrichedReleases = discogsReleases.map(release => ({ release, master: undefined }));
      } else {
        onProgress?.({
          phase: 'fetching',
          progress: 50,
          message: 'Fetching master release data...'
        });

        enrichedReleases = await discogsService.enrichWithMasterData(discogsReleases);

        onProgress?.({
          phase: 'fetching',
          progress: 60,
          message: `Enriched ${enrichedReleases.length} releases with master data`
        });
      }

      // Transform data
      onProgress?.({
        phase: 'transforming',
        progress: 70,
        message: 'Converting releases to app format...'
      });

      // Transform each enriched release with both release and master data
      const transformedRecords: VinylRecord[] = [];
      enrichedReleases.forEach((enriched, index) => {
        try {
          const vinylRecord = transformDiscogsToVinylRecord(
            enriched.release,
            enriched.master,
            index
          );
          transformedRecords.push(vinylRecord);
        } catch (error) {
          console.warn(`Failed to transform release ${enriched.release.id}:`, error);
        }
      });
      const validRecords = filterValidRecords(transformedRecords);

      if (validRecords.length !== transformedRecords.length) {
        const invalidCount = transformedRecords.length - validRecords.length;
        errors.push(`${invalidCount} records were invalid and filtered out`);
        console.warn(`Filtered out ${invalidCount} invalid records`);
      }

      onProgress?.({
        phase: 'transforming',
        progress: 80,
        message: `Processed ${validRecords.length} valid records`
      });

      // Cache the results
      onProgress?.({
        phase: 'caching',
        progress: 90,
        message: 'Saving to local cache...'
      });

      const duration = Date.now() - startTime;
      await cacheService.cacheCollection(validRecords, duration, errors);

      onProgress?.({
        phase: 'complete',
        progress: 100,
        message: `Sync complete! ${validRecords.length} records cached`,
        recordsProcessed: validRecords.length,
        totalRecords: validRecords.length
      });

      const result: SyncResult = {
        success: true,
        recordsProcessed: validRecords.length,
        errors,
        duration,
        fromCache: false
      };

      return { records: validRecords, result };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      errors.push(errorMessage);

      onProgress?.({
        phase: 'error',
        progress: 0,
        message: `Sync failed: ${errorMessage}`
      });

      // Try to return cached data as fallback
      const cachedRecords = await cacheService.getCachedCollection();
      if (cachedRecords && cachedRecords.length > 0) {
        console.warn('Sync failed, using cached data as fallback');
        
        const result: SyncResult = {
          success: false,
          recordsProcessed: cachedRecords.length,
          errors,
          duration: Date.now() - startTime,
          fromCache: true
        };

        return { records: cachedRecords, result };
      }

      const result: SyncResult = {
        success: false,
        recordsProcessed: 0,
        errors,
        duration: Date.now() - startTime,
        fromCache: false
      };

      return { records: [], result };

    } finally {
      this.isSync = false;
      this.cancelSync = false;
    }
  }

  /**
   * Get sync status
   */
  isSyncing(): boolean {
    return this.isSync;
  }

  /**
   * Cancel the current sync operation
   */
  cancelCurrentSync(): void {
    if (this.isSync) {
      console.log('Cancelling sync operation...');
      this.cancelSync = true;
    }
  }

  /**
   * Get cache information
   */
  async getCacheInfo() {
    return cacheService.getCacheStatus();
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    return cacheService.clearCache();
  }

  /**
   * Test Discogs API connection
   */
  async testConnection() {
    return discogsService.testConnection();
  }

  /**
   * Search Discogs for releases
   */
  async searchDiscogs(query: string) {
    return discogsService.searchReleases(query);
  }

  /**
   * Get detailed release information
   */
  async getRelease(releaseId: number) {
    return discogsService.getRelease(releaseId);
  }

  /**
   * Update a specific record in cache
   */
  async updateRecord(recordId: string, updatedRecord: VinylRecord): Promise<void> {
    return cacheService.updateCachedRecord(recordId, updatedRecord);
  }

  /**
   * Add a new record to cache
   */
  async addRecord(record: VinylRecord): Promise<void> {
    return cacheService.addCachedRecord(record);
  }

  /**
   * Remove a record from cache
   */
  async removeRecord(recordId: string): Promise<void> {
    return cacheService.removeCachedRecord(recordId);
  }

  /**
   * Export collection data
   */
  async exportCollection() {
    return cacheService.exportCache();
  }

  /**
   * Import collection data
   */
  async importCollection(data: any) {
    return cacheService.importCache(data);
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo() {
    return cacheService.getStorageInfo();
  }

  /**
   * Validate environment configuration
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!import.meta.env.VITE_DISCOGS_PERSONAL_ACCESS_TOKEN) {
      errors.push('Missing VITE_DISCOGS_PERSONAL_ACCESS_TOKEN environment variable');
    }

    if (!import.meta.env.VITE_DISCOGS_USERNAME) {
      errors.push('Missing VITE_DISCOGS_USERNAME environment variable');
    }

    if (!import.meta.env.VITE_DISCOGS_USER_AGENT) {
      errors.push('Missing VITE_DISCOGS_USER_AGENT environment variable');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get configuration status for UI display
   */
  getConfigurationStatus(): {
    hasToken: boolean;
    hasUsername: boolean;
    hasUserAgent: boolean;
    isConfigured: boolean;
  } {
    const hasToken = !!import.meta.env.VITE_DISCOGS_PERSONAL_ACCESS_TOKEN && 
                     import.meta.env.VITE_DISCOGS_PERSONAL_ACCESS_TOKEN !== 'your_personal_access_token_here';
    
    const hasUsername = !!import.meta.env.VITE_DISCOGS_USERNAME && 
                       import.meta.env.VITE_DISCOGS_USERNAME !== 'your_username_here';
    
    const hasUserAgent = !!import.meta.env.VITE_DISCOGS_USER_AGENT;

    return {
      hasToken,
      hasUsername,
      hasUserAgent,
      isConfigured: hasToken && hasUsername && hasUserAgent
    };
  }
}

// Create and export singleton instance
export const syncService = new SyncService();
export default SyncService;