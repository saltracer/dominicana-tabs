/**
 * Audio Version Service
 * Manages version checking for rosary audio files via manifest
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { AudioVersionManifest, CachedManifest, UpdateCheckResult } from '../types/audio-version-types';
import { RosaryAudioCache } from './RosaryAudioCache';

export class AudioVersionService {
  private static readonly MANIFEST_CACHE_KEY = 'rosary_audio_manifest';
  private static readonly MANIFEST_FILE = 'rosary-audio-version.json';
  private static readonly FETCH_TIMEOUT = 5000; // 5 seconds
  
  // In-memory cache to avoid fetching manifest multiple times per session
  private static inMemoryManifest: AudioVersionManifest | null = null;
  private static manifestFetchPromise: Promise<AudioVersionManifest | null> | null = null;
  private static lastFetchTime: number = 0;
  private static readonly MEMORY_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  /**
   * Fetch manifest from Supabase with timeout and in-memory caching
   */
  static async fetchManifest(): Promise<AudioVersionManifest | null> {
    // Return in-memory cache if still valid
    const now = Date.now();
    if (this.inMemoryManifest && (now - this.lastFetchTime) < this.MEMORY_CACHE_DURATION) {
      return this.inMemoryManifest;
    }

    // If a fetch is already in progress, wait for it
    if (this.manifestFetchPromise) {
      return this.manifestFetchPromise;
    }

    // Start new fetch
    this.manifestFetchPromise = this.performManifestFetch();
    const result = await this.manifestFetchPromise;
    this.manifestFetchPromise = null;

    return result;
  }

  /**
   * Perform the actual manifest fetch (internal method)
   * Uses signed URL + fetch pattern (works on web and React Native)
   */
  private static async performManifestFetch(): Promise<AudioVersionManifest | null> {
    try {
      console.log('[AudioVersion] Fetching manifest from Supabase...');

      // Get signed URL for manifest file (works on all platforms)
      const urlPromise = supabase.storage
        .from('rosary-audio')
        .createSignedUrl(this.MANIFEST_FILE, 60); // 1 minute expiry (enough for fetch)

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Manifest fetch timeout')), this.FETCH_TIMEOUT)
      );

      const { data: urlData, error: urlError } = await Promise.race([urlPromise, timeoutPromise]) as any;

      if (urlError || !urlData?.signedUrl) {
        console.log('[AudioVersion] No manifest file found (this is OK)');
        this.inMemoryManifest = null;
        this.lastFetchTime = Date.now();
        return null;
      }

      // Fetch the manifest JSON (works on web and React Native)
      const response = await fetch(urlData.signedUrl);
      
      if (!response.ok) {
        console.log('[AudioVersion] Manifest fetch failed:', response.status);
        this.inMemoryManifest = null;
        this.lastFetchTime = Date.now();
        return null;
      }

      // Parse JSON directly (works on all platforms)
      const manifest = await response.json() as AudioVersionManifest;

      console.log('[AudioVersion] Manifest loaded:', manifest.version);
      
      // Cache in memory
      this.inMemoryManifest = manifest;
      this.lastFetchTime = Date.now();

      return manifest;
    } catch (error) {
      // Graceful failure - manifest is optional
      if (error instanceof Error) {
        console.log('[AudioVersion] Manifest fetch failed (using indefinite cache):', error.message);
      }
      this.inMemoryManifest = null;
      this.lastFetchTime = Date.now();
      return null;
    }
  }

  /**
   * Get cached local manifest
   */
  static async getCachedManifest(): Promise<AudioVersionManifest | null> {
    try {
      const cached = await AsyncStorage.getItem(this.MANIFEST_CACHE_KEY);
      if (!cached) {
        return null;
      }

      const cachedData: CachedManifest = JSON.parse(cached);
      return cachedData.manifest;
    } catch (error) {
      console.warn('[AudioVersion] Failed to read cached manifest:', error);
      return null;
    }
  }

  /**
   * Save manifest to local cache
   */
  static async cacheManifest(manifest: AudioVersionManifest): Promise<void> {
    try {
      const cacheData: CachedManifest = {
        manifest,
        cachedAt: Date.now(),
      };
      await AsyncStorage.setItem(this.MANIFEST_CACHE_KEY, JSON.stringify(cacheData));
      console.log('[AudioVersion] Manifest cached locally');
    } catch (error) {
      console.warn('[AudioVersion] Failed to cache manifest:', error);
    }
  }

  /**
   * Check if specific file needs update based on manifest
   */
  static shouldUpdateFile(
    voice: string,
    fileName: string,
    newManifest: AudioVersionManifest,
    oldManifest: AudioVersionManifest | null
  ): boolean {
    // No old manifest = no way to compare
    if (!oldManifest) {
      return false;
    }

    const newVoice = newManifest.voices[voice];
    const oldVoice = oldManifest.voices[voice];

    if (!newVoice || !oldVoice) {
      return false;
    }

    const newFile = newVoice.files[fileName];
    const oldFile = oldVoice.files[fileName];

    if (!newFile) {
      return false; // File doesn't exist in new manifest
    }

    if (!oldFile) {
      return true; // New file added
    }

    // Compare hash or lastModified
    if (newFile.hash && oldFile.hash && newFile.hash !== oldFile.hash) {
      return true; // Hash changed
    }

    if (newFile.lastModified !== oldFile.lastModified) {
      return true; // Modified date changed
    }

    return false; // File unchanged
  }

  /**
   * Check for updates (non-blocking background check)
   * Only checks files that are actually cached - no alerts for voices user doesn't have
   */
  static async checkForUpdates(): Promise<UpdateCheckResult> {
    const result: UpdateCheckResult = {
      hasUpdates: false,
      updatedFiles: [],
      newFiles: [],
      voicesWithUpdates: [],
    };

    try {
      const newManifest = await this.fetchManifest();
      
      if (!newManifest) {
        console.log('[AudioVersion] No manifest available, skipping update check');
        return result;
      }

      const oldManifest = await this.getCachedManifest();

      if (!oldManifest) {
        console.log('[AudioVersion] No cached manifest, saving new one');
        await this.cacheManifest(newManifest);
        return result;
      }

      // Check if global version changed
      if (newManifest.version === oldManifest.version) {
        console.log('[AudioVersion] No updates available (version unchanged)');
        return result;
      }

      console.log('[AudioVersion] Version changed:', oldManifest.version, '→', newManifest.version);

      // Get list of files user actually has cached (only check these)
      const cachedFiles = await RosaryAudioCache.getCachedFiles();
      console.log('[AudioVersion] Checking updates for', cachedFiles.length, 'cached files only');

      // Check only cached files for updates
      for (const { voice, fileName } of cachedFiles) {
        const newVoice = newManifest.voices[voice];
        const oldVoice = oldManifest.voices[voice];

        if (!newVoice || !newVoice.files[fileName]) {
          // File removed from manifest
          continue;
        }

        if (!oldVoice) {
          // New voice added (but user already has files, so it's an update)
          result.newFiles.push(`${voice}/${fileName}`);
          if (!result.voicesWithUpdates.includes(voice)) {
            result.voicesWithUpdates.push(voice);
          }
          continue;
        }

        // Check if this specific cached file needs update
        if (this.shouldUpdateFile(voice, fileName, newManifest, oldManifest)) {
          result.updatedFiles.push(`${voice}/${fileName}`);
          
          if (!result.voicesWithUpdates.includes(voice)) {
            result.voicesWithUpdates.push(voice);
          }
        }
      }

      result.hasUpdates = result.updatedFiles.length > 0 || result.newFiles.length > 0;

      if (result.hasUpdates) {
        console.log('[AudioVersion] Updates found:', {
          updated: result.updatedFiles.length,
          new: result.newFiles.length,
          voices: result.voicesWithUpdates,
        });

        // DON'T cache new manifest yet - wait until files are downloaded
        // The new manifest stays in memory only, old manifest stays in AsyncStorage
        // This allows per-file comparison to work correctly
      }

      return result;
    } catch (error) {
      console.warn('[AudioVersion] Update check failed:', error);
      return result;
    }
  }

  /**
   * Invalidate cache for specific files (delete from file system)
   */
  static async invalidateFiles(voice: string, files: string[]): Promise<void> {
    // This will be implemented in RosaryAudioDownloadService
    // For now, just log the files that should be invalidated
    console.log('[AudioVersion] Files marked for update:', files);
  }

  /**
   * Clear cached manifest (for testing)
   */
  static async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.MANIFEST_CACHE_KEY);
      this.inMemoryManifest = null;
      this.lastFetchTime = 0;
      console.log('[AudioVersion] Manifest cache cleared');
    } catch (error) {
      console.warn('[AudioVersion] Failed to clear cache:', error);
    }
  }
}

