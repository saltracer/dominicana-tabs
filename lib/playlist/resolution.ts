/**
 * Playlist Resolution Module
 * Centralized, optimized episode resolution for playlists with batch operations and caching
 */

import { PodcastEpisode } from '../../types/podcast-types';
import { PlaylistItem } from '../../services/PlaylistService';
import { PodcastService } from '../../services/PodcastService';
import { getEpisodesMap, getFeed } from '../podcast/cache';
import { imagePathForUrl, fileExists } from '../podcast/storage';
import { EpisodeMetadataCache } from '../../services/EpisodeMetadataCache';
import { DownloadStatusCache } from '../../services/DownloadStatusCache';
import { ArtworkCache } from '../../services/ArtworkCache';

export interface ResolvedPlaylistItem {
  item: PlaylistItem;
  episode: PodcastEpisode | null;
  artworkPath: string | null;
}

export interface ResolutionOptions {
  useCache?: boolean;
  prefetchArtwork?: boolean;
  batchSize?: number;
}

export interface ResolutionResult {
  resolved: Map<string, PodcastEpisode | null>;
  artworkPaths: Map<string, string | null>;
  downloadStatuses: Map<string, any>;
  stats: {
    totalItems: number;
    cacheHits: number;
    dbQueries: number;
    rssLookups: number;
    artworkFetches: number;
    durationMs: number;
  };
}

/**
 * Resolve playlist items to full episodes with artwork and download status
 */
