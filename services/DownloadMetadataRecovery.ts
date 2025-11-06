/**
 * Download Metadata Recovery Service
 * Rebuilds download metadata by scanning disk when AsyncStorage metadata is lost
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { PODCAST_AUDIO_DIR } from '../lib/podcast/storage';
import { DownloadedEpisode } from './PodcastDownloadService';
import { getEpisodesMap, getFeed } from '../lib/podcast/cache';

export class DownloadMetadataRecovery {
  private static readonly METADATA_KEY = 'podcast_downloads_metadata';

  /**
   * Scan disk and rebuild metadata for orphaned downloads
   * Returns number of episodes recovered
   */
  static async rebuildMetadataFromDisk(): Promise<number> {
    if (Platform.OS === 'web') {
      return 0;
    }

    console.log('[MetadataRecovery] 🔄 Starting metadata recovery from disk...');

    try {
      // Check if audio directory exists
      const dirInfo = await FileSystem.getInfoAsync(PODCAST_AUDIO_DIR);
      if (!dirInfo.exists) {
        console.log('[MetadataRecovery] 📁 No audio directory found');
        return 0;
      }

      // Get all podcast directories
      const podcastDirs = await FileSystem.readDirectoryAsync(PODCAST_AUDIO_DIR);
      console.log('[MetadataRecovery] 📁 Found', podcastDirs.length, 'podcast directories');

      const recovered: DownloadedEpisode[] = [];

      // Scan each podcast directory
      for (const podcastId of podcastDirs) {
        const podcastDir = `${PODCAST_AUDIO_DIR}${podcastId}/`;
        
        try {
          const files = await FileSystem.readDirectoryAsync(podcastDir);
          console.log('[MetadataRecovery] 📁 Podcast', podcastId, 'has', files.length, 'file(s)');

          // Load RSS cache for this podcast to get episode metadata
          const episodesMap = await getEpisodesMap(podcastId);
          console.log('[MetadataRecovery] 📦 Loaded RSS cache for podcast:', podcastId, '(', Object.keys(episodesMap).length, 'episodes)');

          for (const file of files) {
            if (!file.endsWith('.mp3')) continue;

            const episodeId = file.replace('.mp3', '');
            const filePath = `${podcastDir}${file}`;
            
            // Get file info
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            
            if (__DEV__) {
              console.log('[MetadataRecovery] 📝 Processing file:', file);
              console.log('[MetadataRecovery]   - Episode ID:', episodeId);
              console.log('[MetadataRecovery]   - Current path:', filePath);
              console.log('[MetadataRecovery]   - File exists:', fileInfo.exists);
              console.log('[MetadataRecovery]   - File size:', Math.round((fileInfo.size || 0) / 1024 / 1024), 'MB');
            }
            
            if (fileInfo.exists) {
              // Try to find episode in RSS cache
              // Strategy 1: Match by localAudioPath (exact match)
              let episodeData = Object.values(episodesMap).find(ep => 
                (ep as any).localAudioPath === filePath
              );
              
              // Strategy 2: Match by localAudioPath filename (handles app container UUID changes)
              if (!episodeData) {
                const fileName = file; // e.g., "13dcace0-3857-4d55-aeb5-fde45e948ec7.mp3"
                episodeData = Object.values(episodesMap).find(ep => 
                  (ep as any).localAudioPath?.endsWith(`/${podcastId}/${fileName}`)
                );
                if (episodeData && __DEV__) {
                  console.log('[MetadataRecovery] ✅ Matched by filename pattern');
                }
              }
              
              // Strategy 3: Try matching by episodeId as RSS cache key
              if (!episodeData) {
                episodeData = episodesMap[episodeId];
              }
              
              // Strategy 4: Try matching by episodeId in guid field
              if (!episodeData) {
                episodeData = Object.values(episodesMap).find(ep => 
                  ep.guid === episodeId || 
                  (ep.id as string) === episodeId
                );
              }
              
              if (__DEV__) {
                console.log('[MetadataRecovery] 🔍 Matching results for:', episodeId.substring(0, 20));
                console.log('[MetadataRecovery]   - Found in RSS cache:', !!episodeData);
                if (episodeData) {
                  console.log('[MetadataRecovery]   - Episode title:', (episodeData.title || '').substring(0, 60));
                } else {
                  console.log('[MetadataRecovery]   - RSS cache keys sample:', Object.keys(episodesMap).slice(0, 3));
                }
              }

              let title = `Recovered Episode ${episodeId.substring(0, 8)}...`;
              let audioUrl = '';
              let guid = episodeId;
              let description = '';
              let duration: number | undefined;
              let publishedAt: string | undefined;
              let artworkUrl: string | undefined;

              // If found in RSS cache, use that metadata
              if (episodeData) {
                title = episodeData.title || title;
                audioUrl = episodeData.audioUrl || '';
                guid = episodeData.guid || episodeId;
                description = episodeData.description || '';
                duration = episodeData.duration;
                publishedAt = episodeData.publishedAt;
                artworkUrl = episodeData.artworkUrl;
                console.log('[MetadataRecovery] ✅ Enriched from RSS cache:', title.substring(0, 50));
              } else {
                console.warn('[MetadataRecovery] ⚠️ Episode not found in RSS cache, using placeholders');
              }

              const downloadEntry: DownloadedEpisode = {
                episodeId,
                podcastId,
                fileName: file,
                filePath,
                fileSize: fileInfo.size || 0,
                downloadedAt: fileInfo.modificationTime 
                  ? new Date(fileInfo.modificationTime * 1000).toISOString()
                  : new Date().toISOString(),
                audioUrl,
                guid,
                title,
              };

              recovered.push(downloadEntry);
              console.log('[MetadataRecovery] ✅ Recovered:', title.substring(0, 60));
            }
          }
        } catch (podcastError) {
          console.warn('[MetadataRecovery] ⚠️ Error scanning podcast dir:', podcastId, podcastError);
        }
      }

      if (recovered.length > 0) {
        // Save recovered metadata
        await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(recovered));
        console.log('[MetadataRecovery] ✅ Rebuilt metadata for', recovered.length, 'episodes');
        
        // Verify save
        const verification = await AsyncStorage.getItem(this.METADATA_KEY);
        console.log('[MetadataRecovery] ✅ Verification:', verification ? 'saved successfully' : 'SAVE FAILED');
      } else {
        console.log('[MetadataRecovery] ℹ️ No files found to recover');
      }

      return recovered.length;
    } catch (error) {
      console.error('[MetadataRecovery] ❌ Error during recovery:', error);
      return 0;
    }
  }

  /**
   * Check if recovery is needed (metadata empty but files exist)
   */
  static async isRecoveryNeeded(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      // Check metadata
      const metadataRaw = await AsyncStorage.getItem(this.METADATA_KEY);
      const metadata = metadataRaw ? JSON.parse(metadataRaw) : [];

      if (metadata.length > 0) {
        return false; // Metadata exists, no recovery needed
      }

      // Check if files exist on disk
      const dirInfo = await FileSystem.getInfoAsync(PODCAST_AUDIO_DIR);
      if (!dirInfo.exists) {
        return false; // No files, no recovery needed
      }

      const podcastDirs = await FileSystem.readDirectoryAsync(PODCAST_AUDIO_DIR);
      
      // Check if any podcast directory has files
      for (const dir of podcastDirs) {
        const podcastDir = `${PODCAST_AUDIO_DIR}${dir}/`;
        const files = await FileSystem.readDirectoryAsync(podcastDir);
        if (files.some(f => f.endsWith('.mp3'))) {
          return true; // Found orphaned files, recovery needed
        }
      }

      return false;
    } catch (error) {
      console.error('[MetadataRecovery] Error checking if recovery needed:', error);
      return false;
    }
  }
}

