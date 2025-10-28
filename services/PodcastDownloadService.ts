/**
 * Podcast Download Service
 * Downloads and caches podcast episodes for offline listening
 */

import { Platform } from 'react-native';
import { File, Directory, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PodcastEpisode } from '../types/podcast-types';

export interface DownloadProgress {
  episodeId: string;
  fileName: string;
  totalBytes: number;
  downloadedBytes: number;
  progress: number; // 0-100
}

export interface DownloadedEpisode {
  episodeId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  downloadedAt: string;
  audioUrl: string; // Original URL for reference
}

export class PodcastDownloadService {
  private static readonly CACHE_DIR_NAME = 'podcast-episodes';
  private static readonly METADATA_KEY = 'podcast_downloads_metadata';
  
  /**
   * Get the cache directory path
   */
  private static getCacheDir(): string {
    return `${Paths.cache.uri}${this.CACHE_DIR_NAME}`;
  }
  
  /**
   * Initialize the cache directory
   */
  static async initialize(): Promise<void> {
    try {
      const cacheDir = this.getCacheDir();
      console.log('[PodcastDownload] Initializing cache directory at:', cacheDir);
      
      const directory = new Directory(cacheDir);
      if (!directory.exists) {
        await directory.create({ intermediates: true });
        console.log('[PodcastDownload] Created cache directory successfully');
      } else {
        console.log('[PodcastDownload] Cache directory already exists');
      }
    } catch (error) {
      console.error('[PodcastDownload] Error initializing cache directory:', error);
      throw error;
    }
  }

  /**
   * Download an episode to local cache
   */
  static async downloadEpisode(
    episode: PodcastEpisode, 
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    if (Platform.OS === 'web') {
      throw new Error('Podcast downloads are not available on web');
    }

    await this.initialize();

    try {
      const fileName = `${episode.id}.mp3`; // Assume MP3, could be determined from URL
      const filePath = `${this.getCacheDir()}/${fileName}`;
      
      console.log(`[PodcastDownload] Starting download for episode: ${episode.title}`);
      console.log(`[PodcastDownload] URL: ${episode.audioUrl}`);
      console.log(`[PodcastDownload] Local path: ${filePath}`);

      // Check if already downloaded
      const existingFile = new File(filePath);
      if (existingFile.exists) {
        console.log('[PodcastDownload] Episode already downloaded');
        return filePath;
      }

      // Download the file
      const response = await fetch(episode.audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to download episode: ${response.statusText}`);
      }

      const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Notify progress (100% since we have the full buffer)
      if (onProgress) {
        onProgress({
          episodeId: episode.id,
          fileName,
          totalBytes: contentLength || arrayBuffer.byteLength,
          downloadedBytes: arrayBuffer.byteLength,
          progress: 100,
        });
      }

      // Write to cache
      await existingFile.create();
      await existingFile.write(uint8Array);

      // Save metadata
      await this.saveDownloadMetadata({
        episodeId: episode.id,
        fileName,
        filePath,
        fileSize: arrayBuffer.byteLength,
        downloadedAt: new Date().toISOString(),
        audioUrl: episode.audioUrl,
      });

      console.log(`[PodcastDownload] Successfully downloaded: ${fileName}`);
      console.log(`[PodcastDownload] Size: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
      
      return filePath;
    } catch (error) {
      console.error(`[PodcastDownload] Error downloading episode ${episode.id}:`, error);
      throw error;
    }
  }

  /**
   * Get the local file path for a downloaded episode
   */
  static async getDownloadedEpisodePath(episodeId: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const metadata = await this.getDownloadMetadata();
      const download = metadata.find(d => d.episodeId === episodeId);
      
      if (!download) {
        return null;
      }

      const file = new File(download.filePath);
      if (file.exists) {
        return download.filePath;
      } else {
        // File was deleted but metadata remains, clean it up
        await this.deleteDownloadMetadata(episodeId);
        return null;
      }
    } catch (error) {
      console.error(`[PodcastDownload] Error getting episode path for ${episodeId}:`, error);
      return null;
    }
  }

