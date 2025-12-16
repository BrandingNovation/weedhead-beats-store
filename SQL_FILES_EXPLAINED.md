# SQL Files Explained

## Which SQL File Should I Use?

### ✅ `supabase_setup.sql` - **FULL SETUP** (Use This for New Database)

This is the **complete** SQL script that creates everything from scratch:
- All tables (profiles, tracks, posts, merch_types, cart_items, orders, etc.)
- All indexes
- All Row Level Security (RLS) policies
- All functions and triggers
- Storage bucket policies

**Use this if:**
- You're setting up a brand new database
- This is your first time running SQL scripts
- You want everything in one go

**How to use:**
1. Open Supabase SQL Editor
2. Copy entire `supabase_setup.sql` file
3. Paste and run
4. Done! ✅

---

### 🔄 `migration_add_merch_and_orders.sql` - **MIGRATION** (Use This for Existing Database)

This is a **migration script** that adds new features to an existing database:
- Adds 'merch' category to tracks table
- Creates new tables (merch_types, cart_items, orders, order_items, saved_tracks)
- Adds streaming links (spotify_url, apple_music_url, amazon_url)
- Updates existing tables

**Use this if:**
- You already ran `supabase_setup.sql` before
- You have an existing database with tracks/posts
- You want to add the new merch and orders features

**How to use:**
1. Open Supabase SQL Editor
2. Copy entire `migration_add_merch_and_orders.sql` file
3. Paste and run
4. New features added! ✅

---

## Quick Decision Guide

```
Is this your FIRST time setting up the database?
├─ YES → Use supabase_setup.sql (FULL SETUP)
└─ NO  → Use migration_add_merch_and_orders.sql (MIGRATION)
```

## What's Included

### Full Setup (`supabase_setup.sql`) Includes:
- ✅ Profiles table
- ✅ Merch types table
- ✅ Tracks table (with merch support)
- ✅ Cart items table
- ✅ Orders table
- ✅ Order items table
- ✅ Saved tracks table
- ✅ Posts table
- ✅ All RLS policies
- ✅ All functions and triggers
- ✅ Storage policies

### Migration (`migration_add_merch_and_orders.sql`) Adds:
- ✅ Merch category to tracks
- ✅ Streaming links (Spotify, Apple Music, Amazon)
- ✅ Merch types table
- ✅ Cart items table
- ✅ Orders table
- ✅ Order items table
- ✅ Saved tracks table
- ✅ All related policies and indexes

## Safety

Both scripts are safe to run:
- Use `IF NOT EXISTS` - won't break if tables exist
- Use `CREATE OR REPLACE` - safely updates functions
- Use `DROP POLICY IF EXISTS` - safely updates policies

You can run them multiple times without issues!

## Need Help?

1. Check `DATABASE_SETUP.md` for step-by-step instructions
2. Check Supabase logs if you get errors
3. Most errors are harmless (like "already exists")

---

**TL;DR:**
- **New database?** → `supabase_setup.sql`
- **Existing database?** → `migration_add_merch_and_orders.sql`

