-- Migration: Add Podcast Tables
-- Description: Creates tables for podcasts, episodes, subscriptions, and playback progress
-- Date: 2024

-- ============================================
-- PODCAST TABLES
-- ============================================

-- Create podcasts table - Admin-curated podcast library
CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  rss_url TEXT NOT NULL UNIQUE,
  artwork_url TEXT,
  website_url TEXT,
  language TEXT DEFAULT 'en',
  categories TEXT[], -- Array of podcast categories
  is_curated BOOLEAN DEFAULT false, -- Admin-approved for curated library
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create podcast_episodes table - Episodes parsed from RSS feeds
CREATE TABLE IF NOT EXISTS podcast_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration INTEGER, -- seconds
  published_at TIMESTAMP WITH TIME ZONE,
  episode_number INTEGER,
  season_number INTEGER,
  guid TEXT NOT NULL, -- RSS guid for deduplication
  artwork_url TEXT,
  file_size BIGINT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(podcast_id, guid)
);

-- Create user_podcast_subscriptions table - User subscriptions
CREATE TABLE IF NOT EXISTS user_podcast_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, podcast_id)
);

-- Create podcast_playback_progress table - Track listening progress
CREATE TABLE IF NOT EXISTS podcast_playback_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  position REAL NOT NULL DEFAULT 0, -- seconds
  duration REAL, -- total duration
  completed BOOLEAN DEFAULT false,
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

-- Enable RLS on podcast tables
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_podcast_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_playback_progress ENABLE ROW LEVEL SECURITY;

-- Create indexes for podcast tables
CREATE INDEX IF NOT EXISTS idx_podcasts_is_curated ON podcasts(is_curated);
CREATE INDEX IF NOT EXISTS idx_podcasts_is_active ON podcasts(is_active);
CREATE INDEX IF NOT EXISTS idx_podcasts_created_by ON podcasts(created_by);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_podcast_id ON podcast_episodes(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_published_at ON podcast_episodes(published_at);
CREATE INDEX IF NOT EXISTS idx_user_podcast_subscriptions_user_id ON user_podcast_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_podcast_subscriptions_podcast_id ON user_podcast_subscriptions(podcast_id);
CREATE INDEX IF NOT EXISTS idx_podcast_playback_progress_user_id ON podcast_playback_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_podcast_playback_progress_episode_id ON podcast_playback_progress(episode_id);

-- RLS Policies for podcasts table
-- Everyone can read curated podcasts
CREATE POLICY "Anyone can view curated podcasts" ON podcasts
  FOR SELECT USING (is_curated = true AND is_active = true);

-- Authenticated users can create podcasts (for review)
CREATE POLICY "Authenticated users can create podcasts" ON podcasts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admins can update/delete all podcasts
CREATE POLICY "Admins can manage podcasts" ON podcasts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for podcast_episodes table
-- Everyone can read episodes of curated podcasts
CREATE POLICY "Anyone can view episodes of curated podcasts" ON podcast_episodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM podcasts 
      WHERE podcasts.id = podcast_episodes.podcast_id 
      AND podcasts.is_curated = true 
      AND podcasts.is_active = true
    )
  );

-- Admins can manage all episodes
CREATE POLICY "Admins can manage episodes" ON podcast_episodes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_podcast_subscriptions table
-- Users can manage their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_podcast_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_podcast_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" ON user_podcast_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for podcast_playback_progress table
-- Users can manage their own progress
CREATE POLICY "Users can view their own playback progress" ON podcast_playback_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playback progress" ON podcast_playback_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playback progress" ON podcast_playback_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playback progress" ON podcast_playback_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for podcast tables updated_at
CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON podcasts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
