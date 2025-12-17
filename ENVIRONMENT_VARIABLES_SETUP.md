# Environment Variables & Backend Connection Guide

## 🔐 Where to Add Environment Variables in Coolify

### Step 1: Find Environment Variables Section

1. In your Coolify application configuration
2. Look for a section called:
   - **"Environment Variables"**
   - **"Env Variables"**
   - **"Environment"**
   - Or a tab labeled **"Environment"**

3. It's usually:
   - In the left sidebar (scroll down)
   - Or in a separate tab at the top
   - Or in "Advanced Settings"

### Step 2: Add Each Variable

Click **"Add Variable"** or **"+"** button and add these one by one:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_KEY=your-gemini-api-key-here
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
```

**Important:**
- ✅ Use **VITE_** prefix (required for Vite to expose them)
- ✅ Use **production** keys (not test keys)
- ✅ No spaces around the `=` sign
- ✅ No quotes needed

---

## 🔗 How to Connect Frontend to Backend (Supabase)

### Your App is Already Configured!

Your frontend is **already set up** to connect to Supabase. Here's how it works:

### 1. Frontend Configuration (Already Done)

Your app reads Supabase connection from environment variables:

**File: `lib/supabaseClient.ts`**
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

### 2. Get Your Supabase Credentials

1. **Go to Supabase Dashboard**: https://app.supabase.com (or your self-hosted instance)
2. **Select your project**
3. **Go to Settings** → **API**
4. **Copy these values:**
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon/public key** → This is your `VITE_SUPABASE_ANON_KEY`

### 3. Add to Coolify Environment Variables

In Coolify, add:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. How It Connects

When your app runs:
1. ✅ Vite reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. ✅ Your `supabaseClient.ts` creates a Supabase client
3. ✅ All API calls go to your Supabase backend automatically
4. ✅ Database, Auth, and Storage all work!

---

## 📋 Complete Environment Variables List

### Required (for basic functionality):

```env
# Supabase - Backend Connection
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional (for full features):

```env
# Google Gemini AI (for AI features)
VITE_API_KEY=your-gemini-api-key

# Stripe Payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# PayPal Payments
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
```

---

## 🔍 Where to Find Each Key

### Supabase Keys:
1. Go to: Supabase Dashboard → Your Project → Settings → API
2. **Project URL** = `VITE_SUPABASE_URL`
3. **anon public** key = `VITE_SUPABASE_ANON_KEY`

### Gemini API Key:
1. Go to: https://makersuite.google.com/app/apikey
2. Create or copy your API key
3. Add as `VITE_API_KEY`

### Stripe Key:
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy **Publishable key** (use live key for production)
3. Add as `VITE_STRIPE_PUBLISHABLE_KEY`

### PayPal Client ID:
1. Go to: https://developer.paypal.com/dashboard
2. Copy your **Client ID**
3. Add as `VITE_PAYPAL_CLIENT_ID`

---

## ✅ Testing the Connection

After adding variables and deploying:

1. **Visit your site**: `https://weedheadbeats.com`
2. **Open browser console** (F12)
3. **Check for errors**:
   - ✅ No Supabase connection errors = Connected!
   - ❌ "Invalid API key" = Check your keys
   - ❌ "Failed to fetch" = Check Supabase URL

4. **Test features**:
   - Try to sign up/login
   - Browse the store
   - Add items to cart
   - If these work = Backend connected! ✅

---

## 🚨 Common Issues

### "Cannot connect to Supabase"
- ✅ Check `VITE_SUPABASE_URL` is correct (no trailing slash)
- ✅ Check `VITE_SUPABASE_ANON_KEY` is the full key
- ✅ Verify Supabase project is active
- ✅ Check Supabase dashboard for any errors

### "Environment variable not found"
- ✅ Make sure variables start with `VITE_`
- ✅ Restart/redeploy after adding variables
- ✅ Check variable names match exactly (case-sensitive)

### "API key invalid"
- ✅ Use the **anon/public** key (not service_role key)
- ✅ Make sure you copied the full key
- ✅ Check for extra spaces or characters

---

## 📝 Quick Checklist

- [ ] Found Environment Variables section in Coolify
- [ ] Added `VITE_SUPABASE_URL` (from Supabase Settings → API)
- [ ] Added `VITE_SUPABASE_ANON_KEY` (from Supabase Settings → API)
- [ ] Added `VITE_API_KEY` (optional, for AI features)
- [ ] Added `VITE_STRIPE_PUBLISHABLE_KEY` (optional, for payments)
- [ ] Added `VITE_PAYPAL_CLIENT_ID` (optional, for payments)
- [ ] Saved/Deployed the application
- [ ] Tested the connection

---

## 🎯 Summary

**Frontend → Backend Connection:**
- Your frontend code is already configured ✅
- Just add the environment variables in Coolify
- The app will automatically connect to Supabase
- No code changes needed!

**The connection happens automatically when:**
1. Environment variables are set in Coolify
2. App is deployed
3. Vite exposes variables to your React app
4. `supabaseClient.ts` uses them to connect

You're all set! Just add the variables and deploy! 🚀

