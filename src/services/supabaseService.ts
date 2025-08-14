import { createClient, SupabaseClient, User, Session, AuthError } from '@supabase/supabase-js'
import { VinylRecord } from '../data/vinylRecords'
import { DiscogsRelease, DiscogsMasterRelease } from './discogsService'

// Database Types
export interface Profile {
  id: string
  username?: string
  full_name?: string
  discogs_username?: string
  discogs_token?: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface MasterRelease {
  id: string
  title: string
  artist: string
  year?: number
  genres?: string[]
  styles?: string[]
  description?: string
  producer?: string
  recording_date?: string
  notes?: string
  data_quality?: string
  discogs_url?: string
  extra_artists?: any[]
  created_at: string
  updated_at: string
}

export interface VinylReleaseDB {
  id: string
  master_id?: string
  title: string
  artist: string
  release_date?: string
  labels?: any[]
  catalog_number?: string
  cover_url?: string
  images?: any[]
  tracks?: any[]
  formats?: any[]
  country?: string
  notes?: string
  genres?: string[]
  styles?: string[]
  discogs_url?: string
  extra_artists?: any[]
  created_at: string
  updated_at: string
}

export interface UserCollection {
  id: string
  user_id: string
  vinyl_release_id: string
  master_release_id?: string
  date_added: string
  date_acquired?: string
  condition?: string
  media_condition?: string
  sleeve_condition?: string
  personal_notes?: string
  play_count: number
  last_played?: string
  rating?: number
  is_favorite: boolean
  purchase_price?: number
  purchase_currency?: string
  purchase_location?: string
  discogs_instance_id?: string
  created_at: string
  updated_at: string
}

export interface CollectionSyncLog {
  id: string
  user_id: string
  sync_type: 'full' | 'incremental' | 'manual'
  status: 'in_progress' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at?: string
  records_processed: number
  records_added: number
  records_updated: number
  records_removed: number
  errors: any[]
  sync_duration_ms?: number
  discogs_api_calls: number
  created_at: string
}

export interface CollectionWithDetails extends UserCollection {
  vinyl_release?: VinylReleaseDB
  master_release?: MasterRelease
}

// Auth State
export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: AuthError | null
}

