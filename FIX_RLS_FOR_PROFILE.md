# Fix RLS for Profile Query - Profile Exists But 500 Error

## ✅ Good News

Your profile exists and `is_admin = true`! The 500 error is likely an RLS (Row Level Security) issue.

---

## 🔧 Fix: Update RLS Policies

**The app query might be getting blocked. Run this in Supabase SQL Editor:**

```sql
-- Check current policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop and recreate SELECT policy to ensure it works
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Also ensure UPDATE policy exists
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Ensure INSERT policy exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Verify RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 🔍 Alternative: Check if RLS is the Issue

**Temporarily test without RLS (FOR TESTING ONLY):**

```sql
-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test in app - if 500 error goes away, RLS is the issue
-- Then re-enable and fix policies:

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Then run the policy creation above
```

---

## ✅ After Fixing RLS

1. **Sign out** of the app
2. **Sign back in**
3. **Check console** - 500 error should be gone
4. **Dashboard button** should appear

---

## 🎯 Your Profile Status

From your query results:
- ✅ Profile exists
- ✅ `is_admin = true`
- ✅ Email: `info@brandingnovations.com`
- ✅ Name: `Cents`

**Everything is correct in the database!** The issue is just RLS blocking the app's query.

---

**Run the RLS policy fix above, then sign out and back in!** 🚀

