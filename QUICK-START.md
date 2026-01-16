# 🚀 Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Database Setup (2 minutes)

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database/social-features-schema.sql`
3. Click "Run"

✅ Database tables created!

### Step 2: Install PWA Plugin (Optional - 1 minute)

```bash
npm install vite-plugin-pwa --save-dev
```

✅ PWA features enabled!

### Step 3: Add Components to Your App (2 minutes)

#### Example: Add Search to Track Screen

```tsx
// In your track browsing screen
import AdvancedSearch from './components/AdvancedSearch';

<AdvancedSearch
  tracks={allTracks}
  onSearch={(results) => setFilteredTracks(results)}
/>
```

#### Example: Add Recommendations to Home

```tsx
// In your home screen
import Recommendations from './components/Recommendations';

<Recommendations
  tracks={allTracks}
  listeningHistory={history}
  onSelectTrack={(track) => playTrack(track)}
/>
```

✅ Components integrated!

---

## 📦 Available Components

### Ready to Use
- ✅ `AdvancedSearch` - Search with filters
- ✅ `Recommendations` - AI recommendations
- ✅ `SocialFeatures` - Follow & share
- ✅ `AnalyticsExport` - Export data
- ✅ `AudioPlayerWithTempo` - Audio player
- ✅ `WaveformVisualizer` - Waveform display
- ✅ `SocialLogin` - OAuth login
- ✅ `StreamingLinks` - Platform links

### Services
- ✅ `recommendationService` - Get recommendations
- ✅ `integrationService` - Streaming links
- ✅ `analyticsExportService` - Export data

---

## 🎯 Common Integrations

### Track Discovery Page
```tsx
import AdvancedSearch from './components/AdvancedSearch';
import Recommendations from './components/Recommendations';
```

### Track Detail Page
```tsx
import SocialFeatures from './components/SocialFeatures';
import AudioPlayerWithTempo from './components/AudioPlayerWithTempo';
```

### Admin Dashboard
```tsx
import AnalyticsExport from './components/AnalyticsExport';
```

---

## 📚 Full Documentation

See `INTEGRATION-GUIDE.md` for:
- Complete integration examples
- Database setup details
- Troubleshooting guide
- Testing checklist

---

## ✅ Verification

After setup, verify:
- [ ] Database tables exist in Supabase
- [ ] Components import without errors
- [ ] Build succeeds: `npm run build`
- [ ] Dev server runs: `npm run dev`

---

**You're ready to go!** 🎉
