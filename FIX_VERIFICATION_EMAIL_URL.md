# Fix Verification Email URL - DNS_PROBE_FINISHED_NXDOMAIN

## 🔍 The Problem

When you click the verification link in the email, you get:
- `DNS_PROBE_FINISHED_NXDOMAIN`
- "Site can't be reached"
- The link points to `supabase-kong` (internal URL) instead of your public domain

## ✅ The Fix

Supabase needs to know your **public/external URL** for email verification links.

---

## 🔧 Step-by-Step Fix

### Option 1: Supabase Cloud Dashboard

1. **Go to Supabase Dashboard**
2. **Settings → Auth → URL Configuration**
3. **Set "Site URL":**
   - Value: `https://weedheadbeats.com` (your actual domain)
   - Or: `https://your-coolify-preview-url.com`
4. **Add "Redirect URLs":**
   - `https://weedheadbeats.com/**`
   - `https://www.weedheadbeats.com/**`
   - Your Coolify preview URL if testing
5. **Save**

### Option 2: Self-Hosted Supabase (Environment Variables)

If you're using self-hosted Supabase, add these environment variables:

```bash
SITE_URL=https://weedheadbeats.com
ADDITIONAL_REDIRECT_URLS=https://www.weedheadbeats.com,https://your-preview-url.com
```

**In Coolify:**
1. **Go to Coolify → Your Supabase Service → Environment Variables**
2. **Add:**
   - **Name:** `SITE_URL`
   - **Value:** `https://weedheadbeats.com` (your actual domain)
   - ✅ Available at Buildtime
   - ✅ Available at Runtime
3. **Add:**
   - **Name:** `ADDITIONAL_REDIRECT_URLS`
   - **Value:** `https://www.weedheadbeats.com,https://your-preview-url.com`
   - ✅ Available at Buildtime
   - ✅ Available at Runtime
4. **Restart Supabase service**

### Option 3: Via Supabase API/Config

If you have access to Supabase config files:

```yaml
# In docker-compose.yml or config
SITE_URL: https://weedheadbeats.com
ADDITIONAL_REDIRECT_URLS: https://www.weedheadbeats.com
```

---

## 🎯 What URL to Use

**Use your PUBLIC domain:**
- ✅ `https://weedheadbeats.com`
- ✅ `https://www.weedheadbeats.com`
- ✅ Your Coolify preview URL (if testing)

**NOT internal URLs:**
- ❌ `http://supabase-kong`
- ❌ `http://localhost:54321`
- ❌ Internal Docker service names

---

## ✅ After Configuring

1. **Save the configuration**
2. **Restart Supabase service** (if using environment variables)
3. **Test again:**
   - Sign up a new user
   - Check email
   - Click verification link
   - Should redirect to your site, not `supabase-kong`

---

## 🔍 Verify It's Fixed

After configuring:

1. **Sign up a new user**
2. **Check the verification email**
3. **Look at the link** - it should start with:
   - ✅ `https://weedheadbeats.com/...`
   - ❌ NOT `http://supabase-kong/...`

---

## 📋 Quick Checklist

- [ ] Set `SITE_URL` to your public domain
- [ ] Added redirect URLs for your domain
- [ ] Restarted Supabase service (if needed)
- [ ] Tested verification email link
- [ ] Link now points to your site, not supabase-kong

---

## 🚨 Common Issues

### Still seeing supabase-kong in link?
- **Fix:** Make sure `SITE_URL` is set correctly
- **Fix:** Restart Supabase service after changing

### Link works but shows error?
- **Fix:** Make sure redirect URLs include your domain
- **Fix:** Check CORS settings in Supabase

### Can't find where to set it?
- **Fix:** Look in Supabase Dashboard → Settings → Auth
- **Fix:** Or add as environment variable in Coolify

---

**After setting the correct SITE_URL, verification emails will work!** ✅

