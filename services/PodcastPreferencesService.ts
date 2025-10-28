import { supabase } from '../lib/supabase';
import { PodcastPreferences } from '../types/podcast-types';
import { UserLiturgyPreferencesService } from './UserLiturgyPreferencesService';

export class PodcastPreferencesService {
  /**
   * Get podcast-specific preferences
   */
  static async getPodcastPreferences(podcastId: string): Promise<PodcastPreferences | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_podcast_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('podcast_id', podcastId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      console.error('Error fetching podcast preferences:', error);
      throw new Error('Failed to fetch podcast preferences');
    }

    return {
      id: data.id,
      userId: data.user_id,
      podcastId: data.podcast_id,
      playbackSpeed: data.playback_speed,
      maxEpisodesToKeep: data.max_episodes_to_keep,
      autoDownload: data.auto_download,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Update podcast preferences
   */
  static async updatePodcastPreferences(podcastId: string, prefs: Partial<PodcastPreferences>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_podcast_preferences')
      .upsert({
        user_id: user.id,
        podcast_id: podcastId,
        playback_speed: prefs.playbackSpeed,
        max_episodes_to_keep: prefs.maxEpisodesToKeep,
        auto_download: prefs.autoDownload,
      }, {
        onConflict: 'user_id,podcast_id',
      });

    if (error) {
      console.error('Error updating podcast preferences:', error);
      throw new Error('Failed to update podcast preferences');
    }
  }

  /**
   * Delete podcast preferences (reset to global defaults)
   */
  static async deletePodcastPreferences(podcastId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_podcast_preferences')
      .delete()
      .eq('user_id', user.id)
      .eq('podcast_id', podcastId);

    if (error) {
      console.error('Error deleting podcast preferences:', error);
      throw new Error('Failed to delete podcast preferences');
    }
  }

  /**
   * Get effective playback speed (podcast-specific or global fallback)
   */
  static async getEffectiveSpeed(podcastId: string, userId: string): Promise<number> {
    const podcastPrefs = await this.getPodcastPreferences(podcastId);
    
    if (podcastPrefs?.playbackSpeed !== undefined && podcastPrefs.playbackSpeed !== null) {
      return podcastPrefs.playbackSpeed;
    }

    // Fall back to global preferences
    const globalPrefs = await UserLiturgyPreferencesService.getUserPreferences(userId);
    return globalPrefs?.podcast_default_speed || 1.0;
  }

  /**
   * Get effective max episodes to keep (podcast-specific or global fallback)
   */
  static async getEffectiveMaxEpisodes(podcastId: string, userId: string): Promise<number> {
    const podcastPrefs = await this.getPodcastPreferences(podcastId);
    
    if (podcastPrefs?.maxEpisodesToKeep !== undefined && podcastPrefs.maxEpisodesToKeep !== null) {
      return podcastPrefs.maxEpisodesToKeep;
    }

    // Fall back to global preferences
    const globalPrefs = await UserLiturgyPreferencesService.getUserPreferences(userId);
    return globalPrefs?.podcast_max_downloads || 10;
  }

  /**
   * Get effective auto download setting (podcast-specific or global fallback)
   */
  static async getEffectiveAutoDownload(podcastId: string, userId: string): Promise<boolean> {
    const podcastPrefs = await this.getPodcastPreferences(podcastId);
    
    if (podcastPrefs?.autoDownload !== undefined && podcastPrefs.autoDownload !== null) {
      return podcastPrefs.autoDownload;
    }

    // Fall back to global preferences
    const globalPrefs = await UserLiturgyPreferencesService.getUserPreferences(userId);
    return globalPrefs?.podcast_auto_download || false;
  }
}
