/**
 * Podcast Download Queue Service
 * Manages background downloads with concurrency control, retry logic, and network awareness
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
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
  private static readonly QUEUE_KEY = 'podcast_download_queue';
  private static readonly MAX_CONCURRENT = 5;
  private static readonly MAX_RETRIES = 3;
  
  private static listeners: Set<QueueChangeListener> = new Set();
  private static isProcessing = false;
  private static networkUnsubscribe?: () => void;

  /**
   * Initialize the queue service
   */
  static async initialize(userId?: string): Promise<void> {
    if (Platform.OS === 'web') {
      console.warn('[DownloadQueue] Not available on web');
      return;
    }

    // Set up network monitoring
    this.setupNetworkMonitoring(userId);
    
    // Resume any paused downloads
    await this.resumePausedDownloads();
    
    // Process the queue
    await this.processQueue();
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = undefined;
    }
    this.listeners.clear();
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
   * Notify all listeners of queue state change
   */
  private static async notifyListeners(): Promise<void> {
    const state = await this.getQueueState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[DownloadQueue] Listener error:', error);
      }
    });
  }

  /**
   * Get current queue state
   */
  static async getQueueState(): Promise<QueueState> {
    try {
      const data = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (!data) {
        return this.getEmptyQueueState();
      }
      
      const state: QueueState = JSON.parse(data);
      
      // Validate and ensure state has correct shape
      // This handles cases where stored data might be from old version or corrupted
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
      
      // Clean up completed items older than 24 hours
      const now = new Date().getTime();
      state.items = state.items.filter(item => {
        if (item.status === 'completed' && item.completedAt) {
          const completedTime = new Date(item.completedAt).getTime();
          return (now - completedTime) < 24 * 60 * 60 * 1000; // 24 hours
        }
        return true;
      });
      
      return state;
    } catch (error) {
      console.error('[DownloadQueue] Error getting queue state:', error);
      return this.getEmptyQueueState();
    }
  }

  /**
   * Save queue state
   */
  private static async saveQueueState(state: QueueState): Promise<void> {
    try {
      state.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(state));
      
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
      
      await this.notifyListeners();
    } catch (error) {
      console.error('[DownloadQueue] Error saving queue state:', error);
      throw error;
    }
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

    console.log('[DownloadQueue] Adding episode to queue:', episode.title);

    const state = await this.getQueueState();
    
    // Check if already in queue or downloaded
    const existingItem = state.items.find(item => item.episodeId === episode.id);
    if (existingItem) {
      console.log('[DownloadQueue] Episode already in queue, status:', existingItem.status);
      if (existingItem.status === 'completed') {
        console.log('[DownloadQueue] Episode already downloaded, cleaning up from queue');
        // Remove completed item from queue and return success
        // (They can see it in the Downloaded playlist)
        await this.removeFromQueue(existingItem.id);
        // Don't throw error - just return the item as if it was added
        return existingItem;
      }
      if (existingItem.status === 'downloading' || existingItem.status === 'pending') {
        console.log('[DownloadQueue] Episode already in queue with status:', existingItem.status);
        // Don't throw error - just return the existing item
        return existingItem;
      }
      // If failed or paused, we can re-add it
      console.log('[DownloadQueue] Reusing existing failed/paused item');
      return existingItem;
    }

    // Also check if episode is already downloaded (not just in queue)
    const { PodcastDownloadService } = require('./PodcastDownloadService');
    const isAlreadyDownloaded = await PodcastDownloadService.isEpisodeDownloaded(episode.id);
    if (isAlreadyDownloaded) {
      console.log('[DownloadQueue] ✅ Episode already downloaded, skipping queue add');
      // Return a fake queue item so caller knows it succeeded
      return {
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
    await this.saveQueueState(state);

    console.log('[DownloadQueue] ✅ Episode added to queue, total items:', state.items.length);

    // Start processing the queue
    this.processQueue();

    return queueItem;
  }

  /**
   * Remove item from queue
   */
  static async removeFromQueue(queueItemId: string): Promise<void> {
    const state = await this.getQueueState();
    const item = state.items.find(i => i.id === queueItemId);
    
    if (!item) {
      return;
    }

    // If downloading, we need to cancel it first
    if (item.status === 'downloading') {
      const index = state.activeDownloads.indexOf(item.episodeId);
      if (index > -1) {
        state.activeDownloads.splice(index, 1);
      }
    }

    // Remove from queue
    state.items = state.items.filter(i => i.id !== queueItemId);
    await this.saveQueueState(state);

    // Update caches
    DownloadStatusCache.removeQueueItem(item.episodeId);
    EpisodeMetadataCache.update(item.episodeId, {
      downloadStatus: null,
      queuePosition: null,
    });

    // Process queue to start next pending item
    this.processQueue();
  }

  /**
   * Pause a download
   */
  static async pauseDownload(queueItemId: string, reason: PausedReason = 'manual'): Promise<void> {
    const state = await this.getQueueState();
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
    await this.saveQueueState(state);

    // Process queue to start next pending item
    this.processQueue();
  }

  /**
   * Resume a paused download
   */
  static async resumeDownload(queueItemId: string): Promise<void> {
    const state = await this.getQueueState();
    const item = state.items.find(i => i.id === queueItemId);
    
    if (!item || item.status !== 'paused') {
      return;
    }

    item.status = 'pending';
    item.pausedReason = undefined;
    await this.saveQueueState(state);

    // Process queue to start this item
    this.processQueue();
  }

  /**
   * Retry a failed download
   */
  static async retryDownload(queueItemId: string): Promise<void> {
    const state = await this.getQueueState();
    const item = state.items.find(i => i.id === queueItemId);
    
    if (!item || item.status !== 'failed') {
      return;
    }

    // Reset for manual retry (don't count against auto-retry limit)
    item.status = 'pending';
    item.error = undefined;
    item.progress = 0;
    item.bytesDownloaded = 0;
    await this.saveQueueState(state);

    // Process queue to start this item
    this.processQueue();
  }

  /**
   * Clear completed downloads from queue
   */
  static async clearCompleted(): Promise<void> {
    const state = await this.getQueueState();
    state.items = state.items.filter(i => i.status !== 'completed');
    await this.saveQueueState(state);
  }

  /**
   * Process the download queue
   */
  private static async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('[DownloadQueue] Already processing queue, skipping');
      return; // Already processing
    }

    if (Platform.OS === 'web') {
      return;
    }

    this.isProcessing = true;
    console.log('[DownloadQueue] 🔄 Processing queue...');

    try {
      const state = await this.getQueueState();
      console.log('[DownloadQueue] Queue state - total:', state.items.length, 'active:', state.activeDownloads.length);
      
      // Check network conditions
      const canDownload = await this.canDownloadOnCurrentNetwork();
      if (!canDownload) {
        console.log('[DownloadQueue] ⚠️ Network conditions not suitable for download');
        // Pause all active downloads due to network restrictions
        await this.pauseAllActiveDownloads('network');
        return;
      }

      // Start pending downloads up to max concurrent limit
      while (state.activeDownloads.length < this.MAX_CONCURRENT) {
        const nextItem = state.items.find(i => i.status === 'pending');
        if (!nextItem) {
          console.log('[DownloadQueue] No more pending items');
          break; // No more pending items
        }

        console.log('[DownloadQueue] 📥 Starting download for:', nextItem.episode.title);
        // Start this download
        await this.startDownload(nextItem);
        
        // Reload state to get updated active downloads
        const updatedState = await this.getQueueState();
        state.activeDownloads = updatedState.activeDownloads;
        state.items = updatedState.items;
      }
      
      console.log('[DownloadQueue] ✅ Queue processing complete');
    } catch (error) {
      console.error('[DownloadQueue] ❌ Error processing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start downloading an item
   */
  private static async startDownload(item: QueueItem): Promise<void> {
    console.log('[DownloadQueue] 🚀 Starting download for:', item.episode.title);
    const state = await this.getQueueState();
    
    // Mark as downloading
    item.status = 'downloading';
    item.startedAt = new Date().toISOString();
    state.activeDownloads.push(item.episodeId);
    await this.saveQueueState(state);
    console.log('[DownloadQueue] Marked as downloading, active count:', state.activeDownloads.length);

    try {
      // Download the episode
      console.log('[DownloadQueue] Calling PodcastDownloadService.downloadEpisode');
      await PodcastDownloadService.downloadEpisode(
        item.episode,
        (progress: DownloadProgress) => {
          // Update progress
          console.log('[DownloadQueue] 📊 Progress:', progress.progress, '%');
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
  private static async updateProgress(queueItemId: string, progress: DownloadProgress): Promise<void> {
    const state = await this.getQueueState();
    const item = state.items.find(i => i.id === queueItemId);
    
    if (!item) {
      return;
    }

    item.progress = progress.progress;
    item.bytesDownloaded = progress.downloadedBytes;
    item.totalBytes = progress.totalBytes;
    
    await this.saveQueueState(state);
  }

  /**
   * Mark download as completed
   */
  private static async markCompleted(queueItemId: string): Promise<void> {
    console.log('[DownloadQueue] 🎉 Marking download as completed:', queueItemId);
    const state = await this.getQueueState();
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
    await this.saveQueueState(state);
    console.log('[DownloadQueue] ✅ Download marked as completed');

    // Process queue to start next item
    this.processQueue();
  }

  /**
   * Handle download error
   */
  private static async handleDownloadError(queueItemId: string, error: any): Promise<void> {
    const state = await this.getQueueState();
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
      const delayMs = Math.pow(2, item.retryCount) * 5000; // 5s, 10s, 20s
      
      item.status = 'pending';
      await this.saveQueueState(state);

      console.log(`[DownloadQueue] Retrying download in ${delayMs}ms (attempt ${item.retryCount + 1}/${item.maxRetries})`);
      
      setTimeout(() => {
        this.processQueue();
      }, delayMs);
    } else {
      // Max retries reached, mark as failed
      item.status = 'failed';
      await this.saveQueueState(state);
      
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
    const state = await this.getQueueState();
    const activeItems = state.items.filter(i => i.status === 'downloading');
    
    for (const item of activeItems) {
      await this.pauseDownload(item.id, reason);
    }
  }

  /**
   * Resume paused downloads (that were paused due to network)
   */
  private static async resumePausedDownloads(): Promise<void> {
    const state = await this.getQueueState();
    const pausedItems = state.items.filter(
      i => i.status === 'paused' && i.pausedReason === 'network'
    );
    
    for (const item of pausedItems) {
      await this.resumeDownload(item.id);
    }
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

