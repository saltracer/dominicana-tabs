/**
 * Podcast Subscription Service
 * Manage user podcast subscriptions
 */

import { supabase } from '../lib/supabase';
import { Podcast, UserPodcastSubscription } from '../types';

export class PodcastSubscriptionService {
  /**
   * Get user's subscribed podcasts
   */
  static async getUserSubscriptions(): Promise<Podcast[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_podcast_subscriptions')
      .select(`
        podcast_id,
        subscribed_at,
        podcasts (
          id,
          title,
          description,
          author,
          rss_url,
          artwork_url,
          website_url,
          language,
          categories,
          is_curated,
          is_active,
          created_by,
          last_fetched_at,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .order('subscribed_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch subscriptions: ${error.message}`);

    return (data || []).map((sub: any) => ({
      id: sub.podcasts.id,
      title: sub.podcasts.title,
      description: sub.podcasts.description || undefined,
      author: sub.podcasts.author || undefined,
      rssUrl: sub.podcasts.rss_url,
      artworkUrl: sub.podcasts.artwork_url || undefined,
      websiteUrl: sub.podcasts.website_url || undefined,
      language: sub.podcasts.language || 'en',
      categories: sub.podcasts.categories || [],
      isCurated: sub.podcasts.is_curated,
      isActive: sub.podcasts.is_active,
      createdBy: sub.podcasts.created_by || undefined,
      lastFetchedAt: sub.podcasts.last_fetched_at || undefined,
      createdAt: sub.podcasts.created_at,
      updatedAt: sub.podcasts.updated_at,
    }));
  }

  /**
   * Subscribe to a podcast
   */
  static async subscribe(podcastId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_podcast_subscriptions')
      .insert({
        user_id: user.id,
        podcast_id: podcastId,
      });

    if (error) {
      if (error.code === '23505') {
        // Already subscribed
        return;
      }
      throw new Error(`Failed to subscribe: ${error.message}`);
    }
  }

  /**
   * Unsubscribe from a podcast
   */
  static async unsubscribe(podcastId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('user_podcast_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('podcast_id', podcastId);

    if (error) throw new Error(`Failed to unsubscribe: ${error.message}`);
  }

  /**
   * Check if user is subscribed to a podcast
   */
  static async isSubscribed(podcastId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_podcast_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('podcast_id', podcastId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false; // No rows returned
      throw new Error(`Failed to check subscription: ${error.message}`);
    }

    return !!data;
  }
}
