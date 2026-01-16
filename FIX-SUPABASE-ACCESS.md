# 🔧 Fix Supabase Access - Step by Step

## Current Issue
You can't login to Supabase Studio and the connection isn't working.

## Quick Fix Steps

### Step 1: Verify Supabase is Running

```bash
ssh root@65.21.109.247
docker ps | grep supabase
```

You should see containers running. If not, restart the Supabase service in Coolify.

### Step 2: Access Supabase Studio

**URL:** https://supabase.brandingnovations.com

**Login Credentials:**
- **Email:** `admin@supabase.com` (or try `info@brandingnovations.com`)
- **Password:** `FxoQgmV9sokMg45EgKW9gPxskkTBVhYF`

### Step 3: Get the Correct Anon Key

Once you're in Supabase Studio:
1. Go to **Settings** → **API**
2. Copy the **anon/public** key
3. It should start with `eyJ...`

### Step 4: Update in Coolify

1. Go to Coolify Dashboard: `http://65.21.109.247:8000`
2. Find your **WeedheadBeats** application
3. Go to **Environment Variables**
4. Update `VITE_SUPABASE_ANON_KEY` with the key from Step 3
5. Make sure **"Available at Buildtime & Runtime"** is checked
6. **Save**
7. **Redeploy** your application

### Step 5: Verify It Works

After redeploying, check browser console:
- ✅ Should see successful API calls
- ❌ Should NOT see 401 errors

---

## If You Still Can't Login to Supabase Studio

### Option 1: Reset Admin Password

```bash
ssh root@65.21.109.247

# Edit Supabase service .env
cd /data/coolify/services/wk04oowwwk0c48cg8ssw84og
nano .env

# Change SERVICE_PASSWORD_ADMIN to a new password
# Save and exit

# Restart Supabase service in Coolify UI
```

### Option 2: Get Anon Key Directly from Server

You don't need to login to Studio to get the anon key:

```bash
ssh root@65.21.109.247
cat /data/coolify/services/wk04oowwwk0c48cg8ssw84og/.env | grep ANON_KEY
```

Copy that key and use it in Coolify.

---

## What I Changed (and Restored)

I simplified the `supabaseClient.ts` file, but I've now **restored it from git** to the original working version. The code is back to how it was.

The issue is the **anon key is invalid**, not the code. Once you update the key in Coolify, everything should work again.

---

## Current Status

- ✅ Code restored to original working version
- ❌ Supabase anon key needs updating in Coolify
- ❌ Can't login to Supabase Studio (password issue)

**Next Step:** Get the anon key from the server (you don't need Studio for this) and update it in Coolify.
