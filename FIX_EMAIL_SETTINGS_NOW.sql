-- ============================================
-- URGENT FIX: Create Email Settings Table
-- ============================================
-- Run this in Supabase SQL Editor if you're getting
-- 404 errors when trying to save email settings
-- ============================================

-- 1. CREATE EMAIL SETTINGS TABLE
CREATE TABLE IF NOT EXISTS email_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_name TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_email_settings_name ON email_settings(setting_name);
CREATE INDEX IF NOT EXISTS idx_email_settings_active ON email_settings(is_active);

-- 3. ENABLE RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- 4. DROP EXISTING POLICIES (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view email settings" ON email_settings;
DROP POLICY IF EXISTS "Admins can manage email settings" ON email_settings;
DROP POLICY IF EXISTS "Public can view active email settings" ON email_settings;

-- 5. CREATE RLS POLICIES
-- Only admins can view all email settings
CREATE POLICY "Admins can view email settings"
    ON email_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only admins can manage email settings
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

-- Public can view active settings (for email service)
CREATE POLICY "Public can view active email settings"
    ON email_settings FOR SELECT
    USING (is_active = true);

-- 6. INSERT DEFAULT SETTINGS
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
-- VERIFICATION
-- ============================================
-- After running this, verify:
-- SELECT * FROM email_settings;
-- You should see 8 rows with default values
-- ============================================

