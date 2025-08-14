-- Fix Database Permissions for Public Collection Sync
-- Run this in your Supabase SQL Editor to allow sync operations

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public can view vinyl collection" ON vinyl_collection;
DROP POLICY IF EXISTS "Public can view sync metadata" ON sync_metadata;

-- Create new policies that allow anon to read AND write
-- This enables your publishable key to sync data from Discogs

-- Allow anon (publishable key) to read vinyl collection
CREATE POLICY "Anon can view vinyl collection" ON vinyl_collection
FOR SELECT TO anon USING (true);

-- Allow anon (publishable key) to insert new vinyl records (for sync)
CREATE POLICY "Anon can insert vinyl records" ON vinyl_collection
FOR INSERT TO anon WITH CHECK (true);

-- Allow anon (publishable key) to update existing vinyl records (for sync)
CREATE POLICY "Anon can update vinyl records" ON vinyl_collection
FOR UPDATE TO anon USING (true);

-- Allow anon to read sync metadata
CREATE POLICY "Anon can view sync metadata" ON sync_metadata
FOR SELECT TO anon USING (true);

-- Allow anon to insert sync logs
CREATE POLICY "Anon can insert sync metadata" ON sync_metadata
FOR INSERT TO anon WITH CHECK (true);

-- Allow anon to update sync logs
CREATE POLICY "Anon can update sync metadata" ON sync_metadata
FOR UPDATE TO anon USING (true);

-- Keep service role permissions (backup admin access)
-- These policies already exist and will remain unchanged
-- Success! Your publishable key can now sync data from Discogs to Supabase
-- The collection remains publicly readable but also allows sync operations