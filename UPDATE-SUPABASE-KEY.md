# 🔑 Update Supabase Anon Key in Coolify

## Current Issue
Your Supabase anon key is set but **invalid or expired**. This is causing all 401 authentication errors.

## Current Key (from server)
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTU3OTM4MCwiZXhwIjo0OTIxMjUyOTgwLCJyb2xlIjoiYW5vbiJ9.hlgpTY-xPlWSGivx9xrcmJeiNDM__Ja55WzVcF0s-bs
```

## Steps to Fix

### Step 1: Get Fresh Key from Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Select your project (should be the one for `supabase.brandingnovations.com`)
3. Click **Settings** (gear icon) → **API**
4. Find the **"anon"** or **"public"** key section
5. Click **"Reveal"** or **"Copy"** to get the full key
6. **Copy the entire key** (it's a long JWT token starting with `eyJ...`)

### Step 2: Update in Coolify

1. Go to your **Coolify Dashboard**
2. Find your **WeedheadBeats** application
3. Click **Environment Variables**
4. Find `VITE_SUPABASE_ANON_KEY`
5. Click **Edit** or **Update**
6. **Paste the new key** from Supabase Dashboard
7. ✅ Make sure **"Available at Buildtime"** is checked
8. ✅ Make sure **"Available at Runtime"** is checked
9. Click **Save**

### Step 3: Redeploy

1. In Coolify, click **Redeploy** or **Restart** your application
2. Wait for deployment to complete
3. Refresh your browser

### Step 4: Verify

After redeploying, check the browser console:
- ✅ Should see: `✅ Supabase connection successful!`
- ✅ Should see: `✅ Loaded X tracks from Supabase`
- ❌ Should NOT see: `Invalid authentication credentials`
- ❌ Should NOT see: `401 Unauthorized`

---

## Important Notes

⚠️ **DO NOT use the `service_role` key** - that's secret and should never be in frontend code!

✅ **Use the `anon` or `public` key** - this is safe for frontend use

✅ **The key must match your Supabase project** - make sure you're copying from the correct project

---

## Quick Check

After updating, you can verify the key is working by checking the browser console. If you still see 401 errors, the key might be:
- From the wrong Supabase project
- Expired (though they usually don't expire)
- Not properly saved in Coolify

---

## Current Configuration

- **Supabase URL**: `https://supabase.brandingnovations.com` ✅ (This looks correct)
- **Anon Key**: Set but invalid ❌ (Needs to be updated)

Once you update the key in Coolify and redeploy, everything should work! 🚀
