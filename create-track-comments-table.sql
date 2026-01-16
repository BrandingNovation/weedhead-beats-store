-- Create track_comments table for user comments and ratings
CREATE TABLE IF NOT EXISTS track_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(track_id, user_id) -- One comment per user per track
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_track_comments_track_id ON track_comments(track_id);
CREATE INDEX IF NOT EXISTS idx_track_comments_user_id ON track_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_track_comments_created_at ON track_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_track_comments_rating ON track_comments(rating) WHERE rating IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE track_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view comments (public)
CREATE POLICY "Anyone can view comments"
  ON track_comments FOR SELECT
  USING (true);

-- Policy: Users can insert their own comments
CREATE POLICY "Users can insert own comments"
  ON track_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON track_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON track_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_track_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER track_comments_updated_at
  BEFORE UPDATE ON track_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_track_comments_updated_at();
