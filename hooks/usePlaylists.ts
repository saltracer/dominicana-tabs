import { useEffect, useMemo, useState, useCallback, useRef, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PlaylistService, { Playlist } from '../services/PlaylistService';
import { enqueueMutation, getCachedPlaylists, setCachedPlaylists, syncDown, syncUp } from '../lib/playlist/cache';
import { useSharedPlaylistHooks } from '../contexts/SharedPlaylistHooksContext';

// Global singleton to share playlists across all hook instances
let globalPlaylistsInstance: {
  playlists: Playlist[];
  loading: boolean;
  error: unknown;
  timestamp: number;
  userId: string;
} | null = null;

let loadInProgress = false;
const CACHE_TTL = 5000; // 5 seconds

export function usePlaylists() {
  const { user } = useAuth();
  const userId = user?.id;
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);
  const instanceRef = useRef({ isFirstInstance: false });
  
  // Check if we're in a context that provides playlists already
  const sharedContext = useSharedPlaylistHooks();
  const hasSharedPlaylists = sharedContext.playlistsHooks?.playlists;

  useEffect(() => {
    // If context provides playlists, use those and skip expensive work
    if (hasSharedPlaylists) {
      if (__DEV__) console.log('[usePlaylists] 🎯 Using playlists from shared context, skipping load');
      setPlaylists(hasSharedPlaylists);
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    // Check global cache first
    const now = Date.now();
    const isCacheValid = globalPlaylistsInstance && 
                        globalPlaylistsInstance.userId === userId &&
                        (now - globalPlaylistsInstance.timestamp) < CACHE_TTL;
    
    if (isCacheValid && globalPlaylistsInstance) {
      if (__DEV__) console.log('[usePlaylists] ⚡ Using global singleton cache (', globalPlaylistsInstance.playlists.length, 'playlists)');
      setPlaylists(globalPlaylistsInstance.playlists);
      setLoading(globalPlaylistsInstance.loading);
      setError(globalPlaylistsInstance.error);
      return;
    }
    
    // Check if another instance is already loading
    if (loadInProgress && !instanceRef.current.isFirstInstance) {
      if (__DEV__) console.log('[usePlaylists] ⏳ Load already in progress, waiting for global instance...');
      
      // Wait for the load to complete and use that result
      const checkInterval = setInterval(() => {
        if (globalPlaylistsInstance && globalPlaylistsInstance.userId === userId) {
          if (isMounted) {
            setPlaylists(globalPlaylistsInstance.playlists);
            setLoading(false);
            setError(globalPlaylistsInstance.error);
          }
          clearInterval(checkInterval);
        }
      }, 50);
      
      return () => {
        clearInterval(checkInterval);
        isMounted = false;
      };
    }
    
    // This is the first instance - do the load
    if (!instanceRef.current.isFirstInstance) {
      instanceRef.current.isFirstInstance = true;
    }
    
    (async () => {
      if (!userId) {
        setPlaylists([]);
        globalPlaylistsInstance = null;
        return;
      }
      
      loadInProgress = true;
      
      try {
        const loadStart = Date.now();
        setLoading(true);
        
        // Load from cache first (fast initial render)
        const cached = await getCachedPlaylists(userId);
        if (__DEV__) console.log('[usePlaylists] Loaded', cached.length, 'playlists from cache in', Date.now() - loadStart, 'ms');
        if (isMounted && cached.length) setPlaylists(cached);
        
        // Sync mutations up
        const syncUpStart = Date.now();
        await syncUp(userId);
        if (__DEV__) console.log('[usePlaylists] syncUp completed in', Date.now() - syncUpStart, 'ms');
        
        // Always sync down to get latest from Supabase (ensures cross-device consistency)
        if (__DEV__) console.log('[usePlaylists] Syncing down from Supabase...');
        const syncDownStart = Date.now();
        await syncDown(userId);
        if (__DEV__) console.log('[usePlaylists] syncDown completed in', Date.now() - syncDownStart, 'ms');
        
        const fresh = await getCachedPlaylists(userId);
        if (isMounted) {
          setPlaylists(fresh);
        }
        if (__DEV__) console.log('[usePlaylists] Loaded', fresh.length, 'playlists in', Date.now() - loadStart, 'ms');
        
        // Update global cache
        globalPlaylistsInstance = {
          playlists: fresh,
          loading: false,
          error: null,
          timestamp: Date.now(),
          userId,
        };
      } catch (e) {
        setError(e);
        if (globalPlaylistsInstance && globalPlaylistsInstance.userId === userId) {
          globalPlaylistsInstance.error = e;
        }
      } finally {
        setLoading(false);
        loadInProgress = false;
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [userId, hasSharedPlaylists]);

  const createPlaylist = useCallback(async (name: string) => {
    if (!userId) return;
    // optimistic
    const optimistic: Playlist = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      name,
      is_builtin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const next = [optimistic, ...playlists];
    setPlaylists(next);
    await setCachedPlaylists(userId, next);
    await enqueueMutation(userId, { type: 'createPlaylist', name });
    await syncUp(userId);
    // Refresh playlists only (don't fetch all items)
    const freshPlaylists = await PlaylistService.getPlaylists();
    await setCachedPlaylists(userId, freshPlaylists);
    setPlaylists(freshPlaylists);
    
    // Invalidate global cache
    globalPlaylistsInstance = null;
  }, [userId, playlists]);

  const renamePlaylist = useCallback(async (id: string, name: string) => {
    if (!userId) return;
    const next = playlists.map(p => p.id === id ? { ...p, name, updated_at: new Date().toISOString() } : p);
    setPlaylists(next);
    await setCachedPlaylists(userId, next);
    await enqueueMutation(userId, { type: 'renamePlaylist', id, name });
    await syncUp(userId);
    // Refresh playlists only (don't fetch all items)
    const freshPlaylists = await PlaylistService.getPlaylists();
    await setCachedPlaylists(userId, freshPlaylists);
    setPlaylists(freshPlaylists);
    
    // Invalidate global cache
    globalPlaylistsInstance = null;
  }, [userId, playlists]);

  const deletePlaylist = useCallback(async (id: string) => {
    if (!userId) return;
    const next = playlists.filter(p => p.id !== id);
    setPlaylists(next);
    await setCachedPlaylists(userId, next);
    await enqueueMutation(userId, { type: 'deletePlaylist', id });
    await syncUp(userId);
    // Refresh playlists only (don't fetch all items)
    const freshPlaylists = await PlaylistService.getPlaylists();
    await setCachedPlaylists(userId, freshPlaylists);
    setPlaylists(freshPlaylists);
    
    // Invalidate global cache
    globalPlaylistsInstance = null;
  }, [userId, playlists]);

  const updatePlaylistsOrder = useCallback(async (orderedPlaylists: Playlist[]) => {
    if (!userId) return;
    
    if (__DEV__) {
      console.log('[usePlaylists] 🔄 Updating order for', orderedPlaylists.length, 'playlists');
    }
    
    // Optimistic update
    setPlaylists(orderedPlaylists);
    await setCachedPlaylists(userId, orderedPlaylists);
    
    // Update display_order in backend
    const updates = orderedPlaylists.map((p, index) => ({ id: p.id, display_order: index }));
    await enqueueMutation(userId, { type: 'updatePlaylistsOrder', updates });
    await syncUp(userId);
    
    // Refresh playlists only (don't fetch all items)
    const freshPlaylists = await PlaylistService.getPlaylists();
    if (__DEV__) {
      console.log('[usePlaylists] ✅ Updated and refreshed playlists');
    }
    await setCachedPlaylists(userId, freshPlaylists);
    setPlaylists(freshPlaylists);
    
    // Invalidate global cache
    globalPlaylistsInstance = null;
  }, [userId, playlists]);

  const refetch = useCallback(async () => {
    if (!userId) return;
    
    // Invalidate global cache to force reload
    globalPlaylistsInstance = null;
    
    // Sync down to get latest from server
    await syncDown(userId);
    
    // Get fresh playlists from cache
    const freshPlaylists = await getCachedPlaylists(userId);
    setPlaylists(freshPlaylists);
    
    // Update global cache
    globalPlaylistsInstance = {
      playlists: freshPlaylists,
      loading: false,
      error: null,
      timestamp: Date.now(),
      userId,
    };
  }, [userId]);

  return {
    playlists,
    loading,
    error,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    updatePlaylistsOrder,
    refetch,
  };
}

export default usePlaylists;
