# Add SITE_URL for Email Verification

## 🎯 Your Temporary Domain

**Domain:** `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io`

---

## ✅ Exact Variables to Add

Go to **Coolify → Your Supabase Service → Environment Variables** and add:

### Variable 1: SITE_URL
- **Name:** `SITE_URL`
- **Value:** `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io`
  - ⚠️ **NO trailing slash** (removed the `/` at the end)
- ✅ Available at Buildtime
- ✅ Available at Runtime

### Variable 2: ADDITIONAL_REDIRECT_URLS (Optional but Recommended)
- **Name:** `ADDITIONAL_REDIRECT_URLS`
- **Value:** `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io/**`
- ✅ Available at Buildtime
- ✅ Available at Runtime

---

## 📋 Step-by-Step

1. **Go to Coolify Dashboard**
2. **Find your Supabase Service** (not your app, the Supabase service itself)
3. **Click on it**
4. **Go to Environment Variables**
5. **Click "Add Variable"**
6. **Add SITE_URL:**
   - Name: `SITE_URL`
   - Value: `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io`
   - Check both boxes
7. **Add ADDITIONAL_REDIRECT_URLS:**
   - Name: `ADDITIONAL_REDIRECT_URLS`
   - Value: `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io/**`
   - Check both boxes
8. **Save**
9. **Restart your Supabase service**

---

## ✅ After Adding

1. **Restart Supabase service** in Coolify
2. **Test by signing up** a new user
3. **Check verification email** - link should now work!
4. **Click the link** - should redirect to your app

---

## 🔄 When You Connect Your Real Domain

Once you connect `weedheadbeats.com`:

1. **Update SITE_URL** to: `https://weedheadbeats.com`
2. **Update ADDITIONAL_REDIRECT_URLS** to: `https://weedheadbeats.com/**,https://www.weedheadbeats.com/**`
3. **Restart Supabase service**

---

## 🎯 Summary

**Add these 2 variables to your Supabase service:**

```
SITE_URL=https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io
ADDITIONAL_REDIRECT_URLS=https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io/**
```

**After adding and restarting, verification emails will work!** ✅

