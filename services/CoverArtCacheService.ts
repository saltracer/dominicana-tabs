/**
 * Cover Art Cache Service
 * Manages cover image caching with 15MB limit and LRU cleanup
 */

import { File, Directory, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CoverCacheMetadata, CoverCacheEntry } from '../types/cache-types';
import { CACHE_CONFIG } from './cache/CacheConstants';
import { getFileExtension } from './cache/CacheUtils';

class CoverArtCacheServiceClass {
  private metadataKey = CACHE_CONFIG.COVER_CACHE_METADATA_KEY;
  private maxSize = CACHE_CONFIG.COVER_ART_MAX_SIZE;
  private ttl = CACHE_CONFIG.COVER_ART_TTL;

  /**
   * Get cover cache directory
   */
  private getCoverDir(): string {
    return `${Paths.cache.uri}${CACHE_CONFIG.COVER_DIR}`;
  }

  /**
   * Initialize cache directory
   */
  async initialize(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      const directory = new Directory(this.getCoverDir());
      if (!directory.exists) {
        await directory.create({ intermediates: true });
        console.log('Created cover art cache directory');
      }
    } catch (error) {
      console.error('Error initializing cover cache directory:', error);
      throw error;
    }
  }

  /**
   * Cache cover art image
   */
  async cacheCoverArt(
    bookId: string,
    imageUrl: string
  ): Promise<string | null> {
    if (Platform.OS === 'web') return imageUrl; // Return original URL on web

    try {
      await this.initialize();

      // Check if already cached and valid
      const cachedPath = await this.getCachedCover(bookId);
      if (cachedPath) {
        // Check if needs update
        const needsUpdate = await this.checkForCoverUpdates(bookId, imageUrl);
        if (!needsUpdate) {
          // Update access time
          await this.updateAccessTime(bookId);
          return cachedPath;
        }
      }

      // Download and cache new image
      return await this.downloadAndCacheCover(bookId, imageUrl);
    } catch (error) {
      console.error('Error caching cover art:', error);
      return imageUrl; // Fallback to remote URL
    }
  }

  /**
   * Download and cache cover image
   */
  private async downloadAndCacheCover(
    bookId: string,
    imageUrl: string
  ): Promise<string | null> {
    try {
      // Get ETag if available
      let etag: string | undefined;
      if (CACHE_CONFIG.ENABLE_ETAG_CHECKING) {
        try {
          const headResponse = await fetch(imageUrl, { method: 'HEAD' });
          etag = headResponse.headers.get('etag') || undefined;
        } catch {
          // ETag check failed, continue without it
        }
      }

      // Download image
      const extension = getFileExtension(imageUrl);
      const filename = `${bookId}_cover.${extension}`;
      const localPath = `${this.getCoverDir()}/${filename}`;

      // Download the image using fetch
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get file content as array buffer
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Write to cache using File API
      const file = new File(localPath);
      
      // Delete file if it already exists
      if (file.exists) {
        await file.delete();
      }
      
      await file.create();
      await file.write(uint8Array);

      // Get file size
      const size = file.exists ? file.size : arrayBuffer.byteLength;

      // Check if we need to free up space
      const metadata = await this.getMetadata();
      const currentSize = this.calculateTotalSize(metadata);
      
      if (currentSize + size > this.maxSize) {
        await this.cleanupLRU(size);
      }

      // Save metadata
      metadata[bookId] = {
        filename,
        size,
        url: imageUrl,
        etag,
        lastAccessed: Date.now(),
        lastUpdated: Date.now(),
        cachedAt: Date.now(),
      };
      await this.saveMetadata(metadata);

      console.log('Cover art cached:', bookId, size, 'bytes');
      return localPath;
    } catch (error) {
      console.error('Error downloading cover:', error);
      return null;
    }
  }

  /**
   * Get cached cover path
   */
  async getCachedCover(bookId: string): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    try {
      const metadata = await this.getMetadata();
      const entry = metadata[bookId];

      if (!entry) return null;

      const filePath = `${this.getCoverDir()}/${entry.filename}`;
      const file = new File(filePath);

      if (!file.exists) {
        // File missing, clean up metadata
        delete metadata[bookId];
        await this.saveMetadata(metadata);
        return null;
      }

      return filePath;
    } catch (error) {
      console.error('Error getting cached cover:', error);
      return null;
    }
  }

  /**
   * Check if cover is cached
   */
  async isCoverCached(bookId: string): Promise<boolean> {
    const path = await this.getCachedCover(bookId);
    return path !== null;
  }

  /**
   * Check if cover needs updating
   */
  async checkForCoverUpdates(bookId: string, imageUrl: string): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const metadata = await this.getMetadata();
      const entry = metadata[bookId];

      if (!entry) return true; // Not cached, needs download

      // Check time-based TTL
      const age = Date.now() - entry.cachedAt;
      if (age < this.ttl) {
        return false; // Still fresh
      }

      // TTL expired, check ETag if available
      if (CACHE_CONFIG.ENABLE_ETAG_CHECKING && entry.etag) {
        try {
          const response = await fetch(imageUrl, { method: 'HEAD' });
          const newETag = response.headers.get('etag');
          
          if (newETag && newETag !== entry.etag) {
            console.log('Cover art ETag changed:', bookId);
            return true; // ETag changed, needs update
          }
          
          // ETag same, update cached timestamp
          entry.lastUpdated = Date.now();
          metadata[bookId] = entry;
          await this.saveMetadata(metadata);
          return false;
        } catch {
          // ETag check failed, assume needs update
          return true;
        }
      }

      // No ETag or TTL expired
      return true;
    } catch (error) {
      console.error('Error checking cover updates:', error);
      return false; // On error, use cached version
    }
  }

  /**
   * Update access time for LRU
   */
  private async updateAccessTime(bookId: string): Promise<void> {
    try {
      const metadata = await this.getMetadata();
      if (metadata[bookId]) {
        metadata[bookId].lastAccessed = Date.now();
        await this.saveMetadata(metadata);
      }
    } catch (error) {
      console.error('Error updating access time:', error);
    }
  }

  /**
   * Cleanup LRU to free space
   */
  private async cleanupLRU(bytesNeeded: number): Promise<void> {
    try {
      const metadata = await this.getMetadata();
      const entries = Object.entries(metadata);

      // Sort by last accessed (oldest first)
      entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

      let freed = 0;
      for (const [bookId, entry] of entries) {
        if (freed >= bytesNeeded) break;

        // Remove this cover
        const filePath = `${this.getCoverDir()}/${entry.filename}`;
        const file = new File(filePath);
        if (file.exists) {
          await file.delete();
        }

        freed += entry.size;
        delete metadata[bookId];

        console.log('LRU cleanup removed cover:', bookId, entry.size, 'bytes');
      }

      await this.saveMetadata(metadata);
      console.log(`LRU cleanup freed ${freed} bytes`);
    } catch (error) {
      console.error('Error during LRU cleanup:', error);
    }
  }

  /**
   * Get total cache size
   */
  async getCoverCacheSize(): Promise<number> {
    if (Platform.OS === 'web') return 0;

    const metadata = await this.getMetadata();
    return this.calculateTotalSize(metadata);
  }

  /**
   * Get cover count
   */
  async getCoverCount(): Promise<number> {
    if (Platform.OS === 'web') return 0;

    const metadata = await this.getMetadata();
    return Object.keys(metadata).length;
  }

  /**
   * Clear all cached covers
   */
  async clearAllCovers(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const metadata = await this.getMetadata();
      const bookIds = Object.keys(metadata);

      // Delete all files
      await Promise.all(
        bookIds.map(async (bookId) => {
          const entry = metadata[bookId];
          const filePath = `${this.getCoverDir()}/${entry.filename}`;
          const file = new File(filePath);
          if (file.exists) {
            await file.delete();
          }
        })
      );

      // Clear metadata
      await this.saveMetadata({});

      console.log(`Cleared ${bookIds.length} covers from cache`);
    } catch (error) {
      console.error('Error clearing cover cache:', error);
      throw error;
    }
  }

  /**
   * Refresh specific cover
   */
  async refreshCover(bookId: string, imageUrl: string): Promise<string | null> {
    if (Platform.OS === 'web') return imageUrl;

    try {
      // Remove existing
      const metadata = await this.getMetadata();
      if (metadata[bookId]) {
        const filePath = `${this.getCoverDir()}/${metadata[bookId].filename}`;
        const file = new File(filePath);
        if (file.exists) {
          await file.delete();
        }
        delete metadata[bookId];
        await this.saveMetadata(metadata);
      }

      // Download fresh copy
      return await this.downloadAndCacheCover(bookId, imageUrl);
    } catch (error) {
      console.error('Error refreshing cover:', error);
      return null;
    }
  }

  /**
   * Calculate total size from metadata
   */
  private calculateTotalSize(metadata: CoverCacheMetadata): number {
    return Object.values(metadata).reduce((total, entry) => total + entry.size, 0);
  }

  /**
   * Get metadata
   */
  private async getMetadata(): Promise<CoverCacheMetadata> {
    try {
      const json = await AsyncStorage.getItem(this.metadataKey);
      return json ? JSON.parse(json) : {};
    } catch (error) {
      console.error('Error reading cover metadata:', error);
      return {};
    }
  }

  /**
   * Save metadata
   */
  private async saveMetadata(metadata: CoverCacheMetadata): Promise<void> {
    try {
      await AsyncStorage.setItem(this.metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving cover metadata:', error);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    const metadata = await this.getMetadata();
    const size = this.calculateTotalSize(metadata);
    const count = Object.keys(metadata).length;

    return {
      totalSize: size,
      count,
      limit: this.maxSize,
      usage: size / this.maxSize,
      entries: Object.entries(metadata).map(([bookId, entry]) => ({
        bookId,
        size: entry.size,
        cachedAt: entry.cachedAt,
        lastAccessed: entry.lastAccessed,
      })),
    };
  }
}

export const CoverArtCacheService = new CoverArtCacheServiceClass();

