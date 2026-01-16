# 🔐 Access Supabase Studio (Self-Hosted)

## Your Supabase Setup
- **Supabase URL:** `https://supabase.brandingnovations.com`
- **Supabase Studio:** `https://supabase.brandingnovations.com` (same URL)
- **Service Path:** `/data/coolify/services/wk04oowwwk0c48cg8ssw84og`

## Access Supabase Studio

### Option 1: Direct URL
Go to: **https://supabase.brandingnovations.com**

You should see the Supabase Studio login page.

### Option 2: Via Coolify
1. Go to Coolify Dashboard: `http://65.21.109.247:8000`
2. Go to **Services**
3. Find your **Supabase** service
4. Click on it
5. Look for **"Open"** or **"Studio"** button/link
6. Click it to open Supabase Studio

---

## Default Credentials

For self-hosted Supabase, the default credentials are usually:

**Email:** `admin@supabase.com` or `admin@example.com`  
**Password:** Check the Supabase service environment variables

---

## Get Admin Password from Server

### Method 1: Check Environment Variables

```bash
# SSH into your server
ssh root@65.21.109.247

# Check Supabase service .env file
cat /data/coolify/services/wk04oowwwk0c48cg8ssw84og/.env | grep -i -E "PASSWORD|ADMIN|GOTRUE|JWT"
```

Look for:
- `GOTRUE_JWT_SECRET`
- `GOTRUE_ADMIN_PASSWORD`
- `SUPABASE_ADMIN_PASSWORD`
- `JWT_SECRET`

### Method 2: Check Coolify UI

1. Go to Coolify Dashboard: `http://65.21.109.247:8000`
2. Go to **Services** → Find **Supabase** service
3. Click **Environment Variables**
4. Look for password-related variables

### Method 3: Check Docker Container

```bash
ssh root@65.21.109.247

# Find Supabase containers
docker ps | grep supabase

# Check environment variables
docker exec <supabase-auth-container> env | grep -i password
```

---

## Reset Admin Password

If you can't find the password, you can reset it:

### Option 1: Via Supabase Service Environment

```bash
ssh root@65.21.109.247

# Edit Supabase service .env
cd /data/coolify/services/wk04oowwwk0c48cg8ssw84og
nano .env

# Add or update:
GOTRUE_ADMIN_PASSWORD=your-new-password-here

# Restart Supabase service
# (In Coolify UI: Services → Supabase → Restart)
```

### Option 2: Via Coolify UI

1. Go to Coolify Dashboard
2. Services → Supabase
3. Environment Variables
4. Add/Update: `GOTRUE_ADMIN_PASSWORD` = `your-new-password`
5. Save
6. Restart the Supabase service

### Option 3: Direct Database Access

If you have database access, you can reset the admin user directly:

```bash
ssh root@65.21.109.247

# Find Supabase Postgres container
docker ps | grep postgres

# Connect to database
docker exec -it <postgres-container> psql -U postgres -d postgres

# Reset admin password (replace 'newpassword' with your password)
UPDATE auth.users SET encrypted_password = crypt('newpassword', gen_salt('bf')) WHERE email = 'admin@supabase.com';
```

---

## Common Issues

### "Invalid credentials"
- Password might have changed
- Check environment variables for the correct password
- Try resetting the password (see above)

### "Connection refused" or "Can't reach Supabase Studio"
- Supabase service might be down
- Check service status in Coolify
- Restart the Supabase service

### "404 Not Found"
- Supabase Studio might not be enabled
- Check if `SUPABASE_STUDIO_ENABLED=true` in environment variables
- Check if Studio is accessible on a different port

---

## Quick Check Commands

```bash
# Check if Supabase is running
ssh root@65.21.109.247
docker ps | grep supabase

# Check Supabase service status in Coolify
# Go to: http://65.21.109.247:8000 → Services → Supabase

# Test Supabase URL
curl -I https://supabase.brandingnovations.com
```

---

## Alternative: Access via API

If you can't access Studio, you can still get the anon key via API or environment variables:

```bash
ssh root@65.21.109.247
cat /data/coolify/services/wk04oowwwk0c48cg8ssw84og/.env | grep ANON_KEY
```

This will give you the anon key you need for your app, even if you can't login to Studio.

---

## Need Help?

If you still can't access Supabase:
1. Check Coolify service logs for errors
2. Verify Supabase containers are running
3. Check if the domain/URL is correct
4. Try accessing via IP if domain doesn't work
