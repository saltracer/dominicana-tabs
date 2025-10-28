/**
 * Podcast Type Definitions
 */

export interface Podcast {
  id: string;
  title: string;
  description?: string;
  author?: string;
  rssUrl: string;
  artworkUrl?: string;
  websiteUrl?: string;
  language: string;
  categories: string[];
  isCurated: boolean;
  isActive: boolean;
  createdBy?: string;
  lastFetchedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PodcastEpisode {
  id: string;
  podcastId: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration?: number;
  publishedAt?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  guid: string;
  artworkUrl?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export interface UserPodcastSubscription {
  id: string;
  userId: string;
  podcastId: string;
  subscribedAt: string;
}

export interface PodcastPlaybackProgress {
  id: string;
  userId: string;
  episodeId: string;
  position: number;
  duration?: number;
  completed: boolean;
  lastPlayedAt: string;
  playbackSpeed?: number;
}

export interface PodcastWithEpisodes extends Podcast {
  episodes?: PodcastEpisode[];
  episodeCount?: number;
  isSubscribed?: boolean;
}

/**
 * RSS Feed parsing types
 */
export interface ParsedRssFeed {
  title: string;
  description?: string;
  author?: string;
  artworkUrl?: string;
  websiteUrl?: string;
  language?: string;
  categories: string[];
  episodes: ParsedRssEpisode[];
  lastBuildDate?: string;
}

export interface ParsedRssEpisode {
  title: string;
  description?: string;
  audioUrl: string;
  duration?: number;
  publishedAt?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  guid: string;
  artworkUrl?: string;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Podcast service filter options
 */
export interface PodcastFilters {
  search?: string;
  category?: string;
  isCurated?: boolean;
  sortBy?: 'title' | 'created_at' | 'last_fetched_at';
  sortOrder?: 'asc' | 'desc';
}

export interface PodcastListResponse {
  podcasts: Podcast[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Podcast playback state
 */
export interface PodcastPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentEpisode?: PodcastEpisode;
  position: number;
  duration: number;
  playbackRate: number;
}

/**
 * Create/Update podcast data
 */
export interface CreatePodcastData {
  rssUrl: string;
  artworkUrl?: string;
  categories?: string[];
  isCurated?: boolean;
  language?: string;
}

export interface UpdatePodcastData {
  title?: string;
  description?: string;
  author?: string;
  artworkUrl?: string;
  websiteUrl?: string;
  language?: string;
  categories?: string[];
  isCurated?: boolean;
  isActive?: boolean;
}
