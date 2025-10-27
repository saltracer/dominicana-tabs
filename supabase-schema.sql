-- Supabase Database Schema for Dominicana App
-- This file contains the SQL commands to set up the database structure
-- Updated based on complete database analysis of all 8 tables

-- Enable Row Level Security
ALTER TABLE IF EXISTS blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS books ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS liturgy_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS liturgy_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_liturgy_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reading_progress ENABLE ROW LEVEL SECURITY;

-- Create blog_posts table (ACTUAL STRUCTURE)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  featured_image TEXT,
  status TEXT NOT NULL,
  tags TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content_type TEXT NOT NULL,
  media_attachments TEXT,
  word_count INTEGER NOT NULL,
  reading_time_minutes INTEGER NOT NULL
);

-- Create books table (ACTUAL STRUCTURE)
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  year TEXT,
  category TEXT NOT NULL,
  cover_image TEXT,
  description TEXT NOT NULL,
  long_description TEXT[], -- Array of paragraphs for detailed description
  epub_path TEXT,
  epub_sample_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_offices table (ACTUAL STRUCTURE - Empty table)
CREATE TABLE IF NOT EXISTS daily_offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create liturgy_components table (ACTUAL STRUCTURE)
CREATE TABLE IF NOT EXISTS liturgy_components (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rubrics TEXT NOT NULL,
  liturgical_use TEXT NOT NULL,
  language TEXT NOT NULL,
  rank INTEGER NOT NULL,
  psalm_number INTEGER,
  antiphon TEXT NOT NULL,
  has_gloria BOOLEAN NOT NULL,
  citation TEXT NOT NULL,
  meter TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create liturgy_templates table (ACTUAL STRUCTURE)
CREATE TABLE IF NOT EXISTS liturgy_templates (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  hour TEXT NOT NULL,
  rank TEXT NOT NULL,
  components JSONB NOT NULL,
  season_overrides JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table (ACTUAL STRUCTURE)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_liturgy_preferences table (ACTUAL STRUCTURE)
CREATE TABLE IF NOT EXISTS user_liturgy_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'en',
  display_options JSONB NOT NULL DEFAULT '{}',
  memorial_preference TEXT NOT NULL DEFAULT 'both',
  calendar_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  primary_language TEXT NOT NULL DEFAULT 'en',
  secondary_language TEXT NOT NULL DEFAULT 'la',
  display_mode TEXT NOT NULL DEFAULT 'bilingual',
  bible_translation TEXT NOT NULL DEFAULT 'NRSV',
  audio_enabled BOOLEAN NOT NULL DEFAULT true,
  audio_types TEXT[] NOT NULL DEFAULT '{}',
  chant_notation TEXT NOT NULL DEFAULT 'gregorian',
  font_size TEXT NOT NULL DEFAULT 'medium',
  show_rubrics BOOLEAN NOT NULL DEFAULT true,
  theme_preference TEXT NOT NULL DEFAULT 'light',
  chant_notation_enabled BOOLEAN NOT NULL DEFAULT true,
  tts_enabled BOOLEAN NOT NULL DEFAULT true,
  tts_voice_id TEXT NOT NULL DEFAULT '',
  tts_speed INTEGER NOT NULL DEFAULT 2,
  rosary_voice TEXT DEFAULT 'alphonsus', -- Voice selection for rosary audio playback
  show_mystery_meditations BOOLEAN NOT NULL DEFAULT true, -- Show or hide mystery meditations in rosary
  audio_playback_speed NUMERIC(3,2) NOT NULL DEFAULT 1.0 -- Rosary audio playback speed (0.5 - 2.0)
);

-- Add rosary_voice column to existing tables (migration)
-- Run this if the table already exists without this column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'rosary_voice'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN rosary_voice TEXT DEFAULT 'alphonsus';
  END IF;
END $$;

-- Add show_mystery_meditations column to existing tables (migration)
-- Run this if the table already exists without this column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'show_mystery_meditations'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN show_mystery_meditations BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- Add rosary_final_prayers column to existing tables (migration)
-- Run this if the table already exists without this column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'rosary_final_prayers'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN rosary_final_prayers JSONB DEFAULT '[{"id": "hail_holy_queen", "order": 1}, {"id": "versicle_response", "order": 2}, {"id": "rosary_prayer", "order": 3}]'::jsonb;
  END IF;
END $$;

-- Add audio_playback_speed column to existing tables (migration)
-- Run this if the table already exists without this column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'audio_playback_speed'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN audio_playback_speed NUMERIC(3,2) NOT NULL DEFAULT 1.0;
  END IF;
END $$;

-- Create user_roles table (ACTUAL STRUCTURE)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_liturgy_components_type ON liturgy_components(type);
CREATE INDEX IF NOT EXISTS idx_liturgy_components_liturgical_use ON liturgy_components(liturgical_use);
CREATE INDEX IF NOT EXISTS idx_liturgy_components_language ON liturgy_components(language);
CREATE INDEX IF NOT EXISTS idx_liturgy_templates_hour ON liturgy_templates(hour);
CREATE INDEX IF NOT EXISTS idx_liturgy_templates_rank ON liturgy_templates(rank);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_liturgy_preferences_user_id ON user_liturgy_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Row Level Security Policies

-- Blog Posts: Authors can manage their own posts, everyone can read published posts
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view their own blog posts" ON blog_posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can insert their own blog posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own blog posts" ON blog_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own blog posts" ON blog_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Books: Everyone can read books (no authentication required for basic access)
CREATE POLICY "Anyone can view books" ON books
  FOR SELECT USING (true);

-- Daily Offices: Everyone can read daily offices
CREATE POLICY "Anyone can view daily offices" ON daily_offices
  FOR SELECT USING (true);

-- Liturgy Components: Everyone can read liturgy components
CREATE POLICY "Anyone can view liturgy components" ON liturgy_components
  FOR SELECT USING (true);

-- Liturgy Templates: Everyone can read liturgy templates
CREATE POLICY "Anyone can view liturgy templates" ON liturgy_templates
  FOR SELECT USING (true);

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Liturgy Preferences: Users can only access their own preferences
CREATE POLICY "Users can view their own liturgy preferences" ON user_liturgy_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own liturgy preferences" ON user_liturgy_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liturgy preferences" ON user_liturgy_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liturgy preferences" ON user_liturgy_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- User Roles: Users can view their own roles, admins can manage all roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Reading Progress RLS Policies
CREATE POLICY "Users can view their own reading progress" ON reading_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading progress" ON reading_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress" ON reading_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading progress" ON reading_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_offices_updated_at BEFORE UPDATE ON daily_offices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_liturgy_components_updated_at BEFORE UPDATE ON liturgy_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_liturgy_templates_updated_at BEFORE UPDATE ON liturgy_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_liturgy_preferences_updated_at BEFORE UPDATE ON user_liturgy_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create reading_progress table
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  book_title TEXT NOT NULL,
  current_location TEXT NOT NULL, -- Readium locator string
  progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  total_pages INTEGER,
  current_page INTEGER,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id) -- One progress record per user per book
);

