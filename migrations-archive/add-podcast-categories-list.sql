-- Add Podcast Categories List Migration
-- Creates a new list type for podcast categories in the admin lists system

-- ============================================================================
-- 1. INSERT LIST TYPE
-- ============================================================================

-- Insert podcast categories list type
INSERT INTO list_types (id, name, description) VALUES
  ('podcast_categories', 'Podcast Categories', 'Categories for podcasts')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. SEED INITIAL CATEGORIES
-- ============================================================================

-- Insert existing podcast categories
INSERT INTO list_items (list_type_id, value, label, display_order, is_active) VALUES
  ('podcast_categories', 'Religion', 'Religion', 1, true),
  ('podcast_categories', 'Christianity', 'Christianity', 2, true),
  ('podcast_categories', 'Catholicism', 'Catholicism', 3, true),
  ('podcast_categories', 'Theology', 'Theology', 4, true),
  ('podcast_categories', 'Spirituality', 'Spirituality', 5, true),
  ('podcast_categories', 'Philosophy', 'Philosophy', 6, true),
  ('podcast_categories', 'History', 'History', 7, true)
ON CONFLICT (list_type_id, value) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify podcast categories were seeded
SELECT lt.name, COUNT(li.id) as item_count
FROM list_types lt
LEFT JOIN list_items li ON lt.id = li.list_type_id
WHERE lt.id = 'podcast_categories'
GROUP BY lt.id, lt.name;

-- Show all podcast categories
SELECT id, value, label, display_order, is_active
FROM list_items
WHERE list_type_id = 'podcast_categories'
ORDER BY display_order;

SELECT 'Podcast categories migration completed successfully!' as status;
