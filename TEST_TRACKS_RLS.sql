-- ============================================
-- TEST: Check if Tracks RLS Policy is Working
-- ============================================
-- Run this in Supabase SQL Editor to test if RLS allows public read access
-- ============================================

-- 1. Check if tracks exist
SELECT COUNT(*) as total_tracks FROM tracks;

-- 2. Try to select tracks (this should work if RLS allows)
SELECT id, title, cover, audio, created_at 
FROM tracks 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check current RLS policies on tracks table
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
WHERE tablename = 'tracks';

-- 4. Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tracks';

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- 1. total_tracks should show count > 0 if tracks exist
-- 2. SELECT query should return rows (if RLS allows)
-- 3. Should see policy "Tracks are viewable by everyone" with cmd = 'SELECT'
-- 4. rls_enabled should be 'true'
-- ============================================

-- ============================================
-- IF SELECT RETURNS EMPTY BUT COUNT > 0:
-- ============================================
-- This means RLS is blocking. Run FIX_TRACKS_RLS.sql
-- ============================================

