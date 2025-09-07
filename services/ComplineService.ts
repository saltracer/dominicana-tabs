import { Platform } from 'react-native';
import { 
  ComplineData, 
  ComplineCacheEntry, 
  LanguageCode, 
  ComplineServiceConfig,
  OfflineComplineData,
  getDayOfWeekFromDate,
  getComponentForDay
} from '../types/compline-types';
import { LiturgicalDay } from '../types';
import { getComplineForDate as getComplineDataForDate } from '../assets/data/liturgy/compline';

// Platform-specific storage
let AsyncStorage: any = null;
if (Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

export class ComplineService {
  private static instance: ComplineService;
  private cache: Map<string, ComplineCacheEntry> = new Map();
  private config: ComplineServiceConfig;
  private isOnline: boolean = true;

  private constructor(config?: Partial<ComplineServiceConfig>) {
    this.config = {
      cacheSize: 50,
      offlineStorageKey: 'compline-offline-data',
      enableOfflineMode: true,
      preloadDays: 30,
      ...config
    };
    
    this.initializeNetworkListener();
  }

  public static getInstance(config?: Partial<ComplineServiceConfig>): ComplineService {
    if (!ComplineService.instance) {
      ComplineService.instance = new ComplineService(config);
    }
    return ComplineService.instance;
  }

  private initializeNetworkListener(): void {
    // Listen for network state changes (web only)
    if (typeof window !== 'undefined' && 'navigator' in window && 'addEventListener' in window) {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    } else {
      // For React Native, assume online by default
      this.isOnline = true;
    }
  }

  public async getComplineForDate(
    date: Date, 
    language: LanguageCode = 'en'
  ): Promise<ComplineData> {
    const cacheKey = this.generateCacheKey(date, language);
    
    // Check memory cache first
    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      // Check if cache is still valid (24 hours)
      if (Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) {
        return entry.data;
      }
    }

    // Check offline storage
    if (this.config.enableOfflineMode) {
      const offlineData = await this.getOfflineCompline(date, language);
      if (offlineData) {
        this.setCacheEntry(cacheKey, offlineData, language, date);
        return offlineData;
      }
    }

    // Fetch from API if online
    if (this.isOnline && this.config.apiEndpoint) {
      try {
        const data = await this.fetchComplineFromAPI(date, language);
        if (this.config.enableOfflineMode) {
          await this.storeOffline(data, date, language);
        }
        this.setCacheEntry(cacheKey, data, language, date);
        return data;
      } catch (error) {
        console.warn('Failed to fetch from API, falling back to default:', error);
      }
    }

    // Fallback to data from liturgy directory
    const complineData = getComplineDataForDate(date, language);
    this.setCacheEntry(cacheKey, complineData, language, date);
    return complineData;
  }

  public async preloadComplineData(
    language: LanguageCode, 
    days: number = this.config.preloadDays
  ): Promise<void> {
    const dates = this.generateDateRange(days);
    
    for (const date of dates) {
      try {
        const complineData = await this.getComplineForDate(date, language);
        await this.storeOffline(complineData, date, language);
      } catch (error) {
        console.warn(`Failed to preload data for ${date.toISOString()}:`, error);
      }
    }
  }

  public async clearCache(): Promise<void> {
    this.cache.clear();
    if (this.config.enableOfflineMode && Platform.OS !== 'web' && AsyncStorage) {
      await AsyncStorage.removeItem(this.config.offlineStorageKey);
    }
  }

  public async getCacheSize(): Promise<number> {
    return this.cache.size;
  }

  public async getOfflineDataSize(): Promise<number> {
    if (!this.config.enableOfflineMode || Platform.OS === 'web' || !AsyncStorage) return 0;
    
    try {
      const data = await AsyncStorage.getItem(this.config.offlineStorageKey);
      return data ? JSON.parse(data).length : 0;
    } catch {
      return 0;
    }
  }

  private generateCacheKey(date: Date, language: LanguageCode): string {
    const dateStr = date.toISOString().split('T')[0];
    return `${dateStr}-${language}`;
  }

  private setCacheEntry(
    key: string, 
    data: ComplineData, 
    language: LanguageCode, 
    date: Date
  ): void {
    const entry: ComplineCacheEntry = {
      data,
      timestamp: Date.now(),
      language,
      date: date.toISOString().split('T')[0]
    };

    this.cache.set(key, entry);

    // Manage cache size
    if (this.cache.size > this.config.cacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  private async getOfflineCompline(
    date: Date, 
    language: LanguageCode
  ): Promise<ComplineData | null> {
    if (Platform.OS === 'web' || !AsyncStorage) return null;
    
    try {
      const offlineData = await AsyncStorage.getItem(this.config.offlineStorageKey);
      if (!offlineData) return null;

      const parsed: OfflineComplineData = JSON.parse(offlineData);
      const key = this.generateCacheKey(date, language);
      
      return parsed[key] || null;
    } catch (error) {
      console.warn('Failed to read offline data:', error);
      return null;
    }
  }

  private async storeOffline(
    data: ComplineData, 
    date: Date, 
    language: LanguageCode
  ): Promise<void> {
    if (Platform.OS === 'web' || !AsyncStorage) return;
    
    try {
      const key = this.generateCacheKey(date, language);
      const existingData = await AsyncStorage.getItem(this.config.offlineStorageKey);
      const offlineData: OfflineComplineData = existingData ? JSON.parse(existingData) : {};
      
      offlineData[key] = data;
      
      await AsyncStorage.setItem(
        this.config.offlineStorageKey, 
        JSON.stringify(offlineData)
      );
    } catch (error) {
      console.warn('Failed to store offline data:', error);
    }
  }

  private async fetchComplineFromAPI(
    date: Date, 
    language: LanguageCode
  ): Promise<ComplineData> {
    if (!this.config.apiEndpoint) {
      throw new Error('API endpoint not configured');
    }

    const dateStr = date.toISOString().split('T')[0];
    const response = await fetch(
      `${this.config.apiEndpoint}/compline/${dateStr}?language=${language}`
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
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
}
