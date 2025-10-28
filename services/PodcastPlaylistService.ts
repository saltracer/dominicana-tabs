import { supabase } from '../lib/supabase';
import { Playlist, PlaylistWithEpisodes, PlaylistFilters, PodcastEpisode } from '../types/podcast-types';

export class PodcastPlaylistService {
  /**
   * Create a new playlist
   */
  static async createPlaylist(name: string, description?: string): Promise<Playlist> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_podcast_playlists')
      .insert({
        user_id: user.id,
        name,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating playlist:', error);
      throw new Error('Failed to create playlist');
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      isSystem: data.is_system,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Get all user playlists
   */
  static async getUserPlaylists(): Promise<Playlist[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_podcast_playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('is_system', { ascending: false }) // System playlists first
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching playlists:', error);
      throw new Error('Failed to fetch playlists');
    }

    return data.map(playlist => ({
      id: playlist.id,
      userId: playlist.user_id,
      name: playlist.name,
      description: playlist.description,
      isSystem: playlist.is_system,
      createdAt: playlist.created_at,
      updatedAt: playlist.updated_at,
    }));
  }

  /**
   * Get a specific playlist with episodes
   */
  static async getPlaylist(playlistId: string): Promise<PlaylistWithEpisodes | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get playlist info
    const { data: playlistData, error: playlistError } = await supabase
      .from('user_podcast_playlists')
      .select('*')
      .eq('id', playlistId)
      .eq('user_id', user.id)
      .single();

    if (playlistError || !playlistData) {
      return null;
    }

    // Get episodes
    const { data: episodesData, error: episodesError } = await supabase
      .from('user_podcast_playlist_items')
      .select(`
        *,
        podcast_episodes (
          id,
          podcast_id,
          title,
          description,
          audio_url,
          duration,
          published_at,
          episode_number,
          season_number,
          guid,
          artwork_url,
          file_size,
          mime_type,
          created_at
        )
      `)
      .eq('playlist_id', playlistId)
      .order('position');

    if (episodesError) {
      console.error('Error fetching playlist episodes:', episodesError);
      throw new Error('Failed to fetch playlist episodes');
    }

    const episodes = episodesData.map(item => ({
      id: item.podcast_episodes.id,
      podcastId: item.podcast_episodes.podcast_id,
      title: item.podcast_episodes.title,
      description: item.podcast_episodes.description,
      audioUrl: item.podcast_episodes.audio_url,
      duration: item.podcast_episodes.duration,
      publishedAt: item.podcast_episodes.published_at,
      episodeNumber: item.podcast_episodes.episode_number,
      seasonNumber: item.podcast_episodes.season_number,
      guid: item.podcast_episodes.guid,
      artworkUrl: item.podcast_episodes.artwork_url,
      fileSize: item.podcast_episodes.file_size,
      mimeType: item.podcast_episodes.mime_type,
      createdAt: item.podcast_episodes.created_at,
    }));

    return {
      id: playlistData.id,
      userId: playlistData.user_id,
      name: playlistData.name,
      description: playlistData.description,
      isSystem: playlistData.is_system,
      createdAt: playlistData.created_at,
      updatedAt: playlistData.updated_at,
      episodes,
      episodeCount: episodes.length,
    };
  }

  /**
   * Update playlist
   */
  static async updatePlaylist(playlistId: string, updates: Partial<Playlist>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_podcast_playlists')
      .update({
        name: updates.name,
        description: updates.description,
      })
      .eq('id', playlistId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating playlist:', error);
      throw new Error('Failed to update playlist');
    }
  }

  /**
   * Delete playlist
   */
  static async deletePlaylist(playlistId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_podcast_playlists')
      .delete()
      .eq('id', playlistId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting playlist:', error);
      throw new Error('Failed to delete playlist');
    }
  }

  /**
   * Add episode to playlist
   */
  static async addEpisodeToPlaylist(playlistId: string, episodeId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current max position
    const { data: maxPositionData } = await supabase
      .from('user_podcast_playlist_items')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = (maxPositionData?.position || 0) + 1;

    const { error } = await supabase
      .from('user_podcast_playlist_items')
      .insert({
        playlist_id: playlistId,
        episode_id: episodeId,
        position: nextPosition,
      });

    if (error) {
      console.error('Error adding episode to playlist:', error);
      throw new Error('Failed to add episode to playlist');
    }
  }

  /**
   * Remove episode from playlist
   */
  static async removeEpisodeFromPlaylist(playlistId: string, episodeId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_podcast_playlist_items')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('episode_id', episodeId);

    if (error) {
      console.error('Error removing episode from playlist:', error);
      throw new Error('Failed to remove episode from playlist');
    }
  }

