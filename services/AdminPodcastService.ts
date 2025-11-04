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
   * Helper to add episodes for a podcast
   */
  private static async addEpisodes(podcastId: string, episodes: ParsedRssEpisode[]) {
    const episodeData = episodes.map(ep => ({
      podcast_id: podcastId,
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

    // Use upsert to handle both new episodes and updates to existing ones
    // This prevents duplicate key errors when refreshing/reparsing
    const { error } = await supabase
      .from('podcast_episodes')
      .upsert(episodeData, { 
        onConflict: 'podcast_id,guid',
        ignoreDuplicates: false // Update existing episodes with new data
      })
      .select();

    if (error) {
      console.error('Error upserting episodes:', error);
      throw new Error(`Failed to upsert episodes: ${error.message}`);
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
}
