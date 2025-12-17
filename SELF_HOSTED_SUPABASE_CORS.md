# Self-Hosted Supabase CORS Configuration

## 🔧 CORS Configuration for Self-Hosted Supabase

In self-hosted Supabase, CORS is configured via environment variables or configuration files, not through the dashboard.

---

## Option 1: Environment Variables (Recommended)

### If using Docker Compose:

Edit your `docker-compose.yml` or `.env` file and add/update:

```yaml
API_EXTERNAL_URL: https://your-supabase-domain.com
CORS_EXTRA_ORIGINS: https://weedheadbeats.com,https://www.weedheadbeats.com,https://your-coolify-preview-url.com
```

Or in `.env` file:
```env
API_EXTERNAL_URL=https://your-supabase-domain.com
CORS_EXTRA_ORIGINS=https://weedheadbeats.com,https://www.weedheadbeats.com
```

### Restart Supabase:
```bash
docker-compose restart
# or
supabase stop && supabase start
```

---

## Option 2: Kong Configuration (If using Kong API Gateway)

If your self-hosted Supabase uses Kong, edit the Kong configuration:

1. **Find Kong config file** (usually in `supabase/config/kong.yml` or similar)
2. **Add CORS plugin configuration:**

```yaml
plugins:
  - name: cors
    config:
      origins:
        - https://weedheadbeats.com
        - https://www.weedheadbeats.com
        - http://localhost:3000  # for local testing
      methods:
        - GET
        - POST
        - PUT
        - DELETE
        - OPTIONS
        - PATCH
      headers:
        - Accept
        - Accept-Language
        - Content-Language
        - Content-Type
        - Authorization
        - apikey
      exposed_headers:
        - Content-Range
        - X-Content-Range
      credentials: true
      max_age: 3600
```

3. **Restart Kong:**
```bash
docker-compose restart kong
```

---

## Option 3: Nginx/Reverse Proxy Configuration

If you're using Nginx as a reverse proxy in front of Supabase:

Edit your Nginx config (usually `/etc/nginx/sites-available/supabase` or similar):

```nginx
server {
    listen 443 ssl;
    server_name your-supabase-domain.com;

    location / {
        # Add CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://weedheadbeats.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
        add_header 'Access-Control-Allow-Headers' 'Accept, Accept-Language, Content-Language, Content-Type, Authorization, apikey' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Range, X-Content-Range' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://weedheadbeats.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
            add_header 'Access-Control-Allow-Headers' 'Accept, Accept-Language, Content-Language, Content-Type, Authorization, apikey' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Proxy to Supabase
        proxy_pass http://localhost:8000;  # or your Supabase API port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then reload Nginx:
```bash
sudo nginx -t  # Test configuration
sudo systemctl reload nginx  # Reload
```

---

## Option 4: Supabase Config File

If using Supabase CLI or config files, check for:

1. **`supabase/config.toml`** or **`.env`** file
2. Look for `API_EXTERNAL_URL` and `CORS_EXTRA_ORIGINS`
3. Add your domain:

```toml
[api]
external_url = "https://your-supabase-domain.com"
extra_origins = ["https://weedheadbeats.com", "https://www.weedheadbeats.com"]
```

---

## 🔍 How to Find Your Setup

### Check if using Docker:
```bash
docker ps | grep supabase
```

### Check if using Supabase CLI:
```bash
supabase status
```

### Check for config files:
```bash
# In your Supabase directory
ls -la | grep -E "(docker-compose|config|\.env)"
```

---

## ✅ Quick Fix: Disable CORS (Development Only)

**⚠️ WARNING: Only for development/testing!**

If you just need to test quickly, you can temporarily allow all origins:

### In Docker Compose:
```yaml
CORS_EXTRA_ORIGINS: "*"
```

### In Kong:
```yaml
config:
  origins:
    - "*"
```

**This is NOT secure for production!** Use specific domains instead.

---

## 🧪 Test CORS Configuration

After configuring, test with:

```bash
curl -H "Origin: https://weedheadbeats.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: authorization,apikey" \
     -X OPTIONS \
     https://your-supabase-domain.com/rest/v1/
```

You should see CORS headers in the response.

---

## 📋 Checklist

- [ ] Identified your Supabase setup (Docker, CLI, Nginx, etc.)
- [ ] Found configuration file
- [ ] Added your domain to CORS origins
- [ ] Restarted Supabase service
- [ ] Tested CORS with curl or browser
- [ ] Sign in works now

---

## 🆘 Still Having Issues?

1. **Check Supabase logs:**
   ```bash
   docker-compose logs supabase-auth
   # or
   supabase logs
   ```

2. **Check network connectivity:**
   - Can you access Supabase API directly?
   - Test: `curl https://your-supabase-domain.com/rest/v1/`

3. **Check browser console:**
   - Look for specific CORS error messages
   - Check Network tab for failed requests

4. **Temporary workaround:**
   - Use "Enter Demo Mode" button in the sign-in form
   - This bypasses Supabase for testing

---

## 💡 Alternative: Check Supabase Dashboard

Even in self-hosted, some versions have a dashboard. Check:
- `https://your-supabase-domain.com/dashboard`
- Look for "Settings" → "API" → "CORS" or similar

If you can share how your Supabase is set up (Docker, CLI, etc.), I can give more specific instructions!

