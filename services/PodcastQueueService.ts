import { supabase } from '../lib/supabase';
import { PodcastEpisode, Playlist } from '../types/podcast-types';
import { PodcastPlaylistService } from './PodcastPlaylistService';

export class PodcastQueueService {
  /**
   * Get current queue
   */
  static async getQueue(): Promise<PodcastEpisode[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_podcast_queue')
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
      .eq('user_id', user.id)
      .order('position');

    if (error) {
      console.error('Error fetching queue:', error);
      throw new Error('Failed to fetch queue');
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
   * Add episode to queue
   */
  static async addToQueue(episodeId: string, position?: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // If no position specified, add to end
    if (position === undefined) {
      const { data: maxPositionData } = await supabase
        .from('user_podcast_queue')
        .select('position')
        .eq('user_id', user.id)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      position = (maxPositionData?.position || 0) + 1;
    }

    const { error } = await supabase
      .from('user_podcast_queue')
      .insert({
        user_id: user.id,
        episode_id: episodeId,
        position,
      });

    if (error) {
      console.error('Error adding episode to queue:', error);
      throw new Error('Failed to add episode to queue');
    }
  }

  /**
   * Remove episode from queue
   */
  static async removeFromQueue(episodeId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_podcast_queue')
      .delete()
      .eq('user_id', user.id)
      .eq('episode_id', episodeId);

    if (error) {
      console.error('Error removing episode from queue:', error);
      throw new Error('Failed to remove episode from queue');
    }
  }

  /**
   * Reorder queue
   */
  static async reorderQueue(episodeIds: string[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update positions for each episode
    for (let i = 0; i < episodeIds.length; i++) {
      const { error } = await supabase
        .from('user_podcast_queue')
        .update({ position: i + 1 })
        .eq('user_id', user.id)
        .eq('episode_id', episodeIds[i]);

      if (error) {
        console.error('Error reordering queue:', error);
        throw new Error('Failed to reorder queue');
      }
    }
  }

  /**
   * Clear entire queue
   */
  static async clearQueue(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_podcast_queue')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing queue:', error);
      throw new Error('Failed to clear queue');
    }
  }

  /**
   * Add episode as next in queue
   */
  static async playNext(episodeId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current queue to find next position
    const { data: currentQueue } = await supabase
      .from('user_podcast_queue')
      .select('position')
      .eq('user_id', user.id)
      .order('position')
      .limit(1);

    const nextPosition = currentQueue && currentQueue.length > 0 ? currentQueue[0].position : 1;

    // Shift all existing items down by 1
    const { error: shiftError } = await supabase
      .from('user_podcast_queue')
      .update({ position: supabase.raw('position + 1') })
      .eq('user_id', user.id)
      .gte('position', nextPosition);

    if (shiftError) {
      console.error('Error shifting queue items:', shiftError);
      throw new Error('Failed to shift queue items');
    }

    // Add new episode at the next position
    await this.addToQueue(episodeId, nextPosition);
  }

  /**
   * Add episode to end of queue
   */
  static async playLast(episodeId: string): Promise<void> {
    await this.addToQueue(episodeId);
  }

  /**
   * Save current queue as a playlist
   */
  static async saveQueueAsPlaylist(name: string): Promise<Playlist> {
    const queue = await this.getQueue();
    
    // Create new playlist
    const playlist = await PodcastPlaylistService.createPlaylist(name, 'Saved from queue');

    // Add all queue episodes to playlist
    for (const episode of queue) {
      await PodcastPlaylistService.addEpisodeToPlaylist(playlist.id, episode.id);
    }

    return playlist;
  }
}
