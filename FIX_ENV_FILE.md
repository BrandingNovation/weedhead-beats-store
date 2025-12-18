# Fix Missing Credentials - Step by Step

## The Problem
Your `.env` file exists but is **empty**. You need to fill in your Supabase credentials.

---

## Quick Fix (3 Steps)

### Step 1: Get Your Values from Coolify

1. **Go to Coolify Dashboard**
2. **Your App → Environment Variables**
3. **Find these two variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Copy the VALUES** (click to reveal if hidden)

---

### Step 2: Edit `.env` File

**Option A: Using Terminal**
```bash
# Open .env in your editor
nano .env
# or
code .env
# or
open -a "TextEdit" .env
```

**Option B: Using VS Code**
- Open the `.env` file in VS Code
- It's in the project root folder

**Fill in the values:**
```env
VITE_SUPABASE_URL=https://supabase.brandingnovations.com
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:**
- ✅ Use the EXACT values from Coolify
- ✅ No quotes around values
- ✅ No spaces around `=`
- ✅ URL should start with `https://`

---

### Step 3: Restart Dev Server

1. **Stop the current server:**
   - Go to terminal where `npm run dev` is running
   - Press `Ctrl+C` (or `Cmd+C` on Mac)

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Hard refresh browser:**
   - `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

---

## Verify It Works

1. **Open browser console** (F12)
2. **Look for:**
   - ✅ `VITE_SUPABASE_URL: Set` (not "MISSING")
   - ✅ `VITE_SUPABASE_ANON_KEY: Set` (not "MISSING")
3. **Try to sign in** - should work now!

---

## Example `.env` File

Your `.env` should look like this (with YOUR actual values):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://supabase.brandingnovations.com
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjM0NTYsImV4cCI6MTk2MDY5OTQ1Nn0.example

# Optional: Other API keys
# VITE_API_KEY=your_gemini_key
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
# VITE_PAYPAL_CLIENT_ID=your_paypal_id
```

---

## Still Not Working?

**Check:**
1. ✅ `.env` file is in project root (same folder as `package.json`)
2. ✅ Values are filled in (not empty)
3. ✅ No quotes around values
4. ✅ Dev server was restarted after editing `.env`
5. ✅ Browser was hard refreshed

**If still failing:**
- Check browser console for exact error
- Verify values are correct (copy from Coolify again)
- Make sure URL uses `https://` not `http://`

---

**Fill in your `.env` file with values from Coolify, restart the dev server, and it should work!** 🚀


