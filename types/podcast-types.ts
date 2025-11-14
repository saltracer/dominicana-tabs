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
  shareCount?: number; // Number of times this podcast has been shared via share links
  episodeCount?: number; // Number of episodes for this podcast
  subscriptionCount?: number; // Number of users subscribed to this podcast
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
  played: boolean;
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
  isActive?: boolean;
  sortBy?: 'title' | 'created_at' | 'last_fetched_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
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

/**
 * Playlist and Queue types
 */
export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isSystem: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  episodeId: string;
  position: number;
  addedAt: string;
}

export interface PlaylistWithEpisodes extends Playlist {
  episodes: PodcastEpisode[];
  episodeCount: number;
}

export interface PlaylistFilters {
  sortBy?: 'added_date' | 'episode_date' | 'title' | 'duration';
  sortOrder?: 'asc' | 'desc';
  podcastId?: string;
}

export interface PodcastPreferences {
  id: string;
  userId: string;
  podcastId: string;
  playbackSpeed?: number; // null = use global
  maxEpisodesToKeep?: number; // null = use global
  autoDownload?: boolean; // null = use global
  createdAt: string;
  updatedAt: string;
}

export interface QueueItem {
  id: string;
  userId: string;
  episodeId: string;
  position: number;
  addedAt: string;
}

/**
 * RSS Feed validation result
 */
export interface RssFeedValidationResult {
  isValid: boolean;
  feed?: ParsedRssFeed;
  error?: string;
  isDuplicate?: boolean;
  duplicatePodcastId?: string;
  isCurated?: boolean;
}

/**
 * Share link data
 */
export interface PodcastShareLink {
  token: string;
  podcastId: string;
  url: string;
}
