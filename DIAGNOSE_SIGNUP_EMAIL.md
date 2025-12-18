# 🔍 Diagnose Signup Email Issue

Since you were able to sign up before, let's figure out what's different now.

---

## ❓ What's the Exact Problem?

### Option A: Email Not Arriving at All
- **Symptom:** User signs up, but no email arrives (not even in spam)
- **Possible causes:**
  - SMTP settings changed or expired
  - Supabase service restarted and lost SMTP config
  - Email confirmation disabled/enabled
  - Zoho App Password expired

### Option B: Email Arrives But Link Doesn't Work
- **Symptom:** Email arrives, but clicking the link shows error or doesn't work
- **Possible causes:**
  - `SITE_URL` changed or missing
  - Domain changed but `SITE_URL` not updated
  - Link points to old domain/URL

### Option C: Verification Code Screen Appears But Code Doesn't Work
- **Symptom:** User sees verification code input, but code from email doesn't work
- **Possible causes:**
  - Code expired
  - Wrong code entered
  - Supabase auth configuration issue

---

## 🔍 Quick Checks

### 1. Check Supabase Auth Settings

**Go to Supabase Dashboard → Settings → Auth:**

- **Is "Enable email confirmations" ON or OFF?**
  - If **OFF**: Users can sign up without email verification
  - If **ON**: Users must verify email before they can log in

### 2. Check SMTP Configuration

**In Coolify → Supabase Service → Environment Variables:**

Verify these exist:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_ADMIN_EMAIL`

**If any are missing, that's the problem!**

### 3. Check SITE_URL

**In Coolify → Supabase Service → Environment Variables:**

- Does `SITE_URL` exist?
- Is it set to your current domain?
- If you changed domains, did you update `SITE_URL`?

### 4. Test Current Signup Flow

1. **Try signing up a NEW user** (different email)
2. **What happens?**
   - Does it show "Check your email" message?
   - Does verification screen appear?
   - Does email arrive?
   - Does link work?

---

## 🚨 Most Likely Issues

### Issue 1: Email Confirmation Was Disabled, Now Enabled

**If you disabled email confirmation to test before:**
- Supabase might have re-enabled it
- Or it was always enabled and you bypassed it somehow

**Fix:**
- Check Supabase Dashboard → Settings → Auth → "Enable email confirmations"
- If you want to disable temporarily: Turn it OFF
- If you want it enabled: Make sure SMTP is configured

### Issue 2: SMTP Settings Lost After Restart

**If Supabase service restarted:**
- Environment variables might not have persisted
- SMTP config might have been lost

**Fix:**
- Re-add SMTP variables in Coolify
- Restart Supabase service
- Test again

### Issue 3: Zoho App Password Expired

**If you're using Zoho SMTP:**
- App Passwords can expire or be revoked
- You might need to generate a new one

**Fix:**
- Go to Zoho → Security → App Passwords
- Generate new App Password
- Update `SMTP_PASS` in Coolify
- Restart Supabase

---

## ✅ Quick Fixes

### Fix 1: Disable Email Confirmation (Temporary)

**If you need users to sign up immediately:**

1. **Supabase Dashboard → Settings → Auth**
2. **Find "Enable email confirmations"**
3. **Turn it OFF**
4. **Save**
5. **Users can now sign up without verification**

**⚠️ Re-enable for production!**

### Fix 2: Use Verification Code Instead of Link

**If email arrives but link doesn't work:**

1. **Check email for 6-digit code**
2. **In the app, enter the code** in verification screen
3. **This works even if link is broken**

### Fix 3: Check What Actually Happened

**Tell me:**
1. **Did the email arrive?** (Yes/No)
2. **If yes, does the link work?** (Yes/No/Not tried)
3. **What error message do you see?** (if any)
4. **Are you trying to sign up a new user or verify an existing one?**

---

## 🎯 What to Check Right Now

1. **Supabase Dashboard → Settings → Auth**
   - Is email confirmation enabled?
   - Are SMTP settings configured?

2. **Coolify → Supabase Service → Environment Variables**
   - Do SMTP variables exist?
   - Does `SITE_URL` exist?

3. **Try signing up a test user**
   - What happens?
   - Does email arrive?
   - What error (if any)?

---

**Let me know what you find and I'll help you fix the specific issue!** 🔧

