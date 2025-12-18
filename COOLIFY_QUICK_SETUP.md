# Coolify Quick Setup - Build Pack Configuration

## Current Issue: Build Pack Selection

In the Coolify form you're seeing, the **Build Pack** field is set to "Nixpacks". You need to change this.

## Solution: Select the Right Build Pack

### Option 1: Use "Node.js" Build Pack (Recommended)

1. **Click the Build Pack dropdown** (currently shows "Nixpacks")
2. **Select "Node.js"** from the dropdown
3. After selecting, you'll see additional fields appear:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l 3000`
   - **Output Directory**: `dist`

### Option 2: Use "Nixpacks" (Auto-detect)

If "Node.js" isn't available, you can keep "Nixpacks" but:
- It should auto-detect Vite from your `package.json`
- Make sure the **Port** is set to `3000` or `5173`
- Check **"Is it a static site?"** checkbox ✅ (since Vite builds static files)

## Complete Configuration

After clicking "Continue", you'll configure:

### Build Settings:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s dist -l 3000` (for static site)
- **Output Directory**: `dist`
- **Port**: `3000`

### Environment Variables (add these):
```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
VITE_API_KEY=your-gemini-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
VITE_PAYPAL_CLIENT_ID=your-paypal-id
```

## If "Node.js" or "Vite" isn't in the dropdown:

1. **Keep "Nixpacks"** selected
2. **Check "Is it a static site?"** ✅
3. After deployment, Coolify should auto-detect Vite from your `package.json`
4. If it doesn't work, you can manually configure in the advanced settings

## Next Steps:

1. Change Build Pack to "Node.js" (or keep Nixpacks if not available)
2. Click "Continue"
3. Configure build commands
4. Add environment variables
5. Deploy!


