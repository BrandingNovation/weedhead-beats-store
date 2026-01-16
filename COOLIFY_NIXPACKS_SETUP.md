# Coolify Setup with Nixpacks (No Node.js Option Available)

## ✅ Solution: Use Nixpacks with Static Site Configuration

Since you don't have "Node.js" or "Vite" in the Build Pack dropdown, **keep "Nixpacks"** selected. Here's how to configure it:

## Step-by-Step Configuration

### 1. In the Current Form:

- **Repository**: `weedhead-beats-store` ✅ (already filled)
- **Branch**: `main` ✅ (already filled)
- **Base Directory**: `/` ✅ (already filled)
- **Port**: `3000` ✅ (already filled)
- **Is it a static site?**: ✅ **CHECK THIS BOX** (very important!)
- **Build Pack**: `Nixpacks` ✅ (keep this)

### 2. Click "Continue"

After clicking continue, you'll see more configuration options.

### 3. Build Configuration (if shown):

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s dist -l 3000`
- **Output Directory**: `dist`

### 4. Environment Variables:

Add these in the Environment Variables section:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_KEY=your-gemini-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
VITE_PAYPAL_CLIENT_ID=your-paypal-id
```

## How Nixpacks Works

Nixpacks will:
1. **Auto-detect** Node.js from your `package.json`
2. **Auto-detect** Vite from your dependencies
3. **Run** `npm install` automatically
4. **Run** `npm run build` (from your package.json)
5. **Serve** the `dist` folder as a static site

## Important: Static Site Checkbox

✅ **Make sure "Is it a static site?" is CHECKED**

This tells Coolify/Nixpacks that:
- Your app builds to static files (HTML, CSS, JS)
- It doesn't need a Node.js server running
- It should serve the `dist` folder

## If Build Fails

If the build fails, you can create a `nixpacks.toml` file in your repo root (I've created one for you). This gives Nixpacks explicit instructions:

```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "npm-9_x"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npx serve -s dist -l 3000"
```

## Next Steps:

1. ✅ Check "Is it a static site?"
2. ✅ Keep "Nixpacks" as Build Pack
3. ✅ Click "Continue"
4. ✅ Add environment variables
5. ✅ Deploy!

The `nixpacks.toml` file I created will help Nixpacks understand your Vite setup better.



