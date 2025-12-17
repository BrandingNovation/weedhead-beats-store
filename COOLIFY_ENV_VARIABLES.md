# How to Fill Out Environment Variables in Coolify

## 📝 Form Fields Explained

### For Each Variable, Fill Out:

1. **Name***: The variable name (must start with `VITE_`)
2. **Value***: The actual value/key
3. **Available at Buildtime**: ✅ CHECKED (needed during build)
4. **Available at Runtime**: ✅ CHECKED (needed when app runs)
5. **Is Literal?**: ❌ Leave UNCHECKED (unless you want to prevent variable substitution)
6. **Is Multiline?**: ❌ Leave UNCHECKED (unless value has multiple lines)

---

## 🔐 Variables to Add (One by One)

### 1. Supabase URL

**Click "New Environment Variable"** and fill:

- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://your-project-id.supabase.co` (get from Supabase Dashboard → Settings → API)
- **Available at Buildtime**: ✅ CHECKED
- **Available at Runtime**: ✅ CHECKED
- **Is Literal?**: ❌ UNCHECKED
- **Is Multiline?**: ❌ UNCHECKED

Click **"Save"**

---

### 2. Supabase Anon Key

**Click "New Environment Variable"** again and fill:

- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (full key from Supabase)
- **Available at Buildtime**: ✅ CHECKED
- **Available at Runtime**: ✅ CHECKED
- **Is Literal?**: ❌ UNCHECKED
- **Is Multiline?**: ❌ UNCHECKED

Click **"Save"**

---

### 3. Gemini API Key (Optional - for AI features)

**Click "New Environment Variable"** and fill:

- **Name**: `VITE_API_KEY`
- **Value**: `your-gemini-api-key-here`
- **Available at Buildtime**: ✅ CHECKED
- **Available at Runtime**: ✅ CHECKED
- **Is Literal?**: ❌ UNCHECKED
- **Is Multiline?**: ❌ UNCHECKED

Click **"Save"**

---

### 4. Stripe Publishable Key (Optional - for payments)

**Click "New Environment Variable"** and fill:

- **Name**: `VITE_STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_live_xxxxx` (use live key for production)
- **Available at Buildtime**: ✅ CHECKED
- **Available at Runtime**: ✅ CHECKED
- **Is Literal?**: ❌ UNCHECKED
- **Is Multiline?**: ❌ UNCHECKED

Click **"Save"**

---

### 5. PayPal Client ID (Optional - for payments)

**Click "New Environment Variable"** and fill:

- **Name**: `VITE_PAYPAL_CLIENT_ID`
- **Value**: `your-paypal-client-id`
- **Available at Buildtime**: ✅ CHECKED
- **Available at Runtime**: ✅ CHECKED
- **Is Literal?**: ❌ UNCHECKED
- **Is Multiline?**: ❌ UNCHECKED

Click **"Save"**

---

## 🎯 Quick Checklist

For EACH variable:
- [ ] Name starts with `VITE_`
- [ ] Value is correct (no extra spaces)
- [ ] Available at Buildtime: ✅ CHECKED
- [ ] Available at Runtime: ✅ CHECKED
- [ ] Is Literal?: ❌ UNCHECKED
- [ ] Is Multiline?: ❌ UNCHECKED
- [ ] Clicked "Save"

---

## 📍 Where to Get Values

### Supabase Keys:
1. Go to: Supabase Dashboard
2. Select your project
3. Settings → API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Gemini API Key:
- https://makersuite.google.com/app/apikey

### Stripe Key:
- https://dashboard.stripe.com/apikeys (use **Publishable key**)

### PayPal Client ID:
- https://developer.paypal.com/dashboard

---

## ⚠️ Important Notes

1. **VITE_ Prefix Required**: All variables MUST start with `VITE_` for Vite to expose them
2. **No Spaces**: Don't add spaces around the `=` in the value
3. **No Quotes**: Don't wrap values in quotes
4. **Both Checkboxes**: Check both "Buildtime" and "Runtime" for all variables
5. **Case Sensitive**: Variable names are case-sensitive

---

## ✅ After Adding All Variables

1. Save all variables
2. Redeploy your application (or it will auto-deploy)
3. Test the connection by visiting your site
4. Check browser console for any errors

---

## 🚨 Common Mistakes

❌ **Wrong**: `SUPABASE_URL` (missing VITE_)
✅ **Correct**: `VITE_SUPABASE_URL`

❌ **Wrong**: `VITE_SUPABASE_URL = https://...` (space around =)
✅ **Correct**: `VITE_SUPABASE_URL` with value `https://...`

❌ **Wrong**: Value wrapped in quotes `"https://..."`
✅ **Correct**: Value without quotes `https://...`

---

You're all set! Add each variable one by one, and your app will connect to Supabase automatically! 🚀

