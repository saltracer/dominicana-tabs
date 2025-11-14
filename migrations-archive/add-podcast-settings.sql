-- Add Podcast Settings Migration
-- Adds podcast download and playback settings to user_liturgy_preferences

-- ============================================================================
-- 1. ADD PODCAST SETTINGS COLUMNS
-- ============================================================================

-- Add podcast download settings columns
DO $$ 
BEGIN
  -- Enable podcast downloads
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'podcast_downloads_enabled'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN podcast_downloads_enabled BOOLEAN NOT NULL DEFAULT true;
  END IF;

  -- Maximum number of downloaded episodes to keep
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'podcast_max_downloads'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN podcast_max_downloads INTEGER NOT NULL DEFAULT 10;
  END IF;

  -- Auto-download new episodes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'podcast_auto_download'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN podcast_auto_download BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Download quality preference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'podcast_download_quality'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN podcast_download_quality TEXT NOT NULL DEFAULT 'high';
  END IF;

  -- Download over WiFi only
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'podcast_wifi_only'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN podcast_wifi_only BOOLEAN NOT NULL DEFAULT true;
  END IF;

  -- Background playback
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'podcast_background_playback'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN podcast_background_playback BOOLEAN NOT NULL DEFAULT true;
  END IF;

  -- Auto-play next episode
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'podcast_auto_play_next'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN podcast_auto_play_next BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- Default playback speed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_liturgy_preferences' 
    AND column_name = 'podcast_default_speed'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD COLUMN podcast_default_speed NUMERIC(3,2) NOT NULL DEFAULT 1.0;
  END IF;
END $$;

-- ============================================================================
-- 2. ADD CONSTRAINTS
-- ============================================================================

-- Add check constraint for max downloads (1-100)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_podcast_max_downloads'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD CONSTRAINT check_podcast_max_downloads 
    CHECK (podcast_max_downloads >= 1 AND podcast_max_downloads <= 100);
  END IF;
END $$;

-- Add check constraint for download quality
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_podcast_download_quality'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD CONSTRAINT check_podcast_download_quality 
    CHECK (podcast_download_quality IN ('low', 'medium', 'high'));
  END IF;
END $$;

-- Add check constraint for default speed (0.5-3.0)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_podcast_default_speed'
  ) THEN
    ALTER TABLE user_liturgy_preferences 
    ADD CONSTRAINT check_podcast_default_speed 
    CHECK (podcast_default_speed >= 0.5 AND podcast_default_speed <= 3.0);
  END IF;
END $$;

-- ============================================================================
-- 3. UPDATE EXISTING RECORDS
-- ============================================================================

-- Set default values for existing users
UPDATE user_liturgy_preferences 
SET 
  podcast_downloads_enabled = true,
  podcast_max_downloads = 10,
  podcast_auto_download = false,
  podcast_download_quality = 'high',
  podcast_wifi_only = true,
  podcast_background_playback = true,
  podcast_auto_play_next = false,
  podcast_default_speed = 1.0
WHERE 
  podcast_downloads_enabled IS NULL 
  OR podcast_max_downloads IS NULL 
  OR podcast_auto_download IS NULL 
  OR podcast_download_quality IS NULL 
  OR podcast_wifi_only IS NULL 
  OR podcast_background_playback IS NULL 
  OR podcast_auto_play_next IS NULL 
  OR podcast_default_speed IS NULL;

-- ============================================================================
-- 4. VERIFICATION
-- ============================================================================

-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_liturgy_preferences' 
  AND column_name LIKE 'podcast_%'
ORDER BY column_name;

-- Show sample data
SELECT 
  user_id,
  podcast_downloads_enabled,
  podcast_max_downloads,
  podcast_auto_download,
  podcast_download_quality,
  podcast_wifi_only,
  podcast_background_playback,
  podcast_auto_play_next,
  podcast_default_speed
FROM user_liturgy_preferences 
LIMIT 3;

SELECT 'Podcast settings migration completed successfully!' as status;
