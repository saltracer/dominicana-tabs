/**
 * Admin Podcast Service
 * Admin operations for managing podcasts
 */

import { supabase } from '../lib/supabase';
import { RssFeedService } from './RssFeedService';
import { Podcast, PodcastEpisode, PodcastFilters, PodcastListResponse, CreatePodcastData, UpdatePodcastData, ParsedRssEpisode } from '../types';

export class AdminPodcastService {
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

  /**
   * Transform database row to PodcastEpisode type
   */
  private static transformEpisode(data: any): PodcastEpisode {
    return {
      id: data.id,
      podcastId: data.podcast_id,
      title: data.title,
      description: data.description || undefined,
      audioUrl: data.audio_url,
      duration: data.duration || undefined,
      publishedAt: data.published_at || undefined,
      episodeNumber: data.episode_number || undefined,
      seasonNumber: data.season_number || undefined,
      guid: data.guid,
      artworkUrl: data.artwork_url || undefined,
      fileSize: data.file_size || undefined,
      mimeType: data.mime_type || undefined,
      createdAt: data.created_at,
    };
  }

  /**
   * Helper to add episodes for a podcast (public for use by UserPodcastService)
   * Uses a secure database function to bypass RLS restrictions
   */
  static async addEpisodes(podcastId: string, episodes: ParsedRssEpisode[]) {
    const episodeData = episodes.map(ep => ({
      title: ep.title,
      description: ep.description || null,
      audio_url: ep.audioUrl,
      duration: ep.duration || null,
      published_at: ep.publishedAt || null,
      episode_number: ep.episodeNumber || null,
      season_number: ep.seasonNumber || null,
      guid: ep.guid,
      artwork_url: ep.artworkUrl || null,
      file_size: ep.fileSize || null,
      mime_type: ep.mimeType || null,
    }));

    // Use the SECURITY DEFINER function to insert episodes
    // This bypasses RLS in a controlled way
    const { data, error } = await supabase.rpc('insert_podcast_episodes', {
      p_podcast_id: podcastId,
      p_episodes: episodeData,
    });

    if (error) {
      if (__DEV__) {
        console.log('[AdminPodcastService.addEpisodes] RPC error:', JSON.stringify(error, null, 2));
        console.log('[AdminPodcastService.addEpisodes] Episode count:', episodes.length);
      }
      throw new Error(`Failed to insert episodes: ${error.message || error.code || 'Unknown error'}`);
    }
  }

