-- Migration: Move CMS Content to Supabase & Fix Blog Images
-- This migration creates site_content table and adds blog post fields

-- 1. SITE CONTENT TABLE
CREATE TABLE IF NOT EXISTS site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page TEXT NOT NULL UNIQUE,
    hero_image TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page);

-- 2. ADD FIELDS TO POSTS TABLE
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'content'
    ) THEN
        ALTER TABLE posts ADD COLUMN content TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'slug'
    ) THEN
        ALTER TABLE posts ADD COLUMN slug TEXT;
        CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'published'
    ) THEN
        ALTER TABLE posts ADD COLUMN published BOOLEAN DEFAULT true;
        CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'author'
    ) THEN
        ALTER TABLE posts ADD COLUMN author TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'tags'
    ) THEN
        ALTER TABLE posts ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 3. ROW LEVEL SECURITY POLICIES
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view site content" ON site_content;
DROP POLICY IF EXISTS "Authenticated users can manage site content" ON site_content;

CREATE POLICY "Public can view site content"
    ON site_content FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can manage site content"
    ON site_content FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 4. UPDATE TRIGGER
DROP TRIGGER IF EXISTS update_site_content_updated_at ON site_content;
CREATE TRIGGER update_site_content_updated_at
    BEFORE UPDATE ON site_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. INITIAL DATA
INSERT INTO site_content (page, hero_image, content)
VALUES 
    ('store', '', '{}'::jsonb),
    ('collabs', '', '{}'::jsonb),
    ('licenses', '', '{}'::jsonb),
    ('blog', '', '{}'::jsonb)
ON CONFLICT (page) DO NOTHING;



