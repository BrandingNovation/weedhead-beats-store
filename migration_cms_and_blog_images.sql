-- ============================================
-- Migration: Move CMS Content to Supabase & Fix Blog Images
-- ============================================
-- This migration:
-- 1. Creates site_content table for CMS data
-- 2. Adds content field to posts table (if missing)
-- ============================================

-- ============================================
-- 1. SITE CONTENT TABLE
-- ============================================
-- Stores CMS content (hero images, page content) that was previously in localStorage
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page TEXT NOT NULL UNIQUE, -- 'store', 'collabs', 'licenses', 'blog'
    hero_image TEXT,
    content JSONB DEFAULT '{}'::jsonb, -- Flexible JSON for page-specific content
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page);

-- ============================================
-- 2. ENSURE POSTS TABLE HAS ALL REQUIRED FIELDS
-- ============================================
-- Add missing fields for better blog post management
DO $$ 
BEGIN
    -- Add content field if it doesn't exist (for full blog post content)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'content'
    ) THEN
        ALTER TABLE posts ADD COLUMN content TEXT;
    END IF;
    
    -- Add slug field for URL-friendly blog post links
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'slug'
    ) THEN
        ALTER TABLE posts ADD COLUMN slug TEXT;
        CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    END IF;
    
    -- Add published field for draft/published status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'published'
    ) THEN
        ALTER TABLE posts ADD COLUMN published BOOLEAN DEFAULT true;
        CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
    END IF;
    
    -- Add author field
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'author'
    ) THEN
        ALTER TABLE posts ADD COLUMN author TEXT;
    END IF;
    
    -- Add tags field (JSONB array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'tags'
    ) THEN
        ALTER TABLE posts ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on site_content
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view site content" ON site_content;
DROP POLICY IF EXISTS "Authenticated users can manage site content" ON site_content;

-- Everyone can read site content (public pages)
CREATE POLICY "Public can view site content"
    ON site_content FOR SELECT
    USING (true);

-- Only authenticated users can insert/update (admins in practice)
CREATE POLICY "Authenticated users can manage site content"
    ON site_content FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 4. UPDATE TRIGGER
-- ============================================
-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_site_content_updated_at ON site_content;
CREATE TRIGGER update_site_content_updated_at
    BEFORE UPDATE ON site_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. INITIAL DATA (Optional - can be set via CMS)
-- ============================================
-- Insert default site content if not exists
INSERT INTO site_content (page, hero_image, content)
VALUES 
    ('store', '', '{}'::jsonb),
    ('collabs', '', '{}'::jsonb),
    ('licenses', '', '{}'::jsonb),
    ('blog', '', '{}'::jsonb)
ON CONFLICT (page) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- After running this migration:
-- 1. CMS content will be stored in Supabase instead of localStorage
-- 2. Blog images should be uploaded to Storage 'covers' bucket
-- 3. Existing localStorage data can be migrated manually via admin dashboard
-- ============================================

