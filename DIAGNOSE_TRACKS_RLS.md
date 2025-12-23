# 🔍 Diagnose: Tracks in Database But Not Showing on Frontend

## Problem
- ✅ Tracks ARE being saved to Supabase (you can see them in database)
- ❌ Tracks are NOT showing on frontend (local mode / INITIAL_BEATS showing instead)
- This means: **INSERT works, but SELECT is blocked by RLS**

---

## 🔧 Step-by-Step Diagnosis

### Step 1: Test RLS Policy in Supabase

Run this in **Supabase SQL Editor**:

```sql
-- Check if tracks exist
SELECT COUNT(*) as total_tracks FROM tracks;

-- Try to select tracks (this should work if RLS allows)
SELECT id, title, cover, audio, created_at 
FROM tracks 
ORDER BY created_at DESC 
LIMIT 5;

-- Check current RLS policies
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'tracks';
```

**Expected Results:**
- `total_tracks` should show count > 0
- `SELECT` query should return rows
- Should see policy `"Tracks are viewable by everyone"` with `cmd = 'SELECT'`

**If SELECT returns empty but COUNT > 0:**
→ RLS is blocking! Go to Step 2.

---

### Step 2: Fix RLS Policy

Run this in **Supabase SQL Editor**:

```sql
-- Ensure RLS is enabled
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Tracks are viewable by everyone" ON tracks;
DROP POLICY IF EXISTS "Public can view tracks" ON tracks;
DROP POLICY IF EXISTS "Everyone can read tracks" ON tracks;

-- Create the public read policy
CREATE POLICY "Tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (true);
```

**Verify it worked:**
1. Go to **Supabase Dashboard → Authentication → Policies**
2. Find `tracks` table
3. Should see: `"Tracks are viewable by everyone"` with SELECT permission

---

### Step 3: Test in Browser

1. **Open browser console (F12)**
2. **Refresh the page**
3. **Look for these messages:**
   - `🔄 Fetching tracks from Supabase...`
   - `✅ Loaded X tracks from Supabase`
   - `✅ Tracks set in state: X`

**If you see:**
- `❌ Error fetching tracks:` → RLS still blocking
- `⚠️ Query returned empty array` → RLS still blocking
- `✅ Loaded X tracks` → **SUCCESS!** Tracks should appear

---

### Step 4: Check Browser Console Errors

Open browser console (F12) and look for:

**Error Code `42501` or `PGRST301`:**
```
❌ Error fetching tracks: permission denied
```
→ RLS policy is blocking SELECT

**Error Code `PGRST116` or `42P01`:**
```
❌ Error fetching tracks: relation does not exist
```
→ Table doesn't exist (different issue)

**Empty result:**
```
⚠️ Query returned empty array
```
→ RLS is blocking, query returns empty even though tracks exist

---

## 🐛 Common Issues

### Issue 1: Policy Exists But Still Blocking

**Check policy definition:**
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'tracks' AND cmd = 'SELECT';
```

**Should show:**
- `qual` should be `(true)` or similar
- `with_check` should be NULL (for SELECT)

**If wrong, recreate:**
```sql
DROP POLICY "Tracks are viewable by everyone" ON tracks;
CREATE POLICY "Tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (true);
```

---

### Issue 2: Multiple Conflicting Policies

**Check all policies:**
```sql
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'tracks';
```

**If you see multiple SELECT policies:**
- They might conflict
- Drop all and recreate just one:
```sql
-- Drop all SELECT policies
DROP POLICY IF EXISTS "Tracks are viewable by everyone" ON tracks;
DROP POLICY IF EXISTS "Public can view tracks" ON tracks;
DROP POLICY IF EXISTS "Everyone can read tracks" ON tracks;
-- Add any other SELECT policies you see

-- Create single policy
CREATE POLICY "Tracks are viewable by everyone"
    ON tracks FOR SELECT
    USING (true);
```

---

### Issue 3: RLS Enabled But No Policies

**Check if RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'tracks';
```

**If `rowsecurity = true` but no policies exist:**
- RLS is enabled but blocking everything
- Create the policy (Step 2)

**If `rowsecurity = false`:**
- RLS is disabled (should work, but not secure)
- Enable RLS and create policy

---

## ✅ Verification Checklist

After running the fix, verify:

- [ ] Policy exists: `"Tracks are viewable by everyone"`
- [ ] Policy operation: `SELECT`
- [ ] Policy USING: `(true)`
- [ ] Browser console shows: `✅ Loaded X tracks from Supabase`
- [ ] Tracks appear on frontend
- [ ] Tracks persist after page refresh

---

## 🆘 Still Not Working?

### Test Direct API Call

Test if the Supabase REST API works:

```bash
curl -X GET \
  "YOUR_SUPABASE_URL/rest/v1/tracks?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**If this returns empty:**
→ RLS is blocking at API level

**If this returns data:**
→ Issue is in frontend code, not RLS

---

### Check Supabase Logs

1. Go to **Supabase Dashboard → Logs**
2. Look for errors related to `tracks` table
3. Check for `permission denied` errors

---

### Verify Environment Variables

Check your `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Make sure:**
- URL is correct
- Anon key is correct (not service role key)
- No typos or extra spaces

---

## 📝 Quick Fix Summary

**If tracks exist in DB but don't show on frontend:**

1. Run `FIX_TRACKS_RLS.sql` in Supabase SQL Editor
2. Refresh browser
3. Check console for `✅ Loaded X tracks`
4. Tracks should appear!

**The fix ensures RLS allows public read access to tracks.**

