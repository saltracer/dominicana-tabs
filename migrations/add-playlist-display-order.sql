-- ============================================================================
-- Add display_order to playlists for drag-to-reorder functionality
-- ============================================================================

-- Add display_order column to playlists table
ALTER TABLE playlists 
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Set initial display_order based on created_at (newest first)
-- This ensures existing playlists have a valid order
UPDATE playlists 
SET display_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as row_num
  FROM playlists
  WHERE display_order IS NULL
) AS subquery
WHERE playlists.id = subquery.id;

-- Make display_order NOT NULL with default
ALTER TABLE playlists 
ALTER COLUMN display_order SET DEFAULT 0;

-- Set remaining NULLs to 0 (shouldn't be any after the UPDATE, but safe)
UPDATE playlists 
SET display_order = 0 
WHERE display_order IS NULL;

-- Now make it NOT NULL
ALTER TABLE playlists 
ALTER COLUMN display_order SET NOT NULL;

-- Create index for efficient ordering by user
CREATE INDEX IF NOT EXISTS idx_playlists_user_order 
ON playlists(user_id, display_order);

-- Verification
SELECT 'Playlist display_order migration completed successfully!' as status;
SELECT COUNT(*) as playlists_with_order 
FROM playlists 
WHERE display_order IS NOT NULL;

