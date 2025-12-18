# Add Zoho SMTP Variables to Coolify

## 📋 Exact Variables to Add

Go to **Coolify → Your Supabase Service → Environment Variables** and add these:

### Variable 1:
- **Name:** `SMTP_ADMIN_EMAIL`
- **Value:** `your-email@zoho.com` (replace with your actual Zoho email)
- ✅ Available at Buildtime
- ✅ Available at Runtime

### Variable 2:
- **Name:** `SMTP_HOST`
- **Value:** `smtp.zoho.com`
- ✅ Available at Buildtime
- ✅ Available at Runtime

### Variable 3:
- **Name:** `SMTP_PORT`
- **Value:** `587`
- ✅ Available at Buildtime
- ✅ Available at Runtime

### Variable 4:
- **Name:** `SMTP_USER`
- **Value:** `your-email@zoho.com` (replace with your actual Zoho email)
- ✅ Available at Buildtime
- ✅ Available at Runtime

### Variable 5:
- **Name:** `SMTP_PASS`
- **Value:** `ZsEXHwjniNtw`
- ✅ Available at Buildtime
- ✅ Available at Runtime

### Variable 6:
- **Name:** `SMTP_SENDER_NAME`
- **Value:** `Weedhead Beats`
- ✅ Available at Buildtime
- ✅ Available at Runtime

---

## ⚠️ Important

**Replace `your-email@zoho.com` with your actual Zoho email address!**

Examples:
- `info@brandingnovations.com`
- `support@brandingnovations.com`
- Or whatever your Zoho email is

---

## ✅ After Adding

1. **Save all variables**
2. **Restart your Supabase service** in Coolify
3. **Test by signing up** a new user
4. **Check email** for verification link

---

## 🔍 Where to Add

1. **In Coolify Dashboard**
2. **Find your Supabase service** (not your app, the Supabase service itself)
3. **Click on it**
4. **Go to Environment Variables**
5. **Add each variable above**

---

**After adding these and restarting Supabase, verification emails will work!** 📧


