-- ============================================
-- URGENT FIX: Add stems_url Column to Tracks
-- ============================================
-- Run this in Supabase SQL Editor to fix the error:
-- "Could not find the 'stems_url' column of 'tracks'"
-- ============================================

-- Add stems_url column if it doesn't exist
DO $$ 
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'tracks' 
        AND column_name = 'stems_url'
    ) THEN
        -- Add the column
        ALTER TABLE tracks ADD COLUMN stems_url TEXT;
        
        -- Add index for better performance
        CREATE INDEX IF NOT EXISTS idx_tracks_stems_url 
        ON tracks(stems_url) 
        WHERE stems_url IS NOT NULL;
        
        RAISE NOTICE '✅ Added stems_url column to tracks table';
    ELSE
        RAISE NOTICE 'ℹ️ stems_url column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'tracks' 
AND column_name = 'stems_url';

-- ============================================
-- EXPECTED RESULT
-- ============================================
-- Should show:
-- column_name | data_type | is_nullable
-- stems_url   | text      | YES
-- ============================================

