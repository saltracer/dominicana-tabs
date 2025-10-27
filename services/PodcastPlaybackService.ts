/**
 * Podcast Playback Service
 * Manage podcast playback and progress tracking
 */

import { supabase } from '../lib/supabase';
import { PodcastEpisode, PodcastPlaybackProgress } from '../types';

export class PodcastPlaybackService {
  /**
   * Save or update playback progress
   */
  static async saveProgress(
    episodeId: string,
    position: number,
    duration?: number,
    completed = false
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Silently fail if not authenticated

    const { error } = await supabase
      .from('podcast_playback_progress')
      .upsert({
        user_id: user.id,
        episode_id: episodeId,
        position,
        duration,
        completed,
        last_played_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,episode_id',
      });

    if (error) {
      console.error('Error saving progress:', error);
    }
  }

  /**
   * Get playback progress for an episode
   */
  static async getProgress(episodeId: string): Promise<PodcastPlaybackProgress | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('podcast_playback_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('episode_id', episodeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      console.error('Error fetching progress:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      episodeId: data.episode_id,
      position: data.position,
      duration: data.duration || undefined,
      completed: data.completed,
      lastPlayedAt: data.last_played_at,
    };
  }

  /**
   * Mark episode as completed
   */
  static async markCompleted(episodeId: string, duration?: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('podcast_playback_progress')
      .upsert({
        user_id: user.id,
        episode_id: episodeId,
        position: duration || 0,
        duration,
        completed: true,
        last_played_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,episode_id',
      });
  }

  /**
   * Delete progress for an episode (mark as unplayed)
   */
  static async deleteProgress(episodeId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('podcast_playback_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('episode_id', episodeId);
  }

  /**
   * Get all progress for user
   */
  static async getAllProgress(): Promise<PodcastPlaybackProgress[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('podcast_playback_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('last_played_at', { ascending: false });

    if (error) {
      console.error('Error fetching progress:', error);
      return [];
    }

    return (data || []).map(progress => ({
      id: progress.id,
      userId: progress.user_id,
      episodeId: progress.episode_id,
      position: progress.position,
      duration: progress.duration || undefined,
      completed: progress.completed,
      lastPlayedAt: progress.last_played_at,
    }));
  }

  /**
   * Get in-progress episodes (started but not completed)
   */
  static async getInProgressEpisodes(): Promise<PodcastPlaybackProgress[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('podcast_playback_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', false)
      .order('last_played_at', { ascending: false });

    if (error) {
      console.error('Error fetching in-progress episodes:', error);
      return [];
    }

    return (data || []).map(progress => ({
      id: progress.id,
      userId: progress.user_id,
      episodeId: progress.episode_id,
      position: progress.position,
      duration: progress.duration || undefined,
      completed: progress.completed,
      lastPlayedAt: progress.last_played_at,
    }));
  }
}
