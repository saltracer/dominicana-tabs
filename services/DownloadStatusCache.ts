/**
 * Download Status Cache Service
 * Fast in-memory cache for download and queue status to avoid repeated AsyncStorage reads
 */

import { QueueItem, QueueItemStatus } from './PodcastDownloadQueueService';

export interface DownloadStatus {
  isDownloaded: boolean;
  queueItem: QueueItem | null;
  localPath: string | null;
  status: QueueItemStatus | null;
  progress: number;
}

type StatusChangeListener = (episodeId: string, status: DownloadStatus) => void;

export class DownloadStatusCache {
  private static cache = new Map<string, DownloadStatus>();
  private static listeners = new Set<StatusChangeListener>();
  private static initialized = false;

  /**
   * Initialize the cache with current download metadata
   * Should be called once on app startup
   */
  static async initialize(
    downloadedEpisodes: Array<{ episodeId: string; filePath: string }>,
    queueItems: QueueItem[]
  ): Promise<void> {
    this.cache.clear();

    // Add downloaded episodes
    downloadedEpisodes.forEach(({ episodeId, filePath }) => {
      this.cache.set(episodeId, {
        isDownloaded: true,
        queueItem: null,
        localPath: filePath,
        status: 'completed',
        progress: 100,
      });
    });

    // Add/update queue items
    // IMPORTANT: Only mark as downloaded if the file actually exists (i.e., was in downloadedEpisodes)
    // Don't trust queue status alone - files may have been deleted
    queueItems.forEach(item => {
      const existing = this.cache.get(item.episodeId);
      this.cache.set(item.episodeId, {
        // Only preserve isDownloaded if it was already set from downloadedEpisodes
        // Queue status 'completed' alone doesn't mean the file exists
        isDownloaded: existing?.isDownloaded || false,
        queueItem: item,
        localPath: existing?.localPath || null,
        status: item.status,
        progress: item.progress,
      });
    });

    this.initialized = true;

    if (__DEV__) {
      console.log(
        `[DownloadStatusCache] Initialized with ${downloadedEpisodes.length} downloads and ${queueItems.length} queue items`
      );
    }
  }

  /**
   * Get download status for an episode (synchronous)
   */
  static get(episodeId: string): DownloadStatus {
    const cached = this.cache.get(episodeId);
    
    // Debug: Log cache lookup for BTP-LR19
    if (__DEV__ && episodeId === '13dcace0-3857-4d55-aeb5-fde45e948ec7') {
      console.log('[DownloadStatusCache] 🔍 Cache lookup for BTP-LR19:', {
        episodeId: episodeId.substring(0, 40),
        foundInCache: !!cached,
        isDownloaded: cached?.isDownloaded,
        status: cached?.status,
        progress: cached?.progress,
        hasQueueItem: !!cached?.queueItem,
        queueItemStatus: cached?.queueItem?.status,
        queueItemProgress: cached?.queueItem?.progress,
        hasLocalPath: !!cached?.localPath,
      });
    }
    
    if (cached) {
      return cached;
    }

    // Return default status if not in cache
    return {
      isDownloaded: false,
      queueItem: null,
      localPath: null,
      status: null,
      progress: 0,
    };
  }

  /**
   * Get status for multiple episodes at once
   */
  static getMany(episodeIds: string[]): Map<string, DownloadStatus> {
    const result = new Map<string, DownloadStatus>();

    episodeIds.forEach(id => {
      result.set(id, this.get(id));
    });

    return result;
  }

  /**
   * Update download completion status
   */
  static markDownloaded(episodeId: string, localPath: string): void {
    const existing = this.cache.get(episodeId);
    const updated: DownloadStatus = {
      isDownloaded: true,
      queueItem: existing?.queueItem || null,
      localPath,
      status: 'completed',
      progress: 100,
    };

    this.cache.set(episodeId, updated);
    this.notifyListeners(episodeId, updated);
  }

