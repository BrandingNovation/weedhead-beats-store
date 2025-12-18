# Fix "API key is missing" Error

## ✅ Your Key is in Coolify

If `VITE_API_KEY` is already in Coolify but you're still getting the error:

---

## 🔧 Quick Fixes

### Fix 1: Redeploy the App

**The app needs to be redeployed to pick up the environment variable:**

1. **Go to Coolify → Your App**
2. **Click "Redeploy" or trigger a new deployment**
3. **Wait for deployment to complete**
4. **Refresh your browser**

**Why:** Environment variables are baked into the build. You need to rebuild after adding them.

---

### Fix 2: Verify Variable Name

**Make sure it's exactly:**
- ✅ `VITE_API_KEY` (not `API_KEY` or `GEMINI_API_KEY`)
- ✅ Both checkboxes checked (Buildtime & Runtime)

**Check in Coolify:**
- Go to Environment Variables
- Verify `VITE_API_KEY` exists
- Value should be: `your-gemini-api-key-here` (get it from https://aistudio.google.com/app/apikey)

---

### Fix 3: Check Browser Console

**After redeploying:**

1. **Open browser console** (F12)
2. **Look for:**
   - ✅ `VITE_API_KEY: Set` (good)
   - ❌ `VITE_API_KEY: MISSING` (variable not being read)

---

### Fix 4: Hard Refresh

**After redeploying:**

1. **Hard refresh browser:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Clear cache** if needed
3. **Try AI features again**

---

## 🎯 Most Likely Fix

**Redeploy your app in Coolify!**

Environment variables are included at build time, so:
- Adding a variable → Need to rebuild
- Changing a variable → Need to rebuild
- App won't see new variables until redeployed

---

## ✅ After Redeploying

1. **Wait for deployment to complete**
2. **Hard refresh browser**
3. **Try AI features:**
   - AI Studio Concierge
   - Generate AI Blog Post
   - Should work now!

---

**Redeploy your app in Coolify, then the API key error should be gone!** 🚀


