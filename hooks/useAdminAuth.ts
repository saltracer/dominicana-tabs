import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdminAuthState {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const ADMIN_CACHE_KEY = 'admin_status_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to check if the current user has admin role
 * Queries the user_roles table for 'admin' role with caching
 */
export function useAdminAuth(): AdminAuthState {
  const { user } = useAuth();
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    loading: true,
    error: null,
  });
  const hasCheckedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setState({ isAdmin: false, loading: false, error: null });
        hasCheckedRef.current = false;
        userIdRef.current = null;
        return;
      }

      // If we've already checked for this user and got a result, don't reload
      if (hasCheckedRef.current && userIdRef.current === user.id && !state.loading) {
        return;
      }

      try {
        // Try to get cached status first
        const cached = await getCachedAdminStatus(user.id);
        if (cached !== null) {
          setState({ isAdmin: cached, loading: false, error: null });
          hasCheckedRef.current = true;
          userIdRef.current = user.id;
          
          // Verify in background (don't show loading)
          verifyAdminStatusInBackground(user.id);
          return;
        }

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
            await cacheAdminStatus(user.id, false);
            setState({ isAdmin: false, loading: false, error: null });
            hasCheckedRef.current = true;
            userIdRef.current = user.id;
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

        const isAdmin = data?.role === 'admin';
        await cacheAdminStatus(user.id, isAdmin);
        setState({ 
          isAdmin, 
          loading: false, 
          error: null 
        });
        hasCheckedRef.current = true;
        userIdRef.current = user.id;
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
  }, [user?.id]); // Only re-check if user ID changes

  return state;
}

/**
 * Get cached admin status
 */
async function getCachedAdminStatus(userId: string): Promise<boolean | null> {
  try {
    const cacheKey = `${ADMIN_CACHE_KEY}_${userId}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const { isAdmin, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - timestamp < CACHE_DURATION) {
      return isAdmin;
    }
    
    // Cache expired
    await AsyncStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('Error reading admin cache:', error);
    return null;
  }
}

/**
 * Cache admin status
 */
async function cacheAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
  try {
    const cacheKey = `${ADMIN_CACHE_KEY}_${userId}`;
    const cacheData = {
      isAdmin,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching admin status:', error);
  }
}

/**
 * Verify admin status in background without updating UI
 */
async function verifyAdminStatusInBackground(userId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!error || error.code === 'PGRST116') {
      const isAdmin = data?.role === 'admin';
      await cacheAdminStatus(userId, isAdmin);
    }
  } catch (error) {
    // Silent fail - this is background verification
    console.debug('Background admin verification failed:', error);
  }
}

