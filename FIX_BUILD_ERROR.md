# 🔧 Fixed: Build Error - npm-9_x undefined

## ❌ The Problem

The build was failing with:
```
error: undefined variable 'npm-9_x'
```

This happened because `npm-9_x` is not available in the nixpkgs version being used by Nixpacks.

## ✅ The Fix

I've updated `nixpacks.toml` to:
1. **Remove `npm-9_x`** - npm comes bundled with nodejs-18_x, so we don't need to specify it separately
2. **Use `npx serve`** instead of installing serve globally - more reliable
3. **Simplified the configuration** - let npm come with nodejs

## 📝 Updated nixpacks.toml

```toml
# Nixpacks configuration for Vite static site
[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve -s dist -l ${PORT:-3000}"
```

## 🚀 Next Steps

1. **Commit and push the fix:**
   ```bash
   git add nixpacks.toml
   git commit -m "Fix nixpacks build: remove npm-9_x, use npx serve"
   git push
   ```

2. **Redeploy in Coolify:**
   - The build should now work
   - Nixpacks will use nodejs-18_x which includes npm
   - The app will be served using `npx serve`

## ✅ What Changed

- ❌ **Before**: `nixPkgs = ["nodejs-18_x", "npm-9_x"]` (npm-9_x doesn't exist)
- ✅ **After**: `nixPkgs = ["nodejs-18_x"]` (npm comes with nodejs)

- ❌ **Before**: `npm install -g serve` (global install can fail)
- ✅ **After**: `npx serve` (uses npx, no install needed)

## 🎯 Why This Works

- Node.js 18.x comes with npm bundled (usually npm 9.x or 10.x)
- We don't need to specify npm separately
- Using `npx serve` is more reliable than global installs
- Nixpacks will auto-detect and use the bundled npm

---

**The build should now work! 🎉**

