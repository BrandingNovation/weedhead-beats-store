# 🚀 Complete Integration Guide

## 📋 Table of Contents

1. [Database Setup](#database-setup)
2. [Component Integration](#component-integration)
3. [Service Integration](#service-integration)
4. [Example Screens](#example-screens)
5. [Testing Checklist](#testing-checklist)

---

## 🗄️ Database Setup

### Step 1: Run SQL Schemas

Execute these SQL commands in your Supabase SQL Editor:

```sql
-- Follows table for social features
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Activity feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'purchase', 'upload')),
  track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_feed(type);

-- RLS Policies
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Follows policies
CREATE POLICY "Users can view all follows"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own follows"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Activity feed policies
CREATE POLICY "Users can view activity feed"
  ON activity_feed FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own activities"
  ON activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 🧩 Component Integration

### 1. Advanced Search

**Location**: Add to track browsing/list screens

```tsx
import AdvancedSearch from './components/AdvancedSearch';
import { useState } from 'react';
import { Track } from './types';

function TrackBrowserScreen() {
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);

  return (
    <div className="p-6 space-y-6">
      <AdvancedSearch
        tracks={allTracks}
        onSearch={(results) => setFilteredTracks(results)}
        onSelectTrack={(track) => {
          // Handle track selection (play, navigate, etc.)
          console.log('Selected track:', track);
        }}
      />
      
      {/* Display filtered tracks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredTracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}
```

### 2. Recommendations

**Location**: Add to home/dashboard screens

```tsx
import Recommendations from './components/Recommendations';
import { useState, useEffect } from 'react';
import { Track } from './types';

function HomeScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>();
  const [listeningHistory, setListeningHistory] = useState<any[]>([]);

  // Load listening history from context or Supabase
  useEffect(() => {
    // Load from ListeningHistoryContext or Supabase
    // Example:
    // const history = useListeningHistory();
    // setListeningHistory(history);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Discover</h1>
      
      <Recommendations
        tracks={tracks}
        listeningHistory={listeningHistory}
        currentTrack={currentTrack}
        onSelectTrack={(track) => {
          setCurrentTrack(track);
          // Play track
        }}
      />
    </div>
  );
}
```

### 3. Social Features

**Location**: Add to track detail or producer profile pages

```tsx
import SocialFeatures from './components/SocialFeatures';
import { Track } from './types';
import { supabase } from './lib/supabaseClient';
import { useState, useEffect } from 'react';

function TrackDetailScreen({ trackId }: { trackId: string }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [producerId, setProducerId] = useState<string | undefined>();

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id);
    });

    // Load track and get producer ID
    // setProducerId(track.userId);
  }, [trackId]);

  if (!track) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Track details */}
      <div>
        <h1>{track.title}</h1>
        <p>{track.producer}</p>
      </div>

      {/* Social Features */}
      <SocialFeatures
        currentUserId={currentUserId}
        producerId={producerId}
        track={track}
      />
    </div>
  );
}
```

### 4. Analytics Export

**Location**: Add to admin analytics screens

```tsx
import AnalyticsExport from './components/AnalyticsExport';
import { useState, useEffect } from 'react';
import { useOrder } from './context/OrderContext';

function AdminAnalyticsScreen() {
  const { orders, totalRevenue, todayOrders } = useOrder();
  const [analyticsData, setAnalyticsData] = useState<any>({});

  useEffect(() => {
    // Prepare analytics data
    const revenueByPeriod = calculateRevenueByPeriod(orders);
    const salesByTrack = calculateSalesByTrack(orders);

    setAnalyticsData({
      orders: orders,
      revenue: {
        total: totalRevenue,
        byPeriod: revenueByPeriod,
      },
      sales: {
        total: orders.length,
        byTrack: salesByTrack,
      },
    });
  }, [orders, totalRevenue]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <AnalyticsExport
          data={analyticsData}
          filename={`analytics-${new Date().toISOString().split('T')[0]}`}
        />
      </div>
      
      {/* Analytics charts and stats */}
    </div>
  );
}
```

### 5. Audio Player with Tempo

**Location**: Replace existing audio players

```tsx
import AudioPlayerWithTempo from './components/AudioPlayerWithTempo';
import { Track } from './types';

function TrackPlayer({ track }: { track: Track }) {
  return (
    <div className="p-4">
      <AudioPlayerWithTempo
        audioUrl={track.url}
        title={track.title}
        artist={track.producer}
        onEnded={() => {
          // Handle track end
          console.log('Track ended');
        }}
        onTimeUpdate={(time) => {
          // Update current time if needed
          console.log('Current time:', time);
        }}
        autoPlay={false}
      />
    </div>
  );
}
```

### 6. Waveform Visualizer

**Location**: Integrate with audio players

```tsx
import WaveformVisualizer from './components/WaveformVisualizer';
import { useState } from 'react';

function AudioPlayerWithWaveform({ audioUrl }: { audioUrl: string }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-4">
      <WaveformVisualizer
        audioUrl={audioUrl}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onSeek={(time) => {
          setCurrentTime(time);
          // Seek audio element
        }}
        onPlayPause={() => {
          setIsPlaying(!isPlaying);
          // Toggle audio playback
        }}
      />
    </div>
  );
}
```

---

## 🔧 Service Integration

### Recommendation Service

```tsx
import { recommendationService } from './services/recommendationService';
import { Track } from './types';

// Get recommendations
const recommendations = recommendationService.getRecommendations(
  allTracks,
  listeningHistory,
  userPreferences
);

// Get similar tracks
const similarTracks = recommendationService.getSimilarTracks(
  currentTrack,
  allTracks,
  10
);
```

### Integration Service

```tsx
import { integrationService } from './services/integrationService';

// Get streaming links
const links = integrationService.getStreamingLinks('Track Title', 'Artist Name');

// Get share links
const shareLinks = integrationService.getShareLinks(
  'Track Title',
  'https://example.com/track/123',
  'Artist Name'
);

// Create Spotify embed
const spotifyEmbed = integrationService.createSpotifyEmbed('trackId');
```

### Analytics Export Service

```tsx
import { analyticsExportService } from './services/analyticsExportService';

// Export to CSV
analyticsExportService.exportToCSV(analyticsData, 'monthly-report');

// Export to PDF
analyticsExportService.exportToPDF(analyticsData, 'monthly-report');
```

---

## 📱 Example Complete Screen

### Track Discovery Screen

```tsx
import React, { useState, useEffect } from 'react';
import AdvancedSearch from '../components/AdvancedSearch';
import Recommendations from '../components/Recommendations';
import SocialFeatures from '../components/SocialFeatures';
import AudioPlayerWithTempo from '../components/AudioPlayerWithTempo';
import { Track } from '../types';
import { supabase } from '../lib/supabaseClient';

function TrackDiscoveryScreen() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>();
  const [listeningHistory, setListeningHistory] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  useEffect(() => {
    // Load tracks
    loadTracks();
    
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id);
    });

    // Load listening history
    loadListeningHistory();
  }, []);

  const loadTracks = async () => {
    const { data } = await supabase.from('tracks').select('*');
    if (data) setTracks(data);
  };

  const loadListeningHistory = async () => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from('listening_history')
      .select('*')
      .eq('user_id', currentUserId)
      .order('played_at', { ascending: false })
      .limit(100);
    if (data) setListeningHistory(data);
  };

  return (
    <div className="min-h-screen bg-[#221010] p-6 space-y-8">
      {/* Search */}
      <AdvancedSearch
        tracks={tracks}
        onSearch={setFilteredTracks}
        onSelectTrack={setCurrentTrack}
      />

      {/* Recommendations */}
      <Recommendations
        tracks={tracks}
        listeningHistory={listeningHistory}
        currentTrack={currentTrack}
        onSelectTrack={setCurrentTrack}
      />

      {/* Filtered Results */}
      {filteredTracks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onClick={() => setCurrentTrack(track)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Audio Player */}
      {currentTrack && (
        <div className="sticky bottom-0 bg-surface border-t border-white/10 p-4">
          <AudioPlayerWithTempo
            audioUrl={currentTrack.url}
            title={currentTrack.title}
            artist={currentTrack.producer}
            onEnded={() => setCurrentTrack(undefined)}
          />
        </div>
      )}

      {/* Social Features */}
      {currentTrack && (
        <SocialFeatures
          currentUserId={currentUserId}
          producerId={currentTrack.userId}
          track={currentTrack}
        />
      )}
    </div>
  );
}

