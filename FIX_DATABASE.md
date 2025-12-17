# Fix Database Connection - Step by Step

## 🔧 Step-by-Step Fix

### Step 1: Verify Environment Variables in Coolify

1. **Go to Coolify Dashboard**
2. **Select your application**
3. **Go to Environment Variables section**
4. **Check if these exist:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**If missing or incorrect:**
- Add/update them (see below for how to get values)
- Make sure both checkboxes are checked:
  - ✅ Available at Buildtime
  - ✅ Available at Runtime
- **Redeploy** after adding/changing

---

### Step 2: Get Your Supabase Credentials

1. **Go to Supabase Dashboard**
   - Your self-hosted instance URL
   - Or https://app.supabase.com if using cloud

2. **Select your project**

3. **Go to Settings → API**

4. **Copy these values:**
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY`

**Important:**
- Use the **anon/public** key (NOT service_role)
- Copy the FULL key (it's long, starts with `eyJ...`)
- No trailing slash on the URL

---

### Step 3: Add to Coolify

1. **In Coolify → Your App → Environment Variables**

2. **Add/Update `VITE_SUPABASE_URL`:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co` (your actual URL)
   - Available at Buildtime: ✅
   - Available at Runtime: ✅

3. **Add/Update `VITE_SUPABASE_ANON_KEY`:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your actual key)
   - Available at Buildtime: ✅
   - Available at Runtime: ✅

4. **Save**

5. **Redeploy** your application

---

### Step 4: Verify SQL Script Was Run

1. **Go to Supabase Dashboard → SQL Editor**

2. **Run this query to check if tables exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

3. **You should see:**
   - `profiles`
   - `tracks`
   - `posts`
   - `merch_types`
   - `cart_items`
   - `orders`
   - etc.

4. **If tables don't exist:**
   - Run `supabase_setup.sql` in SQL Editor
   - Wait for "Success. No rows returned"

---

### Step 5: Check CORS (Self-Hosted)

If using self-hosted Supabase, configure CORS:

**Option A: Docker Compose**
```yaml
# In your docker-compose.yml or .env
CORS_EXTRA_ORIGINS=https://weedheadbeats.com,https://www.weedheadbeats.com
```

**Option B: Kong Config**
- Edit Kong configuration
- Add your domain to CORS origins

**Option C: Nginx**
- Add CORS headers in Nginx config

(See `SELF_HOSTED_SUPABASE_CORS.md` for details)

---

### Step 6: Test Connection

1. **Redeploy in Coolify** (after adding variables)

2. **Visit your site**

3. **Open browser console (F12)**

4. **Try to sign in**

5. **Check for errors:**
   - If no errors → ✅ Working!
   - If errors → See specific fixes below

---

## 🚨 Specific Error Fixes

### Error: "Supabase credentials missing"

**Fix:**
1. Add environment variables in Coolify
2. Make sure they start with `VITE_`
3. Redeploy

---

### Error: "Failed to fetch" or "Network error"

**Possible causes:**
1. **Wrong Supabase URL**
   - Check URL is correct (no trailing slash)
   - Test URL in browser: `https://your-url.supabase.co/rest/v1/`

2. **CORS not configured**
   - Add your domain to CORS origins
   - See `SELF_HOSTED_SUPABASE_CORS.md`

3. **Supabase project paused**
   - Check Supabase dashboard
   - Resume if paused

---

### Error: "Invalid API key"

**Fix:**
1. Get fresh key from Supabase Dashboard → Settings → API
2. Use **anon public** key (not service_role)
3. Copy the FULL key
4. Update in Coolify
5. Redeploy

---

### Error: "Relation does not exist"

**Fix:**
1. Run `supabase_setup.sql` in Supabase SQL Editor
2. Wait for success message
3. Verify tables exist (see Step 4 above)

---

### Error: "Permission denied" or RLS error

**Fix:**
1. RLS policies should be in `supabase_setup.sql`
2. Verify policies exist:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
3. If missing, re-run the SQL script

---

## ✅ Quick Fix Checklist

- [ ] Environment variables added in Coolify
- [ ] Variables have `VITE_` prefix
- [ ] Both checkboxes checked (Buildtime & Runtime)
- [ ] Supabase URL is correct (no trailing slash)
- [ ] Supabase anon key is correct (full key)
- [ ] SQL script (`supabase_setup.sql`) was run
- [ ] Tables exist in database
- [ ] CORS configured (if self-hosted)
- [ ] Application redeployed after changes
- [ ] Tested sign in

---

## 🔍 Still Not Working?

**Get the exact error:**
1. Open browser console (F12)
2. Try to sign in
3. Copy the exact error message
4. Check Network tab for failed requests
5. Share the error and I'll help fix it!

---

## 💡 Quick Test Query

**Test if Supabase is reachable:**

In browser console, run:
```javascript
fetch('https://your-supabase-url.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-anon-key'
  }
})
.then(r => console.log('✅ Connected!', r))
.catch(e => console.error('❌ Error:', e));
```

Replace with your actual URL and key. This will tell you if the connection works.

---

**Follow these steps in order, and your database should work!** 🚀

