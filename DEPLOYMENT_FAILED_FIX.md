# Fix: Deployment Failed After Build

## 🔍 What Happened

The build completed successfully, but the deployment failed. This usually means:
- ✅ Build succeeded (npm install, npm run build)
- ❌ Container failed to start or health check failed

## 🔧 Quick Fixes

### Fix 1: Check Coolify Settings

1. **Go to Coolify → Your App → Settings**
2. **Verify these settings:**
   ```
   ✅ Is it a static site? → CHECKED
   ✅ Is it a SPA? → CHECKED
   Port: 3000 (or 80)
   Publish Directory: dist
   ```

3. **If "Is it a static site?" is NOT checked:**
   - ✅ Check it
   - Save
   - Redeploy

### Fix 2: Check Runtime Logs

1. **Go to Coolify → Your App → Logs**
2. **Look for errors like:**
   - "Cannot find module"
   - "Port already in use"
   - "EADDRINUSE"
   - "dist folder not found"

### Fix 3: Verify Build Output

1. **Check if `dist` folder was created:**
   - In Coolify → Your App → Build Logs
   - Look for: `✓ built in X.XXs`
   - If you see TypeScript errors, the build failed

### Fix 4: Check Environment Variables

1. **Go to Coolify → Your App → Environment Variables**
2. **Make sure `PORT` is set:**
   ```
   PORT=3000
   ```
   (Or whatever port Coolify assigned)

### Fix 5: If Using Static Site Mode

If "Is it a static site?" is checked, Coolify might be using Nginx instead of the start command.

**Solution:**
1. Uncheck "Is it a static site?"
2. Make sure the start command in `nixpacks.toml` is correct
3. Redeploy

OR

1. Keep "Is it a static site?" checked
2. Make sure "Publish Directory" is set to `dist`
3. Redeploy

## 🚀 Step-by-Step Fix

### Step 1: Check Current Configuration

1. Go to **Coolify → Your App → Settings**
2. Take a screenshot or note:
   - Build Pack: `Nixpacks`
   - Is it a static site? `Yes/No`
   - Is it a SPA? `Yes/No`
   - Port: `?`
   - Publish Directory: `?`

### Step 2: Update Configuration

**If "Is it a static site?" is CHECKED:**
- ✅ Keep it checked
- ✅ Check "Is it a SPA?"
- Set Publish Directory: `dist`
- Port: `3000` (or leave default)

**If "Is it a static site?" is NOT CHECKED:**
- ✅ Check "Is it a static site?"
- ✅ Check "Is it a SPA?"
- Set Publish Directory: `dist`
- Port: `3000`

### Step 3: Add PORT Environment Variable

1. Go to **Coolify → Your App → Environment Variables**
2. Add:
   ```
   PORT=3000
   ```
   (Or use the port Coolify assigned)

### Step 4: Redeploy

1. Click **"Redeploy"** or **"Deploy"**
2. Watch the logs
3. Check if it starts successfully

## 🔍 Debugging

### Check Build Logs

Look for:
- ✅ `✓ built in X.XXs` = Build succeeded
- ❌ `error TS...` = TypeScript error
- ❌ `Error: Cannot find module` = Missing dependency

### Check Runtime Logs

Look for:
- ✅ `Serving!` or `Server running` = Success
- ❌ `EADDRINUSE` = Port conflict
- ❌ `Cannot find module 'serve'` = serve not installed
- ❌ `ENOENT: no such file or directory, open 'dist/index.html'` = dist folder missing

## 📝 Common Issues

### Issue 1: "dist folder not found"

**Cause:** Build failed or didn't complete

**Fix:**
1. Check build logs for errors
2. Make sure `npm run build` completed
3. Verify TypeScript compilation succeeded

### Issue 2: "serve command not found"

**Cause:** `serve` package not installed globally

**Fix:**
- Already handled in `nixpacks.toml` (installs serve globally)
- If still failing, check if npm install completed

### Issue 3: "Port already in use"

**Cause:** Another service using the port

**Fix:**
1. Change port in Coolify settings
2. Update `PORT` environment variable
3. Redeploy

## ✅ After Fixing

Once deployment succeeds:
1. Check the app URL
2. Verify it loads
3. Test sign-in
4. Check browser console for errors

---

**Next Steps:**
1. Check Coolify settings (especially "Is it a static site?")
2. Add `PORT` environment variable
3. Redeploy
4. Check logs if it still fails