  /**
   * Update queue item status
   */
  static updateQueueItem(queueItem: QueueItem): void {
    const existing = this.cache.get(queueItem.episodeId);
    
    // CRITICAL: Only preserve isDownloaded if already true, never set it based on queue status
    // The ONLY way to mark as downloaded is via markDownloaded() which verifies the file exists
    // Queue status 'completed' alone is NOT reliable (files may have been deleted)
    const isDownloaded = existing?.isDownloaded === true;
    const localPath = existing?.localPath || null;
    
    const updated: DownloadStatus = {
      isDownloaded,
      queueItem,
      localPath,
      status: queueItem.status,
      progress: queueItem.progress,
    };

    this.cache.set(queueItem.episodeId, updated);
    this.notifyListeners(queueItem.episodeId, updated);
  }

  /**
   * Remove download status (when deleted)
   */
  static markDeleted(episodeId: string): void {
    const existing = this.cache.get(episodeId);
    
    // If there's a queue item, decide what to do based on its status
    if (existing?.queueItem) {
      // If the queue item is "completed", it's now stale (file is gone) - remove it
      // If it's actively downloading/pending/paused, keep the queue item but mark as not downloaded
      if (existing.queueItem.status === 'completed') {
        // Stale completed entry - remove entirely
        this.cache.delete(episodeId);
        this.notifyListeners(episodeId, this.get(episodeId));
      } else {
        // Active/pending/paused download - keep queue item but mark as not downloaded
        const updated: DownloadStatus = {
          isDownloaded: false,
          queueItem: existing.queueItem,
          localPath: null,
          status: existing.queueItem.status,
          progress: existing.queueItem.progress,
        };
        this.cache.set(episodeId, updated);
        this.notifyListeners(episodeId, updated);
      }
    } else {
      // No queue item, remove from cache entirely
      this.cache.delete(episodeId);
      this.notifyListeners(episodeId, this.get(episodeId));
    }
  }

  /**
   * Remove queue item (when removed from queue)
   */
  static removeQueueItem(episodeId: string): void {
    const existing = this.cache.get(episodeId);
    
    // If downloaded, keep the download status but remove queue item
    if (existing?.isDownloaded) {
      const updated: DownloadStatus = {
        isDownloaded: true,
        queueItem: null,
        localPath: existing.localPath,
        status: 'completed',
        progress: 100,
      };
      this.cache.set(episodeId, updated);
      this.notifyListeners(episodeId, updated);
    } else {
      // Not downloaded, remove from cache
      this.cache.delete(episodeId);
      this.notifyListeners(episodeId, this.get(episodeId));
    }
  }

  /**
   * Check if episode is downloaded
   */
  static isDownloaded(episodeId: string): boolean {
    return this.get(episodeId).isDownloaded;
  }

  /**
   * Check if episode is in queue
   */
  static isInQueue(episodeId: string): boolean {
    return this.get(episodeId).queueItem !== null;
  }

  /**
   * Get local file path for downloaded episode
   */
  static getLocalPath(episodeId: string): string | null {
    return this.get(episodeId).localPath;
  }

  /**
   * Subscribe to status changes
   */
  static subscribe(listener: StatusChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of a status change
   */
  private static notifyListeners(episodeId: string, status: DownloadStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(episodeId, status);
      } catch (error) {
        console.error('[DownloadStatusCache] Listener error:', error);
      }
    });
  }

  /**
   * Clear all cached data
   */
  static clear(): void {
    this.cache.clear();
    this.initialized = false;
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    size: number;
    downloaded: number;
    queued: number;
    listeners: number;
    initialized: boolean;
  } {
    let downloaded = 0;
    let queued = 0;

    this.cache.forEach(status => {
      if (status.isDownloaded) downloaded++;
      if (status.queueItem) queued++;
    });

    return {
      size: this.cache.size,
      downloaded,
      queued,
      listeners: this.listeners.size,
      initialized: this.initialized,
    };
  }

  /**
   * Check if cache is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }
}

