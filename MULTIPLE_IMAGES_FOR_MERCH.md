# Multiple Product Images for Merchandise

## ✅ What's Been Added

You can now upload **multiple product images** for merchandise items! 

### How It Works

1. **When Category = "Merchandise"**: The form shows a "Product Images" field that accepts multiple files
2. **First Image = Cover**: The first image you upload automatically becomes the cover/thumbnail
3. **All Images Saved**: All images are uploaded to Supabase Storage and saved in the `product_images` JSONB field
4. **Image Gallery**: You can see all uploaded images in a preview grid before submitting

### Database Setup Required

**IMPORTANT**: Run this SQL script in Supabase SQL Editor first:

```sql
-- Add product_images column (JSONB array of image URLs)
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS product_images JSONB DEFAULT '[]'::jsonb;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_tracks_product_images ON tracks USING GIN (product_images) WHERE category = 'merch';
```

The SQL file is saved as: `ADD_MULTIPLE_IMAGES_FOR_MERCH.sql`

### How to Use

1. Go to **Dashboard → Upload Track/Merch**
2. Select **Category: "Merchandise"**
3. You'll see **"Product Images * (Multiple images allowed)"** field
4. Click the file input and **select multiple images** (hold Ctrl/Cmd to select multiple)
5. Images will appear in a preview grid
6. The first image will be marked as "Cover"
7. Click the × button to remove any image
8. Fill in other details (Title, Price, Description)
9. Click **"Upload Track"**

### What Gets Saved

- **Cover Image**: First image in the array (used as thumbnail)
- **Product Images**: All images saved as JSON array: `["url1", "url2", "url3"]`
- **Database Field**: `product_images` (JSONB column)

### Notes

- Images are uploaded to the `covers` Supabase Storage bucket
- Each image gets a unique filename with timestamp
- All images are public URLs
- You can upload as many images as you want (recommended: 3-8 images)

---

**Status**: ✅ Implemented - Just need to run the SQL migration!

