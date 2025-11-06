/**
 * Download Path Migration Service
 * Fixes file paths when app container UUID changes (simulator rebuilds)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { PODCAST_AUDIO_DIR } from '../lib/podcast/storage';
import { DownloadedEpisode } from './PodcastDownloadService';

export class DownloadPathMigration {
  private static readonly METADATA_KEY = 'podcast_downloads_metadata';

  /**
   * Migrate file paths when app container changes
   * This happens on iOS simulator when app is rebuilt
   */
  static async migratePathsIfNeeded(): Promise<number> {
    if (Platform.OS === 'web') {
      return 0;
    }

    try {
      // Get current metadata
      const metadataRaw = await AsyncStorage.getItem(this.METADATA_KEY);
      if (!metadataRaw) return 0;

      const metadata: DownloadedEpisode[] = JSON.parse(metadataRaw);
      if (metadata.length === 0) return 0;

      // Get current app container path from FileSystem.documentDirectory
      const currentBasePath = FileSystem.documentDirectory!; // e.g., "file:///.../A9E933BC.../Documents/"
      
      let migratedCount = 0;
      const updated: DownloadedEpisode[] = [];

      for (const download of metadata) {
        // Check if file exists at current path
        const exists = await FileSystem.getInfoAsync(download.filePath);
        
        if (exists.exists) {
          // Path is still valid
          updated.push(download);
        } else {
          // Path is outdated - try to find file in current container
          // Extract relative path: podcastId/episodeId.mp3
          const pathParts = download.filePath.split('/podcasts/audio/');
          if (pathParts.length === 2) {
            const relativePath = pathParts[1]; // e.g., "c8980ba6.../13dcace0....mp3"
            const newPath = `${PODCAST_AUDIO_DIR}${relativePath}`;
            
            // Check if file exists at new path
            const newExists = await FileSystem.getInfoAsync(newPath);
            if (newExists.exists) {
              console.log('[PathMigration] 🔄 Migrating path for:', download.episodeId);
              console.log('[PathMigration]   Old:', download.filePath);
              console.log('[PathMigration]   New:', newPath);
              
              updated.push({
                ...download,
                filePath: newPath,
              });
              migratedCount++;
            } else {
              console.warn('[PathMigration] ⚠️ File not found at old or new path:', download.episodeId);
              // Don't include - file is truly missing
            }
          } else {
            console.warn('[PathMigration] ⚠️ Cannot parse path:', download.filePath);
          }
        }
      }

      if (migratedCount > 0) {
        // Save updated metadata
        await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(updated));
        console.log('[PathMigration] ✅ Migrated', migratedCount, 'file paths');
        console.log('[PathMigration] ✅ Total valid entries:', updated.length);
      }

      return migratedCount;
    } catch (error) {
      console.error('[PathMigration] ❌ Error during path migration:', error);
      return 0;
    }
  }
}

