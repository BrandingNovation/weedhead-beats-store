-- Create listening_history table for tracking user listening analytics
CREATE TABLE IF NOT EXISTS listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id TEXT NOT NULL,
  track_title TEXT NOT NULL,
  listened_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_track_id ON listening_history(track_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_listened_at ON listening_history(listened_at DESC);
CREATE INDEX IF NOT EXISTS idx_listening_history_user_track ON listening_history(user_id, track_id);

-- Enable Row Level Security
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own listening history
CREATE POLICY "Users can view own listening history"
  ON listening_history FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own listening events
CREATE POLICY "Users can insert own listening events"
  ON listening_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own listening history
CREATE POLICY "Users can delete own listening history"
  ON listening_history FOR DELETE
  USING (auth.uid() = user_id);

-- Note: No UPDATE policy - listening history should be append-only
