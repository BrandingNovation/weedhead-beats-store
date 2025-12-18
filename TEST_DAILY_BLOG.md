# How to Test the Daily Blog Post Script

## 🧪 Quick Test Guide

### Step 1: Make sure you have environment variables

The script needs these to work. Check if you have a `.env` file in the project root:

```bash
# From project root
cat .env
```

You should see:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_API_KEY=AIzaSy...
```

**If you don't have a `.env` file**, create one:

```bash
# From project root
nano .env
```

Add these lines (replace with your actual values):
```
VITE_SUPABASE_URL=https://supabase.brandingnovations.com
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_KEY=AIzaSyBxmaE_J4wlwKsyRN0y24OMk8NLJd7EgYY
```

Save and exit (Ctrl+X, then Y, then Enter).

---

### Step 2: Test the script

**From the project root directory**, run:

```bash
node scripts/daily-blog-post.js
```

**What to expect:**
- Script will start generating content
- You'll see progress messages
- It will create a blog post in Supabase
- You'll see a success message at the end

---

### Step 3: Check if it worked

**Option A: Check Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Go to **Table Editor** → **posts** table
3. Look for a new post with today's date
4. Check if it has:
   - ✅ Title
   - ✅ Content
   - ✅ Image URL
   - ✅ `is_ai_generated: true`

**Option B: Check your website**
1. Go to your website
2. Navigate to the **Blog** section
3. Look for the new post at the top

---

## 🐛 Troubleshooting

### Error: "Missing Supabase credentials"

**Fix**: Make sure your `.env` file exists and has the correct values.

```bash
# Check if .env exists
ls -la .env

# If it doesn't exist, create it (see Step 1 above)
```

### Error: "Missing Gemini API key"

**Fix**: Add `VITE_API_KEY` to your `.env` file:

```bash
echo 'VITE_API_KEY=AIzaSyBxmaE_J4wlwKsyRN0y24OMk8NLJd7EgYY' >> .env
```

### Error: "Cannot find module"

**Fix**: Install dependencies first:

```bash
npm install
```

### Error: "Model not found" or 404 errors

**Fix**: The script tries multiple models. If all fail:
- Check your Gemini API key is valid
- Make sure you have a paid account (for premium models)
- Wait a moment and try again (rate limits)

### Script runs but no post appears

**Check**:
1. Look at the script output for errors
2. Check Supabase Dashboard → Logs for errors
3. Check if RLS policies allow inserts
4. Check if `posts` table exists

---

## ✅ Success Checklist

After running the script, you should see:

- [ ] Script completes without errors
- [ ] Success message: "✨ Daily blog post created successfully!"
- [ ] Post appears in Supabase `posts` table
- [ ] Post has title, content, and image
- [ ] Post appears on your website

---

## 🎯 Test with Custom Topic

You can test with a specific topic:

```bash
node scripts/daily-blog-post.js "Trap Beats"
```

Or:

```bash
node scripts/daily-blog-post.js "FL Studio Tips"
```

---

## 📝 Example Output

When it works, you'll see something like:

```
🚀 Starting daily blog post generation...

📝 Step 1: Generating blog content...
   Trying model: gemini-2.5-pro...
   ✅ Successfully generated content with gemini-2.5-pro
   ✅ Title: How to Make Trap Beats Like a Pro in 2024
   ✅ Content length: 2847 characters

🖼️  Step 2: Generating blog image...
   ✅ Image uploaded to Storage: https://...

💾 Step 3: Saving to Supabase...
   ✅ Blog post saved successfully!
   📄 Post ID: abc123-def456-...
   🔗 Slug: how-to-make-trap-beats-like-a-pro-in-2024

✨ Daily blog post created successfully!
```

---

## 🔄 Run It Again

If you want to test multiple times:

```bash
# Run again with different topic
node scripts/daily-blog-post.js "Music Production"
```

**Note**: Each run creates a new post. You can delete test posts from the admin dashboard if needed.

---

## 📞 Need Help?

If the script fails:
1. Check the error message
2. Verify all environment variables are set
3. Check Supabase connection
4. Check Gemini API key is valid
5. Look at the troubleshooting section above

