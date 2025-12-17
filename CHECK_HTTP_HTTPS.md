# Check if Site is HTTP or HTTPS

## 🔍 Quick Check

**Try accessing your site with both:**

1. **HTTP:** `http://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io`
2. **HTTPS:** `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io`

**Which one works?** That's the one you need to use for `SITE_URL`.

---

## ✅ Fix Based on What Works

### If HTTP Works:
**In Coolify → Supabase Service → Environment Variables:**

```
SITE_URL=http://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io
ADDITIONAL_REDIRECT_URLS=http://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io/**
```

### If HTTPS Works:
**In Coolify → Supabase Service → Environment Variables:**

```
SITE_URL=https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io
ADDITIONAL_REDIRECT_URLS=https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io/**
```

### If Both Work:
**Use HTTPS** (more secure):
```
SITE_URL=https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io
ADDITIONAL_REDIRECT_URLS=https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io/**
```

---

## 🔧 Steps

1. **Test both URLs** in your browser
2. **See which one loads your app**
3. **Update SITE_URL** to match (HTTP or HTTPS)
4. **Restart Supabase service**
5. **Test verification email again**

---

## ⚠️ Important

- **SITE_URL must match** the protocol your site actually uses
- **If you set HTTPS but site is HTTP** → links won't work
- **If you set HTTP but site is HTTPS** → links won't work
- **Must match exactly!**

---

**Test both URLs and let me know which one works!** 🚀

