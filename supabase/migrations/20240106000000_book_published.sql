-- Book Published Status Migration
-- Adds published column to enable draft/published workflow

-- ============================================================================
-- 1. ADD PUBLISHED COLUMNS
-- ============================================================================

-- Add published column to books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT false;

-- Add published_at timestamp column (tracks when book was published)
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Set existing books to published with current timestamp
UPDATE books SET published = true, published_at = NOW() WHERE published = false;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_books_published ON books(published);
CREATE INDEX IF NOT EXISTS idx_books_published_at ON books(published_at);

-- ============================================================================
-- 2. UPDATE RLS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view books" ON books;
DROP POLICY IF EXISTS "Anyone can view published books" ON books;
DROP POLICY IF EXISTS "Admins can view all books" ON books;
DROP POLICY IF EXISTS "Admins can insert books" ON books;
DROP POLICY IF EXISTS "Admins can update books" ON books;
DROP POLICY IF EXISTS "Admins can delete books" ON books;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PUBLIC SELECT: Only published books
CREATE POLICY "Anyone can view published books" ON books
  FOR SELECT USING (published = true);

-- ADMIN SELECT: All books (published and unpublished)
CREATE POLICY "Admins can view all books" ON books
  FOR SELECT USING (
    published = true OR is_admin()
  );

-- ADMIN INSERT: Admins can create books
CREATE POLICY "Admins can insert books" ON books
  FOR INSERT WITH CHECK (is_admin());

-- ADMIN UPDATE: Admins can update all books
CREATE POLICY "Admins can update books" ON books
  FOR UPDATE USING (is_admin());

-- ADMIN DELETE: Admins can delete books
CREATE POLICY "Admins can delete books" ON books
  FOR DELETE USING (is_admin());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'books' AND column_name IN ('published', 'published_at');

-- Check existing books are published
SELECT COUNT(*) as total_books, 
       SUM(CASE WHEN published THEN 1 ELSE 0 END) as published_count,
       SUM(CASE WHEN NOT published THEN 1 ELSE 0 END) as draft_count
FROM books;

-- Verify indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename = 'books' 
AND indexname IN ('idx_books_published', 'idx_books_published_at');

-- Verify RLS policies exist
SELECT policyname FROM pg_policies WHERE tablename = 'books';

SELECT 'Migration completed successfully!' as status;

