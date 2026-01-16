# Test Email System with Zoho SMTP

## Quick Test Steps

### 1. Verify Zoho SMTP Settings in Database

Run this SQL in Supabase SQL Editor to check your settings:

```sql
SELECT setting_name, 
       CASE 
         WHEN setting_name LIKE '%password%' THEN '***hidden***'
         ELSE setting_value 
       END as setting_value,
       is_active
FROM email_settings
WHERE setting_name IN (
  'smtp_host',
  'smtp_port', 
  'smtp_username',
  'smtp_password',
  'from_email',
  'from_name',
  'use_tls',
  'send_order_confirmation_emails',
  'newsletter_send_welcome_email'
)
ORDER BY setting_name;
```

**Expected Results:**
- `smtp_host` should be `smtp.zoho.com`
- `smtp_port` should be `587` (TLS) or `465` (SSL)
- `smtp_username` should be your Zoho email
- `from_email` should be your Zoho email
- `send_order_confirmation_emails` should be `true` to enable
- `newsletter_send_welcome_email` should be `true` to enable

---

### 2. Test Newsletter Subscription Email

**Steps:**
1. Go to Blog page or Store page
2. Scroll to newsletter form at bottom
3. Enter your email and name
4. Click "Subscribe"
5. **Check Browser Console** (F12) for:
   - `✅ Welcome email sent successfully` (success)
   - Or error messages if failed

**Expected Behavior:**
- Form shows success message
- Email saved to `newsletter_subscribers` table
- Welcome email sent via Zoho SMTP

---

### 3. Test Contact Form

**Steps:**
1. Click "Contact" in footer
2. Fill out form and submit
3. **Check Browser Console** for errors
4. **Check Database:**
   ```sql
   SELECT * FROM contact_submissions 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

---

### 4. Test Order Confirmation Email

**Steps:**
1. Add item to cart
2. Complete checkout
3. **Check Browser Console** for:
   - `✅ Order confirmation email sent successfully`
   - Or error messages

---

## Troubleshooting

### Emails Not Sending?

**Check 1: Edge Function Status**
- The system tries to use Supabase Edge Function `send-email`
- If Edge Function doesn't exist, it falls back to API endpoint
- Check Supabase Dashboard → Edge Functions → `send-email`

**Check 2: SMTP Settings**
```sql
-- Verify all required settings are active
SELECT setting_name, is_active 
FROM email_settings 
WHERE setting_name IN ('smtp_host', 'smtp_username', 'smtp_password', 'from_email')
AND is_active = true;
```

**Check 3: Email Enabled Flags**
```sql
-- Check if email sending is enabled
SELECT setting_name, setting_value 
FROM email_settings 
WHERE setting_name IN ('send_order_confirmation_emails', 'newsletter_send_welcome_email');
```

**Check 4: Browser Console**
- Open DevTools (F12) → Console tab
- Look for email-related errors
- Common errors:
  - `Edge Function not available` → Edge Function not deployed
  - `Missing required email settings` → SMTP not configured
  - `Email API URL not configured` → No fallback API

---

## Current Email Flow

```
User Action (Subscribe/Contact/Order)
    ↓
Save to Database
    ↓
Read SMTP Settings from email_settings table
    ↓
Try Supabase Edge Function: supabase.functions.invoke('send-email')
    ↓
If fails → Try API endpoint: ${VITE_API_URL}/api/send-email
    ↓
If fails → Log warning (email not sent, but data saved)
```

---

## If Edge Function Not Deployed

The system will try to use an API endpoint. You can:

1. **Deploy Supabase Edge Function** (recommended)
   - Create `supabase/functions/send-email/index.ts`
   - Deploy via Supabase CLI

2. **Or Set Up Backend API**
   - Add `/api/send-email` endpoint to your server
   - Set `VITE_API_URL` environment variable

3. **Or Use Client-Side Email** (not recommended for production)
   - Less secure
   - Exposes SMTP credentials

---

## Verify Zoho Settings Are Active

```sql
-- Make sure all Zoho settings are active
UPDATE email_settings 
SET is_active = true 
WHERE setting_name IN (
  'smtp_host',
  'smtp_port',
  'smtp_username', 
  'smtp_password',
  'from_email',
  'from_name',
  'use_tls'
);
```

---

## Test Email Sending Manually

You can test if emails work by checking the browser console after:
1. Newsletter subscription
2. Contact form submission  
3. Order completion

Look for:
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warnings about Edge Function/API

---

## Next Steps

1. ✅ Verify Zoho SMTP settings in database
2. ✅ Test newsletter subscription
3. ✅ Test contact form
4. ✅ Test order confirmation
5. ✅ Check browser console for errors
6. ✅ Verify emails are being received

If emails still don't send, check:
- Supabase Edge Function logs
- Browser console errors
- Network tab for failed requests
- Spam folder
