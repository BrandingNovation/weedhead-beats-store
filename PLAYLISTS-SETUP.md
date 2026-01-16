# Playlists Database Setup

## Quick Setup

Run the SQL file `create-playlists-tables.sql` in your Supabase SQL Editor.

### Steps:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `create-playlists-tables.sql`
5. Click **Run** (or press Cmd/Ctrl + Enter)

### What This Creates:

- **`playlists` table**: Stores user playlists with name, description, and privacy settings
- **`playlist_tracks` table**: Junction table linking playlists to tracks with position ordering
- **Indexes**: For fast queries on user_id, playlist_id, and track_id
- **Row Level Security (RLS)**: Policies ensuring users can only manage their own playlists
- **Triggers**: Auto-updates `updated_at` timestamp when playlists are modified

### Features Enabled:

✅ Create playlists  
✅ Add tracks to playlists  
✅ Remove tracks from playlists  
✅ Delete playlists  
✅ View own playlists  
✅ View public playlists (if implemented)  
✅ Track ordering within playlists  

### Testing:

After running the SQL:
1. Sign in to the app
2. Click on any beat card
3. Look for the Music icon button (Add to Playlist)
4. Create a new playlist or add to existing one
5. Navigate to "My Playlists" from the user menu
