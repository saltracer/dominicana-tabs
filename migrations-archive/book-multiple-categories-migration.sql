-- ============================================================================
-- CONVERT BOOKS TO SUPPORT MULTIPLE CATEGORIES
-- ============================================================================
-- This migration converts the single category field to a categories array
-- to allow books to belong to multiple categories simultaneously.
--
-- Specifications:
-- - Each book can have 1-10 categories
-- - Categories are stored as TEXT[] (PostgreSQL array)
-- - Order is preserved (admin selection order)
-- - All categories have equal weight (no primary category)
-- ============================================================================

-- Step 1: Add new categories array column (nullable initially)
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS categories TEXT[];

-- Step 2: Migrate existing single category data to array format
-- Convert each single category to a single-item array
UPDATE books 
SET categories = ARRAY[category]
WHERE categories IS NULL;

-- Step 3: Make categories column NOT NULL
ALTER TABLE books 
ALTER COLUMN categories SET NOT NULL;

-- Step 4: Add constraint to ensure at least one category (not empty array)
ALTER TABLE books
ADD CONSTRAINT books_categories_not_empty 
CHECK (array_length(categories, 1) > 0);

-- Step 5: Add constraint to limit maximum categories to 10
ALTER TABLE books
ADD CONSTRAINT books_categories_max_10
CHECK (array_length(categories, 1) <= 10);

-- Step 6: Add GIN index for efficient array queries (contains, overlap, etc.)
CREATE INDEX IF NOT EXISTS idx_books_categories_gin 
ON books USING GIN (categories);

-- Step 7: Drop the old single category column
ALTER TABLE books 
DROP COLUMN IF EXISTS category;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify the column structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'books' AND column_name IN ('category', 'categories')
ORDER BY column_name;

-- Verify constraints are in place
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'books'::regclass
  AND conname LIKE '%categories%';

-- Show sample data to verify migration
SELECT id, title, categories, array_length(categories, 1) as category_count
FROM books
ORDER BY id
LIMIT 10;

-- Show unique categories and their usage
SELECT DISTINCT unnest(categories) as category, COUNT(*) OVER (PARTITION BY unnest(categories)) as book_count
FROM books
ORDER BY category;

SELECT 'Multiple categories migration completed successfully!' as status;

