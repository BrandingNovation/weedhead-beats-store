# Database Setup - Complete Guide

## Required SQL Migrations

Run these SQL files in your Supabase SQL Editor **in this order**:

### 1. Contact Submissions Table
```sql
-- Run: database/create-contact-submissions-table.sql
```
**Purpose:** Stores contact form submissions

### 2. Email Settings Table (if not already done)
```sql
-- Run: migration_add_email_settings.sql
```
**Purpose:** Stores SMTP configuration for sending emails

### 3. Newsletter Subscribers Table (if not already done)
```sql
-- Run: migration_add_newsletter.sql
```
**Purpose:** Stores newsletter subscription data

---

## Quick Setup Commands

Copy and paste this into Supabase SQL Editor:

```sql
-- ============================================
-- 1. CONTACT SUBMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
CREATE POLICY "Anyone can submit contact form"
    ON contact_submissions FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all submissions" ON contact_submissions;
CREATE POLICY "Admins can view all submissions"
    ON contact_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can update submissions" ON contact_submissions;
CREATE POLICY "Admins can update submissions"
    ON contact_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Verification

After running the SQL, verify the tables exist:

```sql
-- Check contact_submissions table
SELECT * FROM contact_submissions LIMIT 1;

-- Check email_settings table
SELECT * FROM email_settings LIMIT 1;

-- Check newsletter_subscribers table
SELECT * FROM newsletter_subscribers LIMIT 1;
```

If any query returns an error, run the corresponding migration file.

---

## Next Steps

1. ✅ Run the SQL migrations above
2. ✅ Configure SMTP settings in Admin Dashboard
3. ✅ Test contact form
4. ✅ Test newsletter subscription
5. ✅ Test login functionality

See `EMAIL-FUNNEL-TEST.md` for detailed testing instructions.
