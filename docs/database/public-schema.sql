-- Simplified Public Database Schema for Analog Vibes App
-- No authentication required - public vinyl collection website

-- ============================================================================
-- VINYL COLLECTION TABLE (Public - No RLS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vinyl_collection (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  year TEXT,
  label TEXT,
  genre TEXT,
  catalog_number TEXT,
  cover_url TEXT,
  description TEXT,
  producer TEXT,
  recording_date TEXT,
  release_date TEXT,
  tracks JSONB DEFAULT '[]', -- Array of track objects
  
  -- Master release data (from Discogs)
  master_id TEXT,
  discogs_release_id TEXT,
  discogs_master_id TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vinyl_collection_artist ON vinyl_collection(artist);
CREATE INDEX IF NOT EXISTS idx_vinyl_collection_year ON vinyl_collection(year);
CREATE INDEX IF NOT EXISTS idx_vinyl_collection_genre ON vinyl_collection(genre);
CREATE INDEX IF NOT EXISTS idx_vinyl_collection_label ON vinyl_collection(label);

-- ============================================================================
-- SYNC METADATA TABLE (Track Discogs syncs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'completed',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  records_processed INTEGER DEFAULT 0,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  sync_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sync history
CREATE INDEX IF NOT EXISTS idx_sync_metadata_started_at ON sync_metadata(started_at);

-- ============================================================================
-- UTILITY FUNCTIONS (Create before triggers)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at on vinyl_collection
CREATE TRIGGER update_vinyl_collection_updated_at 
  BEFORE UPDATE ON vinyl_collection
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PUBLIC ACCESS POLICIES
-- ============================================================================
-- Allow anonymous users to read the collection
ALTER TABLE vinyl_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view the collection)
CREATE POLICY "Public can view vinyl collection" ON vinyl_collection
  FOR SELECT TO anon USING (true);

CREATE POLICY "Public can view sync metadata" ON sync_metadata
  FOR SELECT TO anon USING (true);

-- Only authenticated users with service role can write
-- (This will be you updating via admin functions)
CREATE POLICY "Service role can manage collection" ON vinyl_collection
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage sync metadata" ON sync_metadata
  FOR ALL TO service_role USING (true);

-- Functions and triggers already created above

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- Collection summary view
CREATE OR REPLACE VIEW collection_stats AS
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT artist) as unique_artists,
  COUNT(DISTINCT genre) as unique_genres,
  COUNT(DISTINCT label) as unique_labels,
  MIN(CAST(year AS INTEGER)) as earliest_year,
  MAX(CAST(year AS INTEGER)) as latest_year,
  (
    SELECT json_agg(genre_count ORDER BY count DESC)
    FROM (
      SELECT genre, COUNT(*) as count
      FROM vinyl_collection 
      WHERE genre IS NOT NULL AND genre != ''
      GROUP BY genre
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ) genre_count
  ) as top_genres,
  (
    SELECT json_agg(artist_count ORDER BY count DESC)
    FROM (
      SELECT artist, COUNT(*) as count
      FROM vinyl_collection 
      WHERE artist IS NOT NULL AND artist != ''
      GROUP BY artist
      ORDER BY COUNT(*) DESC
      LIMIT 10
    ) artist_count
  ) as top_artists,
  (
    SELECT json_agg(decade_count ORDER BY decade)
    FROM (
      SELECT 
        CASE 
          WHEN CAST(year AS INTEGER) >= 2020 THEN '2020s'
          WHEN CAST(year AS INTEGER) >= 2010 THEN '2010s'
          WHEN CAST(year AS INTEGER) >= 2000 THEN '2000s'
          WHEN CAST(year AS INTEGER) >= 1990 THEN '1990s'
          WHEN CAST(year AS INTEGER) >= 1980 THEN '1980s'
          WHEN CAST(year AS INTEGER) >= 1970 THEN '1970s'
          WHEN CAST(year AS INTEGER) >= 1960 THEN '1960s'
          WHEN CAST(year AS INTEGER) >= 1950 THEN '1950s'
          ELSE 'Other'
        END as decade,
        COUNT(*) as count
      FROM vinyl_collection 
      WHERE year IS NOT NULL AND year != '' AND year ~ '^[0-9]+$'
      GROUP BY decade
      ORDER BY decade
    ) decade_count
  ) as decade_distribution;

-- Allow public access to stats view
GRANT SELECT ON collection_stats TO anon;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================
-- Uncomment to insert sample data for testing

/*
INSERT INTO vinyl_collection (
  id, title, artist, year, label, genre, catalog_number, cover_url, description
) VALUES 
  ('test-1', 'Kind of Blue', 'Miles Davis', '1959', 'Columbia', 'Jazz', 'CL 1355', 'https://example.com/cover1.jpg', 'Classic modal jazz album'),
  ('test-2', 'Abbey Road', 'The Beatles', '1969', 'Apple', 'Rock', 'PCS 7088', 'https://example.com/cover2.jpg', 'Final studio album by The Beatles')
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Your public vinyl collection database is ready!
-- 
-- Next steps:
-- 1. Grant anon access: GRANT USAGE ON SCHEMA public TO anon;
-- 2. Test public access with your anon key
-- 3. Use service_role key for admin operations (syncing from Discogs)