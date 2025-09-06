import { Platform } from 'react-native';
import { 
  ComplineData, 
  LanguageCode, 
  AudioResource,
  OfflineComplineData 
} from '../types/compline-types';
import { ComplineService } from './ComplineService';

// Platform-specific storage
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private complineService: ComplineService;
  private audioCache: Map<string, string> = new Map(); // URL -> local path
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB
  private currentCacheSize: number = 0;

  private constructor() {
    this.complineService = ComplineService.getInstance();
    // Only initialize cache size on mobile platforms
    if (Platform.OS !== 'web') {
      this.initializeCacheSize();
    }
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private async initializeCacheSize(): Promise<void> {
    if (Platform.OS === 'web' || !AsyncStorage) {
      return;
    }
    
    try {
      const cacheInfo = await AsyncStorage.getItem('offline-cache-info');
      if (cacheInfo) {
        const info = JSON.parse(cacheInfo);
        this.currentCacheSize = info.size || 0;
        this.audioCache = new Map(info.audioCache || []);
      }
    } catch (error) {
      console.warn('Failed to initialize cache size:', error);
    }
  }

  public async preloadComplineData(
    language: LanguageCode, 
    days: number = 30
  ): Promise<void> {
    // Skip offline preloading on web
    if (Platform.OS === 'web') {
      console.log('Offline preloading skipped on web platform');
      return;
    }
    
    console.log(`Preloading Compline data for ${days} days in ${language}...`);
    
    try {
      // Preload Compline data
      await this.complineService.preloadComplineData(language, days);
      
      // Preload audio files
      await this.preloadAudioFiles(language, days);
      
      console.log('Compline data preloading completed');
    } catch (error) {
      console.error('Failed to preload Compline data:', error);
      throw error;
    }
  }

  public async preloadAudioFiles(
    language: LanguageCode, 
    days: number = 30
  ): Promise<void> {
    const dates = this.generateDateRange(days);
    
    for (const date of dates) {
      try {
        const complineData = await this.complineService.getComplineForDate(date, language);
        const audioFiles = this.extractAudioUrls(complineData);
        
        await Promise.all(
          audioFiles.map(audio => this.downloadAndCache(audio))
        );
      } catch (error) {
        console.warn(`Failed to preload audio for ${date.toISOString()}:`, error);
      }
    }
  }

  public async downloadAndCache(audio: AudioResource): Promise<string | null> {
    // Skip caching on web
    if (Platform.OS === 'web' || !AsyncStorage) {
      return null;
    }
    
    const cacheKey = `audio-${audio.id}`;
    
    // Check if already cached
    if (this.audioCache.has(audio.url)) {
      return this.audioCache.get(audio.url)!;
    }

    try {
      // Check available space
      if (this.currentCacheSize + (audio.size || 0) > this.maxCacheSize) {
        await this.cleanupOldCache();
      }

      // Download audio file
      const response = await fetch(audio.url);
      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioArrayBuffer = await audioBlob.arrayBuffer();
      
      // Store in AsyncStorage
      const audioBase64 = this.arrayBufferToBase64(audioArrayBuffer);
      await AsyncStorage.setItem(cacheKey, audioBase64);
      
      // Update cache info
      const localPath = `cache://${cacheKey}`;
      this.audioCache.set(audio.url, localPath);
      this.currentCacheSize += audioArrayBuffer.byteLength;
      
      await this.saveCacheInfo();
      
      return localPath;
    } catch (error) {
      console.warn(`Failed to cache audio ${audio.id}:`, error);
      return null;
    }
  }

  public async getCachedAudio(audio: AudioResource): Promise<string | null> {
    if (Platform.OS === 'web' || !AsyncStorage) {
      return null;
    }
    
    if (this.audioCache.has(audio.url)) {
      const cacheKey = this.audioCache.get(audio.url)!.replace('cache://', '');
      
      try {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          return `data:audio/${audio.format};base64,${cachedData}`;
        }
      } catch (error) {
        console.warn(`Failed to retrieve cached audio ${audio.id}:`, error);
      }
    }
    
    return null;
  }

  public async clearAudioCache(): Promise<void> {
    if (Platform.OS === 'web' || !AsyncStorage) {
      this.audioCache.clear();
      this.currentCacheSize = 0;
      return;
    }
    
    try {
      // Clear all audio cache entries
      for (const [url, localPath] of this.audioCache) {
        const cacheKey = localPath.replace('cache://', '');
        await AsyncStorage.removeItem(cacheKey);
      }
      
      this.audioCache.clear();
      this.currentCacheSize = 0;
      await this.saveCacheInfo();
      
      console.log('Audio cache cleared');
    } catch (error) {
      console.error('Failed to clear audio cache:', error);
    }
  }

  public async getCacheInfo(): Promise<{
    size: number;
    maxSize: number;
    audioFiles: number;
    complineEntries: number;
  }> {
    const complineEntries = Platform.OS === 'web' ? 0 : await this.complineService.getOfflineDataSize();
    
    return {
      size: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      audioFiles: this.audioCache.size,
      complineEntries
    };
  }

  public async isAudioCached(audio: AudioResource): Promise<boolean> {
    return this.audioCache.has(audio.url);
  }

  private async cleanupOldCache(): Promise<void> {
    if (Platform.OS === 'web' || !AsyncStorage) {
      this.audioCache.clear();
      this.currentCacheSize = 0;
      return;
    }
    
    try {
      // Get all cache keys
      const allKeys = await AsyncStorage.getAllKeys();
      const audioKeys = allKeys.filter((key: string) => key.startsWith('audio-'));
      
      // Remove oldest entries (simple FIFO for now)
      const keysToRemove = audioKeys.slice(0, Math.floor(audioKeys.length / 2));
      
      for (const key of keysToRemove) {
        await AsyncStorage.removeItem(key);
      }
      
      // Update cache info
      this.audioCache.clear();
      this.currentCacheSize = 0;
      await this.saveCacheInfo();
      
      console.log(`Cleaned up ${keysToRemove.length} old cache entries`);
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  }

  private async saveCacheInfo(): Promise<void> {
    if (Platform.OS === 'web' || !AsyncStorage) {
      return;
    }
    
    try {
      const cacheInfo = {
        size: this.currentCacheSize,
        audioCache: Array.from(this.audioCache.entries())
      };
      
      await AsyncStorage.setItem('offline-cache-info', JSON.stringify(cacheInfo));
    } catch (error) {
      console.warn('Failed to save cache info:', error);
    }
  }

  private extractAudioUrls(complineData: ComplineData): AudioResource[] {
    const audioFiles: AudioResource[] = [];
    
    const extractFromContent = (content: any) => {
      if (content && typeof content === 'object') {
        Object.values(content).forEach((langContent: any) => {
          if (langContent.audio) {
            audioFiles.push(langContent.audio);
          }
        });
      }
    };

    // Extract from all components
    Object.values(complineData.components).forEach(component => {
      if (component.audio) {
        audioFiles.push(...component.audio);
      }
      
      if (component.content) {
        extractFromContent(component.content);
      }
      
      if (component.title) {
        extractFromContent(component.title);
      }
      
      if (component.antiphon) {
        extractFromContent(component.antiphon);
      }
      
      if (component.verses) {
        extractFromContent(component.verses);
      }
      
      if (component.refrain) {
        extractFromContent(component.refrain);
      }
      
      if (component.source) {
        extractFromContent(component.source);
      }
    });

    return audioFiles;
  }

  private generateDateRange(days: number): Date[] {
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    // Use btoa if available (web), otherwise use a polyfill
    if (typeof btoa !== 'undefined') {
      return btoa(binary);
    } else {
      // Simple base64 polyfill for React Native
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      let result = '';
      let i = 0;
      
      while (i < binary.length) {
        const a = binary.charCodeAt(i++);
        const b = i < binary.length ? binary.charCodeAt(i++) : 0;
        const c = i < binary.length ? binary.charCodeAt(i++) : 0;
        
        const bitmap = (a << 16) | (b << 8) | c;
        
        result += chars.charAt((bitmap >> 18) & 63);
        result += chars.charAt((bitmap >> 12) & 63);
        result += i - 2 < binary.length ? chars.charAt((bitmap >> 6) & 63) : '=';
        result += i - 1 < binary.length ? chars.charAt(bitmap & 63) : '=';
      }
      
      return result;
    }
  }
}
