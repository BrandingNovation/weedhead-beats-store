# Fix 500 Error - Detailed Troubleshooting

## 🔍 The Problem

Still getting `500 Internal Server Error` when fetching profile, even after creating it.

This could be:
1. **RLS (Row Level Security) blocking the query**
2. **Profile exists but query is failing**
3. **Database connection issue**
4. **Missing columns in profiles table**

---

## ✅ Step-by-Step Fix

### Step 1: Check if Profile Exists

**Run in Supabase SQL Editor:**

```sql
SELECT * FROM profiles WHERE id = 'f9022176-6007-43e1-9cd0-c54c4abbeaf4';
```

**If it returns nothing** → Profile doesn't exist, create it (see Step 2)

**If it returns data** → Profile exists, but RLS might be blocking (see Step 3)

---

### Step 2: Create Profile (If Missing)

**Run this:**

```sql
INSERT INTO profiles (id, name, avatar_url, is_admin, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    NULL,
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.id = 'f9022176-6007-43e1-9cd0-c54c4abbeaf4'
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
```

**Replace the ID with your actual user ID from the error.**

---

### Step 3: Check RLS Policies

**The query might be blocked by Row Level Security. Check policies:**

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Should see policies like:**
- "Users can view own profile"
- "Users can update own profile"
- "Admins can view all profiles"

---

### Step 4: Test the Query Directly

**Try querying as your user:**

```sql
-- First, get your user ID
SELECT id, email FROM auth.users WHERE email = 'info@brandingnovations.com';

-- Then test the query (replace with your ID)
SELECT * FROM profiles WHERE id = 'f9022176-6007-43e1-9cd0-c54c4abbeaf4';
```

**If this works in SQL Editor but not in the app:**
- RLS is working, but there might be an app-side issue
- Check browser console for more details

---

### Step 5: Recreate RLS Policies (If Needed)

**If policies are missing or broken, recreate them:**

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );
```

---

### Step 6: Check Table Structure

**Make sure profiles table has all required columns:**

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
```

**Should have:**
- `id` (UUID)
- `name` (TEXT)
- `avatar_url` (TEXT)
- `is_pro` (BOOLEAN)
- `is_admin` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

### Step 7: Enable RLS (If Disabled)

**Check if RLS is enabled:**

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

**If `rowsecurity = false`, enable it:**

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 🎯 Quick All-in-One Fix

**Run all of these in order:**

```sql
-- 1. Create profile if missing
INSERT INTO profiles (id, name, avatar_url, is_admin, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    NULL,
    true,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'info@brandingnovations.com'
ON CONFLICT (id) DO UPDATE SET 
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = NOW();

-- 2. Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Recreate policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
```

---

## 🔍 Debug: Check Supabase Logs

**In Supabase Dashboard:**
1. **Go to Logs**
2. **Look for errors** around the time you tried to sign in
3. **Check for:**
   - Permission denied errors
   - Missing table errors
   - RLS policy errors

---

## ✅ After Running Fixes

1. **Sign out** of the app
2. **Clear browser cache** (optional but recommended)
3. **Sign back in**
4. **Check browser console** (F12) - should see profile loaded
5. **500 error should be gone**

---

## 🆘 Still Not Working?

**Share:**
1. **Does the profile exist?** (run SELECT query)
2. **What do Supabase logs show?** (Dashboard → Logs)
3. **Any other errors in browser console?**
4. **Did you run the SQL setup script?** (`supabase_setup.sql`)

---

**Run the "Quick All-in-One Fix" SQL above, then sign out and back in!** 🚀

