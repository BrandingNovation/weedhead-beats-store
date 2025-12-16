# Troubleshooting "Sign In Failed to Load" Error

## 🔍 Common Causes & Fixes

### 1. Environment Variables Not Set Correctly

**Check in Coolify:**
- Go to your application → Environment Variables
- Verify these exist:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

**Fix:**
- Make sure both variables are set
- Both should have "Available at Buildtime" ✅ and "Available at Runtime" ✅ checked
- Redeploy after adding/changing variables

---

### 2. Supabase URL/Key Incorrect

**Check:**
- Open browser console (F12)
- Look for errors like:
  - "Invalid API key"
  - "Failed to fetch"
  - "Network error"

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Verify:
   - **Project URL** matches `VITE_SUPABASE_URL` exactly
   - **anon public key** matches `VITE_SUPABASE_ANON_KEY` exactly
3. Copy fresh values and update in Coolify
4. Redeploy

---

### 3. CORS Issues

**Check:**
- Browser console shows CORS errors
- Network tab shows blocked requests

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Check "Allowed CORS Origins"
3. Add your domain:
   - `https://weedheadbeats.com`
   - `https://www.weedheadbeats.com`
   - Your Coolify preview URL (if testing)

---

### 4. Supabase Project Not Active

**Check:**
- Go to Supabase Dashboard
- Verify project is active (not paused)

**Fix:**
- If paused, resume the project
- Check billing/subscription status

---

### 5. Database Not Set Up

**Check:**
- Error mentions "relation does not exist"
- Tables missing

**Fix:**
1. Go to Supabase SQL Editor
2. Run `supabase_setup.sql` (if not already done)
3. Verify tables exist: `profiles`, `tracks`, `posts`, etc.

---

### 6. RLS Policies Blocking

**Check:**
- Can browse site but can't sign in
- Error about permissions

**Fix:**
- RLS policies should already be set up in `supabase_setup.sql`
- Verify policies exist:
  ```sql
  SELECT * FROM pg_policies WHERE tablename = 'profiles';
  ```

---

## 🔧 Quick Diagnostic Steps

### Step 1: Check Browser Console

1. Open your site: `https://weedheadbeats.com`
2. Press F12 (open DevTools)
3. Go to Console tab
4. Look for errors:
   - Red errors = Problems
   - Yellow warnings = Less critical

### Step 2: Check Network Tab

1. In DevTools, go to Network tab
2. Try to sign in
3. Look for failed requests:
   - Red requests = Failed
   - Check the error message

### Step 3: Verify Environment Variables

**In Coolify:**
1. Go to your application
2. Check Environment Variables section
3. Verify:
   - `VITE_SUPABASE_URL` exists and has correct value
   - `VITE_SUPABASE_ANON_KEY` exists and has correct value

**Test in browser console:**
```javascript
// This won't work directly, but check if variables are accessible
console.log('Check environment variables in Coolify');
```

---

## ✅ Step-by-Step Fix

### 1. Verify Supabase Connection

**Get your Supabase credentials:**
1. Go to: Supabase Dashboard
2. Select your project
3. Settings → API
4. Copy:
   - Project URL
   - anon public key

### 2. Update Coolify Environment Variables

1. Go to Coolify → Your Application
2. Environment Variables section
3. Update or add:
   - `VITE_SUPABASE_URL` = Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = Your anon public key
4. Make sure both checkboxes are checked:
   - ✅ Available at Buildtime
   - ✅ Available at Runtime

### 3. Redeploy

1. In Coolify, click "Redeploy" or "Deploy"
2. Wait for build to complete
3. Test sign in again

### 4. Check CORS Settings

1. Supabase Dashboard → Settings → API
2. Under "CORS Origins", add:
   - `https://weedheadbeats.com`
   - `https://www.weedheadbeats.com`
3. Save

### 5. Test Again

1. Visit your site
2. Try to sign in
3. Check browser console for errors
4. If still failing, check the specific error message

---

## 🚨 Specific Error Messages

### "Failed to fetch"
- **Cause**: Can't reach Supabase
- **Fix**: Check Supabase URL, network connectivity, CORS settings

### "Invalid API key"
- **Cause**: Wrong anon key
- **Fix**: Copy fresh key from Supabase Dashboard → Settings → API

### "Email not confirmed"
- **Cause**: Email confirmation required
- **Fix**: Check Supabase Auth settings, disable email confirmation if needed

### "User not found"
- **Cause**: User doesn't exist
- **Fix**: Sign up first, or check if user was created

### "Network error"
- **Cause**: Connection issue
- **Fix**: Check Supabase project is active, URL is correct

---

## 🔍 Debug Mode

**Enable detailed logging:**

In browser console, run:
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

This will show more detailed error messages.

---

## ✅ Quick Checklist

- [ ] Environment variables set in Coolify
- [ ] Both variables have VITE_ prefix
- [ ] Both checkboxes checked (Buildtime & Runtime)
- [ ] Supabase URL is correct (no trailing slash)
- [ ] Supabase anon key is correct (full key)
- [ ] CORS origins include your domain
- [ ] Supabase project is active
- [ ] Database tables exist (ran SQL script)
- [ ] Redeployed after changes
- [ ] Checked browser console for specific errors

---

## 🆘 Still Not Working?

1. **Check Coolify logs:**
   - Go to your application in Coolify
   - Click "Logs" tab
   - Look for build/runtime errors

2. **Check Supabase logs:**
   - Supabase Dashboard → Logs
   - Look for authentication errors

3. **Test Supabase connection:**
   - Try accessing Supabase API directly
   - Verify project is accessible

4. **Use Demo Mode:**
   - Click "Enter Demo Mode" in the sign-in form
   - This bypasses Supabase for testing

---

I've also fixed the `supabaseClient.ts` file to properly read environment variables. The issue was it was trying to use `process.env` instead of `import.meta.env` (which Vite uses).

**Next step:** Redeploy your app in Coolify after the fix is pushed to GitHub!

