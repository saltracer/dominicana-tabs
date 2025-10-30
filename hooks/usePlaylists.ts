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
        setLoading(true);
        // Cache-first
        const cached = await getCachedPlaylists(userId);
        if (isMounted && cached.length) setPlaylists(cached);
        // Background sync up + down
        await syncUp(userId);
        await syncDown(userId);
        const fresh = await getCachedPlaylists(userId);
        if (isMounted) setPlaylists(fresh);
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
    await syncDown(userId);
    setPlaylists(await getCachedPlaylists(userId));
  }, [userId, playlists]);

  const renamePlaylist = useCallback(async (id: string, name: string) => {
    if (!userId) return;
    const next = playlists.map(p => p.id === id ? { ...p, name, updated_at: new Date().toISOString() } : p);
    setPlaylists(next);
    await setCachedPlaylists(userId, next);
    await enqueueMutation(userId, { type: 'renamePlaylist', id, name });
    await syncUp(userId);
    await syncDown(userId);
    setPlaylists(await getCachedPlaylists(userId));
  }, [userId, playlists]);

  const deletePlaylist = useCallback(async (id: string) => {
    if (!userId) return;
    const next = playlists.filter(p => p.id !== id);
    setPlaylists(next);
    await setCachedPlaylists(userId, next);
    await enqueueMutation(userId, { type: 'deletePlaylist', id });
    await syncUp(userId);
    await syncDown(userId);
    setPlaylists(await getCachedPlaylists(userId));
  }, [userId, playlists]);

  return {
    playlists,
    loading,
    error,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
  };
}

export default usePlaylists;
