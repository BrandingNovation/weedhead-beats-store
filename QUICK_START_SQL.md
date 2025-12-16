# Quick Start - Which SQL Script to Run?

## ❌ Error: "relation 'tracks' does not exist"

If you see this error, it means you tried to run the **migration script** but your database is **empty**.

## ✅ Solution: Run the FULL Setup Script

You need to run `supabase_setup.sql` first (the complete setup), not the migration script.

---

## Step-by-Step Fix

### 1. Clear the SQL Editor
- Delete the migration script from the editor
- Or create a new query

### 2. Copy the FULL Setup Script
- Open `supabase_setup.sql` file
- Select ALL (Cmd+A / Ctrl+A)
- Copy (Cmd+C / Ctrl+C)

### 3. Paste in Supabase SQL Editor
- Paste into the SQL Editor
- Click **Run** or press **Ctrl+Enter**

### 4. Wait for Success
- You should see: "Success. No rows returned"
- All tables will be created

---

## Why This Happened

The **migration script** (`migration_add_merch_and_orders.sql`) assumes you already have:
- ✅ `tracks` table
- ✅ `profiles` table  
- ✅ `posts` table

But your database is **empty**, so you need the **full setup** first.

---

## After Running Full Setup

Once `supabase_setup.sql` completes successfully:
- ✅ All tables will exist
- ✅ You can then run the migration script if needed (but you won't need to - the full setup already includes everything!)
- ✅ Your database is ready to use

---

## Quick Reference

| Your Situation | Use This Script |
|---------------|----------------|
| **Empty database** (first time) | `supabase_setup.sql` ✅ |
| **Database already has tracks/posts** | `migration_add_merch_and_orders.sql` |

Since you got the error, you're in the first situation → Use `supabase_setup.sql`!

