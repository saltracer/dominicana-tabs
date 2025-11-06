/**
 * Episode Metadata Cache Service
 * Centralized cache for episode rendering data to eliminate redundant queries
 */

import { PodcastEpisode } from '../types/podcast-types';
import { QueueItemStatus } from './PodcastDownloadQueueService';

export interface CachedEpisodeMetadata {
  episode: PodcastEpisode;
  artworkPath: string | null;
  isDownloaded: boolean;
  downloadStatus: QueueItemStatus | null;
  downloadProgress: number;
  queuePosition: number | null;
  played: boolean;
  playbackProgress: number; // 0-1 normalized position
  playbackPosition: number; // Position in seconds
  lastUpdated: number;
}

type MetadataListener = (episodeId: string, metadata: CachedEpisodeMetadata | null) => void;

export class EpisodeMetadataCache {
  private static cache = new Map<string, CachedEpisodeMetadata>();
  private static listeners = new Set<MetadataListener>();
  private static readonly TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached metadata for an episode (synchronous)
   */
  static get(episodeId: string): CachedEpisodeMetadata | null {
    const cached = this.cache.get(episodeId);
    if (!cached) return null;

    // Check if stale
    const now = Date.now();
    if (now - cached.lastUpdated > this.TTL) {
      this.cache.delete(episodeId);
      return null;
    }

    return cached;
  }

  /**
   * Get multiple episodes at once (batch)
   */
  static getMany(episodeIds: string[]): Map<string, CachedEpisodeMetadata> {
    const result = new Map<string, CachedEpisodeMetadata>();
    const now = Date.now();

    for (const id of episodeIds) {
      const cached = this.cache.get(id);
      if (cached && now - cached.lastUpdated <= this.TTL) {
        result.set(id, cached);
      }
    }

    return result;
  }

  /**
   * Set cached metadata for an episode
   */
  static set(episodeId: string, metadata: CachedEpisodeMetadata): void {
    this.cache.set(episodeId, {
      ...metadata,
      lastUpdated: Date.now(),
    });

    // Notify listeners
    this.notifyListeners(episodeId, metadata);
  }

  /**
   * Set multiple episodes at once (batch)
   */
  static setMany(entries: Map<string, CachedEpisodeMetadata>): void {
    const now = Date.now();
    
    entries.forEach((metadata, episodeId) => {
      this.cache.set(episodeId, {
        ...metadata,
        lastUpdated: now,
      });
      
      // Notify listeners
      this.notifyListeners(episodeId, metadata);
    });
  }

  /**
   * Update specific fields without replacing entire entry
   */
  static update(
    episodeId: string,
    updates: Partial<Omit<CachedEpisodeMetadata, 'lastUpdated'>>
  ): void {
    const existing = this.cache.get(episodeId);
    if (!existing) return;

    const updated = {
      ...existing,
      ...updates,
      lastUpdated: Date.now(),
    };

    this.cache.set(episodeId, updated);
    this.notifyListeners(episodeId, updated);
  }

  /**
   * Invalidate (remove) cached metadata for an episode
   */
  static invalidate(episodeId: string): void {
    this.cache.delete(episodeId);
    this.notifyListeners(episodeId, null);
  }

  /**
   * Invalidate multiple episodes at once
   */
  static invalidateMany(episodeIds: string[]): void {
    episodeIds.forEach(id => {
      this.cache.delete(id);
      this.notifyListeners(id, null);
    });
  }

  /**
   * Clear all cached metadata
   */
  static clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  static size(): number {
    return this.cache.size;
  }

  /**
   * Subscribe to metadata changes
   */
  static subscribe(listener: MetadataListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of a change
   */
  private static notifyListeners(
    episodeId: string,
    metadata: CachedEpisodeMetadata | null
  ): void {
    this.listeners.forEach(listener => {
      try {
        listener(episodeId, metadata);
      } catch (error) {
        console.error('[EpisodeMetadataCache] Listener error:', error);
      }
    });
  }

  /**
   * Clean up stale entries (run periodically)
   */
  static cleanup(): void {
    const now = Date.now();
    const staleIds: string[] = [];

    this.cache.forEach((metadata, id) => {
      if (now - metadata.lastUpdated > this.TTL) {
        staleIds.push(id);
      }
    });

    staleIds.forEach(id => this.cache.delete(id));

    if (__DEV__ && staleIds.length > 0) {
      console.log(`[EpisodeMetadataCache] Cleaned up ${staleIds.length} stale entries`);
    }
  }

  /**
   * Get cache statistics (for debugging)
   */
  static getStats(): {
    size: number;
    listeners: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    let oldest: number | null = null;
    let newest: number | null = null;

    this.cache.forEach(metadata => {
      if (oldest === null || metadata.lastUpdated < oldest) {
        oldest = metadata.lastUpdated;
      }
      if (newest === null || metadata.lastUpdated > newest) {
        newest = metadata.lastUpdated;
      }
    });

    return {
      size: this.cache.size,
      listeners: this.listeners.size,
      oldestEntry: oldest,
      newestEntry: newest,
    };
  }
}

// Auto-cleanup every 5 minutes
if (typeof global !== 'undefined') {
  setInterval(() => {
    EpisodeMetadataCache.cleanup();
  }, 5 * 60 * 1000);
}

