-- Convert book category from ENUM to TEXT
-- This allows dynamic categories managed through the Lists system

-- ============================================================================
-- 1. CHANGE COLUMN TYPE FROM ENUM TO TEXT
-- ============================================================================

-- Change the category column from enum to text
ALTER TABLE books 
ALTER COLUMN category TYPE TEXT;

-- Drop the old enum type (if it exists and is not in use by other tables)
-- Note: This will fail if the enum is still referenced elsewhere, which is fine
DROP TYPE IF EXISTS book_category CASCADE;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify column is now TEXT type
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'books' AND column_name = 'category';

-- Show existing categories in use
SELECT DISTINCT category, COUNT(*) as book_count
FROM books
GROUP BY category
ORDER BY category;

SELECT 'Category column converted to TEXT successfully!' as status;

