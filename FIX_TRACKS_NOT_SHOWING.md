# 🔧 Fix: Tracks Not Showing on Frontend

## Problem
Tracks are being saved to Supabase database (you can see them in the database), but they don't appear on the frontend after page refresh.

## Root Cause
This is almost always a **Row Level Security (RLS) policy issue**. The tracks are being inserted successfully (INSERT works), but SELECT queries are being blocked by RLS policies.

## ✅ Quick Fix

### Step 1: Run the SQL Fix

1. **Go to Supabase Dashboard**
2. **Click "SQL Editor"** (in the left sidebar)
3. **Click "New Query"**
4. **Copy and paste this SQL:**

```sql
-- Fix: Tracks Not Showing on Frontend
-- This ensures RLS policies allow public read access to tracks

-- 1. Ensure RLS is enabled
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Tracks are viewable by everyone" ON tracks;
DROP POLICY IF EXISTS "Public can view tracks" ON tracks;
DROP POLICY IF EXISTS "Everyone can read tracks" ON tracks;

-- 3. Create the public read policy
CREATE POLICY "Tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (true);
```

5. **Click "RUN"** (or press Ctrl+Enter)

### Step 2: Verify the Policy

1. **Go to Supabase Dashboard → Authentication → Policies**
2. **Find the `tracks` table**
3. **You should see a policy named:** `Tracks are viewable by everyone`
4. **It should have:**
   - **Operation:** SELECT
   - **Target roles:** `anon`, `authenticated`
   - **USING expression:** `true`

### Step 3: Test

1. **Refresh your frontend page**
2. **Open browser console (F12)**
3. **Look for:** `✅ Loaded X tracks from Supabase`
4. **Tracks should now appear!**

---

## 🔍 Alternative: Check Existing Policies

If the above doesn't work, check if there are conflicting policies:

1. **Go to Supabase Dashboard → Authentication → Policies**
2. **Click on `tracks` table**
3. **Check all policies:**
   - Should have at least ONE policy allowing SELECT
   - Should NOT have policies that block SELECT for anonymous users
   - If you see policies with `USING (false)` or restrictive conditions, they might be blocking

---

## 🐛 Debugging Steps

### Check Browser Console

1. **Open browser console (F12)**
2. **Look for error messages:**
   - `❌ Error fetching tracks:`
   - `⚠️ RLS policy may be blocking track access`
   - `Error code: 42501` (permission denied)

### Test in Supabase SQL Editor

Run this query in Supabase SQL Editor:

```sql
-- This should return all tracks (if RLS allows)
SELECT id, title, cover, audio, created_at 
FROM tracks 
ORDER BY created_at DESC 
LIMIT 10;
```

- **If this works:** RLS is fine, issue is in frontend code
- **If this fails:** RLS policy is blocking, run the fix above

### Check Track Count

```sql
-- Count total tracks
SELECT COUNT(*) FROM tracks;
```

- **If count > 0:** Tracks exist, RLS is blocking SELECT
- **If count = 0:** No tracks in database (upload issue)

---

## 📋 Complete RLS Policy Setup

If you need to set up all RLS policies from scratch:

```sql
-- Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Public can read tracks (for store display)
CREATE POLICY "Tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (true);

-- Admins can insert tracks
CREATE POLICY "Admins can insert tracks"
    ON tracks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admins can update tracks
CREATE POLICY "Admins can update tracks"
    ON tracks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Admins can delete tracks
CREATE POLICY "Admins can delete tracks"
    ON tracks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
```

---

## ✅ Success Indicators

You'll know it's fixed when:

1. ✅ Browser console shows: `✅ Loaded X tracks from Supabase`
2. ✅ Tracks appear on the frontend store page
3. ✅ No permission denied errors in console
4. ✅ Tracks persist after page refresh

---

## 🆘 Still Not Working?

If tracks still don't show after running the fix:

1. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Look for errors related to `tracks` table

2. **Verify Supabase connection:**
   - Check `VITE_SUPABASE_URL` in your `.env` file
   - Check `VITE_SUPABASE_ANON_KEY` is correct

3. **Test with Postman/curl:**
   ```bash
   curl -X GET \
     "YOUR_SUPABASE_URL/rest/v1/tracks?select=*" \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

4. **Check for conflicting policies:**
   - Multiple SELECT policies might conflict
   - Remove all SELECT policies and recreate just one

---

**The SQL fix file is also available as `FIX_TRACKS_RLS.sql` in the project root.**

