/**
 * Rosary Audio Download Service - Web Version
 * Downloads and caches rosary audio files from Supabase Storage
 * Uses browser-compatible APIs instead of expo-file-system
 */

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
   * Get the cache directory path for web (using browser cache)
   */
  private static getAudioCacheDir(): string {
    // For web, we'll use a simple cache key approach
    return 'rosary-audio-cache';
  }
  
  /**
   * Initialize the cache directory (web version - no-op)
   */
  static async initialize(): Promise<void> {
    console.log('Web version: Audio cache initialization skipped (using browser cache)');
  }

  /**
   * Get the cache path for a specific audio file
   */
  private static getCachePath(audioPath: string): string {
    // For web, we'll use the audio path directly as the cache key
    return audioPath;
  }

  /**
   * Check if an audio file is cached (web version)
   */
  private static async isCached(audioPath: string): Promise<boolean> {
    try {
      // For web, we'll check if the file exists by trying to fetch it
      const response = await fetch(audioPath, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
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
      // Individual final prayers
      'assets/audio/rosary/hail_holy_queen.m4a': 'hail-holy-queen.m4a',
      'assets/audio/rosary/versicle_response.m4a': 'versicle-response.m4a',
      'assets/audio/rosary/rosary_prayer.m4a': 'rosary-prayer.m4a',
      'assets/audio/rosary/st_michael.m4a': 'st-michael.m4a',
      'assets/audio/rosary/memorare.m4a': 'memorare.m4a',
      'assets/audio/rosary/prayer_departed.m4a': 'prayer-departed.m4a',
      'assets/audio/rosary/prayer_pope.m4a': 'prayer-pope.m4a',
    };

    const mappedFile = pathMappings[fileName];
    
    if (mappedFile) {
      return `${voice}/${mappedFile}`;
    }
    
    // Handle mystery meditation files
    // Pattern: assets/audio/rosary/mysteries/{mystery-set}/decade-{number}.m4a
    // OR: assets/audio/rosary/mysteries/{mystery-set}/decade-{number}-short.m4a
    const mysteryMatch = fileName.match(/mysteries\/(.+?)-mysteries\/decade-(\d+)(-short)?\.m4a/);
    if (mysteryMatch) {
      const [, mysteryType, decadeNumber, shortSuffix] = mysteryMatch;
      const shortPart = shortSuffix || '';
      const supabaseFileName = `${mysteryType}-decade-${decadeNumber}${shortPart}.m4a`;
      console.log(`[RosaryAudioDownloadService Web] Mystery file detected: ${fileName} -> ${voice}/${supabaseFileName}`);
      return `${voice}/${supabaseFileName}`;
    }
    
    // Handle prayer variations (apostles-creed-1/2, our-father-1/2/3, hail-mary-01 to -20, glory-be-1 to -5, dominican-glory-be-1 to -5)
    const variationMatch = fileName.match(/assets\/audio\/rosary\/(apostles-creed|our-father|hail-mary|glory-be|dominican-glory-be)-(\d+)\.m4a/);
    if (variationMatch) {
      const [, prayerName, number] = variationMatch;
      // hail-mary already has padding, others don't
      const paddedNumber = prayerName === 'hail-mary' ? number : number.padStart(1, '0');
      return `${voice}/${prayerName}-${paddedNumber}.m4a`;
    }
    
    // Default: use the filename as-is
    const fileNameOnly = fileName.split('/').pop() || fileName;
    return `${voice}/${fileNameOnly}`;
  }

  /**
   * Get the URI for an audio file (web version)
   * For web, we return the direct URL to the audio file
   */
  static async getAudioFileUri(voice: string, audioPath: string): Promise<string | null> {
    try {
      console.log(`[RosaryAudioDownloadService Web] Getting audio file: ${audioPath}`);
      
      // Map the internal path to the actual Supabase storage path
      const storagePath = this.getStoragePath(voice, audioPath);
      console.log(`[RosaryAudioDownloadService Web] Mapped to storage path: ${storagePath}`);
      
      // For web, we construct the direct URL to the audio file
      const { data } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(storagePath, 3600); // 1 hour expiry
      
      if (data?.signedUrl) {
        console.log(`[RosaryAudioDownloadService Web] Generated signed URL for: ${storagePath}`);
        return data.signedUrl;
      } else {
        console.warn(`[RosaryAudioDownloadService Web] No signed URL generated for: ${storagePath}`);
        return null;
      }
    } catch (error) {
      console.error(`[RosaryAudioDownloadService Web] Error getting audio file ${audioPath}:`, error);
      return null;
    }
  }

  /**
   * Download an audio file (web version - no-op, we use direct URLs)
   */
  static async downloadAudioFile(
    voice: string, 
    audioPath: string, 
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string | null> {
    // For web, we just return the signed URL
    return this.getAudioFileUri(voice, audioPath);
  }

  /**
   * Clear the audio cache (web version - no-op)
   */
  static async clearCache(): Promise<void> {
    console.log('Web version: Audio cache clearing skipped (browser handles cache)');
  }

  /**
   * Get cache size (web version - not applicable)
   */
  static async getCacheSize(): Promise<number> {
    return 0; // Not applicable for web
  }

  /**
   * Check if audio files are available for a voice
   */
  static async checkAudioAvailability(voice: string): Promise<boolean> {
    try {
      // Check if a common audio file exists
      const testPath = `${voice}/our-father.m4a`;
      const { data } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(testPath, 60); // 1 minute expiry for test
      
      return !!data?.signedUrl;
    } catch (error) {
      console.error(`[RosaryAudioDownloadService Web] Error checking audio availability for ${voice}:`, error);
      return false;
    }
  }

  /**
   * Get available voices
   */
  static async getAvailableVoices(): Promise<string[]> {
    try {
      const { data } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 100 });
      
      if (data) {
        return data
          .filter(item => item.name && !item.name.includes('.'))
          .map(item => item.name);
      }
      
      return [];
    } catch (error) {
      console.error('[RosaryAudioDownloadService Web] Error getting available voices:', error);
      return [];
    }
  }
}
