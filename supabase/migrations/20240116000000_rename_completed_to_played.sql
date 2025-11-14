-- Migration: Rename completed column to played in podcast_playback_progress table
-- This provides clearer semantics for episode completion status

-- Rename the column
ALTER TABLE podcast_playback_progress 
  RENAME COLUMN completed TO played;

-- Add comment for documentation
COMMENT ON COLUMN podcast_playback_progress.played IS 'Indicates if the episode has been played (reached within 25 seconds of end)';

