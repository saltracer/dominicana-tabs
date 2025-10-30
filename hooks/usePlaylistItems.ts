import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PlaylistService, { PlaylistItem, ExternalEpisodeRef } from '../services/PlaylistService';
import { enqueueMutation, getCachedItems, setCachedItems, syncDown, syncUp } from '../lib/playlist/cache';

export function usePlaylistItems(playlistId?: string) {
  const { user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!userId || !playlistId) {
        setItems([]);
        return;
      }
      try {
        setLoading(true);
        const cached = await getCachedItems(playlistId);
        if (isMounted && cached.length) setItems(cached);
        await syncUp(userId);
        await syncDown(userId);
        const fresh = await getCachedItems(playlistId);
        if (isMounted) setItems(fresh);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [userId, playlistId]);

  const addItem = useCallback(async (payload: { episode_id?: string; external_ref?: ExternalEpisodeRef }, position?: number) => {
    if (!userId || !playlistId) return;
    // optimistic
    const optimistic: PlaylistItem = {
      id: `temp-${Date.now()}`,
      playlist_id: playlistId,
      episode_id: payload.episode_id ?? null,
      external_ref: (payload.external_ref as any) ?? null,
      position: position ?? (items.length ? items[items.length - 1].position + 1 : 0),
      added_at: new Date().toISOString(),
    };
    const next = [...items, optimistic];
    setItems(next);
    await setCachedItems(playlistId, next);
    await enqueueMutation(userId, { type: 'addItem', playlistId, payload: { ...payload, position } as any });
    await syncUp(userId);
    await syncDown(userId);
    setItems(await getCachedItems(playlistId));
  }, [userId, playlistId, items]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!userId || !playlistId) return;
    const next = items.filter(i => i.id !== itemId);
    setItems(next);
    await setCachedItems(playlistId, next);
    await enqueueMutation(userId, { type: 'removeItem', itemId });
    await syncUp(userId);
    await syncDown(userId);
    setItems(await getCachedItems(playlistId));
  }, [userId, playlistId, items]);

  const moveItem = useCallback(async (itemId: string, toIndex: number) => {
    if (!userId || !playlistId) return;
    const arr = items.slice();
    const from = arr.findIndex(i => i.id === itemId);
    if (from === -1) return;
    const [moved] = arr.splice(from, 1);
    arr.splice(Math.max(0, Math.min(toIndex, arr.length)), 0, moved);
    const resequenced = arr.map((i, idx) => ({ ...i, position: idx }));
    setItems(resequenced);
    await setCachedItems(playlistId, resequenced);
    await enqueueMutation(userId, { type: 'moveItem', playlistId, itemId, toIndex });
    await syncUp(userId);
    await syncDown(userId);
    setItems(await getCachedItems(playlistId));
  }, [userId, playlistId, items]);

  return { items, loading, error, addItem, removeItem, moveItem };
}

export default usePlaylistItems;