export default TrackDiscoveryScreen;
```

---

## ✅ Testing Checklist

### Advanced Search
- [ ] Search bar appears
- [ ] Autocomplete shows suggestions
- [ ] Filters work (genre, mood, BPM, etc.)
- [ ] Saved searches save/load
- [ ] Recent searches display
- [ ] Clear filters works

### Recommendations
- [ ] Recommendations display
- [ ] Similar tracks show
- [ ] Clicking track selects it
- [ ] Empty state shows when no history

### Social Features
- [ ] Follow button works
- [ ] Follower count updates
- [ ] Activity feed loads
- [ ] Share buttons work
- [ ] Supabase integration works

### Analytics Export
- [ ] CSV export downloads
- [ ] PDF export downloads
- [ ] Data formatted correctly
- [ ] File names correct

### Audio Player
- [ ] Player displays
- [ ] Play/pause works
- [ ] Speed control works
- [ ] Pitch shift works
- [ ] Volume control works
- [ ] Waveform displays

---

## 🐛 Troubleshooting

### Components not loading
- Check imports are correct
- Verify component files exist
- Check for TypeScript errors

### Database errors
- Verify SQL schemas are run
- Check RLS policies
- Verify table names match

### Build errors
- Run `npm install`
- Check for missing dependencies
- Verify TypeScript types

---

## 📚 Next Steps

1. **Run Database Schemas**: Execute SQL in Supabase
2. **Integrate Components**: Add to appropriate screens
3. **Test Features**: Use testing checklist
4. **Configure OAuth**: Set up Supabase OAuth providers
5. **Deploy**: Deploy to production

---

**Status**: ✅ **INTEGRATION GUIDE COMPLETE**
