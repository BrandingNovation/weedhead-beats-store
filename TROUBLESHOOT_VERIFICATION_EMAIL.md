# Troubleshoot Verification Email Still Not Working

## 🔍 Check These Things

### 1. Did You Restart Supabase Service?

**Important:** After adding `SITE_URL`, you MUST restart the Supabase service!

1. **Go to Coolify → Your Supabase Service**
2. **Click "Restart" or "Redeploy"**
3. **Wait for it to restart completely**
4. **Try again**

---

### 2. Old Emails Have Old Links

**If you're clicking a link from an email sent BEFORE you added SITE_URL:**
- That email still has the old `supabase-kong` link
- **Solution:** Sign up a NEW user (or resend verification email)
- New emails will have the correct link

---

### 3. Verify SITE_URL is Set Correctly

**Check in Coolify:**
1. **Go to Supabase Service → Environment Variables**
2. **Verify `SITE_URL` exists:**
   - Name: `SITE_URL`
   - Value: `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io`
   - ✅ Both checkboxes checked
3. **If missing or wrong, fix it and restart**

---

### 4. Check Supabase Logs

**In Coolify → Your Supabase Service → Logs:**
- Look for errors about SITE_URL
- Look for SMTP errors
- Check if Supabase is reading the environment variable

---

### 5. Try Using Verification Code Instead

**Instead of clicking the link:**
1. **Check your email for the 6-digit code**
2. **Go to your app**
3. **Sign up again** (or the verification screen should appear)
4. **Enter the code** in the verification input field
5. **This should work even if the link doesn't**

---

### 6. Alternative: Disable Email Confirmation (Temporary)

**If you need to test quickly:**
1. **Go to Supabase Dashboard → Settings → Auth**
2. **Find "Email Confirmation"**
3. **Disable it temporarily** (for testing only)
4. **Users can sign up without email verification**

**⚠️ Re-enable it for production!**

---

### 7. Check Email Link Format

**When you get a new verification email, check:**
- Does the link start with `https://bowk8k0cww4gkck04wsc4g4w...`?
- Or does it still say `supabase-kong`?

**If still `supabase-kong`:**
- SITE_URL isn't being read
- Restart Supabase service
- Or check if variable name is correct

---

## 🔧 Quick Fix Steps

1. **Verify SITE_URL is set** in Coolify
2. **Restart Supabase service** (very important!)
3. **Sign up a NEW user** (to get a fresh email with new link)
4. **Or use the verification code** instead of clicking the link

---

## 🆘 Still Not Working?

**Share:**
1. **Did you restart Supabase?** (Yes/No)
2. **Is SITE_URL visible in environment variables?** (Yes/No)
3. **Are you clicking an old email or a new one?** (Old/New)
4. **What does the verification link start with?** (share first part)

---

**Most common issue: Forgot to restart Supabase after adding SITE_URL!** 🔄


