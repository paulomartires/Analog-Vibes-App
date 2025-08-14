import axios, { AxiosInstance, AxiosResponse } from 'axios';
import PQueue from 'p-queue';
import pRetry from 'p-retry';

// Master Release data from Discogs
export interface DiscogsMasterRelease {
  id: number;
  title: string;
  year: number;
  artists: Array<{
    name: string;
    id: number;
  }>;
  genres?: string[];
  styles?: string[];
  notes?: string;
  data_quality?: string;
  extraartists?: Array<{
    name: string;
    role: string;
    id: number;
  }>;
}

export interface DiscogsRelease {
  id: number;
  title: string;
  artists: Array<{
    name: string;
    id: number;
  }>;
  year?: number;
  master_year?: number; // Added for original release year from master
  labels?: Array<{
    name: string;
    catno: string;
  }>;
  genres?: string[];
  styles?: string[];
  images?: Array<{
    type: string;
    uri: string;
    uri150: string;
    uri500: string;
  }>;
  tracklist?: Array<{
    position: string;
    title: string;
    duration: string;
  }>;
  master_id?: number;
  master_url?: string;
  notes?: string;
  extraartists?: Array<{
    name: string;
    role: string;
    id: number;
  }>;
  basic_information?: {
    id: number;
    title: string;
    year: number;
    master_id?: number;
    master_url?: string;
    resource_url: string;
    thumb: string;
    cover_image: string;
    formats: Array<{
      name: string;
      qty: string;
      descriptions?: string[];
    }>;
    labels: Array<{
      name: string;
      catno: string;
      entity_type: string;
      entity_type_name: string;
      id: number;
      resource_url: string;
    }>;
    artists: Array<{
      name: string;
      anv: string;
      join: string;
      role: string;
      tracks: string;
      id: number;
      resource_url: string;
    }>;
    genres: string[];
    styles?: string[];
  };
}

export interface DiscogsCollectionResponse {
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
  releases: DiscogsRelease[];
}

export interface DiscogsSearchResponse {
  pagination: {
    page: number;
    pages: number;
    per_page: number;
    items: number;
  };
  results: Array<{
    id: number;
    type: string;
    title: string;
    cover_image: string;
    thumb: string;
    resource_url: string;
    master_id?: number;
    master_url?: string;
    year?: string;
    format?: string[];
    label?: string[];
    genre?: string[];
    style?: string[];
    country?: string;
    barcode?: string[];
    catno?: string;
  }>;
}

class DiscogsService {
  private client: AxiosInstance;
  private queue: PQueue;
  private baseURL: string;
  private userAgent: string;
  private token: string;
  private username: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_DISCOGS_API_BASE_URL || 'https://api.discogs.com';
    this.userAgent = import.meta.env.VITE_DISCOGS_USER_AGENT || 'AnalogVibesApp/1.0';
    this.token = import.meta.env.VITE_DISCOGS_PERSONAL_ACCESS_TOKEN || '';
    this.username = import.meta.env.VITE_DISCOGS_USERNAME || '';

    if (!this.token) {
      console.warn('Discogs API token not found. Please set VITE_DISCOGS_PERSONAL_ACCESS_TOKEN in your .env file');
    }

