# Coolify Deployment Guide - Step by Step

## 🚀 Quick Start for Coolify

This guide will walk you through deploying your Weedhead Beats Store to Coolify and connecting it to your domain `weedheadbeats.com`.

---

## Prerequisites Checklist

Before starting, make sure you have:
- ✅ GitHub repository: https://github.com/BrandingNovation/weedhead-beats-store
- ✅ Coolify instance running and accessible
- ✅ Domain `weedheadbeats.com` pointing to your Coolify server
- ✅ Supabase project set up (database already configured)
- ✅ Environment variables ready (Supabase, Gemini, Stripe, PayPal keys)

---

## Step 1: Create New Application in Coolify

1. **Log into Coolify Dashboard**
   - Access your Coolify instance (usually `https://your-coolify-instance.com`)

2. **Create New Resource**
   - Click **"New Resource"** button
   - Select **"Application"**

3. **Connect GitHub**
   - Choose **"GitHub"** as source
   - If not connected, click **"Connect GitHub"** and authorize
   - Select repository: **`BrandingNovation/weedhead-beats-store`**
   - Select branch: **`main`**

---

## Step 2: Configure Build Settings

### Build Configuration

1. **Build Pack**: Select **"Vite"** or **"Node.js"**
   - If Vite isn't available, use **"Node.js"**

2. **Build Command**:
   ```bash
   npm install && npm run build
   ```

3. **Start Command** (if using Node.js build pack):
   ```bash
   npx serve -s dist -l 3000
   ```
   
   Or if Coolify auto-detects Vite:
   - It should automatically use: `npm run preview`
   - Port: `3000` or `5173`

4. **Output Directory**: `dist`

5. **Node Version**: `18` or `20` (recommended: `20`)

### Advanced Settings (if needed)

- **Working Directory**: Leave empty (root)
- **Dockerfile**: Leave empty (use build pack)
- **Health Check Path**: `/` (optional)

---

## Step 3: Configure Environment Variables

Add these in Coolify's **Environment Variables** section:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini API (for AI features)
VITE_API_KEY=your-gemini-api-key-here

# Stripe (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key-here

# PayPal (for payments)
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id-here
```

**Important Notes:**
- ✅ Use **VITE_** prefix for all variables (required for Vite)
- ✅ Use **production** keys (not test keys) for live site
- ✅ Never commit these to GitHub (they're already in `.gitignore`)

---

## Step 4: Configure Domain

1. **In Coolify Application Settings**
   - Go to **"Domains"** section
   - Click **"Add Domain"**

2. **Add Your Domain**
   - Primary domain: `weedheadbeats.com`
   - Optional: `www.weedheadbeats.com`

3. **DNS Configuration**
   - Go to your domain registrar (where you bought weedheadbeats.com)
   - Add DNS records:
     ```
     Type: A
     Name: @
     Value: [Your Coolify Server IP]
     TTL: 3600
     
     Type: A (or CNAME)
     Name: www
     Value: [Your Coolify Server IP] (or your-coolify-instance.com)
     TTL: 3600
     ```

4. **SSL Certificate**
   - Coolify will automatically provision SSL via Let's Encrypt
   - Make sure ports **80** and **443** are open on your server
   - SSL will activate once DNS propagates (can take up to 24 hours)

---

## Step 5: Deploy

1. **Initial Deployment**
   - Click **"Deploy"** button in Coolify
   - Watch the build logs:
     - ✅ Installing dependencies
     - ✅ Building application
     - ✅ Starting server

2. **Monitor Build**
   - Check for any errors in the logs
   - Build should complete in 2-5 minutes

3. **Verify Deployment**
   - Once deployed, visit: `https://weedheadbeats.com`
   - Test the application:
     - ✅ Homepage loads
     - ✅ Store navigation works
     - ✅ Can browse products
     - ✅ Can add to cart
     - ✅ Can view blog posts

---

## Step 6: Post-Deployment Checklist

### Application Checks
- [ ] Site loads at `https://weedheadbeats.com`
- [ ] SSL certificate is active (green lock icon)
- [ ] All pages load correctly
- [ ] Images and assets load
- [ ] No console errors in browser

