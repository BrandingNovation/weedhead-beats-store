# ✅ Check SITE_URL for Signup Emails

Since your SMTP variables are all configured, let's check `SITE_URL`.

---

## 🔍 What to Check

### In Coolify → Your Supabase Service → Environment Variables

**Look for:**
- `SITE_URL` variable

**If it exists:**
- What value does it have?
- Is it your current domain/URL?

**If it doesn't exist:**
- That's likely the problem!
- Add it (see below)

---

## ✅ Add SITE_URL (If Missing)

### Step 1: Add the Variable

1. **Go to Coolify → Your Supabase Service → Environment Variables**
2. **Click "Add Variable"**
3. **Add:**
   - **Name:** `SITE_URL`
   - **Value:** `https://bowk8k0cww4gkck04wsc4g4w.65.21.109.247.sslip.io`
     - Or your actual domain: `https://weedheadbeats.com`
   - ✅ **Available at Buildtime** (checked)
   - ✅ **Available at Runtime** (checked)
4. **Save**

### Step 2: Restart Supabase

**IMPORTANT:** After adding `SITE_URL`, you MUST restart Supabase:

1. **Go to Coolify → Your Supabase Service**
2. **Click "Restart" or "Redeploy"**
3. **Wait for it to fully restart**

### Step 3: Test

1. **Try signing up a new user**
2. **Check email** (including spam)
3. **Click the verification link** or **enter the code**

---

## 🧪 Test Signup Email

### What Should Happen:

1. **User signs up** → Form submitted
2. **App shows:** "Check your email" or verification code screen
3. **Email arrives** within 1-2 minutes
4. **Email contains:**
   - Verification link (should point to your app URL)
   - 6-digit code
5. **User clicks link OR enters code** → Account verified

---

## 🚨 If Email Still Doesn't Arrive

### Check These:

1. **Supabase Logs:**
   - Coolify → Supabase Service → Logs
   - Look for SMTP errors
   - Look for email sending errors

2. **Email Spam Folder:**
   - Check spam/junk folder
   - Check "Promotions" tab (Gmail)

3. **Zoho Account:**
   - Check if App Password is still active
   - Check Zoho email logs
   - Verify email address is correct

4. **Test SMTP Connection:**
   - Supabase Dashboard → Settings → Auth → SMTP Settings
   - Click "Test Connection"
   - Should show "Connection successful"

---

## 💡 Quick Test: Use Verification Code

**If email arrives but link doesn't work:**

1. **Check email for 6-digit code**
2. **In the app**, enter the code in verification screen
3. **This works even if link is broken**

---

**Check if `SITE_URL` exists in your Supabase service variables!** 🔍

