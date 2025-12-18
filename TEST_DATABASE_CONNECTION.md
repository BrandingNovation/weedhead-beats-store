# Test Database Connection - Quick Guide

## ✅ How to Check if Database is Working

### Method 1: Check Browser Console (Easiest)

1. **Open your app** (local: `http://localhost:5173` or deployed site)
2. **Open Browser Console** (F12 or Cmd+Option+I)
3. **Look for these messages:**

   ✅ **Working:**
   - No Supabase errors
   - No "credentials missing" warnings
   - Can sign in successfully
   - Can see tracks/blog posts from database

   ❌ **Not Working:**
   - "⚠️ Supabase credentials missing!"
   - "Failed to fetch"
   - "Invalid API key"
   - "Network error"

---

### Method 2: Test Sign In

1. **Click "Sign In"** button
2. **Try to create an account** or sign in
3. **Check what happens:**

   ✅ **Working:**
   - Account created successfully
   - Signed in successfully
   - Can access admin dashboard (if admin)

   ❌ **Not Working:**
   - "Sign in failed to load" error
   - "Failed to fetch" error
   - Stuck on loading

---

### Method 3: Check Environment Variables

**In Coolify:**
1. Go to your application
2. Check Environment Variables section
3. Verify these exist:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

**If missing:**
- Add them (see `ENVIRONMENT_VARIABLES_SETUP.md`)
- Redeploy the application

---

### Method 4: Test in Supabase Dashboard

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run this test query:**
   ```sql
   SELECT COUNT(*) FROM tracks;
   ```
3. **If it works:**
   - ✅ Database is set up
   - ✅ Tables exist
   - ✅ Connection from Supabase side works

4. **If error:**
   - ❌ Tables don't exist → Run `supabase_setup.sql`
   - ❌ Permission error → Check RLS policies

---

### Method 5: Check Network Tab

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Try to sign in**
4. **Look for requests to Supabase:**

   ✅ **Working:**
   - Requests to `your-supabase-url.supabase.co`
   - Status: 200 (success)
   - Response contains data

   ❌ **Not Working:**
   - Requests fail (red)
   - Status: 401 (unauthorized) = Wrong API key
   - Status: 404 = Wrong URL
   - CORS errors = CORS not configured

---

## 🔍 Current Status Check

### For Local Development:

**Check if you have a `.env` file:**
```bash
# In your project directory
cat .env | grep VITE_SUPABASE
```

**If no .env file:**
- Create one with your Supabase credentials
- Or the app will use fallback data (INITIAL_BEATS)

### For Production (Coolify):

**Check Coolify Environment Variables:**
- Go to your app in Coolify
- Environment Variables section
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

---

## ✅ Quick Test Checklist

- [ ] Environment variables set in Coolify (or .env file locally)
- [ ] Supabase project is active
- [ ] SQL script (`supabase_setup.sql`) was run
- [ ] Can access Supabase dashboard
- [ ] Browser console shows no Supabase errors
- [ ] Can sign in/create account
- [ ] Can see tracks/blog posts (if data exists in DB)

---

## 🚨 Common Issues

### "Credentials missing" in console
→ **Fix:** Add environment variables in Coolify

### "Failed to fetch"
→ **Fix:** Check Supabase URL, CORS settings, network connectivity

### "Invalid API key"
→ **Fix:** Use correct anon key from Supabase Dashboard → Settings → API

### "Relation does not exist"
→ **Fix:** Run `supabase_setup.sql` in Supabase SQL Editor

### Can sign in but can't see data
→ **Fix:** Check RLS policies, verify data exists in database

---

## 🎯 Quick Answer

**Is the database working?**

**Check these:**
1. ✅ Environment variables set in Coolify?
2. ✅ SQL script run in Supabase?
3. ✅ Can sign in without errors?
4. ✅ Browser console shows no Supabase errors?

**If all yes → Database is working! ✅**
**If any no → Follow the fixes above**

---

Want me to help you test it? Share what you see in the browser console when you try to sign in!


