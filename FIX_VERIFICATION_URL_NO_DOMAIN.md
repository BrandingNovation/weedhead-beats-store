# Fix Verification Email URL (No Domain Yet)

## 🔍 The Problem

You haven't connected your domain yet, but Supabase needs a URL for verification emails.

## ✅ Solution: Use Your Coolify Preview URL

You need to use whatever URL you're currently using to access your app.

---

## 🔧 Step-by-Step Fix

### Step 1: Find Your Current App URL

**What URL are you using to access your app right now?**

Options:
- Coolify preview URL (e.g., `https://preview-xyz.coolify.io`)
- Your server IP (e.g., `https://123.45.67.89`)
- A temporary domain you set up

**Use that URL for now!**

### Step 2: Add SITE_URL to Supabase

**In Coolify → Your Supabase Service → Environment Variables:**

1. **Add Variable:**
   - **Name:** `SITE_URL`
   - **Value:** `https://your-current-app-url.com` (or IP)
   - ✅ Available at Buildtime
   - ✅ Available at Runtime

2. **Add Redirect URLs (optional):**
   - **Name:** `ADDITIONAL_REDIRECT_URLS`
   - **Value:** `https://your-current-app-url.com/**`
   - ✅ Available at Buildtime
   - ✅ Available at Runtime

3. **Restart Supabase service**

---

## 📋 Examples

### If using Coolify preview URL:
```
SITE_URL=https://preview-abc123.coolify.io
ADDITIONAL_REDIRECT_URLS=https://preview-abc123.coolify.io/**
```

### If using IP address:
```
SITE_URL=https://123.45.67.89
ADDITIONAL_REDIRECT_URLS=https://123.45.67.89/**
```

### If using temporary domain:
```
SITE_URL=https://weedheadbeats.temp.com
ADDITIONAL_REDIRECT_URLS=https://weedheadbeats.temp.com/**
```

---

## ✅ After Adding

1. **Restart Supabase service**
2. **Test verification email**
3. **Link should now work!**

---

## 🔄 When You Connect Your Domain Later

Once you connect `weedheadbeats.com`:

1. **Update the SITE_URL:**
   - Change from preview URL to `https://weedheadbeats.com`
2. **Update redirect URLs:**
   - Add `https://weedheadbeats.com/**`
   - Add `https://www.weedheadbeats.com/**`
3. **Restart Supabase**

---

## 🎯 Quick Answer

**What URL are you using to access your app right now?**

That's the URL you need to set as `SITE_URL` in Supabase!

---

**Share your current app URL and I'll give you the exact values to add!** 🚀

