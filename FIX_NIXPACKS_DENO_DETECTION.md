# 🔧 Fix: Nixpacks Detecting as Deno Instead of Node.js

## ❌ The Problem

Nixpacks is incorrectly detecting your project as **"deno"** instead of **Node.js**, which causes:
- Wrong build configuration
- `npm-9_x` error (Deno detection uses different packages)
- Build failures

**Why this happens:**
- Nixpacks sees `supabase/functions/send-email/index.ts` with Deno imports
- It thinks the whole project is Deno
- But your main app is Node.js/Vite!

## ✅ The Fix

I've updated `nixpacks.toml` to:
1. **Force Node.js provider** - Explicitly tell Nixpacks this is Node.js
2. **Removed npm-9_x** - npm comes with nodejs-18_x
3. **Created `.nixpacksignore`** - Ignore Supabase functions folder from detection

## 📝 Changes Made

### 1. Updated `nixpacks.toml`:
```toml
# Force Node.js detection
[providers]
node = true

[phases.setup]
nixPkgs = ["nodejs-18_x"]  # npm comes with nodejs

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve -s dist -l ${PORT:-3000}"
```

### 2. Created `.nixpacksignore`:
```
supabase/functions/
```

## 🚀 Next Steps

1. **Commit and push these changes:**
   ```bash
   git add nixpacks.toml .nixpacksignore
   git commit -m "Fix: Force Node.js detection in Nixpacks, ignore Deno functions"
   git push
   ```

2. **Redeploy in Coolify:**
   - The build should now detect as Node.js
   - No more `npm-9_x` error
   - Build should succeed

## ✅ What This Does

- **`[providers] node = true`** - Forces Node.js provider
- **`.nixpacksignore`** - Tells Nixpacks to ignore the Deno functions folder
- **Removed `npm-9_x`** - npm comes bundled with nodejs-18_x

## 🔍 Verify It Works

After pushing, check the build logs:
- Should see: `"Found application type: node"` (not "deno")
- Should see: `"setup │ nodejs-18_x, curl, wget"` (no npm-9_x)
- Build should complete successfully

---

**Push these changes and redeploy! The build should work now! 🎉**

