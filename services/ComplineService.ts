import { Platform } from 'react-native';
import { 
  ComplineData, 
  ComplineCacheEntry, 
  LanguageCode, 
  ComplineServiceConfig,
  OfflineComplineData 
} from '../types/compline-types';
import { LiturgicalDay } from '../types';

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

    // For now, return default data immediately to prevent flashing
    // TODO: Implement proper async loading later
    const defaultData = this.getDefaultCompline(language);
    this.setCacheEntry(cacheKey, defaultData, language, date);
    return defaultData;

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

    // Fallback to default
    return this.getDefaultCompline(language);
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
      this.cache.delete(oldestKey);
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

  private getDefaultCompline(language: LanguageCode): ComplineData {
    // Return a basic default structure
    return {
      id: 'compline-default',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      season: { name: 'Ordinary Time', color: '#228B22', startDate: '', endDate: '', description: '' },
      rank: 'ferial',
      components: {
        examinationOfConscience: {
          id: 'examination-default',
          type: 'examination',
          content: {
            [language]: {
              text: "Brothers and sisters, let us examine our conscience and repent of our sins, that we may be worthy to offer our prayers to God."
            }
          }
        },
        opening: {
          id: 'opening-default',
          type: 'opening',
          content: {
            [language]: {
              text: "O God, come to my assistance. O Lord, make haste to help me. Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be for ever. Amen."
            }
          }
        },
        hymn: {
          id: 'hymn-default',
          type: 'hymn',
          title: {
            [language]: { text: "Night Hymn" }
          },
          content: {
            [language]: {
              text: "Before the ending of the day, Creator of the world, we pray, that with thy wonted favor thou wouldst be our guard and keeper now."
            }
          },
          metadata: {}
        },
        psalmody: {
          id: 'psalm-default',
          type: 'psalm',
          psalmNumber: 4,
          antiphon: {
            [language]: { text: "In peace I will lie down and sleep." }
          },
          verses: {
            [language]: {
              text: "Answer me when I call, O God of my righteousness! You have given me relief when I was in distress. Be gracious to me and hear my prayer!"
            }
          },
          metadata: {}
        },
        reading: {
          id: 'reading-default',
          type: 'reading',
          title: {
            [language]: { text: "Short Reading" }
          },
          content: {
            [language]: {
              text: "Cast all your anxiety on him because he cares for you. Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour. Resist him, standing firm in the faith."
            }
          },
          source: {
            [language]: { text: "From the First Letter of Peter" }
          },
          metadata: {}
        },
        responsory: {
          id: 'responsory-default',
          type: 'responsory',
          content: {
            [language]: {
              text: "℟. Into your hands, O Lord, I commend my spirit. ℣. You have redeemed us, Lord God of truth. ℟. Glory to the Father, and to the Son, and to the Holy Spirit."
            }
          }
        },
        canticle: {
          id: 'canticle-default',
          type: 'canticle',
          name: "Canticle of Simeon",
          antiphon: {
            [language]: { text: "Protect us, Lord, while we are awake and safeguard us while we sleep." }
          },
          content: {
            [language]: {
              text: "Lord, now you let your servant go in peace; your word has been fulfilled: my own eyes have seen the salvation which you have prepared in the sight of every people: a light to reveal you to the nations and the glory of your people Israel."
            }
          },
          metadata: {}
        },
        concludingPrayer: {
          id: 'prayer-default',
          type: 'prayer',
          title: {
            [language]: { text: "Concluding Prayer" }
          },
          content: {
            [language]: {
              text: "Visit this place, O Lord, and drive far from it all snares of the enemy; let your holy angels dwell with us to preserve us in peace; and let your blessing be upon us always. Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, one God, for ever and ever."
            }
          }
        },
        finalBlessing: {
          id: 'blessing-default',
          type: 'blessing',
          content: {
            [language]: {
              text: "May the almighty Lord grant us a quiet night and a perfect end. Amen."
            }
          }
        }
      },
      metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '1.0.0'
      }
    };
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
