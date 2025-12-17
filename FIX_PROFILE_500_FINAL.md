# Final Fix for 500 Profile Error

## 🔍 The Issue

The app is trying to fetch your profile but getting a 500 error. This means either:
1. Profile doesn't exist
2. RLS policies are blocking it
3. Database query is failing

---

## ✅ Complete Fix (Run All of This)

**Copy and paste this ENTIRE block into Supabase SQL Editor:**

```sql
-- Step 1: Create your profile (replace email with yours)
INSERT INTO profiles (id, name, avatar_url, is_admin, is_pro, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name,
    COALESCE(u.raw_user_meta_data->>'avatar_url', NULL) as avatar_url,
    true as is_admin,
    true as is_pro,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users u
WHERE u.email = 'info@brandingnovations.com'
ON CONFLICT (id) DO UPDATE SET 
    name = COALESCE(EXCLUDED.name, profiles.name),
    is_admin = true,
    updated_at = NOW();

-- Step 2: Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop and recreate SELECT policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Step 4: Verify it worked
SELECT 
    p.id,
    p.name,
    p.is_admin,
    u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'info@brandingnovations.com';
```

**After running, you should see your profile data returned.**

---

## 🔄 After Running SQL

1. **Sign out** of the app (click "Sign Out" button)
2. **Hard refresh browser** (Cmd+Shift+R or Ctrl+Shift+R)
3. **Sign back in**
4. **Check console** - 500 error should be gone

---

## 🚨 If Still Getting 500 Error

**Check Supabase Logs:**

1. **Go to Supabase Dashboard → Logs**
2. **Look for errors** when you sign in
3. **Check the exact error message**

**Common errors:**
- "permission denied" → RLS policy issue
- "relation does not exist" → Table missing
- "column does not exist" → Schema mismatch

---

## 🎯 Alternative: Disable RLS Temporarily (For Testing Only)

**⚠️ Only for testing! Re-enable after:**

```sql
-- Temporarily disable RLS to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test if query works now
-- If it does, the issue is RLS policies

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Then fix policies (see Step 3 above)
```

---

## 📋 Quick Checklist

- [ ] Ran the SQL fix above
- [ ] Profile exists (verified with SELECT query)
- [ ] RLS is enabled
- [ ] Policies are created
- [ ] Signed out and back in
- [ ] Hard refreshed browser
- [ ] Checked Supabase logs for errors

---

**Run the complete SQL block above, then sign out and back in!** 🚀

