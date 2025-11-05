/**
 * Cache Initialization Hook
 * Initializes episode and download caches on app startup (only when authenticated)
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { DownloadStatusCache } from '../services/DownloadStatusCache';
import { PodcastDownloadService } from '../services/PodcastDownloadService';
import { PodcastDownloadQueueService } from '../services/PodcastDownloadQueueService';

/**
 * Initialize caches with download and queue data
 * Only runs when user is authenticated
 */
export function useCacheInitialization() {
  const { user } = useAuth();

  useEffect(() => {
    // Skip on web platform
    if (Platform.OS === 'web') {
      return;
    }

    // Only initialize if user is authenticated
    if (!user) {
      if (__DEV__) {
        console.log('[CacheInit] Skipping - no authenticated user');
      }
      return;
    }

    let cancelled = false;

    async function initializeCaches() {
      try {
        const startTime = Date.now();
        
        if (__DEV__) {
          console.log('[CacheInit] Starting cache initialization for user:', user.id);
        }

        // Check if already initialized
        if (DownloadStatusCache.isInitialized()) {
          if (__DEV__) {
            console.log('[CacheInit] Already initialized, skipping');
          }
          return;
        }

        // Fetch download metadata and queue state in parallel
        const [downloads, queueState] = await Promise.all([
          PodcastDownloadService.getDownloadedEpisodes(),
          PodcastDownloadQueueService.getQueueState(),
        ]);

        if (cancelled) return;

        // Initialize download status cache
        await DownloadStatusCache.initialize(
          downloads.map(d => ({ 
            episodeId: d.episodeId, 
            filePath: d.filePath 
          })),
          queueState.items
        );

        if (__DEV__) {
          const duration = Date.now() - startTime;
          const stats = DownloadStatusCache.getStats();
          console.log('[CacheInit] ✅ Caches initialized successfully in', duration, 'ms');
          console.log('[CacheInit] Stats:', stats);
        }
      } catch (error) {
        console.error('[CacheInit] ❌ Cache initialization error:', error);
      }
    }

    initializeCaches();

    return () => {
      cancelled = true;
    };
  }, [user]);
}

/**
 * Clear all caches (useful on logout)
 */
export function clearAllCaches() {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    DownloadStatusCache.clear();
    
    if (__DEV__) {
      console.log('[CacheInit] 🧹 All caches cleared');
    }
  } catch (error) {
    console.error('[CacheInit] Error clearing caches:', error);
  }
}

