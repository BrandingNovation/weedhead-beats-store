# 🗄️ Next Steps: Database Setup for Social Features

## ✅ Phase 4-6 Deployment Complete

All Phase 4-6 features have been:
- ✅ Tested in browser
- ✅ Committed to git
- ✅ Pushed to GitHub
- ✅ Deployed to Coolify

---

## 🎯 Next Step: Database Setup

The **Social Features** component requires database tables to function. Follow these steps:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Run the Social Features Schema

Copy and paste the entire contents of `database/social-features-schema.sql` into the SQL Editor, or use this:

```sql
-- Social Features Database Schema
-- Run this in your Supabase SQL Editor

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

-- Enable RLS
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

-- Helper function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM follows
  WHERE following_id = user_id;
$$ LANGUAGE SQL STABLE;

-- Helper function to get following count
CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM follows
  WHERE follower_id = user_id;
$$ LANGUAGE SQL STABLE;

-- Helper function to check if user is following
CREATE OR REPLACE FUNCTION is_following(follower_id UUID, following_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1
    FROM follows
    WHERE follows.follower_id = is_following.follower_id
      AND follows.following_id = is_following.following_id
  );
$$ LANGUAGE SQL STABLE;
```

### Step 3: Execute the Query

1. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for execution to complete
3. Verify success message: "Success. No rows returned"

### Step 4: Verify Tables Created

1. Go to **Table Editor** in Supabase
2. Verify these tables exist:
   - ✅ `follows`
   - ✅ `activity_feed`
3. Check that RLS is enabled (should show a lock icon)

---

## ✅ Verification Checklist

After running the SQL:

- [ ] `follows` table created
- [ ] `activity_feed` table created
- [ ] Indexes created (5 indexes)
- [ ] RLS policies created (5 policies)
- [ ] Helper functions created (3 functions)
- [ ] No errors in SQL execution

---

## 🧪 Test Social Features

After database setup:

1. **Test Follow/Unfollow**:
   - Go to a producer/track page
   - Click follow button
   - Verify follower count updates

2. **Test Activity Feed**:
   - Check activity feed component
   - Verify activities appear

3. **Test in Browser**:
   - Visit: `https://weedheadbeats.com/?test-phase4-6`
   - Test Social Features section

---

## 📋 Other Optional Next Steps

### 1. PWA Icons (Optional)
Add PWA icons to `public/` directory:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

Update `public/manifest.json` if needed.

### 2. OAuth Configuration (Optional)
Set up OAuth providers in Supabase:
- Google OAuth
- Apple Sign In
- Facebook Login

See: `GOOGLE-OAUTH-SETUP.md` for details.

### 3. Component Integration (Optional)
Integrate Phase 4-6 components into main app screens:
- Add `AdvancedSearch` to track browsing
- Add `Recommendations` to home/dashboard
- Add `SocialFeatures` to track/producer pages
- Add `AnalyticsExport` to admin dashboard

---

## 🐛 Troubleshooting

### Error: "relation 'profiles' does not exist"
- Make sure `profiles` table exists in Supabase
- This is usually created automatically by Supabase Auth

### Error: "relation 'tracks' does not exist"
- Make sure `tracks` table exists
- Check your existing database schema

### RLS Policies Not Working
- Verify RLS is enabled on tables
- Check policy conditions match your auth setup
- Test with authenticated user

---

## 📚 Related Documentation

- `INTEGRATION-GUIDE.md` - Complete integration guide
- `database/social-features-schema.sql` - Full SQL schema file
- `COOLIFY_DEPLOYMENT.md` - Deployment guide
- `DEPLOYMENT-PHASE-4-6-COMPLETE.md` - Deployment summary

---

## ✅ Status

**Current**: Database setup required for social features
**Next**: Run SQL schema in Supabase
**After**: Test social features in browser

---

**Ready to set up the database? Follow Step 1-4 above!** 🚀
