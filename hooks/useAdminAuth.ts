import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AdminAuthState {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to check if the current user has admin role
 * Queries the user_roles table for 'admin' role
 */
export function useAdminAuth(): AdminAuthState {
  const { user } = useAuth();
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setState({ isAdmin: false, loading: false, error: null });
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Query user_roles table for admin role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (error) {
          // PGRST116 means no rows returned - user is not an admin
          if (error.code === 'PGRST116') {
            setState({ isAdmin: false, loading: false, error: null });
            return;
          }
          
          console.error('Error checking admin status:', error);
          setState({ 
            isAdmin: false, 
            loading: false, 
            error: 'Failed to verify admin status' 
          });
          return;
        }

        setState({ 
          isAdmin: data?.role === 'admin', 
          loading: false, 
          error: null 
        });
      } catch (err) {
        console.error('Error in useAdminAuth:', err);
        setState({ 
          isAdmin: false, 
          loading: false, 
          error: 'An unexpected error occurred' 
        });
      }
    }

    checkAdminStatus();
  }, [user]);

  return state;
}

