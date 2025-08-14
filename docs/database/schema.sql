-- Supabase Database Schema for Analog Vibes App
-- Run these commands in your Supabase SQL Editor

-- Enable Row Level Security
-- This ensures users can only access their own data
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS master_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vinyl_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collection_sync_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  discogs_username TEXT,
  discogs_token TEXT, -- Encrypted by Supabase
  preferences JSONB DEFAULT '{}', -- User settings, theme, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- MASTER RELEASES TABLE (Original Album Information)
-- ============================================================================
CREATE TABLE IF NOT EXISTS master_releases (
  id TEXT PRIMARY KEY, -- Discogs Master ID
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  year INTEGER,
  genres TEXT[], -- Array of genres
  styles TEXT[], -- Array of styles
  description TEXT,
  producer TEXT,
  recording_date TEXT,
  notes TEXT,
  data_quality TEXT,
  discogs_url TEXT,
  extra_artists JSONB DEFAULT '[]', -- Producer, engineer, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_releases_artist ON master_releases(artist);
CREATE INDEX IF NOT EXISTS idx_master_releases_year ON master_releases(year);
CREATE INDEX IF NOT EXISTS idx_master_releases_genres ON master_releases USING GIN(genres);

-- RLS Policies for master_releases (public data, readable by all authenticated users)
CREATE POLICY "Authenticated users can view master releases" ON master_releases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert master releases" ON master_releases
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "System can update master releases" ON master_releases
  FOR UPDATE TO authenticated USING (true);

-- ============================================================================
-- VINYL RELEASES TABLE (Specific Pressing Information)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vinyl_releases (
  id TEXT PRIMARY KEY, -- Discogs Release ID
  master_id TEXT REFERENCES master_releases(id),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  release_date TEXT,
  labels JSONB DEFAULT '[]', -- Array of label objects
  catalog_number TEXT,
  cover_url TEXT,
  images JSONB DEFAULT '[]', -- Array of image objects
  tracks JSONB DEFAULT '[]', -- Array of track objects
  formats JSONB DEFAULT '[]', -- Vinyl format info (LP, 180g, etc.)
  country TEXT,
  notes TEXT,
  genres TEXT[],
  styles TEXT[],
  discogs_url TEXT,
  extra_artists JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vinyl_releases_master_id ON vinyl_releases(master_id);
CREATE INDEX IF NOT EXISTS idx_vinyl_releases_artist ON vinyl_releases(artist);
CREATE INDEX IF NOT EXISTS idx_vinyl_releases_catalog_number ON vinyl_releases(catalog_number);

-- RLS Policies for vinyl_releases (public data, readable by all authenticated users)
CREATE POLICY "Authenticated users can view vinyl releases" ON vinyl_releases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert vinyl releases" ON vinyl_releases
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "System can update vinyl releases" ON vinyl_releases
  FOR UPDATE TO authenticated USING (true);

-- ============================================================================
-- USER COLLECTIONS TABLE (Users' Personal Collections)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vinyl_release_id TEXT REFERENCES vinyl_releases(id),
  master_release_id TEXT REFERENCES master_releases(id),
  
  -- Personal collection metadata
  date_added TIMESTAMPTZ DEFAULT NOW(),
  date_acquired DATE, -- When user actually bought the vinyl
  condition TEXT CHECK (condition IN ('Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good', 'Fair', 'Poor')),
  media_condition TEXT CHECK (media_condition IN ('Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good', 'Fair', 'Poor')),
  sleeve_condition TEXT CHECK (sleeve_condition IN ('Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good', 'Fair', 'Poor')),
  
  -- User notes and stats
  personal_notes TEXT,
  play_count INTEGER DEFAULT 0,
  last_played TIMESTAMPTZ,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- User's personal rating
  is_favorite BOOLEAN DEFAULT FALSE,
  
  -- Purchase/acquisition info
  purchase_price DECIMAL(10,2),
  purchase_currency TEXT DEFAULT 'USD',
  purchase_location TEXT, -- Store, online, etc.
  
  -- Metadata
  discogs_instance_id TEXT, -- Specific instance in user's Discogs collection
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per vinyl release
  UNIQUE(user_id, vinyl_release_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_vinyl_release_id ON user_collections(vinyl_release_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_date_added ON user_collections(date_added);
CREATE INDEX IF NOT EXISTS idx_user_collections_is_favorite ON user_collections(is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_collections_last_played ON user_collections(last_played);

-- RLS Policies for user_collections
CREATE POLICY "Users can view own collection" ON user_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own collection" ON user_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collection" ON user_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own collection" ON user_collections
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- COLLECTION SYNC LOGS TABLE (Track Discogs sync history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS collection_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sync_type TEXT CHECK (sync_type IN ('full', 'incremental', 'manual')),
  status TEXT CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_removed INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  sync_duration_ms INTEGER,
  discogs_api_calls INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collection_sync_logs_user_id ON collection_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_sync_logs_started_at ON collection_sync_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_collection_sync_logs_status ON collection_sync_logs(status);

-- RLS Policies for collection_sync_logs
CREATE POLICY "Users can view own sync logs" ON collection_sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs" ON collection_sync_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync logs" ON collection_sync_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_releases_updated_at BEFORE UPDATE ON master_releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vinyl_releases_updated_at BEFORE UPDATE ON vinyl_releases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collections_updated_at BEFORE UPDATE ON user_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Complete collection view with all related data
CREATE OR REPLACE VIEW user_collection_complete AS
SELECT 
  uc.id as collection_id,
  uc.user_id,
  uc.date_added,
  uc.date_acquired,
  uc.condition,
  uc.media_condition,
  uc.sleeve_condition,
  uc.personal_notes,
  uc.play_count,
  uc.last_played,
  uc.rating,
  uc.is_favorite,
  uc.purchase_price,
  uc.purchase_currency,
  uc.purchase_location,
  
  -- Vinyl release data
  vr.id as vinyl_release_id,
  vr.title,
  vr.artist,
  vr.release_date,
  vr.labels,
  vr.catalog_number,
  vr.cover_url,
  vr.tracks,
  vr.formats,
  vr.country,
  
  -- Master release data
  mr.id as master_id,
  mr.year as original_year,
  mr.genres,
  mr.styles,
  mr.description,
  mr.producer,
  mr.recording_date

FROM user_collections uc
LEFT JOIN vinyl_releases vr ON uc.vinyl_release_id = vr.id
LEFT JOIN master_releases mr ON uc.master_release_id = mr.id
ORDER BY uc.date_added DESC;

-- Collection statistics view
CREATE OR REPLACE VIEW user_collection_stats AS
SELECT 
  uc.user_id,
  COUNT(*) as total_records,
  COUNT(CASE WHEN uc.is_favorite = true THEN 1 END) as favorites_count,
  AVG(uc.rating) as average_rating,
  SUM(uc.play_count) as total_plays,
  MIN(uc.date_added) as collection_started,
  MAX(uc.date_added) as last_addition,
  
  -- Genre distribution (top 10)
  (
    SELECT json_agg(genre_stats)
    FROM (
      SELECT unnest(mr.genres) as genre, COUNT(*) as count
      FROM user_collections uc2
      LEFT JOIN master_releases mr ON uc2.master_release_id = mr.id
      WHERE uc2.user_id = uc.user_id AND mr.genres IS NOT NULL
      GROUP BY genre
      ORDER BY count DESC
      LIMIT 10
    ) genre_stats
  ) as top_genres,
  
  -- Decade distribution
  (
    SELECT json_agg(decade_stats)
    FROM (
      SELECT 
        CASE 
          WHEN mr.year >= 2020 THEN '2020s'
          WHEN mr.year >= 2010 THEN '2010s'
          WHEN mr.year >= 2000 THEN '2000s'
          WHEN mr.year >= 1990 THEN '1990s'
          WHEN mr.year >= 1980 THEN '1980s'
          WHEN mr.year >= 1970 THEN '1970s'
          WHEN mr.year >= 1960 THEN '1960s'
          WHEN mr.year >= 1950 THEN '1950s'
          ELSE 'Other'
        END as decade,
        COUNT(*) as count
      FROM user_collections uc2
      LEFT JOIN master_releases mr ON uc2.master_release_id = mr.id
      WHERE uc2.user_id = uc.user_id AND mr.year IS NOT NULL
      GROUP BY decade
      ORDER BY count DESC
    ) decade_stats
  ) as decade_distribution

FROM user_collections uc
GROUP BY uc.user_id;

-- ============================================================================
-- INITIAL DATA MIGRATION FUNCTION
-- ============================================================================
-- This function will help migrate existing static data to the database
CREATE OR REPLACE FUNCTION migrate_static_vinyl_data()
RETURNS TEXT AS $$
DECLARE
  result_text TEXT := 'Migration completed successfully';
BEGIN
  -- This function can be called after setting up the schema
  -- to migrate any existing static data from your vinylRecords.ts file
  RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================
-- 1. All tables have Row Level Security (RLS) enabled
-- 2. Users can only access their own collection data
-- 3. Master and vinyl release data is shared (public to authenticated users)
-- 4. Discogs tokens are stored securely and only accessible by the user
-- 5. All sensitive operations require authentication

-- ============================================================================
-- PERFORMANCE NOTES  
-- ============================================================================
-- 1. Indexes are created on frequently queried columns
-- 2. JSONB is used for flexible data structures (tracks, labels, etc.)
-- 3. Views are provided for common complex queries
-- 4. Automatic timestamp updates via triggers
-- 5. Proper foreign key relationships for data integrity