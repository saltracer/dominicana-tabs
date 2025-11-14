/**
 * User Podcast Service
 * Manages user-added custom podcast feeds with sharing capabilities
 */

import { supabase } from '../lib/supabase';
import { Podcast, RssFeedValidationResult, PodcastShareLink } from '../types/podcast-types';
import { RssFeedService } from './RssFeedService';
import { AdminPodcastService } from './AdminPodcastService';

export class UserPodcastService {
  /**
   * Validate RSS feed without adding to database
   */
  static async validateRssFeed(rssUrl: string): Promise<RssFeedValidationResult> {
    try {
      // Basic URL validation
      if (!RssFeedService.isValidRssUrl(rssUrl)) {
        return {
          isValid: false,
          error: 'Invalid URL format. Please enter a valid HTTP or HTTPS URL.',
        };
      }

      // Check if RSS URL already exists as a curated podcast
      const duplicateCheck = await this.checkDuplicateRssUrl(rssUrl);
      if (duplicateCheck.isDuplicate) {
        return {
          isValid: true,
          isDuplicate: true,
          duplicatePodcastId: duplicateCheck.podcastId,
          error: 'This podcast is already in our curated library.',
        };
      }

      // Try to parse the RSS feed (wrap in additional try-catch to prevent React error boundary)
      let parsedFeed;
      try {
        parsedFeed = await RssFeedService.parseRssFeed(rssUrl);
      } catch (parseError) {
        // Immediately catch and convert to result object
        let errorMessage = 'Failed to parse RSS feed. Please check the URL and try again.';
        
        if (parseError instanceof Error) {
          if (parseError.message.includes('Network request failed') || parseError.message.includes('Failed to fetch') || parseError.message.includes('HTTP')) {
            errorMessage = 'Unable to reach the podcast feed. Please check the URL and your internet connection.';
          } else if (parseError.message.includes('Unsupported feed format')) {
            errorMessage = 'This URL does not appear to be a valid podcast RSS feed.';
          }
        }
        
        return {
          isValid: false,
          error: errorMessage,
        };
      }

      return {
        isValid: true,
        feed: parsedFeed,
        isDuplicate: false,
      };
    } catch (error) {
      // This catch is for other errors (duplicate check, etc.)
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof Error) {
        // Check for common error patterns and provide helpful messages
        if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch') || error.message.includes('HTTP')) {
          errorMessage = 'Unable to reach the podcast feed. Please check the URL and your internet connection.';
        } else if (error.message.includes('Unsupported feed format')) {
          errorMessage = 'This URL does not appear to be a valid podcast RSS feed.';
        } else if (error.message.includes('Failed to parse')) {
          errorMessage = 'The feed could not be parsed. Please ensure this is a valid podcast RSS feed.';
        }
      }
      
      return {
        isValid: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if RSS URL already exists as a curated podcast
   */
  static async checkDuplicateRssUrl(rssUrl: string): Promise<{ isDuplicate: boolean; podcastId?: string }> {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('id, is_curated')
        .eq('rss_url', rssUrl)
        .eq('is_curated', true)
        .single();

      if (error) {
        // No duplicate found (or other error)
        return { isDuplicate: false };
      }

      return {
        isDuplicate: true,
        podcastId: data.id,
      };
    } catch (error) {
      // Silently handle error
      return { isDuplicate: false };
    }
  }