export async function resolvePlaylistItems(
  items: PlaylistItem[],
  options: ResolutionOptions = {}
): Promise<ResolutionResult> {
  const startTime = Date.now();
  const {
    useCache = true,
    prefetchArtwork = true,
    batchSize = 50,
  } = options;

  const resolved = new Map<string, PodcastEpisode | null>();
  const artworkPaths = new Map<string, string | null>();
  const downloadStatuses = new Map<string, any>();
  
  let cacheHits = 0;
  let dbQueries = 0;
  let rssLookups = 0;
  let artworkFetches = 0;

  if (items.length === 0) {
    return {
      resolved,
      artworkPaths,
      downloadStatuses,
      stats: {
        totalItems: 0,
        cacheHits: 0,
        dbQueries: 0,
        rssLookups: 0,
        artworkFetches: 0,
        durationMs: Date.now() - startTime,
      },
    };
  }

  // Phase 1: Check metadata cache for instant results
  if (useCache) {
    const episodeIds = items
      .map(item => (item as any).episode_id || (item as any).external_ref?.guid)
      .filter(Boolean);
    
    const cached = EpisodeMetadataCache.getMany(episodeIds);
    cached.forEach((metadata, episodeId) => {
      // Find matching items
      items.forEach(item => {
        const itemEpisodeId = (item as any).episode_id || (item as any).external_ref?.guid;
        if (itemEpisodeId === episodeId) {
          resolved.set(item.id, metadata.episode);
          artworkPaths.set(item.id, metadata.artworkPath);
          downloadStatuses.set(item.id, {
            isDownloaded: metadata.isDownloaded,
            status: metadata.downloadStatus,
            progress: metadata.downloadProgress,
          });
          cacheHits++;
        }
      });
    });
  }

  // Phase 2: Batch database queries for episode_id items
  const itemsNeedingDb = items.filter(item => {
    const hasEpisodeId = !!(item as any).episode_id;
    return hasEpisodeId && !resolved.has(item.id);
  });

  if (itemsNeedingDb.length > 0) {
    if (__DEV__) {
      console.log('[Resolution] Fetching', itemsNeedingDb.length, 'episodes from database');
    }
    
    // Batch by splitting into chunks
    for (let i = 0; i < itemsNeedingDb.length; i += batchSize) {
      const batch = itemsNeedingDb.slice(i, i + batchSize);
      
      const dbResults = await Promise.allSettled(
        batch.map(item =>
          PodcastService.getEpisode((item as any).episode_id)
            .then(episode => ({ item, episode }))
        )
      );

      dbResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.episode) {
          const { item, episode } = result.value;
          resolved.set(item.id, episode);
          dbQueries++;
        } else if (result.status === 'rejected') {
          if (__DEV__) {
            console.warn('[Resolution] Failed to fetch episode_id:', (batch[dbResults.indexOf(result)] as any).episode_id, result.reason);
          }
          // Mark as null so we don't try again
          resolved.set(batch[dbResults.indexOf(result)].id, null);
        }
      });
    }
  }

  // Phase 3: Batch RSS cache lookups for external_ref items
  const itemsNeedingRss = items.filter(item => {
    const hasExternalRef = !!(item as any).external_ref;
    return hasExternalRef && !resolved.has(item.id);
  });

  if (itemsNeedingRss.length > 0) {
    if (__DEV__) {
      console.log('[Resolution] Looking up', itemsNeedingRss.length, 'episodes from RSS cache');
    }
    // Group by podcastId for efficient RSS cache access
    const byPodcast = new Map<string, PlaylistItem[]>();
    itemsNeedingRss.forEach(item => {
      const podcastId = (item as any).external_ref?.podcastId;
      if (podcastId) {
        if (!byPodcast.has(podcastId)) {
          byPodcast.set(podcastId, []);
        }
        byPodcast.get(podcastId)!.push(item);
      }
    });

    // Fetch RSS maps in parallel
    const rssMaps = await Promise.all(
      Array.from(byPodcast.keys()).map(async podcastId => ({
        podcastId,
        map: await getEpisodesMap(podcastId),
      }))
    );

    // Resolve items from RSS cache
    rssMaps.forEach(({ podcastId, map }) => {
      const podcastItems = byPodcast.get(podcastId) || [];
      
      podcastItems.forEach(item => {
        const ref = (item as any).external_ref;
        if (!ref) return;

        // Try to find episode in RSS cache
        const episode = Object.values(map).find(e =>
          (ref.guid && e.guid === ref.guid) ||
          (ref.audioUrl && e.audioUrl === ref.audioUrl)
        );

        if (episode) {
          const resolvedEpisode: PodcastEpisode = {
            id: episode.id as any,
            podcastId: podcastId,
            title: episode.title,
            description: episode.description || '',
            audioUrl: episode.audioUrl,
            duration: episode.duration,
            publishedAt: episode.publishedAt,
            episodeNumber: episode.episodeNumber,
            seasonNumber: episode.seasonNumber,
            guid: episode.guid,
            artworkUrl: episode.artworkUrl,
            fileSize: episode.fileSize,
            mimeType: episode.mimeType,
            createdAt: new Date().toISOString(),
          } as any;

          resolved.set(item.id, resolvedEpisode);
          rssLookups++;
        } else if (ref.title) {
          // Fallback: use external_ref metadata
          const fallbackEpisode: PodcastEpisode = {
            id: ref.guid || ref.audioUrl || item.id,
            podcastId: ref.podcastId,
            title: ref.title,
            description: ref.description || '',
            audioUrl: ref.audioUrl || '',
            duration: ref.duration,
            publishedAt: ref.publishedAt,
            episodeNumber: undefined,
            seasonNumber: undefined,
            guid: ref.guid,
            artworkUrl: ref.artworkUrl,
            fileSize: undefined,
            mimeType: undefined,
            createdAt: new Date().toISOString(),
          } as any;

          resolved.set(item.id, fallbackEpisode);
        }
      });
    });
  }

  // Phase 4: Batch artwork resolution
  if (prefetchArtwork) {
    const artworkUrls = new Set<string>();
    const podcastIds = new Set<string>();

    resolved.forEach(episode => {
      if (episode) {
        if (episode.artworkUrl) {
          artworkUrls.add(episode.artworkUrl);
        }
        podcastIds.add(episode.podcastId);
      }
    });

    // Also collect feed artwork
    const feedArtwork = await Promise.all(
      Array.from(podcastIds).map(async podcastId => {
        const feed = await getFeed(podcastId);
        return feed?.summary?.artworkUrl;
      })
    );

    feedArtwork.forEach(url => {
      if (url) artworkUrls.add(url);
    });

    // Batch fetch all artwork
    const artworkResults = await ArtworkCache.getMany(Array.from(artworkUrls));
    artworkFetches = artworkUrls.size;

    // Map artwork to items
    items.forEach(item => {
      const episode = resolved.get(item.id);
      if (episode) {
        let artPath = null;
        
        // Try episode artwork first
        if (episode.artworkUrl) {
          artPath = artworkResults.get(episode.artworkUrl) || null;
        }
        
        // Fallback to feed artwork (will be fetched separately if needed)
        if (!artPath) {
          // This will be handled by feed artwork lookup
        }

        if (artPath) {
          artworkPaths.set(item.id, artPath);
        }
      }
    });
  }

  // Phase 5: Batch download status lookup
  const episodeIds = Array.from(resolved.values())
    .filter((ep): ep is PodcastEpisode => ep !== null)
    .map(ep => ep.id);

  const downloadStates = DownloadStatusCache.getMany(episodeIds);
  downloadStates.forEach((status, episodeId) => {
    // Find item(s) with this episode
    items.forEach(item => {
      const episode = resolved.get(item.id);
      if (episode?.id === episodeId) {
        downloadStatuses.set(item.id, status);
      }
    });
  });

  // Phase 6: Update metadata cache with resolved data
  if (useCache) {
    resolved.forEach((episode, itemId) => {
      if (episode) {
        const downloadStatus = downloadStatuses.get(itemId);
        const artPath = artworkPaths.get(itemId);

        EpisodeMetadataCache.set(episode.id, {
          episode,
          artworkPath: artPath || null,
          isDownloaded: downloadStatus?.isDownloaded || false,
          downloadStatus: downloadStatus?.status || null,
          downloadProgress: downloadStatus?.progress || 0,
          queuePosition: null,
          lastUpdated: Date.now(),
        });
      }
    });
  }

  const durationMs = Date.now() - startTime;

  if (__DEV__) {
    console.log('[Resolution] Resolved playlist:', {
      totalItems: items.length,
      resolved: resolved.size,
      cacheHits,
      dbQueries,
      rssLookups,
      artworkFetches,
      durationMs: `${durationMs}ms`,
    });
  }

  return {
    resolved,
    artworkPaths,
    downloadStatuses,
    stats: {
      totalItems: items.length,
      cacheHits,
      dbQueries,
      rssLookups,
      artworkFetches,
      durationMs,
    },
  };
}

/**
 * Resolve feed artwork for podcast IDs
 */
export async function resolveFeedArtwork(
  podcastIds: string[]
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  
  const feeds = await Promise.all(
    podcastIds.map(async id => ({
      id,
      feed: await getFeed(id),
    }))
  );

  const artworkUrls: Array<{ podcastId: string; url: string }> = [];
  feeds.forEach(({ id, feed }) => {
    if (feed?.summary?.artworkUrl) {
      artworkUrls.push({ podcastId: id, url: feed.summary.artworkUrl });
    }
  });

  // Batch fetch artwork
  const urls = artworkUrls.map(a => a.url);
  const artworkPaths = await ArtworkCache.getMany(urls);

  artworkUrls.forEach(({ podcastId, url }) => {
    result.set(podcastId, artworkPaths.get(url) || null);
  });

  return result;
}

/**
 * Warmup cache for upcoming playlist view
 */
export async function warmupPlaylistCache(items: PlaylistItem[]): Promise<void> {
  // Start resolution in background (don't await)
  void resolvePlaylistItems(items, {
    useCache: true,
    prefetchArtwork: true,
    batchSize: 100,
  });
}

