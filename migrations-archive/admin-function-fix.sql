-- Fix for ambiguous column reference in get_user_statistics function
-- Run this in Supabase SQL Editor to update the function

-- Drop and recreate the function with the fix
DROP FUNCTION IF EXISTS get_user_statistics();

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

-- Verify the function was created
SELECT 'get_user_statistics function updated successfully' as status;

