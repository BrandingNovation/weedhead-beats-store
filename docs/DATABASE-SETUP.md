# WeedheadBeats Database Setup Guide

## Problem
Tracks are uploading to storage but not saving to the database.

## Solution
Use the `TrackUploaderWithDatabase` component that handles both upload AND database save.

---

## Step 1: Create Supabase Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at DESC);

-- Enable Row Level Security
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tracks
CREATE POLICY "Users can view own tracks"
  ON tracks FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own tracks
CREATE POLICY "Users can insert own tracks"
  ON tracks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tracks
CREATE POLICY "Users can update own tracks"
  ON tracks FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own tracks
CREATE POLICY "Users can delete own tracks"
  ON tracks FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Step 2: Install Component

Copy `TrackUploaderWithDatabase.tsx` to your WeedheadBeats project:

```bash
cp weedheadbeats-integration-package/components/TrackUploaderWithDatabase.tsx \
   /path/to/weedheadbeats/components/
```

---

## Step 3: Use the Component

Replace your existing track uploader with the database-enabled version:

```typescript
import { TrackUploaderWithDatabase } from '@/components/TrackUploaderWithDatabase';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth'; // Your auth hook

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const UploadPage = () => {
  const { user } = useAuth(); // Get current user

  const handleUploadComplete = (track: TrackData) => {
    console.log('Track uploaded and saved:', track);
    // Optionally refresh your tracks list
    // fetchTracks();
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
    alert('Upload failed: ' + error.message);
  };

  if (!user) {
    return <div>Please log in to upload tracks</div>;
  }

  return (
    <div>
      <h1>Upload Track</h1>
      <TrackUploaderWithDatabase
        supabaseClient={supabase}
        userId={user.id}
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        tableName="tracks"
      />
    </div>
  );
};
```

---

## Step 4: Fetch Tracks from Database

Update your tracks list to fetch from Supabase:

```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const TracksList = () => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTracks = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTracks(data || []);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [user]);

  if (loading) return <div>Loading tracks...</div>;

  return (
    <div>
      <h2>Your Tracks ({tracks.length})</h2>
      {tracks.map(track => (
        <div key={track.id}>
          <h3>{track.title}</h3>
          <audio src={track.url} controls />
        </div>
      ))}
    </div>
  );
};
```

---

## Troubleshooting

### Error: "Database save failed"
- Check that the table exists in Supabase
- Verify RLS policies allow the user to insert
- Check browser console for detailed error

### Error: "Upload failed"
- Verify API key is set: `NEXT_PUBLIC_STORAGE_API_KEY`
- Check network tab for API response
- Verify CORS is configured on the server

### Tracks not showing up
- Check that `user_id` matches the authenticated user
- Verify RLS policies allow SELECT
- Check Supabase logs for errors

---

## Alternative: Update Existing TrackUploader

If you're already using `TrackUploader`, you can add database save in the callback:

```typescript
<TrackUploader
  onUploadComplete={async (track) => {
    // Upload is done, now save to database
    const { error } = await supabase
      .from('tracks')
      .insert({
        title: track.title,
        url: track.url,
        file_name: track.fileName,
        file_size: track.size,
        file_type: track.type,
        uploaded_at: track.uploadedAt,
        user_id: user.id
      });

    if (error) {
      console.error('Database save failed:', error);
      alert('Track uploaded but failed to save to database');
    } else {
      console.log('Track saved to database');
    }
  }}
/>
```
