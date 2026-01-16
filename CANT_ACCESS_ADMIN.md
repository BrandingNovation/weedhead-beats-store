# Can't Access Admin Dashboard - Troubleshooting

## 🔍 Quick Checks

### 1. Are You Signed In?

- ✅ Make sure you're signed in to your account
- ✅ Check that your user menu (avatar) is visible in the top right

### 2. Do You See the Dashboard Button?

**Look for "Dashboard" in the user menu:**
- Click your avatar/name in the top right
- Do you see a "Dashboard" option?
  - ✅ **Yes** → Click it!
  - ❌ **No** → You're not recognized as admin (see fixes below)

---

## 🔧 Fixes

### Fix 1: Sign Out and Sign Back In

**After making yourself admin via SQL, you need to refresh your session:**

1. **Sign out** of the app
2. **Sign back in**
3. **Check for Dashboard button** again

**Why:** The app caches your user profile. Signing out/in refreshes it.

---

### Fix 2: Verify You're Actually Admin

**Check in Supabase SQL Editor:**

```sql
SELECT u.email, p.name, p.is_admin 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your-email@example.com';
```

**Replace with your email.**

**Should show:** `is_admin = true`

**If it shows `false` or `null`:**
- Run the UPDATE query again (see below)

---

### Fix 3: Make Sure Admin Status is Set

**Run this in Supabase SQL Editor:**

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

**Replace `'your-email@example.com'` with your actual email.**

**Then:**
1. Sign out
2. Sign back in
3. Check for Dashboard button

---

### Fix 4: Check Browser Console

**Open browser console (F12) and look for:**

1. **Sign in**
2. **Check console for:**
   - `isAdmin: true` or `isAdmin: false`
   - Any errors fetching profile

**If you see `isAdmin: false`:**
- Your profile isn't set as admin in the database
- Run the UPDATE query above

---

### Fix 5: Use Email with "admin" in It

**The app also checks if your email contains "admin":**

If your email has "admin" in it (like `admin@example.com`), you'll automatically be admin.

**To test:**
1. Sign up with: `admin@yourdomain.com`
2. Sign in
3. Should see Dashboard button

---

## ✅ Step-by-Step Fix

### Step 1: Verify Admin Status in Database

```sql
SELECT u.email, p.is_admin 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your-email@example.com';
```

### Step 2: If Not Admin, Set It

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

### Step 3: Verify It Was Set

```sql
SELECT u.email, p.is_admin 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'your-email@example.com';
```

**Should now show:** `is_admin = true`

### Step 4: Sign Out and Sign Back In

1. **Click your avatar** → **Sign Out**
2. **Sign back in**
3. **Click your avatar** → Should see **"Dashboard"** option

---

## 🚨 Common Issues

### "I ran the SQL but still can't see Dashboard"

**Fix:**
1. Verify the query worked (run SELECT to check)
2. Sign out completely
3. Sign back in
4. Check again

### "I don't see my avatar/user menu"

**Fix:**
- Make sure you're signed in
- Check top right corner for your avatar/name

### "Dashboard button doesn't do anything"

**Fix:**
- Check browser console for errors (F12)
- Make sure `isAdmin: true` in console
- Try refreshing the page

---

## 🎯 Quick Test

**Fastest way to test:**

1. **Sign up with:** `admin@test.com`
2. **Sign in**
3. **Click avatar** → Should see "Dashboard"
4. **Click Dashboard** → Should see admin panel

If this works, your app is fine - you just need to set your existing account as admin.

---

## 📋 Checklist

- [ ] Verified `is_admin = true` in database (SQL query)
- [ ] Signed out of the app
- [ ] Signed back in
- [ ] Checked user menu for "Dashboard" button
- [ ] Clicked "Dashboard" button
- [ ] Checked browser console for errors (F12)

---

**Most common fix: Sign out and sign back in after setting admin status!** 🔄



