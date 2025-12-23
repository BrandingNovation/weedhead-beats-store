-- ============================================
-- FIX: Tracks Not Showing on Frontend
-- ============================================
-- This script ensures RLS policies allow public read access to tracks
-- Run this in Supabase SQL Editor if tracks are saved but not visible
-- ============================================

-- 1. Ensure RLS is enabled on tracks table
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Tracks are viewable by everyone" ON tracks;
DROP POLICY IF EXISTS "Public can view tracks" ON tracks;
DROP POLICY IF EXISTS "Everyone can read tracks" ON tracks;

-- 3. Create/Recreate the public read policy
CREATE POLICY "Tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (true);

-- 4. Verify the policy was created
-- You can check this in Supabase Dashboard → Authentication → Policies → tracks table

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, check:
-- 1. Go to Supabase Dashboard → Authentication → Policies
-- 2. Find the "tracks" table
-- 3. You should see "Tracks are viewable by everyone" policy with SELECT permission
-- 4. The policy should have "USING (true)" which means everyone can read
-- ============================================

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- If tracks still don't show:
-- 1. Check browser console (F12) for error messages
-- 2. Verify tracks exist in database: SELECT * FROM tracks;
-- 3. Test the policy: SELECT * FROM tracks; (should return rows)
-- 4. Check if there are conflicting policies that might be blocking
-- ============================================

