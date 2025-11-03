/**
 * Podcast Service
 * Public service for fetching podcasts and episodes
 */

import { supabase } from '../lib/supabase';
import { Podcast, PodcastEpisode, PodcastFilters, PodcastListResponse, PodcastWithEpisodes } from '../types';

export class PodcastService {
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
   * List curated podcasts with filters
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

    // Always filter for curated and active podcasts
    query = query.eq('is_curated', true).eq('is_active', true);

    // Apply search filter
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,author.ilike.%${filters.search}%`
      );
    }

    // Apply category filter
    if (filters.category) {
      query = query.contains('categories', [filters.category]);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error listing podcasts:', error);
      throw new Error(`Failed to list podcasts: ${error.message}`);
    }

    const podcasts = (data || []).map(this.transformPodcast);
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      podcasts,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Get a single podcast by ID with episodes
   */
  static async getPodcast(id: string, includeEpisodes = true): Promise<PodcastWithEpisodes> {
    // Fetch podcast
    const { data: podcastData, error: podcastError } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single();

    if (podcastError) {
      console.error('Error fetching podcast:', podcastError);
      throw new Error(`Failed to fetch podcast: ${podcastError.message}`);
    }

    const podcast = this.transformPodcast(podcastData);
    const result: PodcastWithEpisodes = { ...podcast };

    // Fetch episodes if requested
    if (includeEpisodes) {
      const { data: episodesData, error: episodesError } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('podcast_id', id)
        .order('published_at', { ascending: false, nullsFirst: false });

      if (episodesError) {
        console.error('Error fetching episodes:', episodesError);
        // Don't throw, just return empty episodes
        result.episodes = [];
      } else {
        result.episodes = (episodesData || []).map(this.transformEpisode);
      }

      result.episodeCount = result.episodes?.length || 0;
    }

    return result;
  }

  /**
   * Get a single episode by ID
   */
  static async getEpisode(id: string, silent = false): Promise<PodcastEpisode> {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (!silent) {
        console.error('Error fetching episode:', error);
      }
      throw new Error(`Failed to fetch episode: ${error.message}`);
    }

    return this.transformEpisode(data);
  }

  /**
   * Get a single episode by guid (RSS feed guid)
   */
  static async getEpisodeByGuid(podcastId: string, guid: string, silent = false): Promise<PodcastEpisode | null> {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('podcast_id', podcastId)
      .eq('guid', guid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows
      if (!silent) {
        console.error('Error fetching episode by guid:', error);
      }
      return null;
    }

    return this.transformEpisode(data);
  }

  /**
   * Get episode by audio URL (fallback when guid doesn't match)
   */
  static async getEpisodeByAudioUrl(podcastId: string, audioUrl: string, silent = false): Promise<PodcastEpisode | null> {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('podcast_id', podcastId)
      .eq('audio_url', audioUrl)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows
      if (!silent) {
        console.error('Error fetching episode by audio URL:', error);
      }
      return null;
    }

    return this.transformEpisode(data);
  }

  /**
   * Get episodes for a podcast
   */
  static async getEpisodes(podcastId: string, limit = 50): Promise<PodcastEpisode[]> {
    const { data, error } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('podcast_id', podcastId)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching episodes:', error);
      throw new Error(`Failed to fetch episodes: ${error.message}`);
    }

    return (data || []).map(this.transformEpisode);
  }

  /**
   * Get episode count for a podcast
   */
  static async getEpisodeCount(podcastId: string): Promise<number> {
    const { count, error } = await supabase
      .from('podcast_episodes')
      .select('*', { count: 'exact', head: true })
      .eq('podcast_id', podcastId);

    if (error) {
      console.error('Error counting episodes:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get podcast by episode ID
   */
  static async getPodcastByEpisodeId(episodeId: string): Promise<Podcast> {
    // Try to get episode from DB (silent mode to avoid noise for RSS-cached episodes)
    const episode = await this.getEpisode(episodeId, true);
    return await this.getPodcast(episode.podcastId);
  }
}
