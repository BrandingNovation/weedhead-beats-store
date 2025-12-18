-- ============================================
-- Migration: Create Email Settings Table
-- ============================================
-- This migration creates the email_settings table
-- for storing SMTP configuration and email preferences
-- ============================================

-- 1. EMAIL SETTINGS TABLE
CREATE TABLE IF NOT EXISTS email_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_name TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups by setting_name
CREATE INDEX IF NOT EXISTS idx_email_settings_name ON email_settings(setting_name);
CREATE INDEX IF NOT EXISTS idx_email_settings_active ON email_settings(is_active);

-- 2. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts on re-run)
DROP POLICY IF EXISTS "Admins can view email settings" ON email_settings;
DROP POLICY IF EXISTS "Admins can manage email settings" ON email_settings;
DROP POLICY IF EXISTS "Public can view active email settings" ON email_settings;

-- Only admins can view all email settings
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

-- Public can view active settings (for email service to read SMTP config)
-- This is needed so the email service can read settings when sending emails
CREATE POLICY "Public can view active email settings"
    ON email_settings FOR SELECT
    USING (is_active = true);

-- 3. UPDATE TRIGGER
-- Auto-update updated_at timestamp (assuming update_updated_at_column() function exists)
DROP TRIGGER IF EXISTS update_email_settings_updated_at ON email_settings;
CREATE TRIGGER update_email_settings_updated_at
    BEFORE UPDATE ON email_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. INITIAL DEFAULT SETTINGS
-- Insert default email settings if they don't exist
INSERT INTO email_settings (setting_name, setting_value, description, is_active)
VALUES 
    ('send_order_confirmation_emails', 'false', 'Enable/disable order confirmation emails', true),
    ('smtp_host', '', 'SMTP server host (e.g., smtp.zoho.com)', false),
    ('smtp_port', '587', 'SMTP port (587 for TLS, 465 for SSL)', false),
    ('smtp_username', '', 'SMTP username (email address)', false),
    ('smtp_password', '', 'SMTP password (App Password)', false),
    ('from_email', '', 'Sender email address', false),
    ('from_name', 'Weedhead Beats', 'Sender name', false),
    ('use_tls', 'true', 'Use TLS encryption (true for port 587, false for port 465)', false)
ON CONFLICT (setting_name) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- After running this migration:
-- 1. Go to Admin Dashboard → Settings tab
-- 2. Configure your SMTP settings
-- 3. Set 'send_order_confirmation_emails' to 'true' to enable emails
-- ============================================
