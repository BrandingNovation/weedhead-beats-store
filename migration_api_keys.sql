-- ============================================
-- Migration: Add API Keys Management Table
-- ============================================
-- This allows admins to manage API keys from the admin dashboard
-- Keys are stored securely with RLS policies (admin-only access)
-- ============================================

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name TEXT NOT NULL UNIQUE, -- 'gemini', 'stripe', 'paypal'
    key_value TEXT NOT NULL, -- Encrypted/stored securely
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_name ON api_keys(key_name);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all API keys" ON api_keys;
DROP POLICY IF EXISTS "Admins can manage API keys" ON api_keys;

-- Only admins can view API keys
CREATE POLICY "Admins can view all API keys"
    ON api_keys FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can insert/update/delete API keys
CREATE POLICY "Admins can manage API keys"
    ON api_keys FOR ALL
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

-- Update trigger
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTES
-- ============================================
-- After running this migration:
-- 1. Admins can add/edit API keys in the admin dashboard
-- 2. Keys are stored securely with RLS (only admins can access)
-- 3. App will check database first, then fall back to environment variables
-- ============================================



