# Deployment Guide - Coolify & GitHub

## Prerequisites

- GitHub account
- Coolify instance set up
- Domain name configured (weedheadbeats.com)
- Supabase project set up
- Environment variables ready

## Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Name it `weedhead-beats-store` (or your preferred name)
   - **Don't** initialize with README (you already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/weedhead-beats-store.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Set Up Coolify

1. **Create New Application**:
   - Log into your Coolify dashboard
   - Click "New Resource" → "Application"
   - Select "GitHub" as source
   - Connect your GitHub account if not already connected
   - Select your repository: `weedhead-beats-store`

2. **Configure Build Settings**:
   - **Build Pack**: `Vite` or `Node.js`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview` (or use a static server)
   - **Output Directory**: `dist`

3. **Environment Variables**:
   Add these in Coolify's environment variables section:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_API_KEY=your-gemini-api-key-here
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key-here
   VITE_PAYPAL_CLIENT_ID=your-paypal-client-id-here
   ```

## Step 3: Configure Domain

1. **In Coolify**:
   - Go to your application settings
   - Navigate to "Domains"
   - Add domain: `weedheadbeats.com`
   - Add subdomain: `www.weedheadbeats.com` (optional)

2. **DNS Configuration**:
   - Go to your domain registrar (where you bought weedheadbeats.com)
   - Add DNS records:
     - **A Record**: `@` → Your Coolify server IP
     - **A Record**: `www` → Your Coolify server IP
     - Or use **CNAME**: `www` → `your-coolify-instance.com`

3. **SSL Certificate**:
   - Coolify will automatically provision SSL via Let's Encrypt
   - Make sure port 80 and 443 are open on your server

## Step 4: Database Setup

1. **Run SQL Script**:
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Run `supabase_setup.sql` (for new database)
   - Or run `migration_add_merch_and_orders.sql` (for existing database)

2. **Create Storage Buckets**:
   - In Supabase Dashboard → Storage
   - Create bucket: `covers` (Public)
   - Create bucket: `audio` (Public)

3. **Set Up Admin User**:
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
   ```

## Step 5: Build Configuration

### Option A: Static Build (Recommended)

Create `vite.config.ts` if not exists:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
  },
})
```

### Option B: Using Nginx (if needed)

If Coolify doesn't auto-detect Vite, you may need to configure Nginx:

```nginx
server {
    listen 80;
    server_name weedheadbeats.com www.weedheadbeats.com;

    root /app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Step 6: Deploy

1. **Trigger Deployment**:
   - In Coolify, click "Deploy" or push a new commit
   - Coolify will:
     - Pull code from GitHub
     - Install dependencies (`npm install`)
     - Build the app (`npm run build`)
     - Start the application

2. **Monitor Build Logs**:
   - Watch the build process in Coolify logs
   - Check for any errors

3. **Verify Deployment**:
   - Visit `https://weedheadbeats.com`
   - Test all features:
     - Store navigation
     - Product pages
     - Cart functionality
     - Blog posts
     - Admin dashboard

## Step 7: Post-Deployment Checklist

- [ ] Domain resolves correctly
- [ ] SSL certificate is active (HTTPS)
- [ ] Environment variables are set
- [ ] Database connection works
- [ ] Storage buckets are accessible
- [ ] Admin user can log in
- [ ] All pages load correctly
- [ ] Images and assets load
- [ ] API calls work (Supabase, Gemini)

## Troubleshooting

### Build Fails
- Check build logs in Coolify
- Verify `package.json` has correct scripts
- Ensure Node.js version is compatible (18+)

### Domain Not Resolving
- Check DNS records (may take 24-48 hours)
- Verify DNS propagation: https://dnschecker.org
- Check Coolify domain configuration

### Environment Variables Not Working
- Verify variables are set in Coolify (not just `.env` file)
- Restart application after adding variables
- Check variable names match exactly (case-sensitive)

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Verify RLS policies allow public access where needed

### Assets Not Loading
- Check `vite.config.ts` base path
- Verify build output directory
- Check Nginx/static server configuration

## Continuous Deployment

Coolify will automatically deploy when you push to GitHub:
- Push to `main` branch → Production deployment
- Create pull request → Preview deployment (optional)

## Monitoring

- Check Coolify logs regularly
- Monitor Supabase dashboard for database usage
- Set up error tracking (optional: Sentry, LogRocket)

## Backup Strategy

1. **Database**: Supabase handles backups automatically
2. **Code**: GitHub is your backup
3. **Environment Variables**: Document in secure password manager

## Support

For issues:
1. Check Coolify documentation: https://coolify.io/docs
2. Check Supabase documentation: https://supabase.com/docs
3. Review application logs in Coolify

---

**Your app should now be live at https://weedheadbeats.com! 🚀**

