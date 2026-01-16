# ⚡ URGENT: Add Environment Variables in Coolify

## The Problem

Your app is showing:
- `VITE_SUPABASE_URL: MISSING`
- `VITE_SUPABASE_ANON_KEY: MISSING`

This means the environment variables are **not set in Coolify**.

---

## ✅ Step-by-Step Fix (5 Minutes)

### Step 1: Go to Coolify Environment Variables

1. **Open Coolify Dashboard**
2. **Click on your application** (weedhead-beats-store)
3. **Find "Environment Variables" section**
   - Usually in the left sidebar
   - Or in a tab at the top
   - Or in "Settings" → "Environment"

### Step 2: Add VITE_SUPABASE_URL

1. **Click "Add Variable" or "+" button**
2. **Name:** `VITE_SUPABASE_URL`
3. **Value:** Your Supabase URL
   - Example: `https://supabase.brandingnovations.com`
   - **MUST start with `https://`**
   - **NO trailing slash**
4. **Checkboxes:**
   - ✅ **Available at Buildtime** (CHECK THIS!)
   - ✅ **Available at Runtime** (CHECK THIS!)
5. **Click "Save" or "Add"**

### Step 3: Add VITE_SUPABASE_ANON_KEY

1. **Click "Add Variable" or "+" button again**
2. **Name:** `VITE_SUPABASE_ANON_KEY`
3. **Value:** Your Supabase anon key
   - This is a long string starting with `eyJ...`
   - Get it from Supabase Dashboard → Settings → API → anon public key
4. **Checkboxes:**
   - ✅ **Available at Buildtime** (CHECK THIS!)
   - ✅ **Available at Runtime** (CHECK THIS!)
5. **Click "Save" or "Add"**

### Step 4: Get Your Supabase Credentials

**If you don't have them:**

1. **Go to Supabase Dashboard**
   - Your self-hosted instance URL
   - Or https://app.supabase.com

2. **Go to Settings → API**

3. **Copy these:**
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

### Step 5: Redeploy

1. **After adding variables, go back to your app in Coolify**
2. **Click "Redeploy" or trigger a new deployment**
3. **Wait for deployment to complete**
4. **Refresh your site**

---

## ✅ Verification Checklist

After adding variables, verify:

- [ ] `VITE_SUPABASE_URL` exists in Coolify
- [ ] `VITE_SUPABASE_ANON_KEY` exists in Coolify
- [ ] Both have "Available at Buildtime" ✅ checked
- [ ] Both have "Available at Runtime" ✅ checked
- [ ] URL starts with `https://` (not `http://`)
- [ ] URL has NO trailing slash
- [ ] Redeployed after adding variables

---

## 🚨 Common Mistakes

### ❌ Wrong: URL without https://
```
VITE_SUPABASE_URL=supabase.brandingnovations.com
```

### ✅ Correct: URL with https://
```
VITE_SUPABASE_URL=https://supabase.brandingnovations.com
```

### ❌ Wrong: Trailing slash
```
VITE_SUPABASE_URL=https://supabase.brandingnovations.com/
```

### ✅ Correct: No trailing slash
```
VITE_SUPABASE_URL=https://supabase.brandingnovations.com
```

### ❌ Wrong: Buildtime/Runtime not checked
- Variables won't be available to the app

### ✅ Correct: Both checkboxes checked
- ✅ Available at Buildtime
- ✅ Available at Runtime

---

## 📋 Quick Reference

**Variable Names (exact):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Where to get values:**
- Supabase Dashboard → Settings → API

**Format:**
- URL: `https://your-domain.com` (no trailing slash)
- Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

**After adding:**
- ✅ Redeploy
- ✅ Check browser console (should see "Set" not "MISSING")

---

**Follow these steps and your app will work!** 🚀



