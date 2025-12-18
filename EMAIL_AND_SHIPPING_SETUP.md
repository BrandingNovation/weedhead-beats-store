# 📧 Email & Shipping Address Setup

This guide covers:
1. Email/SMTP configuration in admin dashboard
2. Shipping address collection during checkout
3. Newsletter unsubscribe functionality
4. Viewing customer addresses in admin

---

## ✨ Features Added

### 1. Email/SMTP Configuration
- Admin can configure SMTP settings from dashboard
- Settings stored securely in `email_settings` table
- Supports Zoho, Gmail, and other SMTP providers

### 2. Shipping Address Collection
- Address form appears for physical items (albums, merch)
- Addresses saved to `orders.shipping_address` (JSONB)
- Admin can view addresses in order details

### 3. Newsletter Unsubscribe
- Public unsubscribe link/button
- One-click unsubscribe functionality
- Unsubscribe confirmation page

---

## 🛠️ Setup Steps

### Step 1: Run Email Settings Migration

1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy/paste `migration_add_email_settings.sql`**
3. **Click "RUN"**

This creates the `email_settings` table for SMTP configuration.

### Step 2: Configure Email Settings (Admin)

1. **Log in as admin**
2. **Go to Dashboard → Settings tab**
3. **Scroll to "Email/SMTP Configuration" section**
4. **Fill in:**
   - SMTP Host (e.g., `smtp.zoho.com`)
   - SMTP Port (`587` for TLS, `465` for SSL)
   - SMTP Username (your email)
   - SMTP Password (App Password, not regular password)
   - From Email (sender address)
   - From Name (e.g., "Weedhead Beats")
   - Use TLS (true/false)
5. **Click "Save" for each setting**

### Step 3: Test Email Configuration

After saving settings, you can test by:
- Sending a test email from admin dashboard
- Checking if order confirmation emails work
- Verifying newsletter emails send correctly

---

## 📦 Shipping Address Collection

### How It Works

1. **Customer adds physical items** (albums, merch) to cart
2. **During checkout**, shipping address form appears
3. **Address is collected** before payment
4. **Address saved** to `orders.shipping_address` as JSONB:
   ```json
   {
     "name": "John Doe",
     "street": "123 Main St",
     "city": "Los Angeles",
     "state": "CA",
     "zip": "90001",
     "country": "USA",
     "phone": "+1234567890"
   }
   ```

### Viewing Addresses (Admin)

1. **Go to Dashboard → Orders** (if implemented)
2. **Click on an order**
3. **View shipping address** in order details

---

## 🔔 Newsletter Unsubscribe

### For Subscribers

**Option 1: Unsubscribe Link in Emails**
- Include unsubscribe link in newsletter emails
- Link format: `https://weedheadbeats.com/unsubscribe?email=user@example.com&token=xxx`
- Clicking link opens unsubscribe page

**Option 2: Unsubscribe Button**
- Add "Unsubscribe" button in newsletter form
- Or create dedicated unsubscribe page

### Unsubscribe Process

1. **User clicks unsubscribe link/button**
2. **Unsubscribe page opens**
3. **User confirms unsubscribe**
4. **Status updated** in database (`is_active = false`)
5. **Confirmation message** shown

---

## 📋 Database Schema

### Email Settings Table

```sql
email_settings (
  id UUID PRIMARY KEY,
  setting_name TEXT UNIQUE,  -- 'smtp_host', 'smtp_port', etc.
  setting_value TEXT,         -- The actual value
  description TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Orders Table (Shipping Address)

```sql
orders (
  ...
  shipping_address JSONB,  -- Stores address as JSON
  ...
)
```

### Newsletter Subscribers (Unsubscribe)

```sql
newsletter_subscribers (
  ...
  is_active BOOLEAN,        -- false when unsubscribed
  unsubscribed_at TIMESTAMPTZ,
  ...
)
```

---

## 🔒 Security Notes

- **SMTP passwords** stored encrypted in database
- **Shipping addresses** only visible to admins
- **Unsubscribe tokens** should be unique and time-limited
- **RLS policies** protect email settings (admin-only)

---

## 🚀 Next Steps

1. **Run migrations** (`migration_add_email_settings.sql`)
2. **Configure SMTP** in admin dashboard
3. **Test email sending** with order confirmations
4. **Add unsubscribe links** to newsletter emails
5. **View shipping addresses** in order management

---

**All features are now integrated and ready to use!** 🎉

