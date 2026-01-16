# Email Funnel System Test Guide

## Overview
This document outlines how to test the complete email funnel system for Weedhead Beats, including:
1. Newsletter subscription emails
2. Order confirmation emails
3. Welcome emails

---

## Prerequisites

### 1. Database Setup
Run these SQL migrations in Supabase SQL Editor (in order):

1. **Email Settings Table**
   ```bash
   migration_add_email_settings.sql
   ```

2. **Contact Submissions Table**
   ```bash
   database/create-contact-submissions-table.sql
   ```

3. **Newsletter Subscribers Table** (if not already done)
   ```bash
   migration_add_newsletter.sql
   ```

### 2. SMTP Configuration
Configure your SMTP settings in the Admin Dashboard:

1. Go to **Dashboard → Settings** tab
2. Fill in your SMTP credentials:
   - **SMTP Host**: e.g., `smtp.zoho.com` or `smtp.gmail.com`
   - **SMTP Port**: `587` (TLS) or `465` (SSL)
   - **SMTP Username**: Your email address
   - **SMTP Password**: Your app password (not regular password)
   - **From Email**: The email address to send from
   - **From Name**: `Weedhead Beats`
   - **Use TLS**: `true` for port 587, `false` for port 465

3. Enable email sending:
   - Set `send_order_confirmation_emails` to `true`
   - Set `newsletter_send_welcome_email` to `true`

---

## Testing the Email Funnel

### Test 1: Newsletter Subscription Email

**Steps:**
1. Navigate to the Blog page or Store page (newsletter form is at the bottom)
2. Enter your email and name
3. Click "Subscribe"
4. **Expected Result:**
   - Success message appears
   - Email is saved to `newsletter_subscribers` table
   - Welcome email is sent (if enabled)

**Check Database:**
```sql
SELECT * FROM newsletter_subscribers 
ORDER BY subscribed_at DESC 
LIMIT 5;
```

**Check Email:**
- Check your inbox for welcome email from Weedhead Beats
- Subject: "Welcome to Weedhead Beats! 🎵"

---

### Test 2: Contact Form Submission

**Steps:**
1. Navigate to Contact page (via footer link)
2. Fill out the contact form:
   - Name
   - Email
   - Subject
   - Message
3. Click "Send Message"
4. **Expected Result:**
   - Success message appears
   - Submission is saved to `contact_submissions` table
   - Form clears

**Check Database:**
```sql
SELECT * FROM contact_submissions 
ORDER BY created_at DESC 
LIMIT 5;
```

**Admin View:**
- Admins can view submissions in Dashboard (if implemented)
- Status defaults to 'new'

---

### Test 3: Order Confirmation Email

**Steps:**
1. Add items to cart
2. Complete checkout process
3. Make a test purchase
4. **Expected Result:**
   - Order is created
   - Order confirmation email is sent to customer
   - Email includes:
     - Order number
     - Order items
     - Total amount
     - Download links (for digital products)

**Check Database:**
```sql
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
```

**Check Email:**
- Check customer's inbox for order confirmation
- Subject: "Order Confirmation - [ORDER_NUMBER]"

---

## Email System Architecture

### Components

1. **Email Service** (`services/emailService.ts`)
   - Handles order confirmation emails
   - Uses SMTP settings from database
   - Falls back to Edge Function or API

2. **Newsletter Form** (`App.tsx` - `NewsletterForm` component)
   - Subscribes users to newsletter
   - Sends welcome email (if enabled)
   - Uses Supabase Edge Function `send-email`

3. **Contact Form** (`App.tsx` - `renderContactView`)
   - Saves submissions to database
   - Can trigger admin notifications (if implemented)

### Email Flow

```
User Action → Database Save → Email Settings Check → SMTP Send → Email Delivered
```

1. **User Action**: Subscribe, Contact, Purchase
2. **Database Save**: Save to respective table
3. **Email Settings Check**: Read from `email_settings` table
4. **SMTP Send**: Via Supabase Edge Function or API
5. **Email Delivered**: User receives email

---

## Troubleshooting

### Emails Not Sending?

1. **Check SMTP Settings**
   ```sql
   SELECT * FROM email_settings WHERE is_active = true;
   ```
   - Verify all required fields are filled
   - Check `send_order_confirmation_emails` is `true`

2. **Check Edge Function**
   - Ensure `send-email` Edge Function is deployed
   - Check Edge Function logs in Supabase Dashboard

3. **Check Browser Console**
   - Look for email-related errors
   - Check network tab for failed requests

4. **Test SMTP Connection**
   - Use a tool like `telnet` or SMTP tester
   - Verify credentials are correct

### Contact Form Not Working?

1. **Check Table Exists**
   ```sql
   SELECT * FROM contact_submissions LIMIT 1;
   ```
   - If error, run `database/create-contact-submissions-table.sql`

2. **Check RLS Policies**
   - Ensure INSERT policy allows public access
   - Check Supabase logs for RLS errors

### Newsletter Not Working?

1. **Check Table Exists**
   ```sql
   SELECT * FROM newsletter_subscribers LIMIT 1;
   ```
   - If error, run `migration_add_newsletter.sql`

2. **Check Welcome Email Setting**
   ```sql
   SELECT * FROM email_settings 
   WHERE setting_name = 'newsletter_send_welcome_email';
   ```
   - Should be `true` to send welcome emails

---

## Next Steps

1. ✅ Run database migrations
2. ✅ Configure SMTP settings in Admin Dashboard
3. ✅ Test newsletter subscription
4. ✅ Test contact form
5. ✅ Test order confirmation email
6. ✅ Monitor email delivery
7. ✅ Set up email templates (optional enhancement)

---

## Email Templates

Current templates are inline HTML in the code. For production, consider:
- Moving templates to database
- Using a template engine
- Adding email preview functionality
- A/B testing different templates

---

## Security Notes

- SMTP passwords are stored in database (encrypted at rest by Supabase)
- Only admins can view/edit email settings (RLS enforced)
- Contact submissions are private (only admins can view)
- Newsletter emails are opt-in only

---

## Support

If emails are not working:
1. Check Supabase Edge Function logs
2. Verify SMTP credentials are correct
3. Check spam folder
4. Test with a different email provider
5. Review browser console for errors
