-- Migration: Fix RLS for shared user-added podcasts
-- This allows users to view any podcast they're subscribed to, not just ones they created
-- This ensures UUIDs are preserved when podcasts are promoted from user-added to curated

-- Create a SECURITY DEFINER function to check for duplicate RSS URLs
-- This bypasses RLS so users can detect duplicates created by other users
CREATE OR REPLACE FUNCTION check_duplicate_podcast_by_rss(p_rss_url TEXT)
RETURNS TABLE(podcast_id UUID, is_curated BOOLEAN, is_active BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT id, podcasts.is_curated, podcasts.is_active
  FROM podcasts
  WHERE rss_url = p_rss_url
  ORDER BY podcasts.is_curated DESC, podcasts.is_active DESC
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_duplicate_podcast_by_rss(TEXT) TO authenticated;

-- Drop existing SELECT policy for podcasts
DROP POLICY IF EXISTS "Users can view curated or own podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can view curated, own, or subscribed podcasts" ON podcasts;

-- Create new SELECT policy that includes subscribed podcasts
CREATE POLICY "Users can view curated, own, or subscribed podcasts" ON podcasts
  FOR SELECT
  USING (
    -- Curated and active podcasts are visible to all
    (is_curated = true AND is_active = true)
    OR
    -- User's own podcasts are visible
    (created_by = auth.uid())
    OR
    -- Podcasts the user is subscribed to are visible
    EXISTS (
      SELECT 1 FROM user_podcast_subscriptions
      WHERE user_podcast_subscriptions.podcast_id = podcasts.id
        AND user_podcast_subscriptions.user_id = auth.uid()
    )
  );

-- Drop existing SELECT policy for podcast_episodes
DROP POLICY IF EXISTS "Users can view curated or own podcast episodes" ON podcast_episodes;
DROP POLICY IF EXISTS "Users can view curated, own, or subscribed podcast episodes" ON podcast_episodes;

-- Create new SELECT policy that includes episodes of subscribed podcasts
CREATE POLICY "Users can view curated, own, or subscribed podcast episodes" ON podcast_episodes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM podcasts
      WHERE podcasts.id = podcast_episodes.podcast_id
        AND (
          -- Curated and active podcasts
          (podcasts.is_curated = true AND podcasts.is_active = true)
          OR
          -- User's own podcasts
          (podcasts.created_by = auth.uid())
          OR
          -- Podcasts the user is subscribed to
          EXISTS (
            SELECT 1 FROM user_podcast_subscriptions
            WHERE user_podcast_subscriptions.podcast_id = podcasts.id
              AND user_podcast_subscriptions.user_id = auth.uid()
          )
        )
    )
  );

-- Add index to improve performance of subscription lookups in RLS
CREATE INDEX IF NOT EXISTS idx_user_podcast_subscriptions_podcast_user 
  ON user_podcast_subscriptions(podcast_id, user_id);

-- Add comment explaining the policy change
COMMENT ON POLICY "Users can view curated, own, or subscribed podcasts" ON podcasts IS 
  'Allows users to view curated podcasts, their own user-added podcasts, and any podcasts they are subscribed to. This enables shared user-added podcasts with preserved UUIDs.';

COMMENT ON POLICY "Users can view curated, own, or subscribed podcast episodes" ON podcast_episodes IS 
  'Allows users to view episodes of curated podcasts, their own podcasts, and subscribed podcasts. This enables shared user-added podcasts with preserved UUIDs.';

