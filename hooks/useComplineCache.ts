import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { OfflineManager } from '../services/OfflineManager';

export interface CacheInfo {
  size: number;
  maxSize: number;
  audioFiles: number;
  complineEntries: number;
}

export interface UseComplineCacheReturn {
  cacheInfo: CacheInfo | null;
  refreshCacheInfo: () => Promise<void>;
  clearCache: () => Promise<void>;
}

/**
 * Hook to manage Compline cache information and operations
 * Handles cache info loading and cache management operations
 */
export function useComplineCache(
  offlineManager: OfflineManager | null
): UseComplineCacheReturn {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);

  const refreshCacheInfo = useCallback(async () => {
    if (!offlineManager || Platform.OS === 'web') {
      return;
    }

    try {
      const info = await offlineManager.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.warn('Failed to load cache info:', error);
    }
  }, [offlineManager]);

  const clearCache = useCallback(async () => {
    if (!offlineManager) {
      return;
    }

    try {
      await offlineManager.clearCache();
      await refreshCacheInfo();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, [offlineManager, refreshCacheInfo]);

  // Load cache info on mount if available
  useEffect(() => {
    if (offlineManager && Platform.OS !== 'web') {
      refreshCacheInfo();
    }
  }, [offlineManager, refreshCacheInfo]);

  return {
    cacheInfo,
    refreshCacheInfo,
    clearCache
  };
}
