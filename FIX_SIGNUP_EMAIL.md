# 🔧 Fix Signup Email Not Working

## ⚠️ Important: Two Different Email Systems

**The email settings in your admin dashboard are for:**
- Newsletter emails
- Order confirmation emails
- Custom emails from your app

**Supabase's signup verification emails use:**
- Supabase's own SMTP configuration
- Configured in Supabase Dashboard (not your app)

---

## 🔍 Quick Diagnosis

### Did the email arrive at all?

1. **Check spam/junk folder**
2. **Check email address** - make sure you typed it correctly
3. **Wait 1-2 minutes** - emails can be delayed
4. **Try resending** - use the "Resend Code" button in the app

### If email didn't arrive:

**Problem:** Supabase SMTP not configured or not working

**Solution:** Configure SMTP in Supabase (see below)

### If email arrived but link doesn't work:

**Problem:** `SITE_URL` not set in Supabase

**Solution:** Set `SITE_URL` environment variable (see below)

---

## ✅ Fix 1: Configure SMTP in Supabase

### For Supabase Cloud (app.supabase.com)

1. **Go to Supabase Dashboard**
2. **Settings → Auth → SMTP Settings**
3. **Enable "Custom SMTP"**
4. **Fill in your Zoho SMTP settings:**
   - **Host:** `smtp.zoho.com`
   - **Port:** `587` (TLS) or `465` (SSL)
   - **Username:** `your-email@zoho.com`
   - **Password:** Your Zoho App Password (NOT regular password!)
   - **Sender email:** `your-email@zoho.com`
   - **Sender name:** `Weedhead Beats`
5. **Click "Test Connection"**
6. **If test passes, click "Save"**

### For Self-Hosted Supabase (Coolify)

1. **Go to Coolify → Your Supabase Service**
2. **Environment Variables**
3. **Add these variables:**

```
SMTP_ADMIN_EMAIL=your-email@zoho.com
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=your-email@zoho.com
SMTP_PASS=your-zoho-app-password
SMTP_SENDER_NAME=Weedhead Beats
```

4. **Make sure both checkboxes are checked** (Buildtime & Runtime)
5. **Restart Supabase service**
6. **Test signup again**

---

## ✅ Fix 2: Set SITE_URL for Email Links

Even if SMTP works, the verification link needs to point to your app URL.

### In Coolify (Self-Hosted)

1. **Go to Coolify → Your Supabase Service**
2. **Environment Variables**
3. **Add:**

```
SITE_URL=https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io
```

**Or when you have your domain:**

```
SITE_URL=https://weedheadbeats.com
```

4. **Also add (optional but recommended):**

```
ADDITIONAL_REDIRECT_URLS=https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io/**,https://www.weedheadbeats.com/**
```

5. **Restart Supabase service**

### In Supabase Cloud Dashboard

1. **Go to Supabase Dashboard**
2. **Settings → Auth → URL Configuration**
3. **Set "Site URL":**
   - `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io`
   - Or `https://weedheadbeats.com` (when domain is connected)
4. **Add "Redirect URLs":**
   - `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io/**`
   - `https://www.weedheadbeats.com/**`
5. **Save**

---

## 🔑 Getting Zoho App Password

**CRITICAL:** You MUST use an App Password, not your regular password!

1. **Go to:** https://accounts.zoho.com
2. **Security → App Passwords**
3. **Generate New App Password**
4. **Name it:** "Supabase" or "Weedhead Beats"
5. **Copy the password** (you'll only see it once!)
6. **Use this password** in SMTP settings

---

## 🧪 Testing

### Step 1: Test SMTP Connection

**In Supabase Dashboard:**
- Go to Settings → Auth → SMTP Settings
- Click "Test Connection"
- Should show "Connection successful"

### Step 2: Test Signup

1. **Go to your app**
2. **Click "Sign Up"**
3. **Enter email and password**
4. **Submit**
5. **Check email** (including spam folder)
6. **Should receive verification email within 1-2 minutes**

### Step 3: Test Verification Link

1. **Click the link in the email**
2. **Should redirect to your app**
3. **Or enter the 6-digit code** in the verification screen

---

## 🚨 Common Issues & Fixes

### Issue: "Authentication failed" when testing SMTP

**Fix:**
- Use App Password, not regular password
- Double-check email address
- Try port `465` instead of `587`

### Issue: Email not arriving

**Fix:**
- Check spam folder
- Verify SMTP settings are saved
- Check Supabase logs for errors
- Make sure Supabase service is restarted after adding variables

### Issue: Email link shows "supabase-kong" or doesn't work

**Fix:**
- Add `SITE_URL` environment variable
- Restart Supabase service
- Sign up a NEW user (old emails have old links)

### Issue: "Connection timeout"

**Fix:**
- Try port `465` (SSL) instead of `587` (TLS)
- Check firewall settings
- Verify SMTP host is correct

---

## 📋 Complete Checklist

- [ ] Got Zoho App Password (not regular password)
- [ ] Added SMTP variables to Supabase service in Coolify
- [ ] Added `SITE_URL` variable to Supabase service
- [ ] Restarted Supabase service after adding variables
- [ ] Tested SMTP connection in Supabase dashboard
- [ ] Tried signing up a new user
- [ ] Checked email (including spam folder)
- [ ] Verification link works or code can be entered

---

## 🔄 Alternative: Use Verification Code Instead of Link

If the link doesn't work, you can still verify using the code:

1. **Check your email** for the 6-digit code
2. **In the app**, the verification screen should appear
3. **Enter the code** in the input field
4. **Click "Verify"**

This works even if the link is broken!

---

## 💡 Quick Test: Disable Email Confirmation (Temporary)

**For testing only** (not recommended for production):

1. **Supabase Dashboard → Settings → Auth**
2. **Find "Email Confirmation"**
3. **Disable it temporarily**
4. **Users can sign up without verification**

**⚠️ Re-enable before going live!**

---

## 📞 Still Not Working?

Check these:

1. **Supabase Logs** (Coolify → Supabase Service → Logs)
   - Look for SMTP errors
   - Look for email sending errors

2. **Browser Console** (F12 → Console)
   - Look for Supabase errors
   - Check network tab for failed requests

3. **Email Provider**
   - Check Zoho account for blocked emails
   - Verify App Password is active
   - Check Zoho email logs

---

**After configuring SMTP and SITE_URL, restart Supabase and try signing up again!** 📧

