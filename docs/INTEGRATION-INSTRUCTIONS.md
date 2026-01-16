# WeedheadBeats Storage Integration - Step by Step

## Quick Integration (5 Steps)

### Step 1: Copy Files to Your Project

Copy these files to your WeedheadBeats repository:

```
weedheadbeats-integration-package/
├── utils/
│   └── storageApi.ts          → Copy to: your-project/utils/storageApi.ts
└── components/
    └── TrackUploader.tsx      → Copy to: your-project/components/TrackUploader.tsx (optional)
```

### Step 2: Add Environment Variable

Add to your `.env.local` or `.env` file:

```bash
# For Next.js
NEXT_PUBLIC_STORAGE_API_KEY=10db9c5e773a93769bf8313a90be928af98c17c145db2a58f128bb55031d7438

# For React/Vite
VITE_STORAGE_API_KEY=10db9c5e773a93769bf8313a90be928af98c17c145db2a58f128bb55031d7438

# For Create React App
REACT_APP_STORAGE_API_KEY=10db9c5e773a93769bf8313a90be928af98c17c145db2a58f128bb55031d7438
```

### Step 3: Find Your Track Upload Code

Search for where tracks are currently being saved. Look for:
- `localStorage.setItem('tracks'`
- `FileReader` with `readAsDataURL`
- Code that creates data URLs (`data:audio/...`)

### Step 4: Replace Local Storage with API Upload

**BEFORE (saving to local):**
```typescript
const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const newTrack = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      url: e.target?.result as string, // ❌ Local data URL
    };
    
    // Save to local storage
    const tracks = JSON.parse(localStorage.getItem('tracks') || '[]');
    tracks.push(newTrack);
    localStorage.setItem('tracks', JSON.stringify(tracks));
  };
  reader.readAsDataURL(file);
};
```

**AFTER (uploading to server):**
```typescript
import { uploadTrack } from '@/utils/storageApi';

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  try {
    setUploading(true);
    
    // Upload to Storage Box
    const result = await uploadTrack(file, 'weedheadbeats/tracks');
    
    // Create track with server URL
    const newTrack = {
      id: Date.now().toString(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      url: result.url, // ✅ Server URL
      fileName: result.fileName,
      size: result.size,
      type: result.type,
    };
    
    // Save track metadata (not the file) to your state/database
    addTrack(newTrack); // Your function to add track
    
    setUploading(false);
    alert('Track uploaded successfully!');
  } catch (error) {
    console.error('Upload failed:', error);
    setUploading(false);
    alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};
```

### Step 5: Update Track Display

Make sure your track player uses the server URL:

```typescript
// ✅ Use server URL
<audio src={track.url} controls />

// ❌ Don't use local data URLs
// <audio src={track.url} /> // if track.url starts with "data:"
```

---

## Complete Example Integration

Here's a complete example of a track management component:

```typescript
import { useState } from 'react';
import { uploadTrack, UploadResult } from '@/utils/storageApi';

interface Track {
  id: string;
  title: string;
  url: string;
  fileName: string;
  size: number;
  type: string;
}

export const TrackManager = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Upload to server
      const result: UploadResult = await uploadTrack(file);
      
      // Add to tracks list
      const newTrack: Track = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: result.url,
        fileName: result.fileName,
        size: result.size,
        type: result.type,
      };
      
      setTracks(prev => [...prev, newTrack]);
      setUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
      alert('Upload failed');
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      
      <div>
        {tracks.map(track => (
          <div key={track.id}>
            <p>{track.title}</p>
            <audio src={track.url} controls />
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Migration: Moving Existing Local Tracks to Server

If you have existing tracks saved locally, use this migration function:

```typescript
import { uploadTrack } from '@/utils/storageApi';

export const migrateLocalTracks = async () => {
  const localTracks = JSON.parse(localStorage.getItem('tracks') || '[]');
  const migratedTracks = [];
  
  for (const track of localTracks) {
    // Check if track has a data URL (needs migration)
    if (track.url && track.url.startsWith('data:')) {
      try {
        // Convert data URL to blob
        const response = await fetch(track.url);
        const blob = await response.blob();
        const file = new File([blob], track.title + '.mp3', { type: blob.type });
        
        // Upload to server
        const result = await uploadTrack(file);
        
        // Update track with server URL
        migratedTracks.push({
          ...track,
          url: result.url,
          fileName: result.fileName
        });
      } catch (error) {
        console.error(`Failed to migrate track ${track.id}:`, error);
        migratedTracks.push(track); // Keep original if migration fails
      }
    } else {
      // Already on server, keep as is
      migratedTracks.push(track);
    }
  }
  
  // Save migrated tracks
  localStorage.setItem('tracks', JSON.stringify(migratedTracks));
  return migratedTracks;
};
```

---

## Testing

After integration, test the upload:

1. Select an audio file
2. Check browser console for any errors
3. Verify the track URL starts with `https://` (not `data:`)
4. Play the track to confirm it loads from the server

---

## Troubleshooting

**Error: "API key required"**
- Check that environment variable is set correctly
- Restart your dev server after adding env variable
- Verify the variable name matches your framework (NEXT_PUBLIC_, VITE_, REACT_APP_)

**Error: "File type not allowed"**
- Ensure file is MP3, WAV, OGG, or M4A
- Check file MIME type in browser console

**Error: "Upload failed"**
- Check network tab for API response
- Verify API endpoint is accessible: `https://api.brandingnovations.com/api/storage/upload`
- Check browser console for detailed error

**Tracks still saving locally**
- Make sure you replaced all `localStorage.setItem('tracks'` calls
- Verify you're using `uploadTrack()` instead of `FileReader.readAsDataURL()`

---

## Support

If you need help:
1. Check the integration guide: `WEEDHEADBEATS-STORAGE-INTEGRATION.md`
2. Review the API documentation: `STORAGE-API-INTEGRATION.md`
3. Test the API directly using the test endpoint
