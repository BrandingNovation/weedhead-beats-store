# How to Create an Admin User

## 🎯 Two Ways to Create an Admin

### Method 1: Automatic (Easiest) ✅

**Sign up with an email that contains "admin":**

1. **Go to your app**
2. **Click "Sign Up"**
3. **Use an email with "admin" in it:**
   - `admin@yourdomain.com`
   - `yourname.admin@gmail.com`
   - `adminuser@example.com`
   - Any email containing "admin" (case-insensitive)
4. **Complete signup**
5. **You'll automatically be an admin!**

**Note:** The app checks if your email contains "admin" and automatically sets `is_admin = true`.

---

### Method 2: Manual via SQL (For Existing Users)

**If you already have an account and want to make it admin:**

1. **Go to Supabase Dashboard → SQL Editor**
2. **Run this query:**

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

**Replace `'your-email@example.com'` with your actual email address.**

3. **Verify it worked:**

```sql
SELECT email, is_admin 
FROM profiles 
WHERE email = 'your-email@example.com';
```

**Should show:** `is_admin = true`

---

## ✅ Verify You're Admin

**After creating admin account:**

1. **Sign in to your app**
2. **Look for "Dashboard" button** in the user menu
3. **Click it** - you should see admin features:
   - Upload Track
   - Inventory Management
   - CMS
   - Blog Management
   - Settings

---

## 🔧 Quick SQL Commands

### Make a user admin:
```sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

### Remove admin status:
```sql
UPDATE profiles 
SET is_admin = false 
WHERE email = 'your-email@example.com';
```

### List all admins:
```sql
SELECT email, name, is_admin 
FROM profiles 
WHERE is_admin = true;
```

### Check if a user is admin:
```sql
SELECT email, is_admin 
FROM profiles 
WHERE email = 'your-email@example.com';
```

---

## 🎯 Recommended: Use Method 1

**Easiest way:**
1. Sign up with email like `admin@weedheadbeats.com`
2. Automatically becomes admin
3. Done!

---

## ⚠️ Important Notes

- **Admin users can:**
  - Upload tracks/beats
  - Manage inventory
  - Edit CMS content
  - Manage blog posts
  - Access AI features
  - View all user profiles

- **Regular users can:**
  - Browse store
  - Add to cart
  - Purchase items
  - View blog
  - Use basic features

---

## 🚀 Quick Start

**Fastest way to get admin access:**

1. **Sign up** with: `admin@yourdomain.com`
2. **Verify email** (if required)
3. **Sign in**
4. **Click "Dashboard"** in user menu
5. **You're now an admin!**

---

**That's it! Choose the method that works best for you.** 🎉