  /**
   * Add custom podcast from RSS URL
   */
  static async addCustomPodcast(rssUrl: string): Promise<Podcast> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate RSS feed
    const validation = await this.validateRssFeed(rssUrl);
    
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid RSS feed');
    }

    // If duplicate curated podcast exists, throw error with podcast ID
    if (validation.isDuplicate && validation.duplicatePodcastId) {
      throw new Error(`DUPLICATE:${validation.duplicatePodcastId}`);
    }

    if (!validation.feed) {
      throw new Error('Failed to parse RSS feed');
    }

    const parsedFeed = validation.feed;

    // Insert podcast (not curated by default)
    const { data: podcastData, error } = await supabase
      .from('podcasts')
      .insert({
        title: parsedFeed.title,
        description: parsedFeed.description,
        author: parsedFeed.author,
        rss_url: rssUrl,
        artwork_url: parsedFeed.artworkUrl,
        website_url: parsedFeed.websiteUrl,
        language: parsedFeed.language || 'en',
        categories: parsedFeed.categories,
        is_curated: false, // User-added podcasts are not curated
        is_active: true,
        created_by: user.id,
        last_fetched_at: new Date().toISOString(),
        share_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating podcast:', error);
      throw new Error(`Failed to add podcast: ${error.message}`);
    }

    const podcast = this.transformPodcast(podcastData);

    // Add episodes
    if (parsedFeed.episodes.length > 0) {
      try {
        await AdminPodcastService.addEpisodes(podcast.id, parsedFeed.episodes);
      } catch (error) {
        console.error('Error adding episodes:', error);
        // Don't throw - podcast was created successfully
      }
    }

    return podcast;
  }

  /**
   * Get user's added podcasts (non-curated podcasts created by user)
   */
  static async getUserAddedPodcasts(): Promise<Podcast[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('created_by', user.id)
      .eq('is_curated', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch your podcasts: ${error.message}`);
    }

    return (data || []).map(this.transformPodcast);
  }

  /**
   * Remove custom podcast (only if user owns it and it's not curated)
   */
  static async removeCustomPodcast(podcastId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First verify the podcast belongs to the user and is not curated
    const { data: podcast, error: fetchError } = await supabase
      .from('podcasts')
      .select('created_by, is_curated')
      .eq('id', podcastId)
      .single();

    if (fetchError) {
      throw new Error('Podcast not found');
    }

    if (podcast.created_by !== user.id) {
      throw new Error('You do not have permission to delete this podcast');
    }

    if (podcast.is_curated) {
      throw new Error('Cannot delete curated podcasts');
    }

    // Delete the podcast (cascade will handle episodes, subscriptions, etc.)
    const { error } = await supabase
      .from('podcasts')
      .delete()
      .eq('id', podcastId);

    if (error) {
      console.error('Error deleting podcast:', error);
      throw new Error(`Failed to delete podcast: ${error.message}`);
    }
  }

  /**
   * Generate share link for a podcast
   */
  static async generateShareLink(podcastId: string): Promise<PodcastShareLink> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Verify user owns this podcast
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select('id, created_by, is_curated')
      .eq('id', podcastId)
      .single();

    if (error || !podcast) {
      throw new Error('Podcast not found');
    }

    if (podcast.created_by !== user.id && !podcast.is_curated) {
      throw new Error('You do not have permission to share this podcast');
    }

    // Generate a simple token (podcast ID encoded in base64 for obfuscation)
    const token = Buffer.from(podcastId).toString('base64url');
    
    // Construct the share URL
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.EXPO_PUBLIC_WEB_URL || 'https://dominicana.app';
    
    const url = `${baseUrl}/shared-podcast/${token}`;

    return {
      token,
      podcastId,
      url,
    };
  }

  /**
   * Validate share link token and return podcast ID
   */
  static async validateShareLink(token: string): Promise<string> {
    try {
      // Decode the token to get podcast ID
      const podcastId = Buffer.from(token, 'base64url').toString('utf-8');
      
      // Verify podcast exists and is either curated or active
      const { data: podcast, error } = await supabase
        .from('podcasts')
        .select('id, is_active')
        .eq('id', podcastId)
        .single();

      if (error || !podcast || !podcast.is_active) {
        throw new Error('Invalid or inactive podcast');
      }

      return podcastId;
    } catch (error) {
      throw new Error('Invalid share link');
    }
  }

  /**
   * Subscribe to a podcast through share link
   */
  static async subscribeThroughShareLink(token: string): Promise<Podcast> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate token and get podcast ID
    const podcastId = await this.validateShareLink(token);

    // Get the podcast
    const { data: podcastData, error: podcastError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', podcastId)
      .single();

    if (podcastError || !podcastData) {
      throw new Error('Podcast not found');
    }

    // Check if already subscribed
    const { data: existingSub } = await supabase
      .from('user_podcast_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('podcast_id', podcastId)
      .single();

    if (!existingSub) {
      // Subscribe to the podcast
      const { error: subError } = await supabase
        .from('user_podcast_subscriptions')
        .insert({
          user_id: user.id,
          podcast_id: podcastId,
        });

      if (subError) {
        console.error('Error subscribing to podcast:', subError);
        throw new Error('Failed to subscribe to podcast');
      }

      // Increment share count using the database function
      try {
        await supabase.rpc('increment_podcast_share_count', {
          podcast_id: podcastId,
        });
      } catch (error) {
        // Non-fatal error
        console.error('Error incrementing share count:', error);
      }
    }

    return this.transformPodcast(podcastData);
  }

  /**
   * Get a podcast by share token (without subscribing)
   */
  static async getPodcastByShareToken(token: string): Promise<Podcast> {
    const podcastId = await this.validateShareLink(token);

    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', podcastId)
      .single();

    if (error || !data) {
      throw new Error('Podcast not found');
    }

    return this.transformPodcast(data);
  }

  /**
   * Transform database row to Podcast type
   */
  private static transformPodcast(data: any): Podcast {
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      author: data.author || undefined,
      rssUrl: data.rss_url,
      artworkUrl: data.artwork_url || undefined,
      websiteUrl: data.website_url || undefined,
      language: data.language || 'en',
      categories: data.categories || [],
      isCurated: data.is_curated,
      isActive: data.is_active,
      createdBy: data.created_by || undefined,
      lastFetchedAt: data.last_fetched_at || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      shareCount: data.share_count || 0,
    };
  }
}

