# 🌐 Domain Setup with Cloudflare & Coolify

This guide shows you how to connect your custom domain (`weedheadbeats.com`) to your Coolify deployment without breaking anything.

---

## ⚠️ Important: Do This in Order!

**Follow these steps EXACTLY** to avoid breaking your site:

1. ✅ Set up DNS records in Cloudflare FIRST
2. ✅ Wait for DNS to propagate (5-60 minutes)
3. ✅ Add domain in Coolify
4. ✅ SSL certificate will auto-generate

---

## 📋 Step 1: Get Your Coolify Server IP Address

### Find Your Server's Public IP

1. **Go to Coolify Dashboard**
2. **Click on your application**
3. **Look for "Domains" or "Settings" section**
4. **Note your server's public IP address** (e.g., `65.21.109.247`)

**OR** check your current temporary domain:
- Your temp domain: `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io/`
- The IP is: `65.21.109.247`

**Write this down!** You'll need it for DNS records.

---

## 🔧 Step 2: Set Up DNS Records in Cloudflare

### Option A: Root Domain (weedheadbeats.com)

1. **Log in to Cloudflare Dashboard**
2. **Select your domain** (`weedheadbeats.com`)
3. **Go to DNS → Records**
4. **Add these records:**

#### Record 1: Root Domain (A Record)
```
Type: A
Name: @
Content: 65.21.109.247  (your Coolify server IP)
Proxy: 🟠 Proxied (orange cloud ON)
TTL: Auto
```

#### Record 2: WWW Subdomain (CNAME Record)
```
Type: CNAME
Name: www
Target: weedheadbeats.com
Proxy: 🟠 Proxied (orange cloud ON)
TTL: Auto
```

### Option B: Subdomain (app.weedheadbeats.com)

If you prefer a subdomain instead:

```
Type: A
Name: app  (or store, or whatever you want)
Content: 65.21.109.247
Proxy: 🟠 Proxied (orange cloud ON)
TTL: Auto
```

**Then use:** `https://app.weedheadbeats.com` (or your chosen subdomain)

---

## ⏳ Step 3: Wait for DNS Propagation

**CRITICAL:** Don't add the domain in Coolify yet!

1. **Wait 5-60 minutes** for DNS to propagate
2. **Test DNS propagation:**
   ```bash
   # In terminal, run:
   nslookup weedheadbeats.com
   # or
   dig weedheadbeats.com
   ```
3. **Verify it points to your IP:** Should return `65.21.109.247` (or your server IP)

**OR use online tools:**
- https://www.whatsmydns.net/
- https://dnschecker.org/
- Enter `weedheadbeats.com` and check if it shows your server IP

**Wait until DNS shows your server IP before proceeding!**

---

## 🚀 Step 4: Add Domain in Coolify

**ONLY after DNS is propagated:**

1. **Go to Coolify Dashboard**
2. **Click on your application**
3. **Go to "Domains" or "Settings" → "Domains"**
4. **Click "Add Domain" or "+" button**
5. **Enter your domain:**
   - `weedheadbeats.com` (root domain)
   - OR `app.weedheadbeats.com` (subdomain)
6. **Click "Save" or "Add"**

### What Happens Next:

- ✅ Coolify will detect the domain
- ✅ SSL certificate will auto-generate (Let's Encrypt)
- ✅ Domain will be added to your app
- ✅ Your app will be accessible at your custom domain!

**This may take 2-5 minutes** for SSL to generate.

---

## 🔒 Step 5: Verify SSL Certificate

1. **Wait 2-5 minutes** after adding domain
2. **Visit your domain:** `https://weedheadbeats.com`
3. **Check for padlock** 🔒 in browser address bar
4. **If SSL fails:**
   - Wait a few more minutes
   - Check Coolify logs for SSL errors
   - Verify DNS is pointing correctly

---

## 🔄 Step 6: Update Supabase Settings (Important!)

### Update Site URL in Supabase

Your Supabase auth needs to know about your new domain:

1. **Go to Supabase Dashboard → Authentication → URL Configuration**
2. **Update "Site URL":**
   - Change from: `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io`
   - To: `https://weedheadbeats.com`
3. **Add to "Redirect URLs":**
   - `https://weedheadbeats.com`
   - `https://www.weedheadbeats.com`
   - `https://weedheadbeats.com/**` (wildcard)
4. **Save changes**

### Update Environment Variables (if needed)

If you hardcoded any URLs, update them in Coolify:

1. **Coolify → Your App → Environment Variables**
2. **Check for any URLs** that reference the temp domain
3. **Update to:** `https://weedheadbeats.com`

---

## 🎯 Step 7: Test Everything

### Test Checklist:

- [ ] Domain loads: `https://weedheadbeats.com`
- [ ] SSL certificate works (padlock shows)
- [ ] Site content loads correctly
- [ ] Sign in works
- [ ] Sign up works
- [ ] Email verification links work (check Supabase Site URL)
- [ ] All pages work (Store, Blog, Dashboard, etc.)
- [ ] No console errors

---

## 🛡️ Cloudflare Settings (Recommended)

### SSL/TLS Settings

1. **Cloudflare Dashboard → SSL/TLS**
2. **Set encryption mode:** "Full (strict)"
3. **This ensures:** End-to-end encryption between Cloudflare and your server

### Page Rules (Optional)

Create a page rule to force HTTPS:

1. **Cloudflare → Rules → Page Rules**
2. **Create rule:**
   ```
   URL: http://weedheadbeats.com/*
   Setting: Always Use HTTPS
   ```

### Caching (Optional)

For static sites, you can enable caching:

1. **Cloudflare → Caching → Configuration**
2. **Caching Level:** Standard
3. **Browser Cache TTL:** Respect Existing Headers

---

## 🚨 Troubleshooting

### Domain Not Loading?

1. **Check DNS propagation:**
   ```bash
   nslookup weedheadbeats.com
   ```
   Should return your server IP

2. **Check Cloudflare proxy:**
   - Make sure orange cloud (🟠) is ON
   - If gray cloud (⚪), turn on proxy

3. **Check Coolify:**
   - Domain added correctly?
   - SSL certificate generated?
   - App is running?

### SSL Certificate Not Working?

1. **Wait 5-10 minutes** (Let's Encrypt needs time)
2. **Check Coolify logs** for SSL errors
3. **Verify DNS** is pointing correctly
4. **Try accessing:** `http://weedheadbeats.com` (should redirect to HTTPS)

### Site Works But Auth Fails?

1. **Update Supabase Site URL** (see Step 6)
2. **Clear browser cache**
3. **Try incognito/private window**
4. **Check Supabase logs** for redirect errors

### DNS Not Propagating?

1. **Wait longer** (can take up to 48 hours, usually 5-60 minutes)
2. **Check Cloudflare DNS settings:**
   - Records are correct?
   - Proxy is enabled?
3. **Try different DNS checker tools**
4. **Clear your local DNS cache:**
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```

---

## 📝 DNS Record Summary

**For Cloudflare, add these records:**

| Type | Name | Content/Target | Proxy |
|------|------|---------------|-------|
| A | @ | `65.21.109.247` | 🟠 ON |
| CNAME | www | `weedheadbeats.com` | 🟠 ON |

**Replace `65.21.109.247` with your actual Coolify server IP!**

---

## ✅ Final Checklist

Before going live:

- [ ] DNS records added in Cloudflare
- [ ] DNS propagated (verified with nslookup/dig)
- [ ] Domain added in Coolify
- [ ] SSL certificate generated
- [ ] Supabase Site URL updated
- [ ] Site loads at custom domain
- [ ] All features work (auth, payments, etc.)
- [ ] SSL padlock shows in browser

---

## 🎉 You're Done!

Your site should now be accessible at:
- `https://weedheadbeats.com`
- `https://www.weedheadbeats.com`

**Both will work** thanks to the CNAME record!

---

## 💡 Pro Tips

1. **Keep the temp domain** - Don't delete it, useful for testing
2. **Monitor SSL expiration** - Coolify auto-renews, but check occasionally
3. **Use Cloudflare Analytics** - Track your traffic
4. **Enable Cloudflare CDN** - Faster loading worldwide
5. **Set up email** - Use Cloudflare Email Routing for custom email addresses

---

**Need help?** Check Coolify logs and Cloudflare DNS status if anything breaks!



