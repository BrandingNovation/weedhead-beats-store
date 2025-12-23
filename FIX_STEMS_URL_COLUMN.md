# 🔧 Fix: Missing stems_url Column Error

## Error Message
```
Failed to save track to database: Could not find the 'stems_url' column of 'tracks' in the schema cache
```

## Problem
The `tracks` table is missing the `stems_url` column, which is needed to store ZIP file URLs for downloadable stems.

## ✅ Quick Fix

### Step 1: Run SQL in Supabase

1. **Go to Supabase Dashboard → SQL Editor**
2. **Click "New Query"**
3. **Copy and paste this SQL:**

```sql
-- Add stems_url column to tracks table
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS stems_url TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_tracks_stems_url 
ON tracks(stems_url) 
WHERE stems_url IS NOT NULL;
```

4. **Click "RUN"**

### Step 2: Verify It Worked

Run this to verify:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tracks' 
AND column_name = 'stems_url';
```

**Should show:**
```
column_name | data_type
stems_url   | text
```

### Step 3: Try Uploading Again

After running the SQL:
1. **Refresh your browser page**
2. **Try uploading a track again**
3. **Should work now!**

---

## 📋 Alternative: Use the Migration File

If you prefer, you can run the full migration:

1. **Open `migration_add_stems.sql`** in your project
2. **Copy the entire contents**
3. **Paste into Supabase SQL Editor**
4. **Click "RUN"**

---

## 🔍 Why This Happened

The `stems_url` column was added in a migration file (`migration_add_stems.sql`), but:
- The migration wasn't run in your Supabase database
- Or the column was accidentally dropped
- Or you're using a fresh database that doesn't have it

---

## ✅ After Fixing

Once the column is added:
- ✅ Tracks can be uploaded with stems
- ✅ Stems ZIP files will be saved to database
- ✅ Stems will be available for download in checkout
- ✅ No more "column not found" errors

---

## 🆘 Still Getting Errors?

If you still get errors after adding the column:

1. **Check if column exists:**
   ```sql
   SELECT * FROM information_schema.columns 
   WHERE table_name = 'tracks' AND column_name = 'stems_url';
   ```

2. **If it doesn't exist, run the SQL again**

3. **If it exists but still errors:**
   - Check browser console for detailed error
   - Verify you're connected to the correct Supabase project
   - Try refreshing the page

---

**The SQL fix file is available as `ADD_STEMS_URL_COLUMN_NOW.sql` in the project root.**

