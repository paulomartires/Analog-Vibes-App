import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { VinylRecord } from '../data/vinylRecords'
import { DiscogsRelease } from './discogsService'
import { transformDiscogsToVinylRecord } from './dataTransform'

export interface PublicVinylRecord {
  id: string
  title: string
  artist: string
  year: string
  label: string
  genres: string[] // Changed from genre to genres array
  catalog_number: string
  cover_url: string
  description?: string
  producer?: string
  recording_date?: string
  release_date?: string
  tracks: any[]
  master_id?: string
  discogs_release_id?: string
  discogs_master_id?: string
  created_at: string
  updated_at: string
}

export interface SyncMetadata {
  id: string
  sync_type: string
  status: string
  started_at: string
  completed_at?: string
  records_processed: number
  records_added: number
  records_updated: number
  errors: any[]
  sync_duration_ms?: number
  created_at: string
}

export interface CollectionStats {
  total_records: number
  unique_artists: number
  unique_genres: number
  unique_labels: number
  earliest_year: number
  latest_year: number
  top_genres: Array<{ genre: string; count: number }>
  top_artists: Array<{ artist: string; count: number }>
  decade_distribution: Array<{ decade: string; count: number }>
}

class PublicCollectionService {
  private client: SupabaseClient

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file')
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false // No user sessions needed for public access
      }
    })
  }

  // ============================================================================
  // PUBLIC READ METHODS
  // ============================================================================

  /**
   * Get the entire vinyl collection (public access)
   */
  async getCollection(): Promise<VinylRecord[]> {
    const { data, error } = await this.client
      .from('vinyl_collection')
      .select('*')
      .order('artist', { ascending: true })

    if (error) throw error

    // Transform database records to VinylRecord format
    return this.transformDBRecordsToVinylRecords(data || [])
  }

  /**
   * Get collection statistics
   */
  async getStats(): Promise<CollectionStats | null> {
    const { data, error } = await this.client
      .from('collection_stats')
      .select('*')
      .single()

    if (error) {
      console.warn('Failed to get collection stats:', error)
      return null
    }

    return data
  }

  /**
   * Get recent sync history
   */
  async getSyncHistory(limit: number = 10): Promise<SyncMetadata[]> {
    const { data, error } = await this.client
      .from('sync_metadata')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Failed to get sync history:', error)
      return []
    }

    return data || []
  }

  /**
   * Search collection by text
   */
  async searchCollection(query: string): Promise<VinylRecord[]> {
    if (!query.trim()) {
      return this.getCollection()
    }

    const { data, error } = await this.client
      .from('vinyl_collection')
      .select('*')
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%,label.ilike.%${query}%,genres.cs.["${query}"]`)
      .order('artist', { ascending: true })

    if (error) throw error

    return this.transformDBRecordsToVinylRecords(data || [])
  }

  /**
   * Get records by artist
   */
  async getRecordsByArtist(artist: string): Promise<VinylRecord[]> {
    const { data, error } = await this.client
      .from('vinyl_collection')
      .select('*')
      .eq('artist', artist)
      .order('year', { ascending: true })

    if (error) throw error

    return this.transformDBRecordsToVinylRecords(data || [])
  }

  // ============================================================================
  // ADMIN METHODS (Using service role key for sync operations)
  // ============================================================================

  /**
   * Sync collection from Discogs (admin only - requires service role key)
   */
  async syncFromDiscogs(discogsReleases: DiscogsRelease[]): Promise<{
    success: boolean
    recordsAdded: number
    recordsUpdated: number
    errors: string[]
  }> {
    let recordsAdded = 0
    let recordsUpdated = 0
    const errors: string[] = []

    // Start sync log
    const syncStarted = Date.now()
    const { data: syncLog } = await this.client
      .from('sync_metadata')
      .insert({
        sync_type: 'discogs',
        status: 'in_progress',
        records_processed: 0
      })
      .select()
      .single()

    try {
      for (const release of discogsReleases) {
        try {
          // Transform Discogs release to our format
          const vinylRecord = transformDiscogsToVinylRecord(release, undefined, 0)
          
          // Convert to database format
          const dbRecord = this.transformVinylRecordToDB(vinylRecord)

          // Upsert record
          const { error: upsertError } = await this.client
            .from('vinyl_collection')
            .upsert(dbRecord, { onConflict: 'id' })

          if (upsertError) {
            errors.push(`Failed to upsert ${vinylRecord.title}: ${upsertError.message}`)
          } else {
            recordsAdded++
          }
        } catch (error) {
          errors.push(`Failed to process release: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Complete sync log
      const syncDuration = Date.now() - syncStarted
      await this.client
        .from('sync_metadata')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_processed: discogsReleases.length,
          records_added: recordsAdded,
          records_updated: recordsUpdated,
          errors,
          sync_duration_ms: syncDuration
        })
        .eq('id', syncLog?.id)

      return {
        success: errors.length === 0,
        recordsAdded,
        recordsUpdated,
        errors
      }
    } catch (error) {
      // Mark sync as failed
      await this.client
        .from('sync_metadata')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
        })
        .eq('id', syncLog?.id)

      throw error
    }
  }

  /**
   * Clear entire collection (admin only)
   */
  async clearCollection(): Promise<void> {
    const { error } = await this.client
      .from('vinyl_collection')
      .delete()
      .neq('id', '') // Delete all records

    if (error) throw error
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Transform database records to VinylRecord format
   */
  private transformDBRecordsToVinylRecords(dbRecords: PublicVinylRecord[]): VinylRecord[] {
    return dbRecords.map(record => ({
      id: record.id,
      title: record.title,
      artist: record.artist,
      year: record.year || '',
      label: record.label || '',
      genres: record.genres || ['Unknown'], // Now using genres array
      catalogNumber: record.catalog_number || '',
      coverUrl: record.cover_url || '',
      tracks: record.tracks || [],
      description: record.description,
      producer: record.producer,
      recordingDate: record.recording_date,
      releaseDate: record.release_date,
      dateAdded: record.created_at // Map database created_at to dateAdded
    }))
  }

  /**
   * Transform VinylRecord to database format
   */
  private transformVinylRecordToDB(vinylRecord: VinylRecord): Omit<PublicVinylRecord, 'created_at' | 'updated_at'> {
    return {
      id: vinylRecord.id,
      title: vinylRecord.title,
      artist: vinylRecord.artist,
      year: vinylRecord.year,
      label: vinylRecord.label,
      genres: vinylRecord.genres, // Now using genres array
      catalog_number: vinylRecord.catalogNumber,
      cover_url: vinylRecord.coverUrl,
      tracks: vinylRecord.tracks || [],
      description: vinylRecord.description,
      producer: vinylRecord.producer,
      recording_date: vinylRecord.recordingDate,
      release_date: vinylRecord.releaseDate,
      master_id: vinylRecord._masterRelease?.id?.toString(),
      discogs_release_id: vinylRecord.id,
      discogs_master_id: vinylRecord._masterRelease?.id?.toString()
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { count, error } = await this.client
        .from('vinyl_collection')
        .select('*', { count: 'exact', head: true })

      if (error) throw error

      return {
        success: true,
        message: `Successfully connected to Supabase. Collection has ${count || 0} records.`
      }
    } catch (error) {
      return {
        success: false,
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get database client (for advanced operations)
   */
  getClient(): SupabaseClient {
    return this.client
  }
}

// Create and export singleton instance
export const publicCollectionService = new PublicCollectionService()
export default PublicCollectionService