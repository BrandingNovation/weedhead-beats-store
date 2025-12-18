# How to Get Your Gemini API Key

## 🎯 Quick Steps

### Step 1: Go to Google AI Studio

1. **Visit:** https://aistudio.google.com/app/apikey
2. **Or go to:** https://makersuite.google.com/app/apikey

### Step 2: Sign In

1. **Sign in** with your Google account
2. **Accept terms** if prompted

### Step 3: Create API Key

1. **Click "Create API Key"** or **"Get API Key"** button
2. **Select a Google Cloud project:**
   - Use existing project, OR
   - Create new project (recommended: "Weedhead Beats")
3. **API key will be generated** (starts with `AIza...`)

### Step 4: Copy the Key

1. **Copy the API key** (you'll see it on screen)
2. **Save it somewhere safe** (you can view it again later)

---

## ✅ Add to Coolify

1. **Go to Coolify → Your App → Environment Variables**
2. **Add Variable:**
   - **Name:** `VITE_API_KEY`
   - **Value:** `AIza...` (your Gemini API key)
   - ✅ Available at Buildtime
   - ✅ Available at Runtime
3. **Save**
4. **Redeploy** your app

---

## 🔍 Alternative: Google Cloud Console

**If AI Studio doesn't work:**

1. **Go to:** https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable Gemini API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Generative Language API"
   - Click "Enable"
4. **Create API Key:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the key

---

## 📋 Quick Checklist

- [ ] Went to https://aistudio.google.com/app/apikey
- [ ] Signed in with Google account
- [ ] Created API key
- [ ] Copied the key (starts with `AIza...`)
- [ ] Added to Coolify as `VITE_API_KEY`
- [ ] Checked both boxes (Buildtime & Runtime)
- [ ] Redeployed app

---

## ⚠️ Important Notes

- **Free tier available** - Google provides free API credits
- **Key starts with `AIza...`** - That's how you know it's correct
- **Keep it secret** - Don't share your API key publicly
- **Can regenerate** - If lost, you can create a new one

---

## 🎯 After Adding

1. **Redeploy** your app in Coolify
2. **AI features will work:**
   - AI Studio Concierge
   - AI Blog Summary
   - AI Content Generation

---

**Get your key from https://aistudio.google.com/app/apikey, then add it to Coolify!** 🚀


