# 🔧 Fix 503 Error After Domain Change

## 🔍 What is a 503 Error?

**503 Service Unavailable** means the server is not ready to handle the request. This usually happens when:
- The application isn't running
- The application crashed
- SSL certificate is still generating
- Port/proxy configuration issue

---

## ✅ Step-by-Step Fix

### Step 1: Check Application Status in Coolify

1. **Go to Coolify Dashboard**
2. **Click on your application** (not Supabase, your main app)
3. **Check the status:**
   - ✅ **Green/Running** = App is running
   - ❌ **Red/Stopped** = App is stopped
   - ⚠️ **Yellow/Starting** = App is starting (wait a few minutes)

**If the app is stopped:**
- Click **"Start"** or **"Restart"** button
- Wait 1-2 minutes for it to start

---

### Step 2: Check Application Logs

1. **In Coolify → Your App → Logs**
2. **Look for errors:**
   - ❌ "Port already in use"
   - ❌ "Failed to start"
   - ❌ "Build failed"
   - ❌ "Environment variable missing"
   - ❌ "Cannot find module"

**Common issues:**
- **"Port already in use"** → Check if another service is using port 3000
- **"Build failed"** → Check build logs for npm errors
- **"Environment variable missing"** → Add missing variables

---

### Step 3: Verify Domain Configuration

1. **In Coolify → Your App → Domains**
2. **Check if `weedheadbeats.com` is listed:**
   - ✅ Should show as "Active" or "Valid"
   - ⚠️ If it shows "Pending" → Wait 2-5 minutes for SSL to generate
   - ❌ If it shows "Error" → Check DNS settings

3. **Check SSL Certificate:**
   - Should show "Valid" or "Active"
   - If "Generating" → Wait 2-5 minutes
   - If "Failed" → Check DNS is pointing correctly

---

### Step 4: Check DNS Configuration

**Verify DNS is pointing to your server:**

1. **In terminal, run:**
   ```bash
   nslookup weedheadbeats.com
   # or
   dig weedheadbeats.com
   ```

2. **Should return your server IP** (e.g., `65.21.109.247`)

3. **If DNS is wrong:**
   - Go to your domain registrar (Cloudflare, Namecheap, etc.)
   - Update A record to point to your server IP
   - Wait 5-60 minutes for DNS to propagate

---

### Step 5: Restart the Application

**After changing domain, always restart:**

1. **In Coolify → Your App**
2. **Click "Restart"** button
3. **Wait 1-2 minutes** for app to start
4. **Check logs** to see if it started successfully

---

### Step 6: Check Port Configuration

**Verify the port is correct:**

1. **In Coolify → Your App → Environment Variables**
2. **Check for `PORT` variable:**
   - Should be set to `3000` (or your app's port)
   - If missing, add it:
     - **Name:** `PORT`
     - **Value:** `3000`
     - ✅ Available at Runtime

3. **Check `nixpacks.toml`:**
   - Should have: `cmd = "npx serve -s dist -l ${PORT:-3000}"`
   - This uses PORT environment variable or defaults to 3000

---

### Step 7: Verify Build Succeeded

1. **In Coolify → Your App → Builds**
2. **Check latest build:**
   - ✅ **Success** = Build worked
   - ❌ **Failed** = Build failed (check build logs)

3. **If build failed:**
   - Check build logs for errors
   - Common issues:
     - Missing dependencies
     - TypeScript errors
     - Build script errors

---

### Step 8: Check Reverse Proxy/SSL

**If using Coolify's built-in proxy:**

1. **In Coolify → Your App → Settings**
2. **Check "Traefik" or "Proxy" settings:**
   - Should be enabled
   - Should show your domain

3. **If SSL is still generating:**
   - Wait 2-5 minutes
   - Check Coolify logs for SSL errors
   - Verify DNS is pointing correctly

---

## 🚨 Common Issues & Solutions

### Issue 1: App Crashed After Domain Change

**Solution:**
1. Check application logs
2. Look for errors related to:
   - Environment variables
   - Port conflicts
   - Missing files
3. Restart the application

---

### Issue 2: SSL Certificate Still Generating

**Solution:**
- Wait 2-5 minutes
- Verify DNS is pointing correctly
- Check Coolify logs for SSL errors
- Try accessing `http://weedheadbeats.com` (without https) to see if app is running

---

### Issue 3: Port Already in Use

**Solution:**
1. Check if another service is using port 3000
2. Change PORT environment variable to a different port (e.g., 3001)
3. Restart the application

---

### Issue 4: Build Failed

**Solution:**
1. Check build logs in Coolify
2. Common fixes:
   - Run `npm install` locally to check for dependency issues
   - Check for TypeScript errors
   - Verify `package.json` scripts are correct

---

### Issue 5: Environment Variables Missing

**Solution:**
1. **In Coolify → Your App → Environment Variables**
2. **Verify these are set:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `PORT` (if needed)
3. **Make sure they're available at Runtime** ✅

---

## 🔍 Quick Diagnostic Commands

**In Coolify, check:**

1. **Application Status:** Should be "Running"
2. **Latest Build:** Should be "Success"
3. **Domain Status:** Should be "Active" or "Valid"
4. **SSL Status:** Should be "Valid" or "Active"
5. **Logs:** Should show "Server running on port 3000" (or your port)

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Application status is "Running" (green)
- ✅ Domain shows "Active" or "Valid"
- ✅ SSL certificate is "Valid"
- ✅ Logs show "Server running on port X"
- ✅ You can access `https://weedheadbeats.com` without errors

---

## 🆘 Still Not Working?

**Check these in order:**

1. ✅ Application is running (not stopped)
2. ✅ Latest build succeeded
3. ✅ Domain is configured correctly
4. ✅ DNS is pointing to your server
5. ✅ SSL certificate is valid
6. ✅ Port is configured correctly
7. ✅ Environment variables are set
8. ✅ No errors in application logs

**If all of these are correct and it still doesn't work:**
- Check Coolify server logs
- Verify server has enough resources (RAM, CPU)
- Check if firewall is blocking the port
- Try accessing via IP address to see if app is running

---

**After fixing, the 503 error should be gone! 🎉**

