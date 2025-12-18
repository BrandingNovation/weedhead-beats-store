-- ============================================
-- Migration: Add Stems Support
-- ============================================
-- This migration adds support for downloadable stems (zip files)
-- ============================================

-- Add stems_url column to tracks table
DO $$ 
BEGIN
    -- Add stems_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tracks' AND column_name = 'stems_url'
    ) THEN
        ALTER TABLE tracks ADD COLUMN stems_url TEXT;
        CREATE INDEX IF NOT EXISTS idx_tracks_stems_url ON tracks(stems_url) WHERE stems_url IS NOT NULL;
    END IF;
END $$;

-- ============================================
-- NOTES
-- ============================================
-- After running this migration:
-- 1. Stems can be uploaded via admin dashboard
-- 2. Stems will be available for download in checkout (Premium/Unlimited licenses)
-- 3. Stems should be uploaded as ZIP files to Supabase Storage
-- ============================================

