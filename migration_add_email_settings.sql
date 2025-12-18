-- ============================================
-- Migration: Add Email/SMTP Settings Table
-- ============================================
-- This migration creates a table to store SMTP/email configuration
-- ============================================

-- Create email_settings table
CREATE TABLE IF NOT EXISTS email_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_name TEXT NOT NULL UNIQUE, -- 'smtp', 'from_email', 'from_name', etc.
    setting_value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_settings_name ON email_settings(setting_name);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view email settings" ON email_settings;
DROP POLICY IF EXISTS "Admins can manage email settings" ON email_settings;

-- Only admins can view email settings
CREATE POLICY "Admins can view email settings"
    ON email_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can insert, update, and delete email settings
CREATE POLICY "Admins can manage email settings"
    ON email_settings FOR ALL
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
DROP TRIGGER IF EXISTS update_email_settings_updated_at ON email_settings;
CREATE TRIGGER update_email_settings_updated_at
    BEFORE UPDATE ON email_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DEFAULT SETTINGS
-- ============================================
INSERT INTO email_settings (setting_name, setting_value, description, is_active)
VALUES 
    ('smtp_host', '', 'SMTP server host (e.g., smtp.zoho.com)', false),
    ('smtp_port', '587', 'SMTP port (587 for TLS, 465 for SSL)', false),
    ('smtp_username', '', 'SMTP username (usually your email)', false),
    ('smtp_password', '', 'SMTP password (use App Password, not regular password)', false),
    ('from_email', '', 'Sender email address', false),
    ('from_name', 'Weedhead Beats', 'Sender display name', false),
    ('use_tls', 'true', 'Use TLS encryption (true/false)', false)
ON CONFLICT (setting_name) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- After running this migration:
-- 1. Admins can configure SMTP settings in the admin dashboard
-- 2. Settings are stored securely in the database
-- 3. Can be used for sending transactional emails (order confirmations, etc.)
-- ============================================

