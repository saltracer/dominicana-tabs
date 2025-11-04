import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PlaylistService, { Playlist } from '../services/PlaylistService';
import { enqueueMutation, getCachedPlaylists, setCachedPlaylists, syncDown, syncUp } from '../lib/playlist/cache';

export function usePlaylists() {
  const { user } = useAuth();
  const userId = user?.id;
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!userId) {
        setPlaylists([]);
        return;
      }
      try {
        const loadStart = Date.now();
        setLoading(true);
        
        // Cache-first
        const cached = await getCachedPlaylists(userId);
        if (__DEV__) console.log('[usePlaylists] Loaded', cached.length, 'playlists from cache in', Date.now() - loadStart, 'ms');
        if (isMounted && cached.length) setPlaylists(cached);
        
        // Sync mutations up
        const syncUpStart = Date.now();
        await syncUp(userId);
        if (__DEV__) console.log('[usePlaylists] syncUp completed in', Date.now() - syncUpStart, 'ms');
        
        // Only do full syncDown if cache was empty (first load)
        // Skip DB refresh if we have cached data (it's already fresh from optimistic updates)
        if (cached.length === 0) {
          if (__DEV__) console.log('[usePlaylists] Cache empty, doing full syncDown');
          const syncDownStart = Date.now();
          await syncDown(userId);
          if (__DEV__) console.log('[usePlaylists] syncDown completed in', Date.now() - syncDownStart, 'ms');
        } else {
          // Cache hit - use cached data (already synchronized via optimistic updates)
          if (__DEV__) console.log('[usePlaylists] ✅ Cache hit, using cached data (skipping DB refresh)');
        }
        
        const fresh = await getCachedPlaylists(userId);
        if (isMounted) {
          setPlaylists(fresh);
        }
        if (__DEV__) console.log('[usePlaylists] Loaded', fresh.length, 'playlists in', Date.now() - loadStart, 'ms');
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [userId]);

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
  }, [userId, playlists]);

  return {
    playlists,
    loading,
    error,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    updatePlaylistsOrder,
  };
}

export default usePlaylists;
