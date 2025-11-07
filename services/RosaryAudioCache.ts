/**
 * Rosary Audio Cache Utilities
 * Shared utilities for rosary audio caching to avoid circular dependencies
 */

import { File, Directory, Paths } from 'expo-file-system';

export class RosaryAudioCache {
  /**
   * Get the cache directory path (must be accessed at runtime)
   */
  static getAudioCacheDir(): string {
    // Paths.cache is a Directory object, we need its uri property
    return `${Paths.cache.uri}rosary-audio`;
  }

  /**
   * Get list of cached files with voice and fileName parsed
   */
  static async getCachedFiles(): Promise<Array<{ voice: string; fileName: string }>> {
    try {
      const directory = new Directory(this.getAudioCacheDir());
      
      if (!directory.exists) {
        return [];
      }
      
      const items = await directory.list();
      const cachedFiles: Array<{ voice: string; fileName: string }> = [];
      
      for (const item of items) {
        if (item instanceof File) {
          // Extract filename from full path: "voice_filename.m4a"
          const fullFileName = item.uri.split('/').pop() || '';
          
          // Parse format: "voice_filename.m4a" → { voice: "voice", fileName: "filename.m4a" }
          const match = fullFileName.match(/^([^_]+)_(.+)$/);
          if (match) {
            const [, voice, fileName] = match;
            cachedFiles.push({ voice, fileName });
          }
        }
      }
      
      console.log('[RosaryAudioCache] Found', cachedFiles.length, 'cached files');
      return cachedFiles;
    } catch (error) {
      console.error('[RosaryAudioCache] Error getting cached files:', error);
      return [];
    }
  }
}