  /**
   * Reorder playlist items
   */
  static async reorderPlaylistItems(playlistId: string, itemIds: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update positions for each item
    const updates = itemIds.map((itemId, index) => ({
      id: itemId,
      position: index + 1,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('user_podcast_playlist_items')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('playlist_id', playlistId);

      if (error) {
        console.error('Error reordering playlist items:', error);
        throw new Error('Failed to reorder playlist items');
      }
    }
  }

  /**
   * Get playlist episodes with filters
   */
  static async getPlaylistEpisodes(playlistId: string, filters?: PlaylistFilters): Promise<PodcastEpisode[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('user_podcast_playlist_items')
      .select(`
        *,
        podcast_episodes (
          id,
          podcast_id,
          title,
          description,
          audio_url,
          duration,
          published_at,
          episode_number,
          season_number,
          guid,
          artwork_url,
          file_size,
          mime_type,
          created_at
        )
      `)
      .eq('playlist_id', playlistId);

    // Apply filters
    if (filters?.podcastId) {
      query = query.eq('podcast_episodes.podcast_id', filters.podcastId);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || 'added_date';
    const sortOrder = filters?.sortOrder || 'asc';

    if (sortBy === 'added_date') {
      query = query.order('added_at', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'episode_date') {
      query = query.order('podcast_episodes.published_at', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'title') {
      query = query.order('podcast_episodes.title', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'duration') {
      query = query.order('podcast_episodes.duration', { ascending: sortOrder === 'asc' });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching playlist episodes:', error);
      throw new Error('Failed to fetch playlist episodes');
    }

    return data.map(item => ({
      id: item.podcast_episodes.id,
      podcastId: item.podcast_episodes.podcast_id,
      title: item.podcast_episodes.title,
      description: item.podcast_episodes.description,
      audioUrl: item.podcast_episodes.audio_url,
      duration: item.podcast_episodes.duration,
      publishedAt: item.podcast_episodes.published_at,
      episodeNumber: item.podcast_episodes.episode_number,
      seasonNumber: item.podcast_episodes.season_number,
      guid: item.podcast_episodes.guid,
      artworkUrl: item.podcast_episodes.artwork_url,
      fileSize: item.podcast_episodes.file_size,
      mimeType: item.podcast_episodes.mime_type,
      createdAt: item.podcast_episodes.created_at,
    }));
  }

  /**
   * Get or create the "Downloaded" system playlist
   */
  static async getOrCreateDownloadedPlaylist(): Promise<Playlist> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if downloaded playlist exists
    const { data: existingPlaylist } = await supabase
      .from('user_podcast_playlists')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_system', true)
      .eq('name', 'Downloaded')
      .single();

    if (existingPlaylist) {
      return {
        id: existingPlaylist.id,
        userId: existingPlaylist.user_id,
        name: existingPlaylist.name,
        description: existingPlaylist.description,
        isSystem: existingPlaylist.is_system,
        createdAt: existingPlaylist.created_at,
        updatedAt: existingPlaylist.updated_at,
      };
    }

    // Create downloaded playlist
    return await this.createPlaylist('Downloaded', 'Episodes downloaded for offline listening');
  }

  /**
   * Sync the downloaded playlist with actual downloads
   */
  static async syncDownloadedPlaylist(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get downloaded playlist
    const downloadedPlaylist = await this.getOrCreateDownloadedPlaylist();

    // Get all downloaded episodes
    const { data: downloads, error: downloadsError } = await supabase
      .from('user_podcast_downloads')
      .select('episode_id')
      .eq('user_id', user.id);

    if (downloadsError) {
      console.error('Error fetching downloads:', downloadsError);
      throw new Error('Failed to fetch downloads');
    }

    const downloadedEpisodeIds = downloads.map(d => d.episode_id);

    // Get current playlist items
    const { data: currentItems, error: itemsError } = await supabase
      .from('user_podcast_playlist_items')
      .select('episode_id')
      .eq('playlist_id', downloadedPlaylist.id);

    if (itemsError) {
      console.error('Error fetching playlist items:', itemsError);
      throw new Error('Failed to fetch playlist items');
    }

    const currentEpisodeIds = currentItems.map(item => item.episode_id);

    // Add new downloads to playlist
    const newDownloads = downloadedEpisodeIds.filter(id => !currentEpisodeIds.includes(id));
    for (const episodeId of newDownloads) {
      await this.addEpisodeToPlaylist(downloadedPlaylist.id, episodeId);
    }

    // Remove episodes that are no longer downloaded
    const removedDownloads = currentEpisodeIds.filter(id => !downloadedEpisodeIds.includes(id));
    for (const episodeId of removedDownloads) {
      await this.removeEpisodeFromPlaylist(downloadedPlaylist.id, episodeId);
    }
  }
}
