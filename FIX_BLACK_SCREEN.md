# Fix Black Screen Issue

## 🔍 Common Causes

A black screen usually means:
1. **JavaScript error** preventing React from rendering
2. **Missing CSS file** (`index.css`)
3. **Build output not correct**
4. **Environment variables missing** causing app to crash

---

## ✅ Quick Fixes

### Fix 1: Check Browser Console

1. **Open your deployed site**
2. **Press F12** (open browser console)
3. **Look for errors:**
   - Red error messages
   - Failed network requests
   - "Cannot find module" errors

**Share the errors you see!**

---

### Fix 2: Check if CSS File Exists

The `index.html` references `/index.css` which might be missing.

**In Coolify → Your App → Terminal, run:**
```bash
ls -la dist/
ls -la dist/assets/
```

**Should see:**
- `index.html`
- `assets/` folder with CSS/JS files

---

### Fix 3: Check Build Output

**In Coolify → Your App → Logs:**
- Look for "Build completed successfully"
- Check if `dist` folder was created
- Look for any build errors

---

### Fix 4: Environment Variables

**Missing env vars can cause black screen!**

1. **Go to Coolify → Your App → Environment Variables**
2. **Verify these exist:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Both should be:**
   - ✅ Available at Buildtime
   - ✅ Available at Runtime

---

### Fix 5: Check Network Tab

1. **Open browser DevTools → Network tab**
2. **Refresh the page**
3. **Look for:**
   - ❌ Failed requests (red)
   - ❌ 404 errors
   - ❌ CORS errors

---

## 🔧 Most Likely Issues

### Issue 1: Missing index.css

**Problem:** `index.html` references `/index.css` but it might not exist

**Solution:** The CSS should be in `dist/assets/` after build. If missing, check build logs.

### Issue 2: JavaScript Error

**Problem:** App crashes on load due to error

**Solution:** Check browser console for the exact error

### Issue 3: Importmap in Production

**Problem:** The `importmap` in `index.html` is for development, might cause issues in production

**Solution:** Vite should handle this, but if issues persist, we may need to remove it

---

## 🚀 Step-by-Step Debug

### Step 1: Check Browser Console

1. Open your site
2. Press F12
3. Go to Console tab
4. **Copy all errors** and share them

### Step 2: Check Network Requests

1. Go to Network tab
2. Refresh page
3. **Check which files fail to load**

### Step 3: Check Coolify Logs

1. Go to Coolify → Your App → Logs
2. **Look for errors** in build or runtime logs

### Step 4: Verify Build Output

1. Go to Coolify → Your App → Terminal
2. Run: `ls -la dist/`
3. **Verify files exist**

---

## 📋 Quick Checklist

- [ ] Checked browser console for errors
- [ ] Checked Network tab for failed requests
- [ ] Verified environment variables are set
- [ ] Checked build logs in Coolify
- [ ] Verified `dist` folder exists
- [ ] Checked runtime logs in Coolify

---

## 🆘 What to Share

If still not working, share:

1. **Browser console errors** (F12 → Console)
2. **Network tab** - which files fail to load
3. **Coolify build logs** - any errors during build
4. **Coolify runtime logs** - any errors when running

**This will help me pinpoint the exact issue!**



