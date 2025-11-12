/**
 * Podcast Download Queue Service
 * Manages background downloads with concurrency control, retry logic, and network awareness
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { PodcastEpisode } from '../types/podcast-types';
import { PodcastDownloadService, DownloadProgress } from './PodcastDownloadService';
import { UserLiturgyPreferencesService } from './UserLiturgyPreferencesService';
import { DownloadStatusCache } from './DownloadStatusCache';
import { EpisodeMetadataCache } from './EpisodeMetadataCache';

export type QueueItemStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
export type PausedReason = 'network' | 'manual' | 'error';

export interface QueueItem {
  id: string; // unique queue item id
  episodeId: string;
  episode: PodcastEpisode;
  status: QueueItemStatus;
  progress: number; // 0-100
  bytesDownloaded: number;
  totalBytes: number;
  retryCount: number;
  maxRetries: number;
  error?: string;
  addedAt: string;
  startedAt?: string;
  completedAt?: string;
  pausedReason?: PausedReason;
}

export interface QueueState {
  items: QueueItem[];
  activeDownloads: string[]; // episodeIds currently downloading
  completedToday: number;
  lastUpdated: string;
}

export type QueueChangeListener = (state: QueueState) => void;

export class PodcastDownloadQueueService {
  private static readonly QUEUE_KEY = 'podcast:download_queue';
  private static readonly MAX_CONCURRENT = 5;
  private static readonly MAX_RETRIES = 3;
  private static readonly PROGRESS_SAVE_DEBOUNCE_MS = 2000; // Save progress to disk every 2 seconds
  
  private static listeners: Set<QueueChangeListener> = new Set();
  private static isProcessing = false;
  private static networkUnsubscribe?: () => void;
  private static stateLock: Promise<any> | null = null;
  
  // In-memory state cache to avoid excessive AsyncStorage reads
  private static memoryState: QueueState | null = null;
  private static pendingSaveTimeout: NodeJS.Timeout | null = null;

  /**
   * Initialize the queue service
   */
  static async initialize(userId?: string): Promise<void> {
    if (Platform.OS === 'web') {
      console.warn('[DownloadQueue] Not available on web');
      return;
    }

    // CRITICAL: Migrate file paths BEFORE cleanup
    // When app container changes (simulator rebuilds), paths need to be updated
    // before we check if files exist
    const { DownloadPathMigration } = require('./DownloadPathMigration');
    await DownloadPathMigration.migratePathsIfNeeded();

    // One-time migration: move queue from old key to new key
    await this.migrateQueueKey();

    // Clean up stale queue entries (duplicates, old completed items)
    // This checks file existence, so must run AFTER path migration
    await this.cleanupQueue();
    
    // Set up network monitoring
    this.setupNetworkMonitoring(userId);
    
    // Resume any paused downloads
    await this.resumePausedDownloads();
    
    // Process the queue
    await this.processQueue();
  }

  /**
   * One-time migration: move queue from old key to new key
   * Old key: 'podcast_download_queue' (underscore)
   * New key: 'podcast:download_queue' (colon, consistent with other keys)
   */
  private static async migrateQueueKey(): Promise<void> {
    const OLD_QUEUE_KEY = 'podcast_download_queue';
    
    try {
      // Check if old key exists
      const oldData = await AsyncStorage.getItem(OLD_QUEUE_KEY);
      if (!oldData) {
        return; // No migration needed
      }

      // Check if new key already has data
      const newData = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (newData) {
        // New key already has data, just remove old key
        await AsyncStorage.removeItem(OLD_QUEUE_KEY);
        if (__DEV__) {
          console.log('[DownloadQueue] 🔄 Removed old queue key (new key already exists)');
        }
        return;
      }

      // Migrate data from old key to new key
      await AsyncStorage.setItem(this.QUEUE_KEY, oldData);
      await AsyncStorage.removeItem(OLD_QUEUE_KEY);
      
      if (__DEV__) {
        console.log('[DownloadQueue] 🔄 Migrated queue from old key to new key');
      }
    } catch (error) {
      console.error('[DownloadQueue] Error migrating queue key:', error);
      // Don't throw - continue with initialization even if migration fails
    }
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = undefined;
    }
    if (this.pendingSaveTimeout) {
      clearTimeout(this.pendingSaveTimeout);
      this.pendingSaveTimeout = null;
    }
    this.listeners.clear();
    this.memoryState = null;
  }

  /**
   * Subscribe to queue state changes
   */
  static subscribe(listener: QueueChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of queue state change (no longer async - uses memory state)
   */
  private static notifyListeners(): void {
    if (this.memoryState) {
      this.syncCachesAndNotify(this.memoryState);
    }
  }

  /**
   * Modify queue state atomically to prevent race conditions
   * This ensures only one modification happens at a time
   */
  private static async modifyQueueState(modifier: (state: QueueState) => Promise<void> | void): Promise<void> {
    // Wait for any pending operation to complete
    while (this.stateLock) {
      await this.stateLock;
    }
    
    // Acquire lock
    let resolve: () => void;
    this.stateLock = new Promise(r => { resolve = r; });
    
    try {
      // Get latest state
      const state = await this.getQueueState();
      
      // Apply modification
      await modifier(state);
      
      // Save updated state
      await this.saveQueueState(state);
    } finally {
      // Release lock
      resolve!();
      this.stateLock = null;
    }
  }

  /**
   * Get current queue state (uses in-memory cache if available)
   */
  static async getQueueState(): Promise<QueueState> {
    // Return in-memory cache if available
    if (this.memoryState) {
      return this.memoryState;
    }
    
    // Load from AsyncStorage
    try {
      const data = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (!data) {
        this.memoryState = this.getEmptyQueueState();
        return this.memoryState;
      }
      
      const state: QueueState = JSON.parse(data);
      
      // Validate and ensure state has correct shape
      if (!Array.isArray(state.items)) {
        console.warn('[DownloadQueue] Invalid state.items, resetting to empty array');
        state.items = [];
      }
      if (!Array.isArray(state.activeDownloads)) {
        console.warn('[DownloadQueue] Invalid state.activeDownloads, resetting to empty array');
        state.activeDownloads = [];
      }
      if (typeof state.completedToday !== 'number') {
        state.completedToday = 0;
      }
      if (!state.lastUpdated) {
        state.lastUpdated = new Date().toISOString();
      }
      
      // Cache in memory
      this.memoryState = state;
      
      if (__DEV__ && state.items.length > 0) {
        console.log('[DownloadQueue] 📖 Loaded queue state from disk with', state.items.length, 'items');
      }
      
      return state;
    } catch (error) {
      console.error('[DownloadQueue] Error getting queue state:', error);
      this.memoryState = this.getEmptyQueueState();
      return this.memoryState;
    }
  }

  /**
   * Save queue state to AsyncStorage (immediate)
   */
  private static async saveQueueState(state: QueueState): Promise<void> {
    try {
      state.lastUpdated = new Date().toISOString();
      
      // Update in-memory cache
      this.memoryState = state;
      
      if (__DEV__) {
        console.log('[DownloadQueue] 💾 Saving queue state to disk with', state.items.length, 'items');
      }
      
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(state));
      
      // Update caches and notify listeners
      this.syncCachesAndNotify(state);
    } catch (error) {
      console.error('[DownloadQueue] Error saving queue state:', error);
      throw error;
    }
  }

  /**
   * Schedule a debounced save (for frequent operations like progress updates)
   */
  private static scheduleDebouncedSave(): void {
    // Clear any pending save
    if (this.pendingSaveTimeout) {
      clearTimeout(this.pendingSaveTimeout);
    }
    
    // Schedule new save
    this.pendingSaveTimeout = setTimeout(async () => {
      if (this.memoryState) {
        try {
          this.memoryState.lastUpdated = new Date().toISOString();
          await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.memoryState));
          if (__DEV__) {
            console.log('[DownloadQueue] 💾 Debounced save completed');
          }
        } catch (error) {
          console.error('[DownloadQueue] Error in debounced save:', error);
        }
      }
      this.pendingSaveTimeout = null;
    }, this.PROGRESS_SAVE_DEBOUNCE_MS);
  }

  /**
   * Update caches and notify listeners
   */
  private static syncCachesAndNotify(state: QueueState): void {
    // Update download status cache with current queue state
    state.items.forEach(item => {
      DownloadStatusCache.updateQueueItem(item);
      
      // Also update episode metadata cache
      EpisodeMetadataCache.update(item.episodeId, {
        downloadStatus: item.status,
        downloadProgress: item.progress,
        queuePosition: state.items.findIndex(i => i.id === item.id),
      });
    });
    
    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[DownloadQueue] Listener error:', error);
      }
    });
  }

  /**
   * Get empty queue state
   */
  private static getEmptyQueueState(): QueueState {
    return {
      items: [],
      activeDownloads: [],
      completedToday: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Add episode to download queue
   */
  static async addToQueue(episode: PodcastEpisode): Promise<QueueItem> {
    if (Platform.OS === 'web') {
      throw new Error('Downloads not supported on web');
    }

    console.log('[DownloadQueue] 🎬 addToQueue CALLED for:', episode.title.substring(0, 40));
    const startTime = Date.now();

    // Check if episode is already downloaded (not modifying state, so can do outside lock)
    const checkStart = Date.now();
    const { PodcastDownloadService } = require('./PodcastDownloadService');
    const isAlreadyDownloaded = await PodcastDownloadService.isEpisodeDownloaded(episode.id);
    console.log('[DownloadQueue] ⏱️  isEpisodeDownloaded check took:', Date.now() - checkStart, 'ms');

    // Use atomic state modification to prevent race conditions
    let resultItem: QueueItem | null = null;
    
    await this.modifyQueueState(async (state) => {
      // Check if already in queue
      const existingItem = state.items.find(item => item.episodeId === episode.id);
      if (existingItem) {
        console.log('[DownloadQueue] Episode already in queue, status:', existingItem.status);
        if (existingItem.status === 'completed') {
          // Check if file actually exists
          if (isAlreadyDownloaded) {
            console.log('[DownloadQueue] Episode already downloaded, removing completed item from queue');
            // Remove completed item from queue
            state.items = state.items.filter(i => i.id !== existingItem.id);
            resultItem = existingItem;
            return;
          } else {
            console.log('[DownloadQueue] ⚠️  Episode marked completed but file missing, removing stale queue item');
            // File was deleted, remove stale queue item and fall through to create new download
            state.items = state.items.filter(i => i.id !== existingItem.id);
            // Continue to create new item below
          }
        } else if (existingItem.status === 'downloading' || existingItem.status === 'pending') {
          console.log('[DownloadQueue] Episode already in queue with status:', existingItem.status);
          resultItem = existingItem;
          return;
        } else {
          // If failed or paused, reuse existing item
          console.log('[DownloadQueue] Reusing existing failed/paused item');
          resultItem = existingItem;
          return;
        }
      } else if (isAlreadyDownloaded) {
        // Not in queue but file exists
        console.log('[DownloadQueue] ✅ Episode already downloaded, skipping queue add');
        resultItem = {
          id: `already-downloaded-${episode.id}`,
          episodeId: episode.id,
          episode,
          status: 'completed' as const,
          progress: 100,
          bytesDownloaded: 0,
          totalBytes: 0,
          retryCount: 0,
          maxRetries: 0,
          addedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };
        return;
      }

      // Create new queue item
      const queueItem: QueueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        episodeId: episode.id,
        episode,
        status: 'pending',
        progress: 0,
        bytesDownloaded: 0,
        totalBytes: 0,
        retryCount: 0,
        maxRetries: this.MAX_RETRIES,
        addedAt: new Date().toISOString(),
      };

      state.items.push(queueItem);
      resultItem = queueItem;
      console.log('[DownloadQueue] ✅ Episode added to queue, total items:', state.items.length);
    });

    console.log('[DownloadQueue] 🎯 Total addToQueue time:', Date.now() - startTime, 'ms');

    // Start processing the queue
    console.log('[DownloadQueue] 🔄 Calling processQueue...');
    this.processQueue();

    return resultItem!;
  }

  /**
   * Remove item from queue
   */
  static async removeFromQueue(queueItemId: string): Promise<void> {
    let removedItem: QueueItem | null = null;
    
    await this.modifyQueueState(async (state) => {
      const item = state.items.find(i => i.id === queueItemId);
      
      if (!item) {
        return;
      }
      
      removedItem = item;

      // If downloading, remove from active downloads
      if (item.status === 'downloading') {
        const index = state.activeDownloads.indexOf(item.episodeId);
        if (index > -1) {
          state.activeDownloads.splice(index, 1);
        }
      }

      // Remove from queue
      state.items = state.items.filter(i => i.id !== queueItemId);
    });

    // Update caches (outside lock since it doesn't modify queue state)
    if (removedItem) {
      DownloadStatusCache.removeQueueItem(removedItem.episodeId);
      EpisodeMetadataCache.update(removedItem.episodeId, {
        downloadStatus: null,
        queuePosition: null,
      });
    }

    // Process queue to start next pending item
    this.processQueue();
  }

  /**
   * Pause a download by queue item ID
   */
  static async pauseDownload(queueItemId: string, reason: PausedReason = 'manual'): Promise<void> {
    await this.modifyQueueState(async (state) => {
      const item = state.items.find(i => i.id === queueItemId);
      
      if (!item) {
        return;
      }

      if (item.status === 'downloading') {
        const index = state.activeDownloads.indexOf(item.episodeId);
        if (index > -1) {
          state.activeDownloads.splice(index, 1);
        }
      }

      item.status = 'paused';
      item.pausedReason = reason;
    });

    // Process queue to start next pending item
    this.processQueue();
  }

  /**
   * Resume a paused download by queue item ID
   */
  static async resumeDownload(queueItemId: string): Promise<void> {
    await this.modifyQueueState(async (state) => {
      const item = state.items.find(i => i.id === queueItemId);
      
      if (!item) {
        return;
      }

      if (item.status === 'paused' || item.status === 'failed') {
        item.status = 'pending';
        item.pausedReason = undefined;
        item.error = undefined;
        item.retryCount = 0; // Reset retry count on manual resume
      }
    });

    // Process queue to start this item
    this.processQueue();
  }

  /**
   * Retry a failed download
   */
  static async retryDownload(queueItemId: string): Promise<void> {
    await this.modifyQueueState(async (state) => {
      const item = state.items.find(i => i.id === queueItemId);
      
      if (!item || item.status !== 'failed') {
        return;
      }

      // Reset for manual retry (don't count against auto-retry limit)
      item.status = 'pending';
      item.error = undefined;
      item.progress = 0;
      item.bytesDownloaded = 0;
    });

    // Process queue to start this item
    this.processQueue();
  }

  /**
   * Clear completed downloads from queue
   */
  static async clearCompleted(): Promise<void> {
    await this.modifyQueueState(async (state) => {
      state.items = state.items.filter(i => i.status !== 'completed');
    });
  }

  /**
   * Clear ALL items from queue (used when deleting all podcast data)
   */
  static async clearAll(): Promise<void> {
    await this.modifyQueueState(async (state) => {
      state.items = [];
      state.activeDownloads = [];
      
      if (__DEV__) {
        console.log('[DownloadQueue] 🧹 Cleared all queue items');
      }
    });
  }

  /**
   * Completely remove queue from AsyncStorage
   * Used when clearing all podcast data to ensure no stale entries remain
   */
  static async nukeQueue(): Promise<void> {
    const OLD_QUEUE_KEY = 'podcast_download_queue';
    
    try {
      // First, get the current queue state to clear the cache for all episodes
      const state = await this.getQueueState();
      
      if (__DEV__) {
        console.log('[DownloadQueue] 💣 Nuking queue with', state.items.length, 'items');
      }
      
      // Clear download status cache for all episodes in the queue
      for (const item of state.items) {
        DownloadStatusCache.markDeleted(item.episodeId);
      }
      
      // Remove both old and new queue keys from AsyncStorage
      await AsyncStorage.multiRemove([this.QUEUE_KEY, OLD_QUEUE_KEY]);
      
      // Clear in-memory state
      this.memoryState = null;
      if (this.pendingSaveTimeout) {
        clearTimeout(this.pendingSaveTimeout);
        this.pendingSaveTimeout = null;
      }
      this.listeners.clear();
      this.isProcessing = false;
      
      if (__DEV__) {
        console.log('[DownloadQueue] 💣 Queue completely removed from AsyncStorage and memory');
      }
    } catch (error) {
      console.error('[DownloadQueue] ⚠️ Error nuking queue:', error);
    }
  }

  /**
   * Clean up stale queue entries (duplicates and old completed items)
   * Should be called during initialization
   */
  private static async cleanupQueue(): Promise<void> {
    try {
      await this.modifyQueueState(async (state) => {
        const originalCount = state.items.length;
        
        if (originalCount === 0) {
          return;
        }
        
        // Step 1: Remove duplicates (keep most recent entry for each episode)
        // Use a Map to track the newest item for each episodeId
        const episodeMap = new Map<string, QueueItem>();
        
        for (const item of state.items) {
          const existing = episodeMap.get(item.episodeId);
          if (!existing) {
            episodeMap.set(item.episodeId, item);
          } else {
            // Keep the item with the most recent addedAt timestamp
            const existingTime = new Date(existing.addedAt).getTime();
            const currentTime = new Date(item.addedAt).getTime();
            if (currentTime > existingTime) {
              episodeMap.set(item.episodeId, item);
            }
          }
        }
        
        // Step 2: Filter out completed items that don't have actual files
        // Only keep completed items that are truly downloaded
        const cleanedItems: QueueItem[] = [];
        
        for (const item of episodeMap.values()) {
          // Keep non-completed items (pending, downloading, paused, failed)
          if (item.status !== 'completed') {
            cleanedItems.push(item);
            continue;
          }
          
          // For completed items, verify the file exists
          try {
            const filePath = await PodcastDownloadService.getDownloadedEpisodePath(item.episodeId);
            if (filePath) {
              // File exists, keep the item
              cleanedItems.push(item);
            } else {
              // File doesn't exist, remove this stale entry
              if (__DEV__) {
                console.log('[DownloadQueue] 🗑️  Removing stale completed item (file missing):', item.episode.title.substring(0, 40));
              }
            }
          } catch (error) {
            // Error checking file, remove to be safe
            if (__DEV__) {
              console.log('[DownloadQueue] 🗑️  Removing problematic item:', item.episode.title.substring(0, 40), error);
            }
          }
        }
        
        state.items = cleanedItems;
        
        // Step 3: Clear active downloads list if any items in it aren't actually downloading
        state.activeDownloads = state.activeDownloads.filter(episodeId => 
          cleanedItems.some(item => item.episodeId === episodeId && item.status === 'downloading')
        );
        
        const removedCount = originalCount - cleanedItems.length;
        if (removedCount > 0) {
          console.log(`[DownloadQueue] 🧹 Cleaned queue: ${originalCount} → ${cleanedItems.length} items (removed ${removedCount} stale/duplicate entries)`);
        }
      });
    } catch (error) {
      console.error('[DownloadQueue] Error cleaning up queue:', error);
    }
  }

  /**
   * Process the download queue
   */
  private static async processQueue(): Promise<void> {
    // Atomically check and set isProcessing flag to prevent concurrent execution
    if (this.isProcessing) {
      console.log('[DownloadQueue] Already processing queue, skipping');
      return;
    }
    
    this.isProcessing = true; // Set IMMEDIATELY to prevent race condition

    if (Platform.OS === 'web') {
      this.isProcessing = false;
      return;
    }

    console.log('[DownloadQueue] 🔄 Processing queue...');

    try {
      // Collect items to start in one atomic operation
      let toStart: QueueItem[] = [];
      
      await this.modifyQueueState(async (state) => {
        console.log('[DownloadQueue] Queue state - total:', state.items.length, 'active:', state.activeDownloads.length);
        
        // Step 1: Synchronize activeDownloads with actual downloading items
        const downloadingItems = state.items.filter(item => item.status === 'downloading');
        const actualActiveIds = downloadingItems.map(item => item.episodeId);
        
        const currentActiveSet = new Set(state.activeDownloads);
        const isSynced = state.activeDownloads.length === actualActiveIds.length && 
                         actualActiveIds.every(id => currentActiveSet.has(id));
        
        if (!isSynced) {
          if (__DEV__) {
            console.warn('[DownloadQueue] ⚠️ activeDownloads array out of sync. Fixing...');
            console.log('[DownloadQueue] Current active:', state.activeDownloads);
            console.log('[DownloadQueue] Actual downloading:', actualActiveIds);
          }
          state.activeDownloads = actualActiveIds; // Resync
        }

        // Step 2: Check network conditions
        const canDownload = await this.canDownloadOnCurrentNetwork();
        if (!canDownload) {
          console.log('[DownloadQueue] ⚠️ Network conditions not suitable for download');
          // Pause all active downloads due to network restrictions
          for (const item of state.items) {
            if (item.status === 'downloading') {
              item.status = 'paused';
              item.pausedReason = 'network';
            }
          }
          state.activeDownloads = []; // Clear active downloads as they are now paused
          return; // Exit early if no network
        }

        // Step 3: Collect status breakdown for logging
        const statusBreakdown: Record<string, number> = {};
        for (const item of state.items) {
          statusBreakdown[item.status] = (statusBreakdown[item.status] || 0) + 1;
        }
        
        // ALWAYS log breakdown (not just in __DEV__) to diagnose queue issues
        console.log('[DownloadQueue] 📊 Queue breakdown:', {
          total: state.items.length,
          active: state.activeDownloads.length,
          maxConcurrent: this.MAX_CONCURRENT,
          statusBreakdown,
          canStartMore: state.activeDownloads.length < this.MAX_CONCURRENT,
        });
        
        // Log each item's status
        console.log('[DownloadQueue] 📋 Items in queue:');
        state.items.forEach((item, index) => {
          console.log(`  [${index}] ${item.episode.title.substring(0, 40)} - Status: ${item.status}, Progress: ${item.progress}%`);
        });

        // Step 4: Identify and mark items to start
        for (const item of state.items) {
          if (item.status === 'pending' && state.activeDownloads.length + toStart.length < this.MAX_CONCURRENT) {
            toStart.push(item);
            // Immediately mark as active to prevent duplicate starts
            state.activeDownloads.push(item.episodeId);
            item.status = 'downloading';
            item.startedAt = new Date().toISOString(); // Ensure startedAt is set
            if (__DEV__) {
              console.log('[DownloadQueue] 📤 Will start:', item.episode.title.substring(0, 40), {
                previousStatus: 'pending',
                newStatus: 'downloading',
                activeCount: state.activeDownloads.length,
                maxConcurrent: this.MAX_CONCURRENT,
              });
            }
          }
        }
      });
      
      if (toStart.length > 0) {
        console.log('[DownloadQueue] ✅ Starting', toStart.length, 'concurrent downloads');
        
        // Start all downloads WITHOUT awaiting - they run in parallel
        toStart.forEach(item => {
          console.log('[DownloadQueue] 🚀 Launching download:', item.episode.title.substring(0, 40));
          this.startDownload(item); // This will call PodcastDownloadService.downloadEpisode
        });
      } else {
        console.log('[DownloadQueue] ℹ️  No pending items to start (all items are either completed, downloading, paused, or failed)');
      }
      
      console.log('[DownloadQueue] ✅ Queue processing complete');
    } catch (error) {
      console.error('[DownloadQueue] Error processing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start downloading an item
   * NOTE: Item should already be marked as 'downloading' before calling this
   */
  private static async startDownload(item: QueueItem): Promise<void> {
    console.log('[DownloadQueue] 🚀 Starting download for:', item.episode.title);

    try {
      // Download the episode
      console.log('[DownloadQueue] Calling PodcastDownloadService.downloadEpisode');
      await PodcastDownloadService.downloadEpisode(
        item.episode,
        (progress: DownloadProgress) => {
          // Update progress
          this.updateProgress(item.id, progress).catch(console.error);
        }
      );

      console.log('[DownloadQueue] ✅ Download completed successfully');
      // Mark as completed (this will update caches via saveQueueState)
      await this.markCompleted(item.id);
    } catch (error) {
      console.error('[DownloadQueue] ❌ Download failed:', error);
      await this.handleDownloadError(item.id, error);
    }
  }

  /**
   * Update download progress
   */
  /**
   * Update download progress (optimized to avoid blocking queue operations)
   * Updates in-memory state immediately and schedules a debounced save
   */
  private static async updateProgress(queueItemId: string, progress: DownloadProgress): Promise<void> {
    // Get current state (from memory cache, very fast)
    const state = await this.getQueueState();
    const item = state.items.find(i => i.id === queueItemId);
    
    if (!item) {
      return;
    }

    // Ensure status is 'downloading'
    if (item.status !== 'downloading') {
      if (__DEV__) {
        console.log('[DownloadQueue] ⚠️  updateProgress: item status was', item.status, ', setting to downloading');
      }
      item.status = 'downloading';
    }
    
    // Update progress in memory
    item.progress = progress.progress;
    item.bytesDownloaded = progress.downloadedBytes;
    item.totalBytes = progress.totalBytes;
    
    // Update caches and notify listeners immediately for responsive UI
    this.syncCachesAndNotify(state);
    
    // Schedule debounced save to AsyncStorage (don't block on this)
    this.scheduleDebouncedSave();
  }

  /**
   * Mark download as completed
   */
  private static async markCompleted(queueItemId: string): Promise<void> {
    console.log('[DownloadQueue] 🎉 Marking download as completed:', queueItemId);
    
    await this.modifyQueueState(async (state) => {
      const item = state.items.find(i => i.id === queueItemId);
      
      if (!item) {
        console.warn('[DownloadQueue] Item not found for completion:', queueItemId);
        return;
      }

      item.status = 'completed';
      item.progress = 100;
      item.completedAt = new Date().toISOString();
      
      // Remove from active downloads
      const index = state.activeDownloads.indexOf(item.episodeId);
      if (index > -1) {
        state.activeDownloads.splice(index, 1);
        console.log('[DownloadQueue] Removed from active downloads, remaining:', state.activeDownloads.length);
      }

      state.completedToday++;
    });
    
    console.log('[DownloadQueue] ✅ Download marked as completed');

    // Process queue to start next item
    this.processQueue();
  }

  /**
   * Handle download error
   */
  private static async handleDownloadError(queueItemId: string, error: any): Promise<void> {
    let shouldRetry = false;
    let delayMs = 0;
    
    await this.modifyQueueState(async (state) => {
      const item = state.items.find(i => i.id === queueItemId);
      
      if (!item) {
        return;
      }

      // Remove from active downloads
      const index = state.activeDownloads.indexOf(item.episodeId);
      if (index > -1) {
        state.activeDownloads.splice(index, 1);
      }

      item.retryCount++;
      item.error = error instanceof Error ? error.message : String(error);

      // Check if we should retry
      if (item.retryCount < item.maxRetries) {
        // Auto-retry with exponential backoff
        delayMs = Math.pow(2, item.retryCount) * 5000; // 5s, 10s, 20s
        item.status = 'pending';
        shouldRetry = true;
        console.log(`[DownloadQueue] Retrying download in ${delayMs}ms (${item.retryCount}/${item.maxRetries}):`, item.episode.title.substring(0, 40));
      } else {
        item.status = 'failed';
        console.error('[DownloadQueue] Download failed after retries:', item.episode.title.substring(0, 40), item.error);
      }
    });
    
    if (shouldRetry) {
      setTimeout(() => this.processQueue(), delayMs);
    } else {
      // Process queue to start next item
      this.processQueue();
    }
  }

  /**
   * Check if we can download on current network
   */
  private static async canDownloadOnCurrentNetwork(userId?: string): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true;
    }

    try {
      // Get user preferences
      let wifiOnly = true;
      if (userId) {
        const prefs = await UserLiturgyPreferencesService.getUserPreferences(userId);
        wifiOnly = prefs?.podcast_wifi_only ?? true;
      }

      if (!wifiOnly) {
        return true; // User allows cellular downloads
      }

      // Check network type
      const netInfo = await NetInfo.fetch();
      return netInfo.type === 'wifi';
    } catch (error) {
      console.error('[DownloadQueue] Error checking network:', error);
      return false; // Be conservative on error
    }
  }

  /**
   * Set up network monitoring
   */
  private static setupNetworkMonitoring(userId?: string): void {
    if (Platform.OS === 'web') {
      return;
    }

    // Clean up existing subscription
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }

    let lastNetworkType: string | null = null;

    // Subscribe to network changes
    this.networkUnsubscribe = NetInfo.addEventListener(async (state) => {
      // Debounce - only react to actual network type changes
      if (lastNetworkType === state.type) {
        return;
      }
      
      lastNetworkType = state.type;
      console.log('[DownloadQueue] 📶 Network changed:', state.type);
      
      const canDownload = await this.canDownloadOnCurrentNetwork(userId);
      
      if (canDownload) {
        console.log('[DownloadQueue] ✅ Network suitable for downloads');
        // Network is good, resume paused downloads
        await this.resumePausedDownloads();
      } else {
        console.log('[DownloadQueue] ⚠️ Network not suitable, pausing downloads');
        // Network is restricted, pause active downloads
        await this.pauseAllActiveDownloads('network');
      }
    });
    
    console.log('[DownloadQueue] 📶 Network monitoring set up');
  }

  /**
   * Pause all active downloads
   */
  private static async pauseAllActiveDownloads(reason: PausedReason): Promise<void> {
    await this.modifyQueueState(async (state) => {
      for (const item of state.items) {
        if (item.status === 'downloading') {
          item.status = 'paused';
          item.pausedReason = reason;
          if (__DEV__) {
            console.log('[DownloadQueue] ⏸️ Paused active download due to network:', item.episode.title.substring(0, 40));
          }
        }
      }
      state.activeDownloads = []; // Clear active downloads as they are now paused
    });
    this.notifyListeners(); // Notify listeners after state modification
  }

  /**
   * Resume paused downloads (that were paused due to network)
   */
  private static async resumePausedDownloads(): Promise<void> {
    await this.modifyQueueState(async (state) => {
      for (const item of state.items) {
        if (item.status === 'paused' && item.pausedReason === 'network') {
          item.status = 'pending';
          item.pausedReason = undefined;
          if (__DEV__) {
            console.log('[DownloadQueue] ▶️ Resumed paused download:', item.episode.title.substring(0, 40));
          }
        }
      }
    });
    
    // Process queue to start resumed items
    this.processQueue();
  }

  /**
   * Get queue statistics
   */
  static async getStats(): Promise<{
    total: number;
    pending: number;
    downloading: number;
    completed: number;
    failed: number;
    paused: number;
  }> {
    const state = await this.getQueueState();
    
    return {
      total: state.items.length,
      pending: state.items.filter(i => i.status === 'pending').length,
      downloading: state.items.filter(i => i.status === 'downloading').length,
      completed: state.items.filter(i => i.status === 'completed').length,
      failed: state.items.filter(i => i.status === 'failed').length,
      paused: state.items.filter(i => i.status === 'paused').length,
    };
  }
}

