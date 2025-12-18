# 🎵 Stems Download Setup Guide

This guide explains how to add and manage downloadable stems (ZIP files) for your beats.

---

## ✨ What Are Stems?

**Stems** are individual audio files for each element of a beat (drums, melody, bass, vocals, etc.) packaged in a ZIP file. They're used by producers who want to:
- Remix the beat
- Adjust individual elements
- Create new versions
- Mix and master independently

---

## 🚀 Setup Steps

### Step 1: Run the Database Migration

**In Supabase SQL Editor**, run:

```sql
-- File: migration_add_stems.sql
```

This adds the `stems_url` column to the `tracks` table.

### Step 2: Create Storage Bucket (if needed)

Stems are uploaded to the same `audio` bucket as audio files:

1. **Go to Supabase Dashboard → Storage**
2. **Check if `audio` bucket exists**
3. **If not, create it:**
   - Name: `audio`
   - Public: ✅ (checked)
   - Allowed MIME types: `application/zip`, `audio/*`
   - File size limit: `100MB` (or as needed)

### Step 3: Upload Stems via Admin Dashboard

1. **Log in as Admin**
2. **Go to Dashboard → Upload Track**
3. **Fill in track details** (title, BPM, key, etc.)
4. **Upload Cover Image** (required)
5. **Upload Audio File** (required)
6. **Upload Stems (ZIP File)** - Optional
   - Click "Stems (ZIP File) - Optional"
   - Select your ZIP file
   - File will be uploaded to Supabase Storage

### Step 4: Verify Upload

After uploading, the stems will be:
- ✅ Stored in Supabase Storage (`audio` bucket)
- ✅ URL saved in database (`stems_url` column)
- ✅ Available for download in checkout (Premium/Unlimited licenses only)

---

## 📦 Stems File Requirements

### Format
- **Container:** ZIP file
- **Contents:** Individual WAV or MP3 files (one per stem)
- **Naming:** Descriptive names (e.g., `drums.wav`, `melody.wav`, `bass.wav`)

### File Size
- **Recommended:** 20-50MB
- **Maximum:** 100MB (adjustable in Supabase Storage settings)

### Contents
Typical stems include:
- Drums
- Melody/Lead
- Bass
- Vocals (if applicable)
- Percussion
- FX/Ambience

---

## 💰 License Availability

Stems are available for download **only** with these licenses:

1. **Premium Lease** ($49.99)
   - Includes: MP3 + WAV + **Trackout Stems**

2. **Unlimited** ($199.99)
   - Includes: MP3 + WAV + **Stems**

**Basic License** does **NOT** include stems.

---

## 🛒 How Customers Download Stems

1. **Customer purchases** a beat with Premium Lease or Unlimited license
2. **After payment**, they see the checkout confirmation screen
3. **In "Digital Downloads" section**, they'll see:
   - **Audio** download button (for MP3/WAV)
   - **Stems (ZIP)** download button (if stems are available and license includes them)

---

## 🔧 Admin Management

### Adding Stems to Existing Tracks

1. **Go to Dashboard → Inventory**
2. **Click "Edit"** on the track
3. **Scroll to "Stems (ZIP File)"** section
4. **Select ZIP file** and upload
5. **Click "Update Track"**

### Removing Stems

1. **Edit the track**
2. **Delete the stems file** from Supabase Storage (optional)
3. **Update track** - stems field will be cleared

---

## 📝 Notes

- **Stems are optional** - tracks can exist without stems
- **Only Premium/Unlimited licenses** get stems access
- **Stems are stored in Supabase Storage** - not in the database
- **File size matters** - keep ZIP files under 100MB for best performance
- **ZIP format required** - individual files won't work, must be zipped

---

## 🆘 Troubleshooting

### Stems not showing in checkout?

1. **Check license type** - Only Premium Lease and Unlimited show stems
2. **Verify stems_url exists** - Check database: `SELECT stems_url FROM tracks WHERE id = 'your-track-id'`
3. **Check file exists** - Verify ZIP file is in Supabase Storage `audio` bucket
4. **Check RLS policies** - Ensure `audio` bucket allows public read access

### Upload fails?

1. **Check file size** - Must be under bucket limit (default 100MB)
2. **Check file format** - Must be `.zip` file
3. **Check storage bucket** - `audio` bucket must exist and be public
4. **Check admin permissions** - Must be logged in as admin

---

**That's it! Your stems download feature is ready to use.** 🎉


