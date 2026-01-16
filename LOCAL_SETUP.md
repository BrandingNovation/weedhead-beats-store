# Local Development Setup

## Quick Fix for "Failed to Fetch" Errors

The app needs environment variables to connect to Supabase. Here's how to set them up locally:

---

## Step 1: Create `.env` File

1. **Copy the values from Coolify:**
   - Go to Coolify → Your App → Environment Variables
   - Copy `VITE_SUPABASE_URL` value
   - Copy `VITE_SUPABASE_ANON_KEY` value

2. **Create `.env` file in project root:**
   ```bash
   # In the project root directory
   touch .env
   ```

3. **Add your values to `.env`:**
   ```env
   VITE_SUPABASE_URL=https://supabase.brandingnovations.com
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **Important:**
   - Use the **same values** from Coolify
   - Make sure URL starts with `https://` (not `http://`)
   - No quotes around values
   - No trailing slashes

---

## Step 2: Restart Dev Server

After creating `.env`:

1. **Stop the current dev server** (Ctrl+C in terminal)
2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Refresh your browser** (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)

---

## Step 3: Verify It Works

1. **Open browser console** (F12)
2. **Check for errors:**
   - ✅ Should see: `VITE_SUPABASE_URL: Set`
   - ✅ Should see: `VITE_SUPABASE_ANON_KEY: Set`
   - ❌ Should NOT see: `MISSING` errors

3. **Try to sign in:**
   - The "Failed to fetch" error should be gone
   - You should be able to connect to Supabase

---

## Alternative: Get Values from Supabase Dashboard

If you don't have Coolify access:

1. **Go to Supabase Dashboard**
   - Your self-hosted instance URL
   - Or https://app.supabase.com

2. **Settings → API**
   - Copy **Project URL** → Use for `VITE_SUPABASE_URL`
   - Copy **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

3. **Add to `.env` file**

---

## Troubleshooting

### Still seeing "Failed to fetch"?

1. **Check `.env` file exists** in project root
2. **Check values are correct** (no typos, correct URL)
3. **Restart dev server** after creating/editing `.env`
4. **Hard refresh browser** (Cmd+Shift+R)

### "Connection refused" to localhost:54321?

- This means `.env` file is missing or values are empty
- The app is using the fallback `localhost:54321`
- Create `.env` with correct values

### URL should be `https://` not `http://`

- Make sure your Supabase URL uses `https://`
- Browsers require HTTPS for Supabase connections

---

## Optional: Add Other API Keys

You can also add these to `.env` for full functionality:

```env
# Google Gemini (for AI features)
VITE_API_KEY=your_gemini_key

# Stripe (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal (for payments)
VITE_PAYPAL_CLIENT_ID=your_paypal_id
```

---

**After setting up `.env` and restarting, your app should work!** 🚀



