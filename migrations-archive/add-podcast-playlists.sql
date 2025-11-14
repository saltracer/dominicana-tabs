-- Playlists table
CREATE TABLE user_podcast_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE, -- For "Downloaded" playlist
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist items (episodes in playlists)
CREATE TABLE user_podcast_playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES user_podcast_playlists(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- For ordering
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, episode_id)
);

-- Queue table (separate from playlists for current playback queue)
CREATE TABLE user_podcast_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

-- Per-podcast preferences (overrides global preferences)
CREATE TABLE user_podcast_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  playback_speed REAL, -- NULL means use global default
  max_episodes_to_keep INTEGER, -- NULL means use global default
  auto_download BOOLEAN, -- NULL means use global default
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, podcast_id)
);

-- RLS policies
ALTER TABLE user_podcast_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_podcast_playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_podcast_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_podcast_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own playlists" ON user_podcast_playlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own playlist items" ON user_podcast_playlist_items
  FOR ALL USING (
    playlist_id IN (SELECT id FROM user_podcast_playlists WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own queue" ON user_podcast_queue
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own podcast preferences" ON user_podcast_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_playlist_items_playlist ON user_podcast_playlist_items(playlist_id);
CREATE INDEX idx_playlist_items_position ON user_podcast_playlist_items(playlist_id, position);
CREATE INDEX idx_queue_user_position ON user_podcast_queue(user_id, position);
CREATE INDEX idx_podcast_prefs_user_podcast ON user_podcast_preferences(user_id, podcast_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_podcast_playlists_updated_at
    BEFORE UPDATE ON user_podcast_playlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_podcast_preferences_updated_at
    BEFORE UPDATE ON user_podcast_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
