# ⚠️ You're Using the Wrong Variables!

## The Problem

You're seeing:
- `SERVICE_SUPABASEANON_KEY` ❌
- `SERVICE_URL_SUPABASE_KONG` ❌

But your app needs:
- `VITE_SUPABASE_ANON_KEY` ✅
- `VITE_SUPABASE_URL` ✅

## Why This Matters

- **`VITE_` prefix** is required for Vite to expose variables to your React app
- **`SERVICE_` variables** are for Coolify services, not your app
- **App-specific variables** are different from Shared Variables

---

## ✅ How to Fix

### Step 1: Go to App Environment Variables (Not Shared Variables)

1. **In Coolify, click on your APPLICATION name**
   - Not "Shared Variables"
   - Not "Projects" → "Shared Variables"
   - Your actual app: "weedhead-beats-store" or similar

2. **Find "Environment Variables" section**
   - Should be in your app's settings
   - Not in the global "Shared Variables"

### Step 2: Add VITE_SUPABASE_URL

1. **Click "Add Variable"**
2. **Name:** `VITE_SUPABASE_URL` (exact, case-sensitive)
3. **Value:** Your EXTERNAL Supabase URL
   - ❌ NOT: `SERVICE_URL_SUPABASE_KONG` (internal)
   - ✅ YES: `https://supabase.brandingnovations.com` (external)
   - Must start with `https://`
   - No trailing slash
4. **Checkboxes:**
   - ✅ Available at Buildtime
   - ✅ Available at Runtime
5. **Save**

### Step 3: Add VITE_SUPABASE_ANON_KEY

1. **Click "Add Variable"**
2. **Name:** `VITE_SUPABASE_ANON_KEY` (exact, case-sensitive)
3. **Value:** Copy from `SERVICE_SUPABASEANON_KEY`
   - The value starting with `eyJ...`
   - Same value, different variable name
4. **Checkboxes:**
   - ✅ Available at Buildtime
   - ✅ Available at Runtime
5. **Save**

### Step 4: Get External Supabase URL

**You need the EXTERNAL URL, not the internal one:**

- ❌ `SERVICE_URL_SUPABASE_KONG` = Internal Docker URL (won't work)
- ✅ External URL = What you use in browser to access Supabase

**To find it:**
- What URL do you use to open Supabase Dashboard?
- That's your external URL
- Example: `https://supabase.brandingnovations.com`

### Step 5: Redeploy

1. **After adding variables, redeploy your app**
2. **Wait for deployment to complete**
3. **Check browser console** - should see "Set" not "MISSING"

---

## 📋 Checklist

- [ ] Went to App Environment Variables (not Shared Variables)
- [ ] Added `VITE_SUPABASE_URL` (not `SERVICE_URL_SUPABASE_KONG`)
- [ ] Added `VITE_SUPABASE_ANON_KEY` (not `SERVICE_SUPABASEANON_KEY`)
- [ ] Used EXTERNAL URL (https://...) not internal
- [ ] Both checkboxes checked for each variable
- [ ] Redeployed after adding

---

## 🎯 Key Differences

| Wrong (Shared Variables) | Right (App Variables) |
|-------------------------|----------------------|
| `SERVICE_SUPABASEANON_KEY` | `VITE_SUPABASE_ANON_KEY` |
| `SERVICE_URL_SUPABASE_KONG` | `VITE_SUPABASE_URL` |
| Internal Docker URL | External HTTPS URL |
| Shared across services | App-specific |

---

**Go to your APP's Environment Variables and add the VITE_ variables!** 🚀