class SupabaseService {
  private client: SupabaseClient
  private authCallbacks: Set<(authState: AuthState) => void> = new Set()

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })

    // Set up auth state listener
    this.client.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event)
      const authState: AuthState = {
        user: session?.user || null,
        session,
        isLoading: false,
        error: null
      }
      this.authCallbacks.forEach(callback => callback(authState))
    })
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.client.auth.getUser()
    return user
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await this.client.auth.getSession()
    return session
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, options?: { data?: Record<string, any> }) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options
    })

    if (error) throw error

    // Create profile after successful signup
    if (data.user && !error) {
      await this.createProfile(data.user.id, {
        username: options?.data?.username,
        full_name: options?.data?.full_name
      })
    }

    return data
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await this.client.auth.signOut()
    if (error) throw error
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (authState: AuthState) => void): () => void {
    this.authCallbacks.add(callback)
    return () => {
      this.authCallbacks.delete(callback)
    }
  }

  // ============================================================================
  // PROFILE METHODS
  // ============================================================================

  /**
   * Create user profile
   */
  async createProfile(userId: string, profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await this.client
      .from('profiles')
      .insert({
        id: userId,
        ...profileData
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get user profile
   */
  async getProfile(userId?: string): Promise<Profile | null> {
    const user = userId || (await this.getCurrentUser())?.id
    if (!user) return null

    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', user)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    
    return data
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.client
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ============================================================================
  // VINYL COLLECTION METHODS
  // ============================================================================

  /**
   * Get user's vinyl collection with complete details
   */
  async getUserCollection(userId?: string): Promise<VinylRecord[]> {
    const user = userId || (await this.getCurrentUser())?.id
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.client
      .from('user_collection_complete')
      .select('*')
      .eq('user_id', user)
      .order('date_added', { ascending: false })

    if (error) throw error

    // Transform database records to VinylRecord format
    return this.transformDBRecordsToVinylRecords(data || [])
  }

  /**
   * Add vinyl record to user's collection
   */
  async addToCollection(vinylRecord: VinylRecord, collectionData?: Partial<UserCollection>): Promise<UserCollection> {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // First, ensure the vinyl release and master release exist in the database
    await this.upsertVinylRelease(vinylRecord)
    
    const { data, error } = await this.client
      .from('user_collections')
      .insert({
        user_id: user.id,
        vinyl_release_id: vinylRecord.id,
        master_release_id: vinylRecord._masterRelease?.id,
        ...collectionData
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        // Record already exists, update it instead
        return this.updateCollectionRecord(vinylRecord.id, collectionData || {})
      }
      throw error
    }

    return data
  }

  /**
   * Update collection record
   */
  async updateCollectionRecord(vinylReleaseId: string, updates: Partial<UserCollection>): Promise<UserCollection> {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.client
      .from('user_collections')
      .update(updates)
      .eq('user_id', user.id)
      .eq('vinyl_release_id', vinylReleaseId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Remove record from collection
   */
  async removeFromCollection(vinylReleaseId: string): Promise<void> {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await this.client
      .from('user_collections')
      .delete()
      .eq('user_id', user.id)
      .eq('vinyl_release_id', vinylReleaseId)

    if (error) throw error
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(userId?: string) {
    const user = userId || (await this.getCurrentUser())?.id
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.client
      .from('user_collection_stats')
      .select('*')
      .eq('user_id', user)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // ============================================================================
  // SYNC METHODS
  // ============================================================================

  /**
   * Start a new sync operation
   */
  async startSync(syncType: 'full' | 'incremental' | 'manual'): Promise<CollectionSyncLog> {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.client
      .from('collection_sync_logs')
      .insert({
        user_id: user.id,
        sync_type: syncType,
        status: 'in_progress'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update sync progress
   */
  async updateSync(syncId: string, updates: Partial<CollectionSyncLog>): Promise<CollectionSyncLog> {
    const { data, error } = await this.client
      .from('collection_sync_logs')
      .update(updates)
      .eq('id', syncId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Complete sync operation
   */
  async completeSync(
    syncId: string, 
    stats: {
      records_processed: number
      records_added: number
      records_updated: number
      records_removed: number
      errors: any[]
      discogs_api_calls: number
    }
  ): Promise<CollectionSyncLog> {
    const { data, error } = await this.client
      .from('collection_sync_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        sync_duration_ms: Date.now() - new Date(data?.started_at || Date.now()).getTime(),
        ...stats
      })
      .eq('id', syncId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get sync history
   */
  async getSyncHistory(userId?: string, limit: number = 10): Promise<CollectionSyncLog[]> {
    const user = userId || (await this.getCurrentUser())?.id
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await this.client
      .from('collection_sync_logs')
      .select('*')
      .eq('user_id', user)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  /**
   * Subscribe to collection changes
   */
  subscribeToCollection(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel('collection-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_collections',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  /**
   * Subscribe to sync status changes
   */
  subscribeToSyncLogs(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel('sync-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collection_sync_logs',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Upsert vinyl release and master release data
   */
  private async upsertVinylRelease(vinylRecord: VinylRecord): Promise<void> {
    // Upsert master release if available
    if (vinylRecord._masterRelease) {
      await this.client
        .from('master_releases')
        .upsert({
          id: vinylRecord._masterRelease.id,
          title: vinylRecord._masterRelease.title,
          artist: vinylRecord._masterRelease.artist,
          year: vinylRecord._masterRelease.year,
          genres: vinylRecord._masterRelease.genres,
          styles: vinylRecord._masterRelease.styles,
          description: vinylRecord._masterRelease.notes,
          producer: vinylRecord._masterRelease.producer,
          extra_artists: vinylRecord._masterRelease.extraartists || []
        })
    }

    // Upsert vinyl release
    await this.client
      .from('vinyl_releases')
      .upsert({
        id: vinylRecord.id,
        master_id: vinylRecord._masterRelease?.id,
        title: vinylRecord.title,
        artist: vinylRecord.artist,
        release_date: vinylRecord.releaseDate,
        catalog_number: vinylRecord.catalogNumber,
        cover_url: vinylRecord.coverUrl,
        tracks: vinylRecord.tracks,
        genres: [vinylRecord.genre], // Convert single genre to array
        // Add other fields as needed
      })
  }

  /**
   * Transform database records to VinylRecord format
   */
  private transformDBRecordsToVinylRecords(dbRecords: any[]): VinylRecord[] {
    return dbRecords.map(record => ({
      id: record.vinyl_release_id,
      title: record.title,
      artist: record.artist,
      year: record.original_year?.toString() || record.release_date?.substring(0, 4) || '',
      label: record.labels?.[0]?.name || '',
      genre: record.genres?.[0] || 'Unknown',
      catalogNumber: record.catalog_number || '',
      coverUrl: record.cover_url || '',
      tracks: record.tracks || [],
      description: record.description,
      producer: record.producer,
      recordingDate: record.recording_date,
      releaseDate: record.release_date,
      
      // Collection-specific data
      _collectionData: {
        dateAdded: record.date_added,
        dateAcquired: record.date_acquired,
        condition: record.condition,
        mediaCondition: record.media_condition,
        sleeveCondition: record.sleeve_condition,
        personalNotes: record.personal_notes,
        playCount: record.play_count || 0,
        lastPlayed: record.last_played,
        rating: record.rating,
        isFavorite: record.is_favorite || false,
        purchasePrice: record.purchase_price,
        purchaseCurrency: record.purchase_currency,
        purchaseLocation: record.purchase_location
      }
    }))
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('count')
        .limit(1)

      if (error) throw error

      return {
        success: true,
        message: 'Successfully connected to Supabase'
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
export const supabaseService = new SupabaseService()
export default SupabaseService