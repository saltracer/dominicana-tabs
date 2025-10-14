/**
 * Cache Manager
 * Unified interface for book and cover art caching
 */

import { BookCacheService } from './BookCacheService';
import { CoverArtCacheService } from './CoverArtCacheService';
import { CacheStats } from '../types/cache-types';
import { formatBytes } from './cache/CacheUtils';

class CacheManagerClass {
  /**
   * Initialize all caches
   */
  async initialize(): Promise<void> {
    await Promise.all([
      BookCacheService.initialize(),
      CoverArtCacheService.initialize(),
    ]);
    console.log('Cache system initialized');
  }

  /**
   * Get total cache size across all caches
   */
  async getTotalCacheSize(): Promise<{
    covers: number;
    epubs: number;
    total: number;
  }> {
    const [coverSize, epubSize] = await Promise.all([
      CoverArtCacheService.getCoverCacheSize(),
      BookCacheService.getEpubCacheSize(),
    ]);

    return {
      covers: coverSize,
      epubs: epubSize,
      total: coverSize + epubSize,
    };
  }

  /**
   * Get comprehensive cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    const [coverStats, epubStats] = await Promise.all([
      CoverArtCacheService.getStats(),
      BookCacheService.getStats(),
    ]);

    return {
      covers: {
        totalSize: coverStats.totalSize,
        count: coverStats.count,
        limit: coverStats.limit,
      },
      epubs: {
        totalSize: epubStats.totalSize,
        count: epubStats.count,
      },
      total: {
        size: coverStats.totalSize + epubStats.totalSize,
        count: coverStats.count + epubStats.count,
      },
    };
  }

  /**
   * Get formatted cache statistics for display
   */
  async getFormattedStats(): Promise<{
    coverArt: string;
    coverCount: number;
    downloadedBooks: string;
    bookCount: number;
    total: string;
  }> {
    const stats = await this.getCacheStats();

    return {
      coverArt: formatBytes(stats.covers.totalSize),
      coverCount: stats.covers.count,
      downloadedBooks: formatBytes(stats.epubs.totalSize),
      bookCount: stats.epubs.count,
      total: formatBytes(stats.total.size),
    };
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    await Promise.all([
      CoverArtCacheService.clearAllCovers(),
      BookCacheService.clearAllEpubs(),
    ]);
    console.log('All caches cleared');
  }

  /**
   * Clear only cover art cache
   */
  async clearCoverArtCache(): Promise<void> {
    await CoverArtCacheService.clearAllCovers();
    console.log('Cover art cache cleared');
  }

  /**
   * Clear only EPUB cache
   */
  async clearEpubCache(): Promise<void> {
    await BookCacheService.clearAllEpubs();
    console.log('EPUB cache cleared');
  }
}

export const CacheManager = new CacheManagerClass();

