/**
 * Rosary Audio Download Service
 * Downloads and caches rosary audio files from Supabase Storage
 */

import { File, Directory, Paths } from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { AudioVersionService } from './AudioVersionService';

export interface DownloadProgress {
  fileName: string;
  totalBytes: number;
  downloadedBytes: number;
  progress: number; // 0-100
}

export class RosaryAudioDownloadService {
  private static readonly BUCKET_NAME = 'rosary-audio';
  
  /**
   * Get the cache directory path (must be accessed at runtime)
   */
  private static getAudioCacheDir(): string {
    // Paths.cache is a Directory object, we need its uri property
    return `${Paths.cache.uri}rosary-audio`;
  }
  
  /**
   * Initialize the cache directory
   */
  static async initialize(): Promise<void> {
    try {
      const cacheDir = this.getAudioCacheDir();
      console.log('Initializing audio cache directory at:', cacheDir);
      
      const directory = new Directory(cacheDir);
      if (!directory.exists) {
        // Create directory with intermediates option to create parent directories
        await directory.create({ intermediates: true });
        console.log('Created rosary audio cache directory successfully');
      } else {
        console.log('Audio cache directory already exists');
      }
    } catch (error) {
      console.error('Error initializing audio cache directory:', error);
      console.error('Paths.cache value:', Paths.cache);
      throw error;
    }
  }