-- Create trigger for reading_progress updated_at
CREATE TRIGGER update_reading_progress_updated_at BEFORE UPDATE ON reading_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- ============================================
-- ANNOTATION TABLES
-- ============================================

-- Create book_bookmarks table for EPUB book annotations
CREATE TABLE IF NOT EXISTS book_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  location TEXT NOT NULL, -- Readium locator JSON string
  cfi TEXT, -- Optional CFI for compatibility
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create book_highlights table for EPUB book highlights
CREATE TABLE IF NOT EXISTS book_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  location TEXT NOT NULL, -- Readium locator JSON string
  cfi_range TEXT, -- Start and end CFI for text range
  highlighted_text TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('yellow', 'green', 'blue', 'pink', 'red')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bible_bookmarks table for Bible verse annotations
CREATE TABLE IF NOT EXISTS bible_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_code TEXT NOT NULL, -- e.g., 'GEN', 'MAT'
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  version TEXT NOT NULL, -- e.g., 'douay-rheims'
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bible_highlights table for Bible verse highlights
CREATE TABLE IF NOT EXISTS bible_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_code TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_start INTEGER NOT NULL,
  verse_end INTEGER NOT NULL, -- For multi-verse highlights
  version TEXT NOT NULL,
  highlighted_text TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color IN ('yellow', 'green', 'blue', 'pink', 'red')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on annotation tables
ALTER TABLE book_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_highlights ENABLE ROW LEVEL SECURITY;

-- Create indexes for annotation tables
CREATE INDEX IF NOT EXISTS idx_book_bookmarks_user_book ON book_bookmarks(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_book_highlights_user_book ON book_highlights(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_user_location ON bible_bookmarks(user_id, book_code, chapter, version);
CREATE INDEX IF NOT EXISTS idx_bible_highlights_user_location ON bible_highlights(user_id, book_code, chapter, version);

-- RLS Policies for book_bookmarks
CREATE POLICY "Users can view their own book bookmarks" ON book_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own book bookmarks" ON book_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book bookmarks" ON book_bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own book bookmarks" ON book_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for book_highlights
CREATE POLICY "Users can view their own book highlights" ON book_highlights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own book highlights" ON book_highlights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book highlights" ON book_highlights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own book highlights" ON book_highlights
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bible_bookmarks
CREATE POLICY "Users can view their own bible bookmarks" ON bible_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bible bookmarks" ON bible_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bible bookmarks" ON bible_bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bible bookmarks" ON bible_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bible_highlights
CREATE POLICY "Users can view their own bible highlights" ON bible_highlights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bible highlights" ON bible_highlights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bible highlights" ON bible_highlights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bible highlights" ON bible_highlights
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for annotation tables updated_at
CREATE TRIGGER update_book_bookmarks_updated_at BEFORE UPDATE ON book_bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_highlights_updated_at BEFORE UPDATE ON book_highlights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bible_bookmarks_updated_at BEFORE UPDATE ON bible_bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bible_highlights_updated_at BEFORE UPDATE ON bible_highlights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration (UPDATED FOR ACTUAL STRUCTURE)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sample data for books (based on actual data)
INSERT INTO books (title, author, year, category, description) VALUES
('On Being and Essence', 'St. Thomas Aquinas', '1252', 'Philosophy', 'A treatise on metaphysics and the nature of being.'),
('Disputed Questions on Truth', 'St. Thomas Aquinas', '1256-1259', 'Theology', 'A series of theological discussions on various aspects of truth.'),
('Compendium of Theology', 'St. Thomas Aquinas', '1272', 'Theology', 'A concise summary of Christian doctrine.')
ON CONFLICT DO NOTHING;