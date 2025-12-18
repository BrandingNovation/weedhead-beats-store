-- ============================================
-- Migration: Add Newsletter Subscribers Table
-- ============================================
-- This migration creates a table to store newsletter subscribers
-- ============================================

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    unsubscribed_at TIMESTAMPTZ,
    source TEXT DEFAULT 'website', -- 'website', 'admin', 'import', etc.
    tags TEXT[] DEFAULT '{}', -- Optional tags for segmentation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = true;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view all subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can manage subscribers" ON newsletter_subscribers;

-- Anyone can insert (subscribe)
CREATE POLICY "Anyone can subscribe"
    ON newsletter_subscribers FOR INSERT
    WITH CHECK (true);

-- Anyone can view their own subscription (by email)
CREATE POLICY "Users can view own subscription"
    ON newsletter_subscribers FOR SELECT
    USING (true); -- Public read for unsubscribe functionality

-- Only admins can update/delete
CREATE POLICY "Admins can manage subscribers"
    ON newsletter_subscribers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================
-- UPDATE TRIGGER
-- ============================================
-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTES
-- ============================================
-- After running this migration:
-- 1. Newsletter form will save subscriptions to database
-- 2. Admins can view/manage subscribers in dashboard
-- 3. Users can unsubscribe (sets is_active = false)
-- 4. Email addresses are unique (prevents duplicates)
-- ============================================

