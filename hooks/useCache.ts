/**
 * useCache Hook
 * React hook for cache operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Book } from '../types';
import { CacheStats } from '../types/cache-types';
import { BookCacheService } from '../services/BookCacheService';
import { CoverArtCacheService } from '../services/CoverArtCacheService';
import { CacheManager } from '../services/CacheManager';

export function useBookCache(bookId: string) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check download status on mount
  useEffect(() => {
    checkDownloadStatus();
  }, [bookId]);

  const checkDownloadStatus = useCallback(async () => {
    const cached = await BookCacheService.isEpubCached(bookId);
    setIsDownloaded(cached);
  }, [bookId]);

  const downloadBook = useCallback(async (book: Book) => {
    try {
      setIsDownloading(true);
      setError(null);
      setDownloadProgress(0);

      await BookCacheService.downloadEpub(book, (progress) => {
        setDownloadProgress(progress);
      });

      setIsDownloaded(true);
      setDownloadProgress(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
      throw err;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const removeDownload = useCallback(async () => {
    try {
      await BookCacheService.removeEpub(bookId);
      setIsDownloaded(false);
      setDownloadProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove failed');
      throw err;
    }
  }, [bookId]);

  const getCachedPath = useCallback(async () => {
    return await BookCacheService.getCachedEpubPath(bookId);
  }, [bookId]);

  return {
    isDownloaded,
    isDownloading,
    downloadProgress,
    error,
    downloadBook,
    removeDownload,
    getCachedPath,
    refresh: checkDownloadStatus,
  };
}

export function useCacheStats() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const cacheStats = await CacheManager.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, []);

  const clearCoverArt = useCallback(async () => {
    await CacheManager.clearCoverArtCache();
    await loadStats();
  }, [loadStats]);

  const clearEpubs = useCallback(async () => {
    await CacheManager.clearEpubCache();
    await loadStats();
  }, [loadStats]);

  const clearAll = useCallback(async () => {
    await CacheManager.clearAllCaches();
    await loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    refresh: loadStats,
    clearCoverArt,
    clearEpubs,
    clearAll,
  };
}

