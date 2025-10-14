/**
 * Book Cache Service
 * Manages EPUB file caching and downloads
 */

import { File, Directory, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Book } from '../types';
import { EpubCacheMetadata, EpubCacheEntry } from '../types/cache-types';
import { CACHE_CONFIG } from './cache/CacheConstants';
import { extractStoragePath } from './cache/CacheUtils';

class BookCacheServiceClass {
  private metadataKey = CACHE_CONFIG.EPUB_CACHE_METADATA_KEY;

  /**
   * Get EPUB cache directory
   */
  private getEpubDir(): string {
    return `${Paths.cache.uri}${CACHE_CONFIG.EPUB_DIR}`;
  }

  /**
   * Initialize cache directory
   */
  async initialize(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      const directory = new Directory(this.getEpubDir());
      if (!directory.exists) {
        await directory.create({ intermediates: true });
        console.log('Created EPUB cache directory');
      }
    } catch (error) {
      console.error('Error initializing EPUB cache directory:', error);
      throw error;
    }
  }

  /**
   * Download and cache an EPUB file
   */
  async downloadEpub(
    book: Book,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    if (Platform.OS === 'web') {
      throw new Error('EPUB caching is not available on web');
    }

    if (!book.epubPath) {
      throw new Error('No EPUB file available for this book');
    }

    try {
      await this.initialize();

      // Convert book ID to string for consistency
      const bookIdStr = String(book.id);

      // Check if already cached
      const existingPath = await this.getCachedEpubPath(bookIdStr);
      if (existingPath) {
        console.log('EPUB already cached:', existingPath);
        return existingPath;
      }

      // Extract storage path and generate signed URL
      const storagePath = extractStoragePath(book.epubPath);
      const { data: signedUrlData, error: signedUrlError} = await supabase.storage
        .from('epub_files')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (signedUrlError || !signedUrlData?.signedUrl) {
        throw new Error('Failed to generate download URL');
      }

      // Download file with progress
      const filename = `${bookIdStr}.epub`;
      const localPath = `${this.getEpubDir()}/${filename}`;

      // Download the file using fetch
      const response = await fetch(signedUrlData.signedUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get content length for progress tracking
      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);

      // Get file content as array buffer
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Notify progress (100% since we have the full buffer)
      onProgress?.(1);

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

      // Save metadata
      const metadata = await this.getMetadata();
      metadata[bookIdStr] = {
        filename,
        size,
        downloadedAt: Date.now(),
        bookTitle: book.title,
        localPath,
      };
      await this.saveMetadata(metadata);

      console.log('EPUB downloaded and cached:', localPath);
      return localPath;
    } catch (error) {
      console.error('Error downloading EPUB:', error);
      throw error;
    }
  }

  /**
   * Remove cached EPUB
   */
  async removeEpub(bookId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const metadata = await this.getMetadata();
      const entry = metadata[bookId];

      if (entry) {
        // Delete file
        const filePath = entry.localPath || `${this.getEpubDir()}/${entry.filename}`;
        const file = new File(filePath);
        if (file.exists) {
          await file.delete();
        }

        // Remove from metadata
        delete metadata[bookId];
        await this.saveMetadata(metadata);

        console.log('EPUB removed:', bookId);
      }
    } catch (error) {
      console.error('Error removing EPUB:', error);
      throw error;
    }
  }

  /**
   * Check if EPUB is cached
   */
  async isEpubCached(bookId: string): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    try {
      const metadata = await this.getMetadata();
      const entry = metadata[bookId];

      if (!entry) return false;

      // Verify file still exists
      const filePath = entry.localPath || `${this.getEpubDir()}/${entry.filename}`;
      const file = new File(filePath);

      if (!file.exists) {
        // File missing, clean up metadata
        delete metadata[bookId];
        await this.saveMetadata(metadata);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking EPUB cache:', error);
      return false;
    }
  }

  /**
   * Get cached EPUB path
   */
  async getCachedEpubPath(bookId: string): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    const isCached = await this.isEpubCached(bookId);
    if (!isCached) return null;

    const metadata = await this.getMetadata();
    const entry = metadata[bookId];
    return entry?.localPath || null;
  }

  /**
   * Get total EPUB cache size
   */
  async getEpubCacheSize(): Promise<number> {
    if (Platform.OS === 'web') return 0;

    try {
      const metadata = await this.getMetadata();
      return Object.values(metadata).reduce((total, entry) => total + entry.size, 0);
    } catch {
      return 0;
    }
  }

  /**
   * Get count of downloaded books
   */
  async getDownloadedBooksCount(): Promise<number> {
    if (Platform.OS === 'web') return 0;

    const metadata = await this.getMetadata();
    return Object.keys(metadata).length;
  }

  /**
   * Get list of downloaded book IDs
   */
  async getDownloadedBooks(): Promise<string[]> {
    if (Platform.OS === 'web') return [];

    const metadata = await this.getMetadata();
    return Object.keys(metadata);
  }

  /**
   * Clear all cached EPUBs
   */
  async clearAllEpubs(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const metadata = await this.getMetadata();
      const bookIds = Object.keys(metadata);

      // Delete all files
      await Promise.all(
        bookIds.map(async (bookId) => {
          const entry = metadata[bookId];
          const filePath = entry.localPath || `${this.getEpubDir()}/${entry.filename}`;
          const file = new File(filePath);
          if (file.exists) {
            await file.delete();
          }
        })
      );

      // Clear metadata
      await this.saveMetadata({});

      console.log(`Cleared ${bookIds.length} EPUBs from cache`);
    } catch (error) {
      console.error('Error clearing EPUB cache:', error);
      throw error;
    }
  }

  /**
   * Get cache metadata
   */
  private async getMetadata(): Promise<EpubCacheMetadata> {
    try {
      const json = await AsyncStorage.getItem(this.metadataKey);
      return json ? JSON.parse(json) : {};
    } catch (error) {
      console.error('Error reading EPUB metadata:', error);
      return {};
    }
  }

  /**
   * Save cache metadata
   */
  private async saveMetadata(metadata: EpubCacheMetadata): Promise<void> {
    try {
      await AsyncStorage.setItem(this.metadataKey, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving EPUB metadata:', error);
      throw error;
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    const metadata = await this.getMetadata();
    const entries = Object.entries(metadata);

    return {
      totalSize: await this.getEpubCacheSize(),
      count: entries.length,
      books: entries.map(([bookId, entry]) => ({
        bookId,
        title: entry.bookTitle,
        size: entry.size,
        downloadedAt: entry.downloadedAt,
      })),
    };
  }
}

export const BookCacheService = new BookCacheServiceClass();

