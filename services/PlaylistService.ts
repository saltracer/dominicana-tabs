import { supabase } from '../lib/supabase';

export type Playlist = {
  id: string;
  user_id: string;
  name: string;
  is_builtin: boolean;
  created_at: string;
  updated_at: string;
};

export type ExternalEpisodeRef = {
  podcastId: string;
  guid?: string;
  audioUrl?: string;
  // Additional metadata for display when episode isn't in cache
  title?: string;
  description?: string;
  duration?: number;
  publishedAt?: string;
  artworkUrl?: string;
};

export type PlaylistItem = {
  id: string;
  playlist_id: string;
  episode_id: string | null;
  external_ref: ExternalEpisodeRef | null;
  position: number;
  added_at: string;
};

export default class PlaylistService {
  static async getPlaylists(): Promise<Playlist[]> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('is_builtin', { ascending: false })
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data as unknown as Playlist[];
  }

  static async createPlaylist(name: string): Promise<Playlist> {
    const { data: auth } = await (supabase as any).auth.getUser();
    const userId: string | undefined = auth?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('playlists')
      .insert({ name, user_id: userId })
      .select('*')
      .single();
    if (error) throw error;
    return data as unknown as Playlist;
  }

  static async renamePlaylist(id: string, name: string): Promise<Playlist> {
    const { data, error } = await supabase
      .from('playlists')
      .update({ name })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as unknown as Playlist;
  }

  static async deletePlaylist(id: string): Promise<void> {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  static async getItems(playlistId: string): Promise<PlaylistItem[]> {
    const { data, error } = await supabase
      .from('playlist_items')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('position');
    if (error) throw error;
    return data as unknown as PlaylistItem[];
  }

  static async addItem(
    playlistId: string,
    item:
      | { episode_id: string; external_ref?: undefined }
      | { episode_id?: undefined; external_ref: ExternalEpisodeRef },
    position?: number
  ): Promise<PlaylistItem> {
    const payload: any = { playlist_id: playlistId, position: position ?? 2147483647 };
    if ('episode_id' in item && item.episode_id) payload.episode_id = item.episode_id;
    if ('external_ref' in item && item.external_ref) payload.external_ref = item.external_ref as any;

    const { data, error } = await supabase
      .from('playlist_items')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return data as unknown as PlaylistItem;
  }

  static async removeItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('playlist_items')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
  }

  static async moveItem(
    playlistId: string,
    itemId: string,
    toIndex: number
  ): Promise<void> {
    if (__DEV__) console.log('[PlaylistService] moveItem called:', { playlistId, itemId, toIndex });
    
    // Fetch current items to reassign positions (simple approach; can be optimized server-side)
    const items = await this.getItems(playlistId);
    if (__DEV__) console.log('[PlaylistService] Current items count:', items.length);
    if (__DEV__) console.log('[PlaylistService] Current items:', items.map(i => ({ id: i.id, position: i.position })));
    
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx === -1) {
      if (__DEV__) console.warn('[PlaylistService] Item not found:', itemId);
      return;
    }
    
    if (__DEV__) console.log('[PlaylistService] Found item at index:', idx, 'moving to:', toIndex);
    const [moved] = items.splice(idx, 1);
    items.splice(Math.max(0, Math.min(toIndex, items.length)), 0, moved);
    
    // Re-number positions sequentially - include ALL fields to satisfy INSERT policy during upsert
    const updates = items.map((i, index) => ({
      id: i.id,
      playlist_id: i.playlist_id,
      episode_id: i.episode_id,
      external_ref: i.external_ref,
      position: index,
      added_at: i.added_at,
    }));
    if (__DEV__) console.log('[PlaylistService] Updating positions:', updates);
    
    if (__DEV__) console.log('[PlaylistService] Calling supabase.upsert with onConflict: id');
    const { data, error } = await supabase
      .from('playlist_items')
      .upsert(updates, { onConflict: 'id' });
    
    if (error) {
      console.error('[PlaylistService] Upsert failed:', error);
      console.error('[PlaylistService] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    
    if (__DEV__) console.log('[PlaylistService] Upsert succeeded, data:', data);
    if (__DEV__) console.log('[PlaylistService] moveItem completed successfully');
  }
}


