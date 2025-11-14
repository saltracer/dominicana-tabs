import { useState, useCallback } from 'react';
import { UserPodcastService } from '../services/UserPodcastService';
import { PodcastSubscriptionService } from '../services/PodcastSubscriptionService';
import { Podcast, RssFeedValidationResult, PodcastShareLink } from '../types/podcast-types';
import { useAuth } from '../contexts/AuthContext';

export function useUserPodcasts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Validate RSS feed before adding
   */
  const validateFeed = useCallback(async (rssUrl: string): Promise<RssFeedValidationResult> => {
    if (!user) {
      return {
        isValid: false,
        error: 'User not authenticated',
      };
    }

    setLoading(true);
    setError(null);
    
    const result = await UserPodcastService.validateRssFeed(rssUrl);
    setLoading(false);
    
    return result;
  }, [user]);

  /**
   * Add custom podcast
   * If it's a duplicate of a curated podcast, auto-subscribes to the curated version
   */
  const addCustomPodcast = useCallback(async (rssUrl: string): Promise<{
    success: boolean;
    podcast?: Podcast;
    isDuplicate?: boolean;
    error?: string;
  }> => {
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    setLoading(true);
    setError(null);
    
    try {
      const podcast = await UserPodcastService.addCustomPodcast(rssUrl);
      
      // Auto-subscribe to the newly added podcast
      await PodcastSubscriptionService.subscribe(podcast.id);
      
      setLoading(false);
      return {
        success: true,
        podcast,
      };
    } catch (err) {
      setLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Failed to add podcast';
      
      // Check if it's a duplicate error
      if (errorMsg.startsWith('DUPLICATE:')) {
        const duplicatePodcastId = errorMsg.split(':')[1];
        try {
          // Subscribe to the curated version
          await PodcastSubscriptionService.subscribe(duplicatePodcastId);
          
          // Get the podcast details
          const { data } = await import('../lib/supabase').then(m => m.supabase)
            .from('podcasts')
            .select('*')
            .eq('id', duplicatePodcastId)
            .single();
          
          setLoading(false);
          return {
            success: true,
            isDuplicate: true,
            podcast: data ? {
              id: data.id,
              title: data.title,
              description: data.description,
              author: data.author,
              rssUrl: data.rss_url,
              artworkUrl: data.artwork_url,
              websiteUrl: data.website_url,
              language: data.language,
              categories: data.categories,
              isCurated: data.is_curated,
              isActive: data.is_active,
              createdBy: data.created_by,
              lastFetchedAt: data.last_fetched_at,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
              shareCount: data.share_count || 0,
            } : undefined,
          };
        } catch (subscribeErr) {
          setLoading(false);
          return {
            success: false,
            error: 'This podcast is already in our library, but we could not subscribe you to it.',
          };
        }
      }
      
      const error = err instanceof Error ? err : new Error(errorMsg);
      setError(error);
      setLoading(false);
      return {
        success: false,
        error: error.message,
      };
    }
  }, [user]);

  /**
   * Remove custom podcast
   */
  const removeCustomPodcast = useCallback(async (podcastId: string): Promise<boolean> => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      await UserPodcastService.removeCustomPodcast(podcastId);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove podcast');
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Generate share link for a podcast
   */
  const generateShareLink = useCallback(async (podcastId: string): Promise<PodcastShareLink | null> => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const shareLink = await UserPodcastService.generateShareLink(podcastId);
      return shareLink;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate share link');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Subscribe via share link
   */
  const subscribeViaShareLink = useCallback(async (token: string): Promise<{
    success: boolean;
    podcast?: Podcast;
    error?: string;
  }> => {
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    try {
      setLoading(true);
      setError(null);
      const podcast = await UserPodcastService.subscribeThroughShareLink(token);
      return {
        success: true,
        podcast,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to subscribe via share link');
      setError(error);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get podcast by share token (without subscribing)
   */
  const getPodcastByShareToken = useCallback(async (token: string): Promise<Podcast | null> => {
    try {
      setLoading(true);
      setError(null);
      const podcast = await UserPodcastService.getPodcastByShareToken(token);
      return podcast;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load podcast');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    validateFeed,
    addCustomPodcast,
    removeCustomPodcast,
    generateShareLink,
    subscribeViaShareLink,
    getPodcastByShareToken,
  };
}

