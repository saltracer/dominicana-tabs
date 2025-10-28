-- Migration: Add Podcast Downloads Table
-- Description: Creates table to track user podcast downloads and adds playback_speed column
-- Date: 2024

-- ============================================
-- PODCAST DOWNLOADS TABLE
-- ============================================

-- Create user_podcast_downloads table - Track downloaded episodes per user
CREATE TABLE IF NOT EXISTS user_podcast_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  audio_url TEXT NOT NULL, -- Original URL for reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

-- ============================================
-- PLAYBACK SPEED COLUMN
-- ============================================

-- Add playback_speed column to podcast_playback_progress table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_playback_progress' AND column_name = 'playback_speed') THEN
        ALTER TABLE podcast_playback_progress ADD COLUMN playback_speed REAL NOT NULL DEFAULT 1.0;
    END IF;
END $$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on downloads table
ALTER TABLE user_podcast_downloads ENABLE ROW LEVEL SECURITY;

-- Users can only access their own downloads
CREATE POLICY "Users can view their own downloads" ON user_podcast_downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" ON user_podcast_downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own downloads" ON user_podcast_downloads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own downloads" ON user_podcast_downloads
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_podcast_downloads_user_id ON user_podcast_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_user_podcast_downloads_episode_id ON user_podcast_downloads(episode_id);
CREATE INDEX IF NOT EXISTS idx_user_podcast_downloads_downloaded_at ON user_podcast_downloads(downloaded_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Add updated_at trigger for downloads table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at column to downloads table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_podcast_downloads' AND column_name = 'updated_at') THEN
        ALTER TABLE user_podcast_downloads ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_podcast_downloads_updated_at ON user_podcast_downloads;
CREATE TRIGGER update_user_podcast_downloads_updated_at
    BEFORE UPDATE ON user_podcast_downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

SELECT 'Podcast downloads migration completed successfully!' as status;
