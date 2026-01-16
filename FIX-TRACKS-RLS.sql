-- Fix RLS Policies for tracks table
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can insert own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can update own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can delete own tracks" ON tracks;
DROP POLICY IF EXISTS "Users manage own tracks" ON tracks;
DROP POLICY IF EXISTS "Tracks are viewable by everyone" ON tracks;
DROP POLICY IF EXISTS "Authenticated users can insert tracks" ON tracks;

-- Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view tracks (public read)
CREATE POLICY "Tracks are viewable by everyone"
  ON tracks FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert tracks (with their user_id)
CREATE POLICY "Authenticated users can insert tracks"
  ON tracks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tracks
CREATE POLICY "Users can update own tracks"
  ON tracks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tracks
CREATE POLICY "Users can delete own tracks"
  ON tracks FOR DELETE
  USING (auth.uid() = user_id);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tracks'
ORDER BY policyname;
