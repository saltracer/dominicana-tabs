/**
 * Cache Service
 * Provides centralized cache management functions
 */

import { Platform } from 'react-native';
import { DownloadStatusCache } from './DownloadStatusCache';

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
      console.log('[CacheService] 🧹 All caches cleared');
    }
  } catch (error) {
    console.error('[CacheService] Error clearing caches:', error);
  }
}