  /**
   * Get the Supabase storage path for an audio file
   */
  private static getStoragePath(voice: string, fileName: string): string {
    // Map from app's internal path to actual Supabase storage path
    const pathMappings: Record<string, string> = {
      'assets/audio/rosary/sign-of-cross.m4a': 'sign-of-the-cross.m4a',
      'assets/audio/rosary/faith-hope-charity.m4a': 'faith-hope-charity.m4a',
      'assets/audio/rosary/fatima-prayer.m4a': 'fatima-prayer.m4a',
      'assets/audio/rosary/final-prayer.m4a': 'final-prayer.m4a',
      'assets/audio/rosary/dominican-opening-1.m4a': 'dominican-opening-1.m4a',
      'assets/audio/rosary/dominican-opening-2.m4a': 'dominican-opening-2.m4a',
      'assets/audio/rosary/dominican-opening-3.m4a': 'dominican-opening-3.m4a',
      'assets/audio/rosary/dominican-opening-glory-be.m4a': 'dominican-opening-glory-be.m4a',
      'assets/audio/rosary/alleluia.m4a': 'alleluia.m4a',
    };

    const mappedFile = pathMappings[fileName];
    
    if (mappedFile) {
      return `${voice}/${mappedFile}`;
    }
    
    // Handle prayer variations (apostles-creed-1/2, our-father-1/2/3, hail-mary-01 to -20, glory-be-1 to -5, dominican-glory-be-1 to -5)
    const variationMatch = fileName.match(/assets\/audio\/rosary\/(apostles-creed|our-father|hail-mary|glory-be|dominican-glory-be)-(\d+)\.m4a/);
    if (variationMatch) {
      const [, prayerName, number] = variationMatch;
      // hail-mary already has padding, others don't
      const paddedNumber = prayerName === 'hail-mary' ? number : number.padStart(1, '0');
      const supabaseFileName = `${prayerName}-${paddedNumber === number ? number : paddedNumber}.m4a`;
      console.log(`[Audio Path] Variation detected: ${fileName} -> ${voice}/${supabaseFileName}`);
      return `${voice}/${supabaseFileName}`;
    }
    
    // Smart fallback for mystery files (both full and short versions)
    // Pattern: assets/audio/rosary/mysteries/{mystery-set}/decade-{number}.m4a
    // OR: assets/audio/rosary/mysteries/{mystery-set}/decade-{number}-short.m4a
    const mysteryMatch = fileName.match(/mysteries\/(.+?)-mysteries\/decade-(\d+)(-short)?\.m4a/);
    if (mysteryMatch) {
      const [, mysteryType, decadeNumber, shortSuffix] = mysteryMatch;
      const shortPart = shortSuffix || '';
      const supabaseFileName = `${mysteryType}-decade-${decadeNumber}${shortPart}.m4a`;
      console.log(`[Audio Path] Mystery file detected: ${fileName} -> ${voice}/${supabaseFileName}`);
      return `${voice}/${supabaseFileName}`;
    }
    
    // Generic fallback for any other files
    const baseName = fileName.replace('assets/audio/rosary/', '').replace(/\/mysteries\/[^/]+\//g, '').replace(/\//g, '-');
    console.warn(`No specific mapping found for ${fileName}, using generic fallback: ${baseName}`);
    return `${voice}/${baseName}`;
  }

  /**
   * Get the local cache path for an audio file
   */
  private static getCachePath(voice: string, fileName: string): string {
    const baseName = fileName.replace('assets/audio/rosary/', '').replace(/\//g, '_').replace('.m4a', '');
    return `${this.getAudioCacheDir()}/${voice}_${baseName}.m4a`;
  }

  /**
   * Check if a file is cached locally
   */
  static async isCached(voice: string, fileName: string): Promise<boolean> {
    try {
      const cachePath = this.getCachePath(voice, fileName);
      const file = new File(cachePath);
      return file.exists;
    } catch (error) {
      return false;
    }
  }

  /**
   * Download audio file from Supabase Storage
   */
  static async downloadAudioFile(
    voice: string,
    fileName: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    try {
      await this.initialize();

      const cachePath = this.getCachePath(voice, fileName);
      
      // Check if already cached
      if (await this.isCached(voice, fileName)) {
        console.log(`Audio file already cached: ${cachePath}`);
        return cachePath;
      }

      // Get the storage path
      const storagePath = this.getStoragePath(voice, fileName);
      console.log(`[Rosary Audio Download] Attempting to download:`);
      console.log(`  Bucket: ${this.BUCKET_NAME}`);
      console.log(`  Path: ${storagePath}`);
      console.log(`  Voice: ${voice}`);
      console.log(`  Original fileName: ${fileName}`);

      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log(`  Auth status: ${user ? `✅ Signed in as ${user.email}` : '❌ NOT signed in'}`);
      if (authError) {
        console.error(`  Auth error: ${authError.message}`);
      }

      // Get signed URL from Supabase Storage
      const { data: urlData, error: urlError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (urlError || !urlData?.signedUrl) {
        console.error(`[Rosary Audio Download] Failed to get signed URL:`);
        console.error(`  Error: ${urlError?.message || 'No URL returned'}`);
        console.error(`  Error details:`, urlError);
        console.error(`  This usually means:`);
        console.error(`  - File does not exist at path: ${storagePath}`);
        console.error(`  - Bucket policies not configured correctly`);
        console.error(`  - User not authenticated (currently: ${user ? 'authenticated' : 'NOT authenticated'})`);
        throw new Error(`Failed to get signed URL: ${urlError?.message || 'No URL returned'}`);
      }

      // Download the file using fetch and new File API
      console.log(`Downloading from signed URL...`);
      
      const response = await fetch(urlData.signedUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get file content as array buffer (React Native compatible)
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Write to cache using new File API
      const cacheFile = new File(cachePath);
      await cacheFile.create();
      await cacheFile.write(uint8Array);

      console.log(`Downloaded and cached: ${cachePath}`);
      console.log(`  Size: ${(arrayBuffer.byteLength / 1024).toFixed(1)} KB`);
      
      return cachePath;
    } catch (error) {
      console.error(`Error downloading audio file ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Get audio file URI (download if necessary)
   */
  static async getAudioFileUri(
    voice: string,
    fileName: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    const cachePath = this.getCachePath(voice, fileName);
    
    // Return cached file if available
    if (await this.isCached(voice, fileName)) {
      // Check for updates in background (non-blocking)
      this.checkFileVersionInBackground(voice, fileName).catch(err => {
        // Silently fail - version check is optional
        console.warn('[Version Check] Background check failed:', err.message);
      });
      
      return cachePath;
    }

    // Download if not cached
    return await this.downloadAudioFile(voice, fileName, onProgress);
  }

  /**
   * Check if file needs update based on manifest (runs in background)
   */
  private static async checkFileVersionInBackground(voice: string, fileName: string): Promise<void> {
    try {
      const manifest = await AudioVersionService.fetchManifest();
      
      if (!manifest) {
        // No manifest = no updates available
        return;
      }

      const cachedManifest = await AudioVersionService.getCachedManifest();
      const baseFileName = fileName.split('/').pop() || fileName;
      
      if (AudioVersionService.shouldUpdateFile(voice, baseFileName, manifest, cachedManifest)) {
        console.log('[AudioVersion] File needs update, re-downloading in background:', fileName);
        
        // Re-download file in background (will replace cached version)
        await this.downloadAudioFile(voice, fileName);
        
        console.log('[AudioVersion] Background update complete:', fileName);
        
        // After successful download, update the cached manifest
        // This prevents re-checking this file on next access
        await AudioVersionService.cacheManifest(manifest);
        console.log('[AudioVersion] Manifest cache updated after successful download');
      }
    } catch (error) {
      // Graceful failure - don't interrupt user
      console.warn('[AudioVersion] Background version check failed:', error);
    }
  }

  /**
   * Download all audio files for a specific voice
   */
  static async downloadVoicePack(
    voice: string,
    onProgress?: (fileName: string, progress: DownloadProgress) => void
  ): Promise<{ success: boolean; downloaded: number; failed: number; errors: string[] }> {
    const audioFiles = [
      'assets/audio/rosary/sign-of-cross.m4a',
      'assets/audio/rosary/faith-hope-charity.m4a',
      'assets/audio/rosary/fatima-prayer.m4a',
      'assets/audio/rosary/final-prayer.m4a',
      'assets/audio/rosary/dominican-opening-1.m4a',
      'assets/audio/rosary/dominican-opening-2.m4a',
      'assets/audio/rosary/dominican-opening-3.m4a',
      'assets/audio/rosary/dominican-opening-glory-be.m4a',
      'assets/audio/rosary/alleluia.m4a',
      // Apostles' Creed variations
      'assets/audio/rosary/apostles-creed-1.m4a',
      'assets/audio/rosary/apostles-creed-2.m4a',
      // Our Father variations
      'assets/audio/rosary/our-father-1.m4a',
      'assets/audio/rosary/our-father-2.m4a',
      'assets/audio/rosary/our-father-3.m4a',
      // Hail Mary variations (20)
      ...Array.from({ length: 20 }, (_, i) => `assets/audio/rosary/hail-mary-${(i + 1).toString().padStart(2, '0')}.m4a`),
      // Glory Be variations (5)
      ...Array.from({ length: 5 }, (_, i) => `assets/audio/rosary/glory-be-${i + 1}.m4a`),
      // Dominican Glory Be variations (5)
      ...Array.from({ length: 5 }, (_, i) => `assets/audio/rosary/dominican-glory-be-${i + 1}.m4a`),
    ];

    let downloaded = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const fileName of audioFiles) {
      try {
        await this.downloadAudioFile(voice, fileName, (progress) => {
          onProgress?.(fileName, progress);
        });
        downloaded++;
      } catch (error) {
        failed++;
        errors.push(`${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`Failed to download ${fileName}:`, error);
      }
    }

    return {
      success: failed === 0,
      downloaded,
      failed,
      errors,
    };
  }

  /**
   * Clear all cached audio files
   */
  static async clearCache(): Promise<void> {
    try {
      const directory = new Directory(this.getAudioCacheDir());
      if (directory.exists) {
        await directory.delete();
        console.log('Cleared rosary audio cache');
      }
    } catch (error) {
      console.error('Error clearing audio cache:', error);
    }
  }

  /**
   * Clear cached files for a specific voice
   */
  static async clearVoiceCache(voice: string): Promise<void> {
    try {
      const directory = new Directory(this.getAudioCacheDir());
      const items = await directory.list();
      
      // Filter files (not directories) that start with voice prefix
      for (const item of items) {
        if (item instanceof File && item.uri.includes(`${voice}_`)) {
          await item.delete();
        }
      }
      
      console.log(`Cleared cached files for voice: ${voice}`);
    } catch (error) {
      console.error(`Error clearing cache for voice ${voice}:`, error);
    }
  }

  /**
   * Get cache size in bytes
   */
  static async getCacheSize(): Promise<number> {
    try {
      const directory = new Directory(this.getAudioCacheDir());
      
      if (!directory.exists) {
        return 0;
      }

      const items = await directory.list();
      let totalSize = 0;

      for (const item of items) {
        if (item instanceof File) {
          totalSize += item.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
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
      
      console.log('[RosaryAudio] Found', cachedFiles.length, 'cached files');
      return cachedFiles;
    } catch (error) {
      console.error('Error getting cached files:', error);
      return [];
    }
  }
}

