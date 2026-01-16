-- Create download_history table for tracking user downloads
CREATE TABLE IF NOT EXISTS download_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  track_id TEXT NOT NULL,
  track_title TEXT NOT NULL,
  license_type TEXT NOT NULL CHECK (license_type IN ('basic', 'premium', 'exclusive')),
  file_type TEXT NOT NULL CHECK (file_type IN ('audio', 'stems', 'license')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  downloaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  download_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_download_history_user_id ON download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_download_history_track_id ON download_history(track_id);
CREATE INDEX IF NOT EXISTS idx_download_history_downloaded_at ON download_history(downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_download_history_user_track ON download_history(user_id, track_id);

-- Enable Row Level Security
ALTER TABLE download_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own download history
CREATE POLICY "Users can view own download history"
  ON download_history FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own download records
CREATE POLICY "Users can insert own download records"
  ON download_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own download history
CREATE POLICY "Users can delete own download history"
  ON download_history FOR DELETE
  USING (auth.uid() = user_id);

-- Note: No UPDATE policy - download history should be append-only
