-- ============================================
-- Add Support for Multiple Product Images for Merchandise
-- ============================================
-- This adds a product_images field to store multiple images for merch items
-- Run this in Supabase SQL Editor
-- ============================================

-- Add product_images column (JSONB array of image URLs)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS product_images JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance when querying merch items with images
CREATE INDEX IF NOT EXISTS idx_tracks_product_images ON tracks USING GIN (product_images) WHERE category = 'merch';

-- Example of what product_images will look like:
-- ["https://...image1.jpg", "https://...image2.jpg", "https://...image3.jpg"]

-- ============================================
-- Migration Complete
-- ============================================
-- Now you can store multiple images for merchandise items
-- The first image in the array will be used as the cover/thumbnail
-- ============================================

