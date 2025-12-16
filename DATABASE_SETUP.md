# Database Setup Guide - Step by Step

## Quick Answer

**Yes, you need to place the SQL code in Supabase!** Here's exactly how:

## Step-by-Step Instructions

### 1. Access Supabase SQL Editor

1. Go to your Supabase Dashboard:
   - **Cloud**: https://app.supabase.com
   - **Self-hosted**: Your Supabase instance URL

2. Log in to your project

3. Click **SQL Editor** in the left sidebar (icon looks like a database/terminal)

### 2. Create a New Query

1. Click the **"New Query"** button (or the **+** icon)
2. A new SQL editor window will open

### 3. Copy the SQL Script

**For New Database:**
- Open the file `supabase_setup.sql` in your project
- Select all (Cmd+A / Ctrl+A)
- Copy (Cmd+C / Ctrl+C)

**For Existing Database (Migration):**
- Open the file `migration_add_merch_and_orders.sql`
- Select all and copy

### 4. Paste and Run

1. **Paste** the SQL code into the Supabase SQL Editor (Cmd+V / Ctrl+V)
2. **Review** the code (optional but recommended)
3. Click the **"Run"** button (or press **Ctrl+Enter** / **Cmd+Enter**)

### 5. Verify Success

You should see:
- ✅ **"Success. No rows returned"** message
- Or a success message with execution time

If you see errors:
- Check the error message
- Common issues:
  - Tables already exist (if running setup twice) - this is OK, the script uses `IF NOT EXISTS`
  - Missing permissions - ensure you're logged in as the project owner
  - Syntax errors - double-check you copied the entire file

## What Gets Created

After running the script, you'll have:

### Tables:
- ✅ `profiles` - User profiles
- ✅ `merch_types` - Merchandise types (T-Shirt, Hoodie, etc.)
- ✅ `tracks` - Beats, albums, merch items
- ✅ `cart_items` - Shopping cart
- ✅ `orders` - Customer orders
- ✅ `order_items` - Items in orders
- ✅ `saved_tracks` - User favorites
- ✅ `posts` - Blog posts

### Security:
- ✅ Row Level Security (RLS) enabled
- ✅ Policies for user access control
- ✅ Admin-only access for sensitive operations

### Functions:
- ✅ `generate_order_number()` - Creates unique order numbers
- ✅ `calculate_order_total()` - Calculates order totals
- ✅ Auto-update timestamps

## Next Steps After Running SQL

1. **Create Storage Buckets** (see SETUP.md)
2. **Set Up Admin User**:
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
   ```

3. **Insert Sample Merch Types** (optional):
   - The sample data section in `supabase_setup.sql` is commented out
   - Uncomment it if you want initial merch types

## Troubleshooting

### "Relation already exists" errors
- This is normal if you run the script multiple times
- The script uses `IF NOT EXISTS` so it's safe to run again
- You can ignore these warnings

### "Permission denied" errors
- Make sure you're logged in as the project owner/admin
- Check that you have database write permissions

### "Function already exists" errors
- Similar to tables, functions use `CREATE OR REPLACE`
- These are safe to ignore

## Visual Guide

```
Supabase Dashboard
    ↓
SQL Editor (left sidebar)
    ↓
New Query (+ button)
    ↓
Paste SQL code
    ↓
Click "Run" or Ctrl+Enter
    ↓
✅ Success!
```

## Need Help?

- Check the Supabase documentation: https://supabase.com/docs
- Review the SQL script comments for explanations
- Ensure your Supabase instance is running and accessible

