# Fix "Failed to Fetch" Error - Simple Guide

## 🔍 The Problem

You're seeing **"Failed to fetch"** when trying to sign in. This means your app can't connect to Supabase.

## ✅ The Fix

### Issue: Wrong Supabase URL

I can see your `VITE_SUPABASE_URL` in Coolify is:
```
http://supabasekong-wk040ow...
```

This looks like an **internal Docker URL** that won't work from your browser. You need the **external/public URL**.

---

## 🔧 Step-by-Step Fix

### Step 1: Find Your Correct Supabase URL

**For Self-Hosted Supabase:**

1. **What URL do you use to access Supabase Dashboard?**
   - Example: `https://supabase.brandingnovations.com`
   - Or: `https://your-domain.com`
   - This is your **external URL**

2. **The URL should be:**
   - ✅ `https://` (not `http://`)
   - ✅ Your public domain (not internal Docker name)
   - ✅ Accessible from the internet

**Common formats:**
- `https://supabase.yourdomain.com`
- `https://yourdomain.com/supabase`
- `https://api.yourdomain.com`

---

### Step 2: Update in Coolify

1. **Go to Coolify → Your App → Environment Variables**

2. **Click "Update" on `VITE_SUPABASE_URL`**

3. **Change the value to your EXTERNAL URL:**
   - ❌ Wrong: `http://supabasekong-wk040ow...` (internal)
   - ✅ Correct: `https://supabase.brandingnovations.com` (or your actual external URL)

4. **Make sure:**
   - Starts with `https://`
   - No trailing slash
   - Is the URL you use to access Supabase dashboard

5. **Save**

---

### Step 3: Verify the Anon Key

1. **In Coolify, check `VITE_SUPABASE_ANON_KEY`**

2. **Get the correct key:**
   - Go to Supabase Dashboard
   - Settings → API
   - Copy the **anon public** key (starts with `eyJ...`)

3. **Update in Coolify if needed**

---

### Step 4: Redeploy

1. **After updating variables, redeploy your app in Coolify**
2. **Wait for deployment to complete**
3. **Test sign in again**

---

## 🧪 Quick Test

**Test if your Supabase URL works:**

1. **Open browser**
2. **Go to:** `https://YOUR_SUPABASE_URL/rest/v1/`
   - Replace with your actual external URL
3. **You should see:** JSON response or API info
4. **If error:** URL is wrong or not accessible

---

## ❓ How to Find Your External Supabase URL

**Option 1: Check Your Supabase Dashboard**
- What URL do you use to log into Supabase?
- That's likely your external URL

**Option 2: Check Your Domain/DNS**
- If you set up a domain for Supabase, use that
- Example: `supabase.brandingnovations.com`

**Option 3: Check Coolify/Servers**
- Look at your Supabase server configuration
- Find the public/external URL

**Option 4: Ask Your Server Admin**
- If someone else set up Supabase, ask them for the external URL

---

## ✅ Quick Checklist

- [ ] Found your external Supabase URL (the one you use in browser)
- [ ] Updated `VITE_SUPABASE_URL` in Coolify to external URL
- [ ] URL starts with `https://` (not `http://`)
- [ ] No trailing slash on URL
- [ ] `VITE_SUPABASE_ANON_KEY` is correct
- [ ] Redeployed application
- [ ] Tested sign in

---

## 🎯 Most Likely Fix

**Your Supabase URL in Coolify is probably:**
- ❌ `http://supabasekong-...` (internal Docker name)

**Should be:**
- ✅ `https://supabase.brandingnovations.com` (or your actual external domain)

**Update it and redeploy!** 🚀

---

**What URL do you use to access your Supabase dashboard? That's the URL you need to use in Coolify!**


