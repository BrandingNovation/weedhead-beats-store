# 🚨 Quick Fix for 503 Error

## Most Common Causes (Check These First!)

### 1. **Application Not Running** (90% of cases)
- Go to **Coolify → Your App**
- Check if status is **"Running"** (green)
- If **"Stopped"** (red) → Click **"Start"** or **"Restart"**
- Wait 1-2 minutes

### 2. **SSL Certificate Still Generating**
- After adding domain, SSL takes 2-5 minutes to generate
- Check **Coolify → Your App → Domains**
- If SSL shows "Generating" → **Wait 2-5 minutes**
- Try accessing `http://weedheadbeats.com` (without https) to see if app is running

### 3. **App Crashed After Domain Change**
- **Go to Coolify → Your App → Logs**
- Look for errors
- **Click "Restart"** button
- Wait 1-2 minutes

---

## ✅ Quick Fix Steps (Do These Now)

1. **Check App Status:**
   - Coolify → Your App → Is it "Running"? 
   - If not → Click "Restart"

2. **Check Logs:**
   - Coolify → Your App → Logs
   - Look for errors
   - Share any errors you see

3. **Wait for SSL:**
   - If you just added the domain, wait 2-5 minutes
   - SSL certificate needs time to generate

4. **Restart the App:**
   - Click "Restart" in Coolify
   - Wait 1-2 minutes
   - Try accessing the site again

---

## 🔍 What to Check in Coolify

**Go to Coolify → Your App and check:**

- ✅ **Status:** Should be "Running" (green)
- ✅ **Latest Build:** Should be "Success"
- ✅ **Domain:** Should show `weedheadbeats.com` as "Active"
- ✅ **SSL:** Should be "Valid" (may take 2-5 minutes)
- ✅ **Logs:** Should show "Server running on port 3000"

**If any of these are wrong, that's your issue!**

---

## 🆘 Still Not Working?

**Check the full guide:** `FIX_503_ERROR.md`

**Or tell me:**
1. What does the app status show in Coolify? (Running/Stopped/Starting)
2. What do the logs say?
3. How long ago did you add the domain?

---

**Most likely fix: Just restart the app in Coolify! 🚀**

