# Coolify Configuration - Current Settings

## ✅ What's Already Correct:

- **Build Pack**: `Nixpacks` ✅
- **Is it a static site?**: ✅ CHECKED (good!)
- **Base Directory**: `/` ✅

## ⚠️ What Needs to Be Changed:

### 1. Check "Is it a SPA (Single Page Application)?" ✅

**This is IMPORTANT!** Your React/Vite app is a Single Page Application, so:
- ✅ **Check the "Is it a SPA?" checkbox**

This ensures proper routing (when users navigate to `/store`, `/blog`, etc., it won't show 404 errors).

### 2. Set Publish Directory to `dist`

**Current**: Publish Directory shows `/`
**Should be**: `dist`

- Change **Publish Directory** from `/` to `dist`
- This tells Coolify where your built files are located

### 3. Build Commands (Optional - Nixpacks will auto-detect)

You can leave these empty, OR explicitly set:
- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Start Command**: (leave empty - Nixpacks will use the static image)

### 4. Nginx Configuration

Since you're using a static site with SPA, the default Nginx config should work, but if you need to customize it, use:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
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

Click "Generate Default Nginx Configuration" if you want Coolify to create this automatically.

## Summary of Changes:

1. ✅ Check "Is it a SPA (Single Page Application)?"
2. ✅ Change Publish Directory from `/` to `dist`
3. ✅ (Optional) Click "Generate Default Nginx Configuration"
4. ✅ Add environment variables (next step)
5. ✅ Configure domain (weedheadbeats.com)

## After Configuration:

1. Click "Save" or "Deploy"
2. Add environment variables in the next section
3. Configure your domain
4. Deploy!



