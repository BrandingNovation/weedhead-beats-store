# 🔐 Admin API Keys Management Setup

## ✨ New Feature: Manage API Keys from Admin Dashboard

You can now add and manage API keys directly from the admin dashboard! No more editing environment variables or redeploying.

---

## 📋 Setup Steps

### Step 1: Run the Database Migration

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy and paste** the contents of `migration_api_keys.sql`
3. **Click "Run"** to create the `api_keys` table

This creates a secure table where only admins can view/edit API keys.

---

### Step 2: Access Admin Settings

1. **Log in** as an admin user
2. **Click your profile** (top right)
3. **Click "Dashboard"**
4. **Click the "Settings" tab**

---

### Step 3: Add Your API Keys

You'll see three editable fields:

1. **Google Gemini API Key** (for AI features)
   - Enter your Gemini API key (starts with `AIza...`)
   - Click "Save"
   - Status will show "✓ Configured"

2. **Stripe Publishable Key** (for payments)
   - Enter your Stripe publishable key (starts with `pk_...`)
   - Click "Save"

3. **PayPal Client ID** (for payments)
   - Enter your PayPal Client ID
   - Click "Save"

---

## 🔄 How It Works

### Priority Order:
1. **Database keys** (from admin dashboard) - **Highest Priority**
2. **Environment variables** (from Coolify) - **Fallback**

### Example:
- If you set Gemini key in admin dashboard → Uses database key
- If database key is empty → Falls back to `VITE_API_KEY` from environment

---

## ✅ Benefits

- ✅ **No redeployment needed** - Changes take effect immediately
- ✅ **Secure storage** - Keys stored in Supabase with admin-only access
- ✅ **Easy management** - Edit keys anytime from the dashboard
- ✅ **Fallback support** - Still works with environment variables

---

## 🔒 Security

- **RLS Policies**: Only admins can view/edit API keys
- **Password fields**: Keys are hidden when typing
- **Database storage**: Keys are stored securely in Supabase
- **No exposure**: Keys never appear in client-side code

---

## 📝 Notes

- Keys are stored in the `api_keys` table
- Each key has a unique name (`gemini`, `stripe`, `paypal`)
- Keys can be updated anytime (no restart needed)
- If a key exists in both database and environment, database takes priority

---

## 🚨 Troubleshooting

### "Failed to save" error:
- Make sure you're logged in as an admin
- Check that the `api_keys` table exists (run the migration)
- Check browser console for detailed error messages

### Keys not working:
- Make sure you clicked "Save" after entering the key
- Check the status indicator (should show "✓ Configured")
- Try refreshing the page
- Check that the key format is correct (no extra spaces)

---

## 🎯 Quick Start

1. Run `migration_api_keys.sql` in Supabase
2. Go to Admin Dashboard → Settings
3. Enter your API keys
4. Click "Save" for each key
5. Done! Keys are active immediately

---

**That's it! You can now manage all your API keys from the admin dashboard.** 🚀