  /**
   * Delete a downloaded episode
   */
  static async deleteDownloadedEpisode(episodeId: string): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const metadata = await this.getDownloadMetadata();
      const download = metadata.find(d => d.episodeId === episodeId);
      
      if (download) {
        const file = new File(download.filePath);
        if (file.exists) {
          await file.delete();
          console.log(`[PodcastDownload] Deleted file: ${download.filePath}`);
        }
        
        await this.deleteDownloadMetadata(episodeId);
        console.log(`[PodcastDownload] Deleted metadata for episode: ${episodeId}`);
      }
    } catch (error) {
      console.error(`[PodcastDownload] Error deleting episode ${episodeId}:`, error);
      throw error;
    }
  }

  /**
   * Get all downloaded episodes
   */
  static async getDownloadedEpisodes(): Promise<DownloadedEpisode[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      const metadata = await this.getDownloadMetadata();
      
      // Verify files still exist and clean up metadata if not
      const validDownloads: DownloadedEpisode[] = [];
      for (const download of metadata) {
        const file = new File(download.filePath);
        if (file.exists) {
          validDownloads.push(download);
        } else {
          await this.deleteDownloadMetadata(download.episodeId);
        }
      }
      
      return validDownloads;
    } catch (error) {
      console.error('[PodcastDownload] Error getting downloaded episodes:', error);
      return [];
    }
  }

  /**
   * Clean up old downloads to stay within limit
   */
  static async cleanupOldDownloads(maxDownloads: number): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const downloads = await this.getDownloadedEpisodes();
      
      if (downloads.length <= maxDownloads) {
        return;
      }

      // Sort by download date (oldest first)
      const sortedDownloads = downloads.sort((a, b) => 
        new Date(a.downloadedAt).getTime() - new Date(b.downloadedAt).getTime()
      );

      // Delete oldest downloads until we're under the limit
      const toDelete = sortedDownloads.slice(0, downloads.length - maxDownloads);
      
      for (const download of toDelete) {
        await this.deleteDownloadedEpisode(download.episodeId);
        console.log(`[PodcastDownload] Cleaned up old download: ${download.fileName}`);
      }
    } catch (error) {
      console.error('[PodcastDownload] Error cleaning up old downloads:', error);
      throw error;
    }
  }

  /**
   * Check if an episode is downloaded
   */
  static async isEpisodeDownloaded(episodeId: string): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const path = await this.getDownloadedEpisodePath(episodeId);
    return path !== null;
  }

  /**
   * Get total storage used by downloads
   */
  static async getTotalStorageUsed(): Promise<number> {
    if (Platform.OS === 'web') {
      return 0;
    }

    try {
      const downloads = await this.getDownloadedEpisodes();
      return downloads.reduce((total, download) => total + download.fileSize, 0);
    } catch (error) {
      console.error('[PodcastDownload] Error calculating storage used:', error);
      return 0;
    }
  }

  /**
   * Save download metadata to AsyncStorage
   */
  private static async saveDownloadMetadata(download: DownloadedEpisode): Promise<void> {
    try {
      const metadata = await this.getDownloadMetadata();
      const existingIndex = metadata.findIndex(d => d.episodeId === download.episodeId);
      
      if (existingIndex >= 0) {
        metadata[existingIndex] = download;
      } else {
        metadata.push(download);
      }
      
      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('[PodcastDownload] Error saving download metadata:', error);
      throw error;
    }
  }

  /**
   * Get download metadata from AsyncStorage
   */
  private static async getDownloadMetadata(): Promise<DownloadedEpisode[]> {
    try {
      const data = await AsyncStorage.getItem(this.METADATA_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[PodcastDownload] Error getting download metadata:', error);
      return [];
    }
  }

  /**
   * Delete download metadata from AsyncStorage
   */
  private static async deleteDownloadMetadata(episodeId: string): Promise<void> {
    try {
      const metadata = await this.getDownloadMetadata();
      const filteredMetadata = metadata.filter(d => d.episodeId !== episodeId);
      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(filteredMetadata));
    } catch (error) {
      console.error('[PodcastDownload] Error deleting download metadata:', error);
      throw error;
    }
  }
}
