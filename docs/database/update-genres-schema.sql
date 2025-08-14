-- Update vinyl_collection table to support multiple genres
-- Run this in your Supabase SQL Editor

-- Step 1: Add new genres column as JSONB array
ALTER TABLE vinyl_collection 
ADD COLUMN genres JSONB DEFAULT '[]';

-- Step 2: Migrate existing single genre data to genres array
-- This converts single genre strings to array format
UPDATE vinyl_collection 
SET genres = CASE 
  WHEN genre IS NOT NULL AND genre != '' AND genre != 'Unknown' 
  THEN jsonb_build_array(genre)
  ELSE '[]'::jsonb
END;

-- Step 3: Create index for better performance on genres array
CREATE INDEX IF NOT EXISTS idx_vinyl_collection_genres ON vinyl_collection USING GIN(genres);

-- Step 4: Remove the old single genre column (optional - uncomment if you want to clean up)
-- ALTER TABLE vinyl_collection DROP COLUMN genre;

-- Step 5: Update the genre index (if dropping the old column)
-- DROP INDEX IF EXISTS idx_vinyl_collection_genre;

-- Verification query - check the migration worked
SELECT 
  title, 
  artist, 
  genre as old_genre, 
  genres as new_genres
FROM vinyl_collection 
LIMIT 10;

-- Success! Your database now supports multiple genres per record.