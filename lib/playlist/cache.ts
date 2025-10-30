import { getJson, setJson } from '../podcast/storage';
import PlaylistService, { Playlist, PlaylistItem } from '../../services/PlaylistService';

type UserId = string;

export const keys = {
  playlists: (userId: UserId) => `podcast:playlists:${userId}`,
  playlistItems: (playlistId: string) => `podcast:playlistItems:${playlistId}`,
  cursorPlaylists: (userId: UserId) => `podcast:playlists:cursor:${userId}`,
  cursorItems: (playlistId: string) => `podcast:playlistItems:cursor:${playlistId}`,
  mutationQueue: (userId: UserId) => `podcast:playlists:mutations:${userId}`,
};

export type Mutation =
  | { type: 'createPlaylist'; name: string }
  | { type: 'renamePlaylist'; id: string; name: string }
  | { type: 'deletePlaylist'; id: string }
  | { type: 'addItem'; playlistId: string; payload: { episode_id?: string; external_ref?: any; position?: number } }
  | { type: 'removeItem'; itemId: string }
  | { type: 'moveItem'; playlistId: string; itemId: string; toIndex: number };

export async function getCachedPlaylists(userId: string): Promise<Playlist[]> {
  return (await getJson(keys.playlists(userId))) || [];
}

export async function setCachedPlaylists(userId: string, playlists: Playlist[]): Promise<void> {
  await setJson(keys.playlists(userId), playlists);
}

export async function getCachedItems(playlistId: string): Promise<PlaylistItem[]> {
  return (await getJson(keys.playlistItems(playlistId))) || [];
}

export async function setCachedItems(playlistId: string, items: PlaylistItem[]): Promise<void> {
  await setJson(keys.playlistItems(playlistId), items);
}

export async function enqueueMutation(userId: string, m: Mutation): Promise<void> {
  const q: Mutation[] = (await getJson(keys.mutationQueue(userId))) || [];
  q.push(m);
  await setJson(keys.mutationQueue(userId), q);
  if (__DEV__) console.log('[playlist-cache] enqueue', m.type);
}

export async function drainMutationQueue(userId: string): Promise<Mutation[]> {
  const q: Mutation[] = (await getJson(keys.mutationQueue(userId))) || [];
  await setJson(keys.mutationQueue(userId), []);
  if (__DEV__) console.log('[playlist-cache] drain', q.length);
  return q;
}

// Simple sync: fetch all playlists and items, cache them. Can be optimized to deltas.
export async function syncDown(userId: string): Promise<void> {
  const t0 = Date.now();
  const playlists = await PlaylistService.getPlaylists();
  await setCachedPlaylists(userId, playlists);
  // Fetch items for each playlist
  for (const p of playlists) {
    const items = await PlaylistService.getItems(p.id);
    await setCachedItems(p.id, items);
  }
  if (__DEV__) console.log('[playlist-cache] syncDown elapsed', Date.now() - t0, 'ms for', playlists.length, 'playlists');
}

export async function syncUp(userId: string): Promise<void> {
  const t0 = Date.now();
  const q = await drainMutationQueue(userId);
  for (const m of q) {
    try {
      if (m.type === 'createPlaylist') await PlaylistService.createPlaylist(m.name);
      else if (m.type === 'renamePlaylist') await PlaylistService.renamePlaylist(m.id, m.name);
      else if (m.type === 'deletePlaylist') await PlaylistService.deletePlaylist(m.id);
      else if (m.type === 'addItem') await PlaylistService.addItem(m.playlistId, m.payload as any, (m.payload as any).position);
      else if (m.type === 'removeItem') await PlaylistService.removeItem(m.itemId);
      else if (m.type === 'moveItem') await PlaylistService.moveItem(m.playlistId, m.itemId, m.toIndex);
    } catch (e) {
      if (__DEV__) console.warn('[playlist-cache] syncUp mutation failed', m, e);
    }
  }
  if (__DEV__) console.log('[playlist-cache] syncUp elapsed', Date.now() - t0, 'ms for', q.length, 'mutations');
}


