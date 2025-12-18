# Fix: App Deployed But Not Loading

## 🔍 Quick Checks

### 1. Check Application Status in Coolify

1. **Go to Coolify → Your App**
2. **Check the status:**
   - ✅ Green/Healthy = Running
   - ❌ Red/Unhealthy = Issue
   - ⚠️ Yellow = Starting

### 2. Check Logs

1. **In Coolify → Your App → Logs**
2. **Look for errors:**
   - Port conflicts
   - File not found errors
   - Permission errors

### 3. Verify Configuration

**In Coolify → Your App → Settings:**

- ✅ **Port**: Should be `3000` (or whatever you set)
- ✅ **Is it a static site?**: Should be **CHECKED**
- ✅ **Is it a SPA?**: Should be **CHECKED** (for React routing)
- ✅ **Publish Directory**: Should be `dist`

---

## 🔧 Common Fixes

### Fix 1: Port Configuration

**Problem:** App might be running on wrong port

**Solution:**
1. In Coolify → Your App → Settings
2. Check **Port** field
3. Make sure it matches what's in `nixpacks.toml` (should use `$PORT` now)
4. Default is usually `3000`

### Fix 2: Static Site Not Configured

**Problem:** Coolify doesn't know it's a static site

**Solution:**
1. In Coolify → Your App → Settings
2. ✅ **Check "Is it a static site?"**
3. ✅ **Check "Is it a SPA (Single Page Application)?"**
4. Set **Publish Directory** to `dist`
5. **Redeploy**

### Fix 3: Build Output Not Found

**Problem:** `dist` folder not being created or found

**Solution:**
1. Check build logs in Coolify
2. Verify `npm run build` completed successfully
3. Check if `dist` folder exists in build logs
4. If missing, check for build errors

### Fix 4: Serve Command Not Working

**Problem:** `serve` package not available

**Solution:**
I've updated `nixpacks.toml` to install `serve` globally. After redeploying, this should be fixed.

---

## 🚀 Step-by-Step Fix

### Step 1: Verify Coolify Settings

1. **Go to Coolify → Your App → Settings**
2. **Check these settings:**
   ```
   Port: 3000
   Is it a static site?: ✅ CHECKED
   Is it a SPA?: ✅ CHECKED
   Publish Directory: dist
   ```

### Step 2: Check Build Logs

1. **Go to Coolify → Your App → Logs**
2. **Look for:**
   - ✅ "Build completed successfully"
   - ✅ "dist" folder created
   - ❌ Any errors

### Step 3: Check Runtime Logs

1. **Go to Coolify → Your App → Logs**
2. **Look for:**
   - ✅ "Serving!" or "Server running"
   - ✅ Port number
   - ❌ "Cannot find module" or "EADDRINUSE"

### Step 4: Redeploy

1. **Trigger a new deployment** in Coolify
2. **Wait for it to complete**
3. **Check if app loads**

---

## 🧪 Test the Deployment

### Option 1: Check via Coolify

1. **Go to Coolify → Your App**
2. **Click "Open" or "Visit"** button
3. **See if it loads**

### Option 2: Check via Domain

1. **Visit your domain** (weedheadbeats.com)
2. **Check browser console** (F12) for errors
3. **Check Network tab** for failed requests

### Option 3: Check Container

1. **In Coolify → Your App → Terminal**
2. **Run:**
   ```bash
   ls -la dist/
   ```
3. **Should see:** `index.html` and `assets/` folder

---

## 🔍 Debug Commands

**In Coolify → Your App → Terminal:**

```bash
# Check if dist folder exists
ls -la dist/

# Check if serve is installed
which serve

# Check what's running on port
netstat -tulpn | grep 3000

# Check environment variables
env | grep PORT
env | grep VITE
```

---

## ✅ Most Likely Fix

**The issue is probably one of these:**

1. **"Is it a static site?" not checked** → Check it and redeploy
2. **"Is it a SPA?" not checked** → Check it and redeploy  
3. **Port mismatch** → Verify port in settings matches `nixpacks.toml`
4. **Build failed** → Check build logs for errors

**After fixing, redeploy and it should work!** 🚀

---

## 📋 Quick Checklist

- [ ] "Is it a static site?" is CHECKED
- [ ] "Is it a SPA?" is CHECKED
- [ ] Publish Directory is set to `dist`
- [ ] Port is set correctly (usually 3000)
- [ ] Build completed successfully (check logs)
- [ ] `dist` folder exists (check terminal)
- [ ] Redeployed after making changes
- [ ] Checked runtime logs for errors

---

**If still not working, share the logs from Coolify and I'll help debug!**


