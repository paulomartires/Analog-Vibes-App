-- Simple Working Schema for Public Vinyl Collection
-- Run this in your Supabase SQL Editor

-- Step 1: Create the main collection table
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
  tracks JSONB DEFAULT '[]',
  master_id TEXT,
  discogs_release_id TEXT,
  discogs_master_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create sync metadata table
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

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vinyl_collection_artist ON vinyl_collection(artist);
CREATE INDEX IF NOT EXISTS idx_vinyl_collection_year ON vinyl_collection(year);
CREATE INDEX IF NOT EXISTS idx_vinyl_collection_genre ON vinyl_collection(genre);
CREATE INDEX IF NOT EXISTS idx_vinyl_collection_label ON vinyl_collection(label);
CREATE INDEX IF NOT EXISTS idx_sync_metadata_started_at ON sync_metadata(started_at);

-- Step 4: Enable Row Level Security
ALTER TABLE vinyl_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

-- Step 5: Create public access policies
CREATE POLICY "Public can view vinyl collection" ON vinyl_collection
  FOR SELECT TO anon USING (true);

CREATE POLICY "Public can view sync metadata" ON sync_metadata
  FOR SELECT TO anon USING (true);

CREATE POLICY "Service role can manage collection" ON vinyl_collection
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage sync metadata" ON sync_metadata
  FOR ALL TO service_role USING (true);

-- Step 6: Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 7: Apply trigger to vinyl_collection table
DROP TRIGGER IF EXISTS update_vinyl_collection_updated_at ON vinyl_collection;
CREATE TRIGGER update_vinyl_collection_updated_at 
  BEFORE UPDATE ON vinyl_collection
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Grant permissions to anon user
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON vinyl_collection TO anon;
GRANT SELECT ON sync_metadata TO anon;

-- Success! Your database is ready.
-- Now update your .env file with your Supabase credentials and test the app.