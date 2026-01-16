# Configure Zoho SMTP for Supabase Email Verification

## 🎯 Goal

Configure Zoho SMTP so Supabase can send verification emails when users sign up.

---

## 📋 Zoho SMTP Settings

Here are the standard Zoho SMTP settings:

```
SMTP Server: smtp.zoho.com
SMTP Port: 587 (TLS) or 465 (SSL)
Username: your-email@zoho.com
Password: Your Zoho App Password (not regular password)
From Email: your-email@zoho.com
From Name: Weedhead Beats (or your choice)
```

**Important:** You need to use an **App Password**, not your regular Zoho password.

---

## 🔧 How to Configure in Supabase

### Option 1: Supabase Cloud (app.supabase.com)

1. **Go to Supabase Dashboard**
2. **Settings → Auth → SMTP Settings**
3. **Enable Custom SMTP**
4. **Fill in:**
   - **Host:** `smtp.zoho.com`
   - **Port:** `587` (or `465` for SSL)
   - **Username:** `your-email@zoho.com`
   - **Password:** Your Zoho App Password
   - **Sender email:** `your-email@zoho.com`
   - **Sender name:** `Weedhead Beats`
5. **Test the connection**
6. **Save**

### Option 2: Self-Hosted Supabase

#### Method A: Via Supabase Dashboard (if available)

1. **Go to your Supabase Dashboard**
2. **Settings → Auth → SMTP Settings**
3. **Configure as above**

#### Method B: Via Environment Variables (Docker)

If you're using Docker/self-hosted, you need to set these environment variables:

```bash
SMTP_ADMIN_EMAIL=your-email@zoho.com
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=your-email@zoho.com
SMTP_PASS=your-zoho-app-password
SMTP_SENDER_NAME=Weedhead Beats
```

**In your Supabase docker-compose.yml or .env file:**

```yaml
# SMTP Configuration
SMTP_ADMIN_EMAIL: your-email@zoho.com
SMTP_HOST: smtp.zoho.com
SMTP_PORT: 587
SMTP_USER: your-email@zoho.com
SMTP_PASS: your-zoho-app-password
SMTP_SENDER_NAME: Weedhead Beats
```

#### Method C: Via Kong/API Configuration

If using Kong API gateway, you may need to configure SMTP through the API or config files.

---

## 🔑 Getting Zoho App Password

**You MUST use an App Password, not your regular password:**

1. **Go to Zoho Account**
   - https://accounts.zoho.com
2. **Security → App Passwords**
3. **Generate New App Password**
4. **Name it:** "Supabase" or "Weedhead Beats"
5. **Copy the generated password** (you'll only see it once!)
6. **Use this password** in Supabase SMTP settings

---

## ✅ Testing

After configuring:

1. **Go to your app**
2. **Try to sign up** with a new email
3. **Check your email** for verification link
4. **If not received:**
   - Check Supabase logs for SMTP errors
   - Verify App Password is correct
   - Check spam folder
   - Verify SMTP settings are correct

---

## 🚨 Common Issues

### "Authentication failed"
- **Fix:** Use App Password, not regular password
- **Fix:** Make sure email is correct

### "Connection timeout"
- **Fix:** Try port `465` instead of `587`
- **Fix:** Check firewall settings

### "Emails not sending"
- **Fix:** Check Supabase logs
- **Fix:** Verify SMTP settings are saved
- **Fix:** Test connection in Supabase dashboard

### "Emails going to spam"
- **Fix:** Configure SPF/DKIM records for your domain
- **Fix:** Use a custom domain email if possible

---

## 📝 Quick Checklist

- [ ] Got Zoho App Password (not regular password)
- [ ] Configured SMTP in Supabase Dashboard
- [ ] Tested connection
- [ ] Saved settings
- [ ] Tested sign-up flow
- [ ] Received verification email

---

## 🔍 Where to Find SMTP Settings in Supabase

**Supabase Cloud:**
- Dashboard → Settings → Auth → SMTP Settings

**Self-Hosted:**
- Check your Supabase config files
- Or via API if dashboard doesn't have it
- Or in environment variables

---

## 💡 Alternative: Use Supabase's Built-in Email

If Zoho doesn't work, Supabase has built-in email (limited):
- Works out of the box
- Limited customization
- May have rate limits

But custom SMTP (Zoho) is better for production!

---

**After configuring Zoho SMTP, your verification emails will be sent through Zoho!** 📧