### Functionality Checks
- [ ] Can browse store (beats, albums, merch)
- [ ] Can add items to cart
- [ ] Can view product details
- [ ] Blog posts are clickable
- [ ] Admin dashboard accessible (if logged in)
- [ ] Supabase connection works
- [ ] AI features work (if API key is set)

### Database Checks
- [ ] Supabase connection successful
- [ ] Can create user accounts
- [ ] Can upload tracks (admin)
- [ ] Can create blog posts (admin)

---

## Troubleshooting

### Build Fails

**Error: "npm install failed"**
- Check Node.js version (should be 18+)
- Verify `package.json` is correct
- Check build logs for specific error

**Error: "Build command failed"**
- Verify build command: `npm run build`
- Check for TypeScript errors
- Ensure all dependencies are in `package.json`

### Domain Not Resolving

**Site not accessible**
- Check DNS propagation: https://dnschecker.org
- Verify DNS records are correct
- Wait up to 24 hours for DNS to propagate
- Check Coolify domain configuration

### Environment Variables Not Working

**Variables not accessible**
- Verify variables have `VITE_` prefix
- Restart application after adding variables
- Check variable names match exactly (case-sensitive)
- Rebuild application after adding variables

### SSL Certificate Issues

**SSL not working**
- Ensure ports 80 and 443 are open
- Check DNS is pointing to correct IP
- Wait for Let's Encrypt to provision (can take a few minutes)
- Check Coolify SSL logs

### Application Errors

**"Cannot connect to Supabase"**
- Verify `VITE_SUPABASE_URL` is correct
- Verify `VITE_SUPABASE_ANON_KEY` is correct
- Check Supabase project is active
- Verify RLS policies allow public access

**"API key not found"**
- Verify `VITE_API_KEY` is set (for Gemini AI)
- Check variable names match exactly
- Restart application after adding

---

## Continuous Deployment

Coolify will automatically deploy when you push to GitHub:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Coolify Auto-Deploy**:
   - Coolify detects the push
   - Automatically pulls latest code
   - Rebuilds and redeploys
   - Your site updates automatically!

---

## Updating Your Application

### Making Changes

1. **Make changes locally**
2. **Test locally**: `npm run dev`
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. **Coolify auto-deploys** (or manually trigger deploy)

### Manual Deployment

If auto-deploy is disabled:
1. Go to Coolify dashboard
2. Click **"Deploy"** button
3. Wait for build to complete

---

## Monitoring & Logs

### View Logs in Coolify

1. Go to your application in Coolify
2. Click **"Logs"** tab
3. View:
   - Build logs
   - Application logs
   - Error logs

### Check Application Status

- **Health**: Check if application is running
- **Resources**: Monitor CPU/Memory usage
- **Logs**: View real-time application logs

---

## Backup & Recovery

### Code Backup
- ✅ Code is in GitHub (automatic backup)
- ✅ Can clone/recover anytime

### Database Backup
- ✅ Supabase handles automatic backups
- ✅ Can restore from Supabase dashboard

### Environment Variables
- ✅ Document in secure password manager
- ✅ Keep `.env.example` file updated (without secrets)

---

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to GitHub
   - Use production keys for live site
   - Rotate keys periodically

2. **Domain Security**
   - Use HTTPS only (SSL certificate)
   - Enable HSTS in Coolify (if available)

3. **Supabase Security**
   - Review RLS policies
   - Use least privilege principle
   - Monitor database access

---

## Support & Resources

- **Coolify Docs**: https://coolify.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev
- **GitHub Repo**: https://github.com/BrandingNovation/weedhead-beats-store

---

## Quick Reference Commands

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Git Commands
```bash
git status           # Check status
git add .            # Stage changes
git commit -m "msg"  # Commit changes
git push origin main # Push to GitHub
```

---

## 🎉 You're All Set!

Once deployed, your site will be live at:
**https://weedheadbeats.com**

If you encounter any issues, check the troubleshooting section or review the logs in Coolify.

Good luck with your deployment! 🚀


