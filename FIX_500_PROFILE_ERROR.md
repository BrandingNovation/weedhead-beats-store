# Fix 500 Error When Fetching Profile

## 🔍 The Problem

You're getting a `500 Internal Server Error` when the app tries to fetch your profile:
```
GET /rest/v1/profiles?select=*&id=eq.xxx 500 (Internal Server Error)
```

This usually means:
1. **Profile doesn't exist** for your user
2. **RLS policy issue** blocking the query
3. **Database connection problem**

---

## ✅ Quick Fix: Create Missing Profile

**Most likely, your profile doesn't exist in the `profiles` table.**

### Step 1: Check if Profile Exists

**Run in Supabase SQL Editor:**

```sql
SELECT * FROM profiles WHERE id = 'f9022176-6007-43e1-9cd0-c54c4abbeaf4';
```

**Replace with your actual user ID from the error.**

**If it returns nothing** → Profile doesn't exist (this is the problem!)

---

### Step 2: Create the Profile

**Run this in Supabase SQL Editor:**

```sql
INSERT INTO profiles (id, name, avatar_url, is_admin, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    COALESCE(u.raw_user_meta_data->>'avatar_url', NULL),
    false, -- Set to true if you want admin
    NOW(),
    NOW()
FROM auth.users u
WHERE u.id = 'f9022176-6007-43e1-9cd0-c54c4abbeaf4'
ON CONFLICT (id) DO NOTHING;
```

**Replace `'f9022176-6007-43e1-9cd0-c54c4abbeaf4'` with your user ID.**

---

### Step 3: Make Yourself Admin (Optional)

**If you want to be admin, run:**

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'f9022176-6007-43e1-9cd0-c54c4abbeaf4';
```

---

### Step 4: Refresh the App

1. **Sign out**
2. **Sign back in**
3. **Error should be gone!**

---

## 🔧 Alternative: Find Your User ID by Email

**If you don't know your user ID, find it by email:**

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then create profile using that ID
INSERT INTO profiles (id, name, avatar_url, is_admin, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    COALESCE(u.raw_user_meta_data->>'avatar_url', NULL),
    false,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'your-email@example.com'
ON CONFLICT (id) DO NOTHING;
```

---

## 🎯 One-Line Fix (Easiest)

**If you know your email, run this:**

```sql
INSERT INTO profiles (id, name, avatar_url, is_admin, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
    NULL,
    false,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'info@brandingnovations.com'
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
```

**Replace `'info@brandingnovations.com'` with your email.**

**Then make yourself admin:**

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'info@brandingnovations.com');
```

---

## ✅ Verify It Worked

**Check your profile exists:**

```sql
SELECT p.*, u.email 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'info@brandingnovations.com';
```

**Should return your profile data.**

---

## 🔄 After Fixing

1. **Sign out** of the app
2. **Sign back in**
3. **500 error should be gone**
4. **Dashboard should work** (if you set `is_admin = true`)

---

## 🚨 Why This Happens

**The profile trigger might not have fired when you signed up:**
- Email verification might have interrupted the process
- Database trigger might have failed
- Profile creation might have been skipped

**The fix:** Manually create the profile using the SQL above.

---

**Run the INSERT query above with your email, then sign out and back in!** 🚀



