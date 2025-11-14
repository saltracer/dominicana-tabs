-- Migration: Add User-Added Podcasts Support
-- Adds share tracking and updates RLS policies to support user-added podcasts

-- Add share_count column to podcasts table
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- Create index for share_count (useful for sorting by popularity)
CREATE INDEX IF NOT EXISTS idx_podcasts_share_count ON podcasts(share_count);

-- Drop existing RLS policies for podcasts table that we need to update
DROP POLICY IF EXISTS "Anyone can view curated podcasts" ON podcasts;
DROP POLICY IF EXISTS "Authenticated users can create podcasts" ON podcasts;

DROP POLICY IF EXISTS "Users can view curated or own podcasts" ON podcasts;
-- Updated RLS policy: Users can view curated podcasts OR their own non-curated podcasts
CREATE POLICY "Users can view curated or own podcasts" ON podcasts
  FOR SELECT USING (
    (is_curated = true AND is_active = true) OR 
    (created_by = auth.uid())
  );

-- Allow authenticated users to create podcasts (for user-added feeds)
CREATE POLICY "Authenticated users can create podcasts" ON podcasts
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update own podcasts" ON podcasts;
-- Allow users to update their own non-curated podcasts
CREATE POLICY "Users can update own podcasts" ON podcasts
  FOR UPDATE USING (
    created_by = auth.uid() AND is_curated = false
  );

DROP POLICY IF EXISTS "Users can delete own podcasts" ON podcasts;
-- Allow users to delete their own non-curated podcasts
CREATE POLICY "Users can delete own podcasts" ON podcasts
  FOR DELETE USING (
    created_by = auth.uid() AND is_curated = false
  );

-- Drop existing episode policies that need updating
DROP POLICY IF EXISTS "Anyone can view episodes of curated podcasts" ON podcast_episodes;
DROP POLICY IF EXISTS "Users can view curated or own podcast episodes" ON podcast_episodes;

-- Updated RLS policy: Users can view episodes of curated podcasts OR their own podcasts
CREATE POLICY "Users can view curated or own podcast episodes" ON podcast_episodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM podcasts 
      WHERE podcasts.id = podcast_episodes.podcast_id 
      AND (
        (podcasts.is_curated = true AND podcasts.is_active = true) OR
        (podcasts.created_by = auth.uid())
      )
    )
  );

-- Create a SECURITY DEFINER function to insert episodes, bypassing RLS
-- This is safer than giving users direct INSERT permissions
CREATE OR REPLACE FUNCTION insert_podcast_episodes(
  p_podcast_id UUID,
  p_episodes JSONB
)
RETURNS void AS $$
DECLARE
  episode JSONB;
BEGIN
  -- Verify the user owns this podcast or it's being done by an admin
  IF NOT EXISTS (
    SELECT 1 FROM podcasts 
    WHERE id = p_podcast_id 
    AND (
      created_by = auth.uid() OR
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    )
  ) THEN
    RAISE EXCEPTION 'Permission denied: You do not own this podcast';
  END IF;

  -- Insert episodes using upsert to handle duplicates
  FOR episode IN SELECT * FROM jsonb_array_elements(p_episodes)
  LOOP
    INSERT INTO podcast_episodes (
      podcast_id,
      title,
      description,
      audio_url,
      duration,
      published_at,
      episode_number,
      season_number,
      guid,
      artwork_url,
      file_size,
      mime_type
    ) VALUES (
      p_podcast_id,
      episode->>'title',
      episode->>'description',
      episode->>'audio_url',
      (episode->>'duration')::INTEGER,
      (episode->>'published_at')::TIMESTAMPTZ,
      (episode->>'episode_number')::INTEGER,
      (episode->>'season_number')::INTEGER,
      episode->>'guid',
      episode->>'artwork_url',
      (episode->>'file_size')::BIGINT,
      episode->>'mime_type'
    )
    ON CONFLICT (podcast_id, guid) 
    DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      audio_url = EXCLUDED.audio_url,
      duration = EXCLUDED.duration,
      published_at = EXCLUDED.published_at,
      episode_number = EXCLUDED.episode_number,
      season_number = EXCLUDED.season_number,
      artwork_url = EXCLUDED.artwork_url,
      file_size = EXCLUDED.file_size,
      mime_type = EXCLUDED.mime_type;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_podcast_episodes(UUID, JSONB) TO authenticated;

-- Add function to increment share count
CREATE OR REPLACE FUNCTION increment_podcast_share_count(podcast_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE podcasts 
  SET share_count = share_count + 1 
  WHERE id = podcast_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION increment_podcast_share_count(UUID) TO authenticated;

-- Add trigger to update podcast updated_at when share_count changes
-- (This is already handled by the existing update_podcasts_updated_at trigger)

-- Comments for documentation
COMMENT ON COLUMN podcasts.share_count IS 'Number of times this podcast has been shared via share links';
COMMENT ON FUNCTION increment_podcast_share_count IS 'Increments share_count for a podcast when shared link is used';

