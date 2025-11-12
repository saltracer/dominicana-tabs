/**
 * Podcast Download Service
 * Downloads and caches podcast episodes for offline listening
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PodcastEpisode } from '../types/podcast-types';
import {
  ensureAudioDownloaded,
  getFileSize,
  deleteFile,
  bumpAudioBytes,
  fileExists,
} from '../lib/podcast/storage';
import { getEpisodesMap } from '../lib/podcast/cache';
import { setJson, keys, hashString } from '../lib/podcast/storage';
import { DownloadStatusCache } from './DownloadStatusCache';
import { EpisodeMetadataCache } from './EpisodeMetadataCache';

export interface DownloadProgress {
  episodeId: string;
  fileName: string;
  totalBytes: number;
  downloadedBytes: number;
  progress: number; // 0-100
}

export interface DownloadedEpisode {
  episodeId: string;
  podcastId?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  downloadedAt: string;
  audioUrl: string; // Original URL for reference
  guid?: string; // Episode GUID for stable matching across restarts
  title?: string; // Episode title for display
}

export class PodcastDownloadService {
  private static readonly METADATA_KEY = 'podcast_downloads_metadata';
  
  // Cache for getDownloadedEpisodes to prevent multiple filesystem scans
  private static downloadedEpisodesCache: {
    data: DownloadedEpisode[];
    timestamp: number;
  } | null = null;
  private static readonly CACHE_TTL = 2000; // 2 seconds
  
  // Storage initialization handled by podcast storage helpers

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

    try {
      const result = await ensureAudioDownloaded(
        episode.podcastId,
        episode.id,
        episode.audioUrl,
        'mp3',
        p => {
          if (onProgress) {
            onProgress({
              episodeId: episode.id,
              fileName: `${episode.id}.mp3`,
              totalBytes: p.totalBytesExpectedToWrite,
              downloadedBytes: p.totalBytesWritten,
              progress: p.totalBytesExpectedToWrite > 0 ? Math.round((p.totalBytesWritten / p.totalBytesExpectedToWrite) * 100) : 0,
            });
          }
        }
      );

      if (__DEV__) {
        console.log('[PodcastDownloadService] 💾 Saving metadata for completed download:', {
          title: episode.title?.substring(0, 40),
          episodeId: episode.id?.substring(0, 60),
          guid: episode.guid,
          filePath: result.path?.substring(0, 80),
        });
      }
      
      await this.saveDownloadMetadata({
        episodeId: episode.id,
        podcastId: episode.podcastId,
        fileName: `${episode.id}.mp3`,
        filePath: result.path,
        fileSize: result.bytesAdded,
        downloadedAt: new Date().toISOString(),
        audioUrl: episode.audioUrl,
        guid: episode.guid,
        title: episode.title,
      });

      // Invalidate cache since we added a download
      this.downloadedEpisodesCache = null;

      // Update download status cache
      if (__DEV__) {
        console.log('[PodcastDownloadService] 📝 Marking episode as downloaded in cache:', {
          title: episode.title?.substring(0, 40),
          episodeId: episode.id?.substring(0, 60),
        });
      }
      DownloadStatusCache.markDownloaded(episode.id, result.path);

      // Update episode metadata cache
      EpisodeMetadataCache.update(episode.id, {
        isDownloaded: true,
        downloadStatus: 'completed',
        downloadProgress: 100,
      });

      // Persist localAudioPath into cache episodes map for accurate per-feed usage
      try {
        const cacheEpisodeId = episode.guid || await hashString(episode.audioUrl);
        const map = await getEpisodesMap(episode.podcastId);
        const existing = map[cacheEpisodeId];
        if (existing) {
          map[cacheEpisodeId] = { ...existing, localAudioPath: result.path } as any;
          await setJson(keys.episodes(episode.podcastId), map);
        }
      } catch {
        // best-effort only
      }

      return result.path;
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

      const exists = await fileExists(download.filePath);
      if (exists) {
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
        const size = await getFileSize(download.filePath);
        await deleteFile(download.filePath);
        if (size > 0) await bumpAudioBytes(-size);
        
        await this.deleteDownloadMetadata(episodeId);
        console.log(`[PodcastDownload] Deleted metadata for episode: ${episodeId}`);

        // Invalidate cache since we deleted a download
        this.downloadedEpisodesCache = null;

        // Update download status cache
        DownloadStatusCache.markDeleted(episodeId);

        // Update episode metadata cache
        EpisodeMetadataCache.update(episodeId, {
          isDownloaded: false,
          downloadStatus: null,
          downloadProgress: 0,
        });

        // Also clear localAudioPath in cache map if present
        if (download.podcastId) {
          try {
            const map = await getEpisodesMap(download.podcastId);
            // We don't know cache id (guid/hash) here; try clearing any entry pointing at this path
            let changed = false;
            for (const [id, ep] of Object.entries(map)) {
              if ((ep as any).localAudioPath === download.filePath) {
                (ep as any).localAudioPath = undefined;
                map[id] = ep as any;
                changed = true;
              }
            }
            if (changed) await setJson(keys.episodes(download.podcastId), map);
          } catch {
            // best-effort only
          }
        }
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

    // Check cache first to avoid redundant filesystem scans
    const now = Date.now();
    if (this.downloadedEpisodesCache && (now - this.downloadedEpisodesCache.timestamp) < this.CACHE_TTL) {
      if (__DEV__) console.log('[PodcastDownload] getDownloadedEpisodes: returning cached result (', this.downloadedEpisodesCache.data.length, 'items)');
      return this.downloadedEpisodesCache.data;
    }

    try {
      // CRITICAL: Migrate paths BEFORE validating files
      // This ensures we check the correct paths after app container changes
      const { DownloadPathMigration } = require('./DownloadPathMigration');
      await DownloadPathMigration.migratePathsIfNeeded();

      let metadata = await this.getDownloadMetadata();
      console.log('[PodcastDownload] getDownloadedEpisodes: found', metadata.length, 'metadata entries');
      
      if (metadata.length === 0) {
        console.warn('[PodcastDownload] ⚠️ WARNING: No metadata found in AsyncStorage!');
        console.warn('[PodcastDownload] 🔑 Metadata key:', this.METADATA_KEY);
        
        // AUTOMATIC RECOVERY: Check if files exist on disk and rebuild metadata
        const { DownloadMetadataRecovery } = require('./DownloadMetadataRecovery');
        try {
          const needsRecovery = await DownloadMetadataRecovery.isRecoveryNeeded();
          if (needsRecovery) {
            console.warn('[PodcastDownload] 🔧 RECOVERING: Rebuilding metadata from disk files...');
            const recovered = await DownloadMetadataRecovery.rebuildMetadataFromDisk();
            console.log('[PodcastDownload] ✅ AUTO-RECOVERY: Rebuilt metadata for', recovered, 'episodes');
            
            // Re-fetch metadata after recovery
            if (recovered > 0) {
              metadata = await this.getDownloadMetadata();
              console.log('[PodcastDownload] ✅ After recovery: found', metadata.length, 'metadata entries');
            }
          }
        } catch (recoveryError) {
          console.error('[PodcastDownload] ❌ Auto-recovery failed:', recoveryError);
        }
      }
      
      // Verify files still exist and clean up metadata if not
      const validDownloads: DownloadedEpisode[] = [];
      for (const download of metadata) {
        try {
          const exists = await fileExists(download.filePath);
          if (exists) {
            validDownloads.push(download);
            if (__DEV__) console.log('[PodcastDownload] verified download:', download.episodeId, download.filePath);
          } else {
            if (__DEV__) console.warn('[PodcastDownload] file missing, removing metadata:', download.episodeId, download.filePath);
            await this.deleteDownloadMetadata(download.episodeId);
          }
        } catch (e) {
          if (__DEV__) console.warn('[PodcastDownload] error checking file', download.episodeId, e);
          // Don't delete on check error; file might still exist
          validDownloads.push(download);
        }
      }
      
      if (__DEV__) console.log('[PodcastDownload] getDownloadedEpisodes: returning', validDownloads.length, 'valid downloads');
      
      // Cache the result
      this.downloadedEpisodesCache = {
        data: validDownloads,
        timestamp: now,
      };
      
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
      
      if (__DEV__) {
        console.log('[PodcastDownload] ✅ Saved metadata:', download.title?.substring(0, 50), '(total:', metadata.length, 'entries)');
      }
      
      // Invalidate cache length tracker to log next read
      (this as any)._lastMetadataLength = undefined;
    } catch (error) {
      console.error('[PodcastDownload] ❌ Error saving download metadata:', error);
      throw error;
    }
  }

  /**
   * Get download metadata from AsyncStorage
   */
  private static async getDownloadMetadata(): Promise<DownloadedEpisode[]> {
    try {
      const data = await AsyncStorage.getItem(this.METADATA_KEY);
      const parsed = data ? JSON.parse(data) : [];
      
      // Only log on first read or when metadata changes
      if (__DEV__) {
        const dataLength = data?.length || 0;
        const prevLength = (this as any)._lastMetadataLength;
        
        if (prevLength === undefined || dataLength !== prevLength) {
          console.log('[PodcastDownload] 📦 Metadata:', parsed.length, 'entries,', dataLength, 'chars');
          if (parsed.length > 0) {
            console.log('[PodcastDownload] 📋 Sample:', parsed[0].title?.substring(0, 50));
          } else if (dataLength === 2) {
            console.warn('[PodcastDownload] ⚠️ Metadata is empty array');
          }
          (this as any)._lastMetadataLength = dataLength;
        }
      }
      
      return parsed;
    } catch (error) {
      console.error('[PodcastDownload] ❌ Error getting download metadata:', error);
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

  /**
   * Get download metadata (exposed for queue service)
   */
  static async getMetadata(): Promise<DownloadedEpisode[]> {
    return this.getDownloadMetadata();
  }

  /**
   * Check if an episode is currently being downloaded or queued
   * (This is a placeholder for queue integration - actual logic in queue service)
   */
  static async getDownloadStatus(episodeId: string): Promise<{
    isDownloaded: boolean;
    isDownloading: boolean;
    progress?: number;
  }> {
    const isDownloaded = await this.isEpisodeDownloaded(episodeId);
    return {
      isDownloaded,
      isDownloading: false, // Will be updated by queue service
      progress: isDownloaded ? 100 : 0,
    };
  }
}