  /**
   * List all podcasts (including non-curated) for admin
   */
  static async listPodcasts(
    filters: PodcastFilters = {},
    pagination = { page: 1, limit: 50 }
  ): Promise<PodcastListResponse> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('podcasts')
      .select('*', { count: 'exact' });

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,author.ilike.%${filters.search}%`
      );
    }

    if (filters.isCurated !== undefined) {
      query = query.eq('is_curated', filters.isCurated);
    }

    if (filters.category) {
      query = query.contains('categories', [filters.category]);
    }

    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to list podcasts: ${error.message}`);

    return {
      podcasts: (data || []).map(this.transformPodcast),
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  /**
   * Preview RSS feed without saving to database
   */
  static async previewRssFeed(rssUrl: string) {
    if (!RssFeedService.isValidRssUrl(rssUrl)) {
      throw new Error('Invalid RSS URL');
    }
    const parsed = await RssFeedService.parseRssFeed(rssUrl);
    return {
      title: parsed.title,
      description: parsed.description,
      author: parsed.author,
      artworkUrl: parsed.artworkUrl,
      websiteUrl: parsed.websiteUrl,
      language: parsed.language,
      categories: parsed.categories,
      episodeCount: parsed.episodes.length,
      episodes: parsed.episodes.slice(0, 5),
    };
  }

  /**
   * Add podcast from RSS URL
   */
  static async addPodcast(data: CreatePodcastData): Promise<Podcast> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    if (!RssFeedService.isValidRssUrl(data.rssUrl)) throw new Error('Invalid RSS URL');

    const parsedFeed = await RssFeedService.parseRssFeed(data.rssUrl);

    const { data: podcastData, error } = await supabase
      .from('podcasts')
      .insert({
        title: parsedFeed.title,
        description: parsedFeed.description,
        author: parsedFeed.author,
        rss_url: data.rssUrl,
        artwork_url: data.artworkUrl || parsedFeed.artworkUrl,
        website_url: parsedFeed.websiteUrl,
        language: data.language || parsedFeed.language || 'en',
        categories: data.categories || parsedFeed.categories,
        is_curated: data.isCurated || false,
        created_by: user.id,
        last_fetched_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create podcast: ${error.message}`);

    const podcast = this.transformPodcast(podcastData);

    if (parsedFeed.episodes.length > 0) {
      try {
        await this.addEpisodes(podcast.id, parsedFeed.episodes);
      } catch (error) {
        console.error('Error adding episodes:', error);
      }
    }

    return podcast;
  }

  /**
   * Get podcast by ID
   */
  static async getPodcast(id: string): Promise<Podcast> {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch podcast: ${error.message}`);
    return this.transformPodcast(data);
  }

  /**
   * Update podcast
   */
  static async updatePodcast(id: string, updates: UpdatePodcastData): Promise<Podcast> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.author !== undefined) updateData.author = updates.author;
    if (updates.artworkUrl !== undefined) updateData.artwork_url = updates.artworkUrl;
    if (updates.websiteUrl !== undefined) updateData.website_url = updates.websiteUrl;
    if (updates.language !== undefined) updateData.language = updates.language;
    if (updates.categories !== undefined) updateData.categories = updates.categories;
    if (updates.isCurated !== undefined) updateData.is_curated = updates.isCurated;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('podcasts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update podcast: ${error.message}`);
    return this.transformPodcast(data);
  }

  /**
   * Delete podcast
   */
  static async deletePodcast(id: string): Promise<void> {
    const { error } = await supabase.from('podcasts').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete podcast: ${error.message}`);
  }

  /**
   * Refresh episodes from RSS feed
   */
  static async refreshEpisodes(podcastId: string): Promise<void> {
    const podcast = await this.getPodcast(podcastId);
    const parsedFeed = await RssFeedService.parseRssFeed(podcast.rssUrl);
    await this.addEpisodes(podcastId, parsedFeed.episodes);
    await supabase
      .from('podcasts')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', podcastId);
  }

  /**
   * Refresh all active podcasts from their RSS feeds
   * Returns statistics about the refresh operation
   */
  static async refreshAllEpisodes(options: { onlyActive?: boolean; onlyCurated?: boolean } = {}): Promise<{
    total: number;
    succeeded: number;
    failed: number;
    errors: Array<{ podcastId: string; podcastTitle: string; error: string }>;
  }> {
    const { onlyActive = true, onlyCurated = false } = options;
    
    // Fetch all podcasts that match criteria
    let query = supabase.from('podcasts').select('id, title, rss_url, is_active');
    
    if (onlyActive) {
      query = query.eq('is_active', true);
    }
    
    if (onlyCurated) {
      query = query.eq('is_curated', true);
    }
    
    const { data: podcasts, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch podcasts: ${error.message}`);
    }
    
    const stats = {
      total: podcasts?.length || 0,
      succeeded: 0,
      failed: 0,
      errors: [] as Array<{ podcastId: string; podcastTitle: string; error: string }>,
    };
    
    if (!podcasts || podcasts.length === 0) {
      return stats;
    }
    
    // Refresh each podcast sequentially to avoid overwhelming the system
    for (const podcast of podcasts) {
      try {
        await this.refreshEpisodes(podcast.id);
        stats.succeeded++;
      } catch (error) {
        stats.failed++;
        stats.errors.push({
          podcastId: podcast.id,
          podcastTitle: podcast.title,
          error: error instanceof Error ? error.message : String(error),
        });
        console.error(`Failed to refresh podcast ${podcast.title}:`, error);
      }
    }
    
    return stats;
  }

  /**
   * Get episodes for a podcast
   */
  static async getEpisodes(podcastId: string, limit = 50): Promise<PodcastEpisode[]> {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('podcast_id', podcastId)
      .order('published_at', { ascending: false, nullsLast: true })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch episodes: ${error.message}`);
    return (data || []).map(this.transformEpisode);
  }

  /**
   * Delete an episode
   */
  static async deleteEpisode(id: string): Promise<void> {
    const { error } = await supabase.from('podcast_episodes').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete episode: ${error.message}`);
  }

  /**
   * List all user-added (non-curated) podcasts
   */
  static async listUserAddedPodcasts(
    filters: PodcastFilters & { userId?: string } = {},
    pagination = { page: 1, limit: 50 }
  ): Promise<PodcastListResponse & { podcastsWithUserInfo: Array<Podcast & { userEmail?: string }> }> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('podcasts')
      .select(`
        *,
        profiles:created_by (
          id,
          username
        )
      `, { count: 'exact' })
      .eq('is_curated', false);

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,author.ilike.%${filters.search}%`
      );
    }

    if (filters.userId) {
      query = query.eq('created_by', filters.userId);
    }

    if (filters.category) {
      query = query.contains('categories', [filters.category]);
    }

    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to list user-added podcasts: ${error.message}`);

    const podcasts = (data || []).map(row => this.transformPodcast(row));
    const podcastsWithUserInfo = (data || []).map(row => ({
      ...this.transformPodcast(row),
      userEmail: row.profiles?.username || 'Unknown',
    }));

    return {
      podcasts,
      podcastsWithUserInfo,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  /**
   * Get users with their custom feed counts
   */
  static async getUsersWithCustomFeeds(): Promise<Array<{
    userId: string;
    userEmail: string;
    podcastCount: number;
  }>> {
    const { data, error } = await supabase
      .from('podcasts')
      .select(`
        created_by,
        profiles:created_by (
          id,
          username
        )
      `)
      .eq('is_curated', false)
      .not('created_by', 'is', null);

    if (error) {
      throw new Error(`Failed to fetch users with custom feeds: ${error.message}`);
    }

    // Group by user and count podcasts
    const userMap = new Map<string, { userEmail: string; count: number }>();
    
    for (const row of data || []) {
      if (!row.created_by) continue;
      
      const userId = row.created_by;
      const userEmail = row.profiles?.username || 'Unknown';
      
      if (userMap.has(userId)) {
        userMap.get(userId)!.count++;
      } else {
        userMap.set(userId, { userEmail, count: 1 });
      }
    }

    return Array.from(userMap.entries()).map(([userId, info]) => ({
      userId,
      userEmail: info.userEmail,
      podcastCount: info.count,
    })).sort((a, b) => b.podcastCount - a.podcastCount);
  }

  /**
   * Get specific user's custom podcasts
   */
  static async getUserPodcasts(userId: string): Promise<Podcast[]> {
    const { data, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('created_by', userId)
      .eq('is_curated', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user podcasts: ${error.message}`);
    }

    return (data || []).map(this.transformPodcast);
  }

  /**
   * Promote a user-added podcast to curated status
   * Preserves podcast ID so all subscriptions, downloads, and progress remain intact
   */
  static async promoteToCurated(podcastId: string): Promise<Podcast> {
    // Get the podcast to verify it exists and is not already curated
    const { data: podcast, error: fetchError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', podcastId)
      .single();

    if (fetchError || !podcast) {
      throw new Error('Podcast not found');
    }

    if (podcast.is_curated) {
      throw new Error('Podcast is already curated');
    }

    // Get subscription count for logging
    const { count: subCount } = await supabase
      .from('user_podcast_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('podcast_id', podcastId);

    console.log(`Promoting podcast ${podcast.title} to curated. ${subCount || 0} users subscribed.`);

    // Update podcast to curated status
    const { data: updatedPodcast, error: updateError } = await supabase
      .from('podcasts')
      .update({ is_curated: true })
      .eq('id', podcastId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to promote podcast: ${updateError.message}`);
    }

    return this.transformPodcast(updatedPodcast);
  }

  /**
   * Refresh single podcast feed (alias for refreshEpisodes for consistency)
   */
  static async refreshFeed(podcastId: string): Promise<void> {
    return this.refreshEpisodes(podcastId);
  }

  /**
   * Refresh all feeds (both curated and user-added)
   */
  static async refreshAllFeeds(): Promise<{
    total: number;
    succeeded: number;
    failed: number;
    errors: Array<{ podcastId: string; podcastTitle: string; error: string }>;
  }> {
    // Refresh all active podcasts (both curated and user-added)
    return this.refreshAllEpisodes({ onlyActive: true, onlyCurated: false });
  }
}