    if (!this.username) {
      console.warn('Discogs username not found. Please set VITE_DISCOGS_USERNAME in your .env file');
    }

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'User-Agent': this.userAgent,
        'Authorization': `Discogs token=${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.discogs.v2.discogs+json'
      },
      timeout: 30000, // 30 second timeout
    });

    // Set up rate limiting queue (aggressive settings for faster sync)
    // Discogs allows 60/min for authenticated users, we'll use most of it
    const rateLimit = parseInt(import.meta.env.VITE_DISCOGS_RATE_LIMIT_AUTHENTICATED || '55');
    this.queue = new PQueue({
      intervalCap: rateLimit,
      interval: 60 * 1000, // 1 minute
      concurrency: 8 // Aggressive concurrency for much faster processing
    });

    // Add response interceptor for debugging and error handling
    this.client.interceptors.response.use(
      (response) => {
        // Log rate limit info
        const remaining = response.headers['x-discogs-ratelimit-remaining'];
        const used = response.headers['x-discogs-ratelimit-used'];
        if (remaining !== undefined) {
          console.log(`Discogs API: ${used} requests used, ${remaining} remaining`);
        }
        return response;
      },
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          console.error(`Discogs API Error ${status}:`, data);
          
          switch (status) {
            case 401:
              throw new Error('Invalid Discogs API token. Please check your credentials.');
            case 403:
              throw new Error('Rate limit exceeded. Please wait before making more requests.');
            case 404:
              throw new Error('Resource not found.');
            case 422:
              throw new Error(`Invalid parameters: ${data.message || 'Unknown error'}`);
            default:
              throw new Error(`Discogs API Error: ${status} - ${data.message || 'Unknown error'}`);
          }
        }
        throw error;
      }
    );
  }

  /**
   * Make a rate-limited request to the Discogs API with retry logic
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const result = await this.queue.add(async () => {
      return pRetry(
        async () => {
          const response: AxiosResponse<T> = await this.client.get(endpoint, { params });
          return response.data;
        },
        {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 5000,
          onFailedAttempt: (error) => {
            console.warn(`Discogs API request failed, attempt ${error.attemptNumber}: ${error.message}`);
          }
        }
      );
    });
    
    return result as T;
  }

  /**
   * Get user's collection with pagination
   */
  async getUserCollection(page: number = 1, perPage: number = 100): Promise<DiscogsCollectionResponse> {
    if (!this.username) {
      throw new Error('Username not configured. Please set VITE_DISCOGS_USERNAME in your .env file');
    }

    const params = {
      page,
      per_page: Math.min(perPage, 100), // API max is 100
      sort: 'added',
      sort_order: 'desc'
    };

    return this.makeRequest<DiscogsCollectionResponse>(
      `/users/${this.username}/collection/folders/0/releases`,
      params
    );
  }

  /**
   * Get all pages of user's collection with optional track details (optimized with parallel fetching)
   */
  async getAllUserCollection(includeTrackDetails: boolean = false): Promise<DiscogsRelease[]> {
    console.log('Fetching complete Discogs collection...');

    // First, get the first page to determine total pages
    const firstPage = await this.getUserCollection(1, 100);
    const totalPages = firstPage.pagination.pages;
    const allReleases: DiscogsRelease[] = [...firstPage.releases];
    
    console.log(`Found ${totalPages} pages with ${firstPage.pagination.items} total releases`);

    // If there are more pages, fetch them in parallel
    if (totalPages > 1) {
      const pagePromises: Promise<DiscogsCollectionResponse>[] = [];
      
      // Create promises for remaining pages
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(this.getUserCollection(page, 100));
      }
      
      // Fetch all remaining pages in parallel
      console.log(`Fetching remaining ${totalPages - 1} pages in parallel...`);
      const remainingPages = await Promise.all(pagePromises);
      
      // Add all releases from remaining pages
      remainingPages.forEach(pageResponse => {
        allReleases.push(...pageResponse.releases);
      });
    }

    console.log(`Collection fetch complete: ${allReleases.length} releases`);
    
    // Optionally fetch detailed track information
    if (includeTrackDetails) {
      console.log('Fetching detailed track information...');
      return await this.enrichWithTrackDetails(allReleases);
    }
    
    return allReleases;
  }

  /**
   * Enrich releases with detailed track information
   */
  async enrichWithTrackDetails(releases: DiscogsRelease[]): Promise<DiscogsRelease[]> {
    const enrichedReleases: DiscogsRelease[] = [];
    let processed = 0;
    
    for (const release of releases) {
      try {
        const releaseId = release.basic_information?.id || release.id;
        if (releaseId) {
          // Fetch detailed release information
          const detailedRelease = await this.getRelease(releaseId);
          
          // Merge the detailed info with the collection info
          const enrichedRelease = {
            ...release,
            tracklist: detailedRelease.tracklist,
            // Keep basic_information but add tracklist
          };
          
          enrichedReleases.push(enrichedRelease);
          
          processed++;
          if (processed % 10 === 0) {
            console.log(`Enriched ${processed}/${releases.length} releases with track details`);
          }
          
          // Reduced delay for better performance (rate limiting handled by queue)
          await new Promise(resolve => setTimeout(resolve, 50));
        } else {
          // If no ID available, use original release
          enrichedReleases.push(release);
        }
      } catch (error) {
        console.warn(`Failed to fetch track details for release:`, error);
        // Use original release if detailed fetch fails
        enrichedReleases.push(release);
      }
    }
    
    console.log(`Track enrichment complete: ${processed} releases processed`);
    return enrichedReleases;
  }

  /**
   * Get detailed information about a specific release
   */
  async getRelease(releaseId: number): Promise<DiscogsRelease> {
    return this.makeRequest<DiscogsRelease>(`/releases/${releaseId}`);
  }

  /**
   * Get detailed release information with full track listing
   */
  async getReleaseWithTracks(releaseId: number): Promise<DiscogsRelease> {
    console.log(`Fetching detailed track info for release ${releaseId}`);
    return this.getRelease(releaseId);
  }

  /**
   * Get master release details
   */
  async getMasterRelease(masterId: number): Promise<DiscogsMasterRelease> {
    return this.makeRequest<DiscogsMasterRelease>(`/masters/${masterId}`);
  }

  /**
   * Get both release and master data for a collection item
   */
  async getReleaseWithMasterData(release: DiscogsRelease): Promise<{
    release: DiscogsRelease;
    master?: DiscogsMasterRelease;
  }> {
    const releaseId = release.basic_information?.id || release.id;
    const masterId = release.basic_information?.master_id || release.master_id;
    
    // Get detailed release info
    const detailedRelease = await this.getRelease(releaseId);
    
    // Get master data if available
    let masterData: DiscogsMasterRelease | undefined;
    if (masterId) {
      try {
        masterData = await this.getMasterRelease(masterId);
      } catch (error) {
        console.warn(`Failed to fetch master data for ${masterId}:`, error);
      }
    }
    
    return {
      release: detailedRelease,
      master: masterData
    };
  }

  /**
   * Enrich collection releases with master release data (optimized with parallel processing)
   */
  async enrichWithMasterData(releases: DiscogsRelease[]): Promise<Array<{
    release: DiscogsRelease;
    master?: DiscogsMasterRelease;
  }>> {
    console.log(`Enriching ${releases.length} releases with master data...`);
    
    // Create master data cache to avoid duplicate requests
    const masterCache = new Map<number, DiscogsMasterRelease>();
    
    // Process releases in batches to optimize parallel processing
    const batchSize = 10; // Process 10 releases concurrently
    const enrichedReleases: Array<{ release: DiscogsRelease; master?: DiscogsMasterRelease }> = [];
    
    for (let i = 0; i < releases.length; i += batchSize) {
      const batch = releases.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (release) => {
        const basicInfo = release.basic_information;
        const releaseId = basicInfo?.id || release.id;
        const masterId = basicInfo?.master_id || release.master_id;
        
        // Get detailed release info
        let detailedRelease = release;
        try {
          detailedRelease = await this.getRelease(releaseId);
        } catch (error) {
          console.warn(`Failed to fetch detailed release for ${releaseId}:`, error);
        }
        
        // Get master data if available (with caching)
        let masterData: DiscogsMasterRelease | undefined;
        if (masterId) {
          // Check cache first
          if (masterCache.has(masterId)) {
            masterData = masterCache.get(masterId);
            console.log(`Using cached master data for ${masterId}`);
          } else {
            try {
              masterData = await this.getMasterRelease(masterId);
              masterCache.set(masterId, masterData); // Cache for future use
              console.log(`✓ Master ${masterId}: "${masterData.title}" (${masterData.year || 'NO YEAR'})`);
            } catch (error) {
              console.warn(`✗ Failed to fetch master data for ${masterId}:`, error);
            }
          }
        }
        
        return {
          release: detailedRelease,
          master: masterData
        };
      });
      
      // Wait for batch completion
      const batchResults = await Promise.all(batchPromises);
      enrichedReleases.push(...batchResults);
      
      // Log progress
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(releases.length / batchSize)} - ${enrichedReleases.length}/${releases.length} releases`);
      
      // Small delay between batches (reduced from 200ms per item to once per batch)
      if (i + batchSize < releases.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`Enrichment complete: ${enrichedReleases.length} releases processed, ${masterCache.size} unique masters cached`);
    return enrichedReleases;
  }

  /**
   * Search for releases
   */
  async searchReleases(query: string, options: Record<string, any> = {}): Promise<DiscogsSearchResponse> {
    const params = {
      q: query,
      type: 'release',
      ...options
    };
    return this.makeRequest<DiscogsSearchResponse>('/database/search', params);
  }

  /**
   * Get user profile information
   */
  async getUserProfile(username?: string): Promise<any> {
    const user = username || this.username;
    if (!user) {
      throw new Error('Username not provided and not configured');
    }
    return this.makeRequest<any>(`/users/${user}`);
  }

  /**
   * Test the API connection and credentials
   */
  async testConnection(): Promise<{ success: boolean; message: string; userInfo?: any }> {
    try {
      if (!this.token) {
        return {
          success: false,
          message: 'No API token configured. Please set VITE_DISCOGS_PERSONAL_ACCESS_TOKEN in your .env file'
        };
      }

      if (!this.username) {
        return {
          success: false,
          message: 'No username configured. Please set VITE_DISCOGS_USERNAME in your .env file'
        };
      }

      // Test with user profile
      const userInfo = await this.getUserProfile();
      
      return {
        success: true,
        message: `Successfully connected to Discogs API as ${userInfo.username}`,
        userInfo
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: `Failed to connect to Discogs API: ${errorMessage}`
      };
    }
  }
}

// Create and export a singleton instance
export const discogsService = new DiscogsService();
export default DiscogsService;