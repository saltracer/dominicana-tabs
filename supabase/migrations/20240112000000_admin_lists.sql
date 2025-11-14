-- Admin Lists Management System Migration
-- Creates tables for managing dynamic lookup lists (like book categories)

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- List types table (defines different list types like book_categories)
CREATE TABLE IF NOT EXISTS list_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- List items table (values within each list)
CREATE TABLE IF NOT EXISTS list_items (
  id SERIAL PRIMARY KEY,
  list_type_id TEXT NOT NULL REFERENCES list_types(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_type_id, value)
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_list_items_type ON list_items(list_type_id);
CREATE INDEX IF NOT EXISTS idx_list_items_active ON list_items(is_active);
CREATE INDEX IF NOT EXISTS idx_list_items_order ON list_items(display_order);

-- ============================================================================
-- 3. ENABLE RLS
-- ============================================================================

ALTER TABLE list_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES
-- ============================================================================

-- Public can view all list types
CREATE POLICY "Anyone can view list types" ON list_types
  FOR SELECT USING (true);

-- Public can view active list items
CREATE POLICY "Anyone can view active list items" ON list_items
  FOR SELECT USING (is_active = true);

-- Admins can view all items (including inactive)
CREATE POLICY "Admins can view all list items" ON list_items
  FOR SELECT USING (
    is_active = true OR is_admin()
  );

-- Admins can manage list types
CREATE POLICY "Admins can insert list types" ON list_types
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update list types" ON list_types
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete list types" ON list_types
  FOR DELETE USING (is_admin());

-- Admins can manage list items
CREATE POLICY "Admins can insert list items" ON list_items
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update list items" ON list_items
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete list items" ON list_items
  FOR DELETE USING (is_admin());

-- ============================================================================
-- 5. SEED DATA
-- ============================================================================

-- Insert book categories list type
INSERT INTO list_types (id, name, description) VALUES
  ('book_categories', 'Book Categories', 'Categories for library books')
ON CONFLICT (id) DO NOTHING;

-- Insert existing book categories
INSERT INTO list_items (list_type_id, value, label, display_order, is_active) VALUES
  ('book_categories', 'Philosophy', 'Philosophy', 1, true),
  ('book_categories', 'Theology', 'Theology', 2, true),
  ('book_categories', 'Mysticism', 'Mysticism', 3, true),
  ('book_categories', 'Science', 'Science', 4, true),
  ('book_categories', 'Natural History', 'Natural History', 5, true),
  ('book_categories', 'Spiritual', 'Spiritual', 6, true)
ON CONFLICT (list_type_id, value) DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('list_types', 'list_items');

-- Verify book categories were seeded
SELECT lt.name, COUNT(li.id) as item_count
FROM list_types lt
LEFT JOIN list_items li ON lt.id = li.list_type_id
WHERE lt.id = 'book_categories'
GROUP BY lt.id, lt.name;

-- Show all book categories
SELECT id, value, label, display_order, is_active
FROM list_items
WHERE list_type_id = 'book_categories'
ORDER BY display_order;

-- Verify RLS policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('list_types', 'list_items')
ORDER BY tablename, policyname;

SELECT 'Lists migration completed successfully!' as status;

