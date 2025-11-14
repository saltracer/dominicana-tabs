-- Admin RLS Policies for Dominicana Admin Console
-- Run this SQL in your Supabase SQL Editor

-- ============================================================================
-- 1. CREATE rosary_audio_metadata TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS rosary_audio_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'prayer' or 'mystery'
  mystery_type TEXT, -- 'joyful', 'sorrowful', 'glorious', 'luminous' (null for prayers)
  file_path TEXT NOT NULL, -- Full path in bucket: {voice}/{file_name}
  file_size BIGINT, -- Size in bytes
  duration NUMERIC(10,2), -- Duration in seconds
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voice_name, file_name)
);

-- Enable RLS
ALTER TABLE rosary_audio_metadata ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rosary_audio_metadata_voice ON rosary_audio_metadata(voice_name);
CREATE INDEX IF NOT EXISTS idx_rosary_audio_metadata_type ON rosary_audio_metadata(file_type);

-- RLS Policies for rosary_audio_metadata
-- Everyone can read
CREATE POLICY "Anyone can view rosary audio metadata" ON rosary_audio_metadata
  FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage rosary audio metadata" ON rosary_audio_metadata
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_rosary_audio_metadata_updated_at 
  BEFORE UPDATE ON rosary_audio_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. UPDATE BOOKS TABLE RLS POLICIES
-- ============================================================================

-- Add admin write policies for books table
-- Admins can insert books
CREATE POLICY "Admins can insert books" ON books
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update books
CREATE POLICY "Admins can update books" ON books
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete books
CREATE POLICY "Admins can delete books" ON books
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 3. UPDATE PROFILES TABLE RLS POLICIES
-- ============================================================================

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 4. STORAGE BUCKET POLICIES
-- ============================================================================

-- Note: Storage policies are managed separately in Supabase Storage UI
-- For reference, admins should have:
-- - Read/Write access to 'epub_files' bucket
-- - Read/Write access to 'book_covers' bucket  
-- - Read/Write access to 'rosary-audio' bucket

-- To set these up:
-- 1. Go to Supabase Dashboard → Storage → Policies
-- 2. For each bucket, add admin policies like:

-- Example policy for epub_files (create in Storage UI):
-- INSERT policy: "Admins can upload EPUBs"
-- SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'

-- UPDATE policy: "Admins can update EPUBs"
-- SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'

-- DELETE policy: "Admins can delete EPUBs"
-- SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'

-- ============================================================================
-- 5. HELPER FUNCTIONS FOR ADMIN OPERATIONS
-- ============================================================================

-- Function to check if a user is an admin (for use in queries)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = is_admin.user_id 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics (for admin dashboard)
CREATE OR REPLACE FUNCTION get_user_statistics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Only admins can call this
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'users_by_role', (
      SELECT json_object_agg(role_name, count)
      FROM (
        SELECT COALESCE(user_roles.role, 'authenticated') as role_name, COUNT(*) as count
        FROM auth.users
        LEFT JOIN user_roles ON auth.users.id = user_roles.user_id
        GROUP BY user_roles.role
      ) role_counts
    ),
    'recent_signups', (
      SELECT COUNT(*) 
      FROM auth.users 
      WHERE created_at > NOW() - INTERVAL '30 days'
    ),
    'active_readers', (
      SELECT COUNT(DISTINCT user_id)
      FROM reading_progress
      WHERE last_read_at > NOW() - INTERVAL '7 days'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get book statistics (for admin dashboard)
CREATE OR REPLACE FUNCTION get_book_statistics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Only admins can call this
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_build_object(
    'total_books', (SELECT COUNT(*) FROM books),
    'books_by_category', (
      SELECT json_object_agg(category, count)
      FROM (
        SELECT category, COUNT(*) as count
        FROM books
        GROUP BY category
      ) category_counts
    ),
    'books_with_epub', (
      SELECT COUNT(*) 
      FROM books 
      WHERE epub_path IS NOT NULL
    ),
    'most_read_books', (
      SELECT json_agg(book_stats)
      FROM (
        SELECT 
          b.id,
          b.title,
          b.author,
          COUNT(rp.user_id) as reader_count
        FROM books b
        LEFT JOIN reading_progress rp ON b.id = rp.book_id
        GROUP BY b.id, b.title, b.author
        ORDER BY reader_count DESC
        LIMIT 10
      ) book_stats
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DONE! 
-- ============================================================================

-- Verify setup:
SELECT 'rosary_audio_metadata table created' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rosary_audio_metadata');

SELECT 'Admin policies enabled' as status;

