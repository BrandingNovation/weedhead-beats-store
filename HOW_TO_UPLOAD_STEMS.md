# 📦 How to Upload Stems (ZIP Files) for Each Track

This guide shows you exactly where and how to upload stems ZIP files for your beats.

---

## 🎯 Where to Upload Stems

### Step 1: Access Admin Dashboard

1. **Log in** to your Weedhead Beats store
2. **Click your profile/avatar** in the top right
3. **Click "Dashboard"** from the dropdown menu

### Step 2: Navigate to Upload/Edit Section

You have **two options**:

#### Option A: Upload New Track with Stems
1. In Dashboard, click **"Upload Track"** tab (or button)
2. Fill in all track details
3. Scroll down to find **"Stems (ZIP File) - Optional"** field
4. Click the file input and select your ZIP file
5. Click **"Upload Track"**

#### Option B: Add Stems to Existing Track
1. In Dashboard, go to **"Inventory"** tab
2. Find the track you want to add stems to
3. Click **"Edit"** button on that track
4. Scroll down to find **"Stems (ZIP File) - Optional"** field
5. Click the file input and select your ZIP file
6. Click **"Update Track"**

---

## 📍 Exact Location in Form

The stems upload field appears **right after the Audio File field**:

```
┌─────────────────────────────────────┐
│ Cover Image *                        │
│ [Upload Image]                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Audio File                           │
│ [Upload Audio]                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Stems (ZIP File) - Optional  ← HERE! │
│ [Upload ZIP]                        │
└─────────────────────────────────────┘

[Upload Track] or [Update Track]
```

---

## 📋 Step-by-Step Instructions

### For New Tracks:

1. **Go to:** Dashboard → Upload Track tab
2. **Fill in:**
   - Title
   - BPM
   - Key
   - Price
   - Mood
   - Category
   - Description (optional)
   - YouTube URL (optional)
3. **Upload Cover Image** (required)
4. **Upload Audio File** (required)
5. **Upload Stems ZIP** (optional) ← **This is where you add stems!**
6. **Click "Upload Track"**

### For Existing Tracks:

1. **Go to:** Dashboard → Inventory tab
2. **Find your track** in the list
3. **Click "Edit"** button
4. **Scroll down** to the file upload section
5. **Find "Stems (ZIP File) - Optional"** field
6. **Click the file input** and select your ZIP file
7. **Click "Update Track"**

---

## ✅ What Happens After Upload

1. **ZIP file is uploaded** to Supabase Storage (`audio` bucket)
2. **URL is saved** to database (`stems_url` column)
3. **Stems become available** for download in checkout
4. **Only Premium/Unlimited license buyers** can download stems

---

## 🔍 How to Verify Stems Were Uploaded

### Method 1: Check in Dashboard
1. **Edit the track** again
2. **Look at "Stems (ZIP File)" field**
3. **Should show:** "Selected: your-file.zip"

### Method 2: Check in Supabase
1. **Go to Supabase Dashboard → Storage**
2. **Open `audio` bucket**
3. **Look for files** starting with `stems-` prefix

### Method 3: Test Purchase
1. **Add track to cart** with Premium Lease or Unlimited license
2. **Complete checkout**
3. **Check confirmation screen** - should show "Stems (ZIP)" download button

---

## 💡 Tips

- **File naming:** Name your ZIP files descriptively (e.g., `dark-trap-beat-stems.zip`)
- **File size:** Keep under 100MB for best performance
- **Contents:** Make sure ZIP contains individual WAV/MP3 files (not nested folders)
- **Testing:** Always test download after uploading to ensure it works

---

## 🆘 Troubleshooting

### "Stems field not showing?"
- Make sure you're logged in as **admin**
- Check that you're in **Dashboard → Upload Track** or **Inventory → Edit**
- Scroll down past the Audio File field

### "Upload fails?"
- Check file size (must be under 100MB)
- Check file format (must be `.zip`)
- Verify `audio` bucket exists in Supabase Storage
- Check browser console for errors (F12)

### "Stems not showing in checkout?"
- Verify track has `stems_url` in database
- Check that customer purchased **Premium Lease** or **Unlimited** license
- Basic License does NOT include stems

---

**That's it! You can now upload stems for each track in your store.** 🎵


