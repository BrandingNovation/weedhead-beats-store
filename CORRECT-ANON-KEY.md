# ✅ CORRECT SUPABASE ANON KEY

## Found on Server

The correct anon key from your Supabase service is:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTU4NDYwMCwiZXhwIjo0OTIxMjU4MjAwLCJyb2xlIjoiYW5vbiJ9.cUOOuFlC8qsXFCCMfFAIMQmGXI-CFj28QHLTK4EACnI
```

## Update in Coolify NOW

1. Go to Coolify Dashboard: `http://65.21.109.247:8000`
2. Find your **WeedheadBeats** application
3. Go to **Environment Variables**
4. Find `VITE_SUPABASE_ANON_KEY`
5. **Update it** with the key above
6. Make sure **"Available at Buildtime & Runtime"** is checked
7. **Save**
8. **Redeploy** your application

## Supabase Studio Login

**URL:** https://supabase.brandingnovations.com

**Email:** `admin@supabase.com`  
**Password:** `FxoQgmV9sokMg45EgKW9gPxskkTBVhYF`

---

## What Was Wrong

The app was using an **old/expired anon key**. The correct key is in the Supabase service `.env` file on the server. I've found it for you above.

Once you update it in Coolify and redeploy, everything should work again.
