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
import { DownloadMetadataRecovery } from '../services/DownloadMetadataRecovery';
import { DownloadPathMigration } from '../services/DownloadPathMigration';

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

        // STEP 1: Migrate file paths if app container changed (happens on simulator rebuilds)
        const migrated = await DownloadPathMigration.migratePathsIfNeeded();
        if (migrated > 0) {
          console.log('[CacheInit] ✅ Migrated', migrated, 'file paths to current app container');
        }

        // STEP 2: Check if metadata recovery is needed (after migration)
        const needsRecovery = await DownloadMetadataRecovery.isRecoveryNeeded();
        if (needsRecovery) {
          console.warn('[CacheInit] 🔧 Metadata recovery needed - rebuilding from disk...');
          const recovered = await DownloadMetadataRecovery.rebuildMetadataFromDisk();
          console.log('[CacheInit] ✅ Recovered', recovered, 'episodes from disk');
        }

        // Fetch download metadata and queue state in parallel
        const [downloads, queueState] = await Promise.all([
          PodcastDownloadService.getDownloadedEpisodes(),
          PodcastDownloadQueueService.getQueueState(),
        ]);

        if (cancelled) return;

        console.log('[CacheInit] 📊 Fetched data:', {
          downloads: downloads.length,
          queueItems: queueState.items.length,
        });
        if (downloads.length > 0) {
          console.log('[CacheInit] 📊 Sample download:', {
            episodeId: downloads[0].episodeId,
            filePath: downloads[0].filePath,
            title: downloads[0].title?.substring(0, 50),
          });
        } else {
          console.warn('[CacheInit] ⚠️ No downloads found after recovery attempt');
        }

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
          console.log('[CacheInit] 📊 Final stats:', stats);
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
 * @deprecated Use clearAllCaches from CacheService instead
 */
export { clearAllCaches } from '../services/CacheService';

