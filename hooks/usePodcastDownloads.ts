/**
 * Hook for managing podcast downloads with queue support
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { PodcastEpisode } from '../types/podcast-types';
import { PodcastDownloadService, DownloadProgress, DownloadedEpisode } from '../services/PodcastDownloadService';
import { PodcastDownloadQueueService, QueueItem, QueueState } from '../services/PodcastDownloadQueueService';
import { UserLiturgyPreferencesService } from '../services/UserLiturgyPreferencesService';
import { useAuth } from '../contexts/AuthContext';
import { useSharedPlaylistHooks } from '../contexts/SharedPlaylistHooksContext';
import { DownloadStatusCache } from '../services/DownloadStatusCache';

export interface DownloadState {
  episodeId: string;
  status: 'idle' | 'pending' | 'downloading' | 'downloaded' | 'error' | 'paused';
  progress?: number;
  error?: string;
  queueItem?: QueueItem;
}

export function usePodcastDownloads() {
  const { user } = useAuth();
  const [downloadStates, setDownloadStates] = useState<Map<string, DownloadState>>(new Map());
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<DownloadedEpisode[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [useQueue, setUseQueue] = useState(true); // Enable queue by default
  const [cacheVersion, setCacheVersion] = useState(0); // Force re-render when cache changes
  
  // Check if we're in a context that provides download hooks already
  const sharedContext = useSharedPlaylistHooks();
  const hasSharedDownloadHooks = !!sharedContext.downloadHooks;

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const prefs = await UserLiturgyPreferencesService.getUserPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('[usePodcastDownloads] Error loading preferences:', error);
    }
  }, [user?.id]);

  // Load downloaded episodes
  const loadDownloadedEpisodes = useCallback(async () => {
    try {
      // OPTIMIZATION: Skip if DownloadStatusCache is initialized (already has this data)
      if (DownloadStatusCache.isInitialized()) {
        const stats = DownloadStatusCache.getStats();
        if (__DEV__) console.log('[usePodcastDownloads] Using DownloadStatusCache, found', stats.downloaded, 'downloads (skipping service call)');
        // Cache has the data, no need to call service
        setDownloadedEpisodes([]); // We'll use cache for queries anyway
        return;
      }
      
      const downloads = await PodcastDownloadService.getDownloadedEpisodes();
      setDownloadedEpisodes(downloads);
    } catch (error) {
      console.error('[usePodcastDownloads] Error loading downloaded episodes:', error);
    }
  }, []);

  // Initialize queue service and subscribe to changes (only once globally)
  useEffect(() => {
    // If context provides download hooks, skip queue initialization entirely
    if (hasSharedDownloadHooks) {
      if (__DEV__) console.log('[usePodcastDownloads] 🎯 Using shared context, skipping queue initialization');
      return;
    }
    
    if (Platform.OS === 'web' || !useQueue) {
      return;
    }

    // Only initialize if not already initialized (prevents duplicate initializations)
    const isAlreadyInitialized = (PodcastDownloadQueueService as any)._isInitialized;
    if (isAlreadyInitialized) {
      if (__DEV__) {
        console.log('[usePodcastDownloads] Queue service already initialized, skipping');
      }
      let mounted = true;
      
      // Initialize cache if not already done (async, non-blocking)
      if (!DownloadStatusCache.isInitialized()) {
        (async () => {
          const downloads = await PodcastDownloadService.getDownloadedEpisodes();
          const queueState = await PodcastDownloadQueueService.getQueueState();
          await DownloadStatusCache.initialize(downloads, queueState.items);
          if (__DEV__) {
            console.log('[usePodcastDownloads] ✅ Initialized DownloadStatusCache (late init)');
          }
          if (mounted) {
            setCacheVersion(prev => prev + 1);
          }
        })();
      }
      
      // Still need to subscribe to changes
      const unsubscribe = PodcastDownloadQueueService.subscribe((state) => {
        if (!mounted) return;
        setQueueState(state);
        const newStates = new Map<string, DownloadState>();
        state.items.forEach(item => {
          newStates.set(item.episodeId, {
            episodeId: item.episodeId,
            status: item.status as any,
            progress: item.progress,
            error: item.error,
            queueItem: item,
          });
        });
        setDownloadStates(newStates);
      });
      
      return () => {
        console.log('[usePodcastDownloads] Cleaning up queue service');
        mounted = false;
        unsubscribe();
      };
    }

    console.log('[usePodcastDownloads] Initializing queue service');
    let mounted = true;
    let cacheInitialized = false;

    // Initialize queue service and mark as initialized
    PodcastDownloadQueueService.initialize(user?.id).then(async () => {
      if (!mounted) return;
      
      // Initialize DownloadStatusCache with downloaded episodes and queue items
      if (!cacheInitialized) {
        const downloads = await PodcastDownloadService.getDownloadedEpisodes();
        const queueState = await PodcastDownloadQueueService.getQueueState();
        
        await DownloadStatusCache.initialize(downloads, queueState.items);
        cacheInitialized = true;
        
        if (__DEV__) {
          console.log('[usePodcastDownloads] ✅ Initialized DownloadStatusCache with', downloads.length, 'downloads and', queueState.items.length, 'queue items');
        }
        
        // Trigger a cache version update to refresh components
        setCacheVersion(prev => prev + 1);
      }
    }).catch(console.error);
    (PodcastDownloadQueueService as any)._isInitialized = true;

    // Subscribe to queue state changes
    const unsubscribe = PodcastDownloadQueueService.subscribe((state) => {
      if (!mounted) return;
      
      console.log('[usePodcastDownloads] 📊 Queue state updated:', {
        total: state.items.length,
        active: state.activeDownloads.length,
        items: state.items.map(i => ({ id: i.episodeId, status: i.status, progress: i.progress }))
      });
      setQueueState(state);
      
      // Update download states based on queue items
      const newStates = new Map<string, DownloadState>();
      state.items.forEach(item => {
        newStates.set(item.episodeId, {
          episodeId: item.episodeId,
          status: item.status as any,
          progress: item.progress,
          error: item.error,
          queueItem: item,
        });
      });
      setDownloadStates(newStates);
      console.log('[usePodcastDownloads] Updated download states for', newStates.size, 'items');
    });

    // Load initial queue state
    PodcastDownloadQueueService.getQueueState()
      .then((state) => {
        if (!mounted) return;
        console.log('[usePodcastDownloads] Initial queue state loaded:', state.items.length, 'items');
        setQueueState(state);
      })
      .catch(console.error);

    return () => {
      console.log('[usePodcastDownloads] Cleaning up queue service');
      mounted = false;
      unsubscribe();
      // Don't call cleanup here - let it persist across component lifecycles
    };
  }, [user?.id, useQueue, hasSharedDownloadHooks]);

  // Subscribe to DownloadStatusCache changes to trigger re-renders
  // Only subscribe if this hook instance will actually be used (not shadowed by shared hooks)
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    
    // If shared hooks are available, skip subscription (the shared instance will handle it)
    if (hasSharedDownloadHooks) {
      return;
    }
    
    const unsubscribe = DownloadStatusCache.subscribe((episodeId, status) => {
      // Increment cache version to force components to re-render
      setCacheVersion(prev => prev + 1);
    });
    
    return () => {
      unsubscribe();
    };
  }, [hasSharedDownloadHooks]); // Re-subscribe if shared hooks availability changes
  
  // Initialize
  useEffect(() => {
    // If context provides download hooks, skip initialization
    if (hasSharedDownloadHooks) {
      setIsLoading(false);
      return;
    }
    
    const initialize = async () => {
      setIsLoading(true);
      await Promise.all([
        loadPreferences(),
        loadDownloadedEpisodes(),
      ]);
      setIsLoading(false);
    };
    
    initialize();
  }, [loadPreferences, loadDownloadedEpisodes, hasSharedDownloadHooks]);

  // Check if downloads are enabled
  const isDownloadsEnabled = preferences?.podcast_downloads_enabled ?? true;

  // Check if episode is downloaded
  const isEpisodeDownloaded = useCallback((episodeId: string): boolean => {
    // OPTIMIZATION: Use DownloadStatusCache for instant lookup (O(1) vs O(n) array scan)
    if (DownloadStatusCache.isInitialized()) {
      return DownloadStatusCache.isDownloaded(episodeId);
    }
    return downloadedEpisodes.some(ep => ep.episodeId === episodeId);
  }, [downloadedEpisodes, cacheVersion]); // Add cacheVersion to force updates

  // Get download state for episode
  const getDownloadState = useCallback((episodeId: string): DownloadState => {
    // OPTIMIZATION: Use DownloadStatusCache for instant lookup
    if (DownloadStatusCache.isInitialized()) {
      const cachedStatus = DownloadStatusCache.get(episodeId);
      return {
        episodeId,
        status: cachedStatus.isDownloaded ? 'downloaded' : 
                cachedStatus.status === 'downloading' ? 'downloading' :
                cachedStatus.status === 'pending' ? 'pending' :
                cachedStatus.status === 'failed' ? 'error' :
                cachedStatus.status === 'paused' ? 'paused' : 'idle',
        progress: cachedStatus.progress,
        error: cachedStatus.queueItem?.error,
        queueItem: cachedStatus.queueItem || undefined,
      };
    }
    return downloadStates.get(episodeId) || { episodeId, status: 'idle' };
  }, [downloadStates, cacheVersion]); // Add cacheVersion to force updates

  // Check WiFi connection
  const checkWiFiConnection = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return true; // Web doesn't have WiFi restriction
    }

    const wifiOnly = preferences?.podcast_wifi_only ?? true;
    if (!wifiOnly) {
      return true; // WiFi-only is disabled
    }

    const netInfo = await NetInfo.fetch();
    return netInfo.type === 'wifi';
  }, [preferences?.podcast_wifi_only]);

  // Download episode (with queue support)
  const downloadEpisode = useCallback(async (episode: PodcastEpisode): Promise<boolean> => {
    console.log('[usePodcastDownloads] 📥 downloadEpisode CALLED for:', episode.title.substring(0, 40));
    const startTime = Date.now();
    
    if (!isDownloadsEnabled) {
      console.warn('[usePodcastDownloads] Downloads are disabled');
      return false;
    }

    if (Platform.OS === 'web') {
      console.warn('[usePodcastDownloads] Downloads not supported on web');
      return false;
    }

    // Use queue if enabled
    if (useQueue) {
      try {
        console.log('[usePodcastDownloads] ⏱️  Calling addToQueue...');
        const addToQueueStart = Date.now();
        await PodcastDownloadQueueService.addToQueue(episode);
        console.log('[usePodcastDownloads] ✅ addToQueue returned in', Date.now() - addToQueueStart, 'ms');
        console.log('[usePodcastDownloads] ✅ Total downloadEpisode time:', Date.now() - startTime, 'ms');
        // Don't reload downloaded episodes immediately - wait for download to complete
        return true;
      } catch (error) {
        console.error('[usePodcastDownloads] ❌ Failed to add to queue:', error);
        // If error is "already in queue" or "already downloaded", that's okay - return true
        if (error instanceof Error && 
            (error.message.includes('already in queue') || 
             error.message.includes('already downloaded'))) {
          console.log('[usePodcastDownloads] Episode already in queue or downloaded, returning success');
          return true;
        }
        return false;
      }
    }

    // Fallback to direct download (legacy behavior)
    // Check WiFi connection
    const hasWiFi = await checkWiFiConnection();
    if (!hasWiFi) {
      setDownloadStates(prev => new Map(prev).set(episode.id, {
        episodeId: episode.id,
        status: 'error',
        error: 'WiFi connection required for downloads',
      }));
      return false;
    }

    try {
      // Set downloading state
      setDownloadStates(prev => new Map(prev).set(episode.id, {
        episodeId: episode.id,
        status: 'downloading',
        progress: 0,
      }));

      // Download the episode
      await PodcastDownloadService.downloadEpisode(episode, (progress: DownloadProgress) => {
        setDownloadStates(prev => new Map(prev).set(episode.id, {
          episodeId: episode.id,
          status: 'downloading',
          progress: progress.progress,
        }));
      });

      // Check max downloads limit
      const maxDownloads = preferences?.podcast_max_downloads ?? 10;
      await PodcastDownloadService.cleanupOldDownloads(maxDownloads);

      // Reload downloaded episodes
      await loadDownloadedEpisodes();

      // Set downloaded state
      setDownloadStates(prev => new Map(prev).set(episode.id, {
        episodeId: episode.id,
        status: 'downloaded',
      }));

      return true;
    } catch (error) {
      console.error('[usePodcastDownloads] Download failed:', error);
      setDownloadStates(prev => new Map(prev).set(episode.id, {
        episodeId: episode.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Download failed',
      }));
      return false;
    }
  }, [isDownloadsEnabled, checkWiFiConnection, preferences?.podcast_max_downloads, loadDownloadedEpisodes, useQueue]);

  // Delete downloaded episode
  const deleteDownloadedEpisode = useCallback(async (episodeId: string): Promise<boolean> => {
    try {
      await PodcastDownloadService.deleteDownloadedEpisode(episodeId);
      await loadDownloadedEpisodes();
      
      // Clear download state
      setDownloadStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(episodeId);
        return newMap;
      });

      return true;
    } catch (error) {
      console.error('[usePodcastDownloads] Delete failed:', error);
      return false;
    }
  }, [loadDownloadedEpisodes]);

  // Get downloaded episode path
  const getDownloadedEpisodePath = useCallback(async (episodeId: string): Promise<string | null> => {
    try {
      return await PodcastDownloadService.getDownloadedEpisodePath(episodeId);
    } catch (error) {
      console.error('[usePodcastDownloads] Error getting episode path:', error);
      return null;
    }
  }, []);

  // Get total storage used
  const getTotalStorageUsed = useCallback(async (): Promise<number> => {
    try {
      return await PodcastDownloadService.getTotalStorageUsed();
    } catch (error) {
      console.error('[usePodcastDownloads] Error getting storage used:', error);
      return 0;
    }
  }, []);

  // Refresh preferences
  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  // Queue operations
  const addToQueue = useCallback(async (episode: PodcastEpisode): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    try {
      await PodcastDownloadQueueService.addToQueue(episode);
      return true;
    } catch (error) {
      console.error('[usePodcastDownloads] Failed to add to queue:', error);
      return false;
    }
  }, []);

  const removeFromQueue = useCallback(async (queueItemId: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    await PodcastDownloadQueueService.removeFromQueue(queueItemId);
  }, []);

  const pauseDownload = useCallback(async (queueItemId: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    await PodcastDownloadQueueService.pauseDownload(queueItemId, 'manual');
  }, []);

  const resumeDownload = useCallback(async (queueItemId: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    await PodcastDownloadQueueService.resumeDownload(queueItemId);
  }, []);

  const retryDownload = useCallback(async (queueItemId: string): Promise<void> => {
    if (Platform.OS === 'web') return;
    await PodcastDownloadQueueService.retryDownload(queueItemId);
  }, []);

  const clearCompleted = useCallback(async (): Promise<void> => {
    if (Platform.OS === 'web') return;
    await PodcastDownloadQueueService.clearCompleted();
  }, []);

  const getQueueStats = useCallback(async () => {
    if (Platform.OS === 'web') return null;
    return await PodcastDownloadQueueService.getStats();
  }, []);

  return {
    // State
    downloadStates,
    downloadedEpisodes,
    preferences,
    isLoading,
    queueState,
    useQueue,
    
    // Computed
    isDownloadsEnabled,
    
    // Actions
    downloadEpisode,
    deleteDownloadedEpisode,
    getDownloadedEpisodePath,
    getTotalStorageUsed,
    refreshPreferences,
    
    // Queue operations
    addToQueue,
    removeFromQueue,
    pauseDownload,
    resumeDownload,
    retryDownload,
    clearCompleted,
    getQueueStats,
    
    // Helpers
    isEpisodeDownloaded,
    getDownloadState,
    checkWiFiConnection,
    
    // Settings
    setUseQueue,
  };
}
