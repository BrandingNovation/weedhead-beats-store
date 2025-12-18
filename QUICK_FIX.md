# ⚡ Quick Fix - Missing Credentials

## 🚀 Fastest Way to Fix

### Option 1: Use the Setup Script (Easiest)

```bash
./setup-env.sh
```

This will prompt you for your values and create the `.env` file automatically.

---

### Option 2: Manual Fix (2 Minutes)

1. **Get values from Coolify:**
   - Go to: Coolify → Your App → Environment Variables
   - Copy `VITE_SUPABASE_URL` value
   - Copy `VITE_SUPABASE_ANON_KEY` value

2. **Edit `.env` file:**
   ```bash
   # Open in your editor
   code .env
   # or
   nano .env
   ```

3. **Paste your values:**
   ```env
   VITE_SUPABASE_URL=https://supabase.brandingnovations.com
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Restart dev server:**
   - Stop: `Ctrl+C`
   - Start: `npm run dev`
   - Refresh browser: `Cmd+Shift+R`

---

## ✅ That's It!

After filling in `.env` and restarting, the errors will be gone!

ENVEOF


