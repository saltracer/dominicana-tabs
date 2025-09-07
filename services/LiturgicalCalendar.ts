import { LiturgicalDay, LiturgicalSeason, Celebration, Saint } from '../types';
import { format } from 'date-fns';
import { getCelebrationsForDate, getLiturgicalSeason, getLiturgicalWeek } from '../assets/data/calendar';
import { CelebrationRank } from '../types/celebrations-types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // Time to live in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
}

export class LiturgicalCalendarService {
  private static instance: LiturgicalCalendarService;
  private saints: Map<string, Saint> = new Map();
  
  // Cache storage
  private liturgicalDayCache: Map<string, CacheEntry<LiturgicalDay>> = new Map();
  private feastCache: Map<string, CacheEntry<Celebration[]>> = new Map();
  private seasonCache: Map<string, CacheEntry<LiturgicalSeason>> = new Map();
  
  // Cache configuration
  private cacheConfig: CacheConfig = {
    maxSize: 200, // Maximum number of entries per cache
    defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
    cleanupInterval: 60 * 60 * 1000, // 1 hour
  };
  
  // Cleanup timer
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;



  private constructor() {
    this.initializeSaints();
    this.startCacheCleanup();
    // No need to initialize feasts since we're using new calendar functions
  }

  public static getInstance(): LiturgicalCalendarService {
    if (!LiturgicalCalendarService.instance) {
      LiturgicalCalendarService.instance = new LiturgicalCalendarService();
    }
    return LiturgicalCalendarService.instance;
  }

  // Cache management methods
  private startCacheCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.cacheConfig.cleanupInterval);
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    
    // Cleanup liturgical day cache
    const liturgicalDayKeys = Array.from(this.liturgicalDayCache.keys());
    liturgicalDayKeys.forEach(key => {
      const entry = this.liturgicalDayCache.get(key);
      if (entry && now > entry.expiresAt) {
        this.liturgicalDayCache.delete(key);
      }
    });
    
    // Cleanup feast cache
    const feastKeys = Array.from(this.feastCache.keys());
    feastKeys.forEach(key => {
      const entry = this.feastCache.get(key);
      if (entry && now > entry.expiresAt) {
        this.feastCache.delete(key);
      }
    });
    
    // Cleanup season cache
    const seasonKeys = Array.from(this.seasonCache.keys());
    seasonKeys.forEach(key => {
      const entry = this.seasonCache.get(key);
      if (entry && now > entry.expiresAt) {
        this.seasonCache.delete(key);
      }
    });
  }

  private evictOldestEntries<T>(cache: Map<string, CacheEntry<T>>): void {
    if (cache.size >= this.cacheConfig.maxSize) {
      // Find the oldest entry
      let oldestKey = '';
      let oldestTimestamp = Date.now();
      
      const keys = Array.from(cache.keys());
      keys.forEach(key => {
        const entry = cache.get(key);
        if (entry && entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
          oldestKey = key;
        }
      });
      
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
  }

  private getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.cacheConfig.defaultTTL);
    
    this.evictOldestEntries(cache);
    
    cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  // Public cache management methods
  public clearCache(): void {
    this.liturgicalDayCache.clear();
    this.feastCache.clear();
    this.seasonCache.clear();
  }

  public getCacheStats(): { liturgicalDays: number; feasts: number; seasons: number } {
    return {
      liturgicalDays: this.liturgicalDayCache.size,
      feasts: this.feastCache.size,
      seasons: this.seasonCache.size
    };
  }

  public preloadDateRange(startDate: Date, endDate: Date): void {
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      
      // Preload liturgical day if not cached
      if (!this.liturgicalDayCache.has(dateString)) {
        this.getLiturgicalDay(currentDate);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }





  // Get liturgical day for a specific date
  public getLiturgicalDay(date: Date): LiturgicalDay {
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check cache first
    const cached = this.getFromCache(this.liturgicalDayCache, dateString);
    if (cached) {
      return cached;
    }
    
    // Use new calendar functions
    const season = getLiturgicalSeason(date);
    const week = getLiturgicalWeek(date, season);
    
    // Extract week number from week string (e.g., "Week 3 of Advent" -> 3)
    const weekMatch = week.match(/\d+/);
    const weekNumber = weekMatch ? parseInt(weekMatch[0]) : 1;

    // Get feasts for this date
    const feasts = this.getFeastsForDate(date);

    const liturgicalDay: LiturgicalDay = {
      date: dateString,
      season: {
        name: season.name,
        color: season.color,
        startDate: '', // Not provided by new functions
        endDate: '',   // Not provided by new functions
        description: season.description
      },
      week: weekNumber,
      dayOfWeek: date.getDay(),
      feasts: feasts,
      color: season.color
    };
    
    // Cache the result
    this.setCache(this.liturgicalDayCache, dateString, liturgicalDay);
    
    return liturgicalDay;
  }

  // Initialize saints database
  private initializeSaints(): void {
    // const dominicanSaints: Saint[] = [
    //   {
    //     id: 'st-thomas-aquinas',
    //     name: 'St. Thomas Aquinas',
    //     feastDay: '2024-01-28',
    //     birthDate: '1225-01-28',
    //     deathDate: '1274-03-07',
    //     canonizationDate: '1323-07-18',
    //     patronages: ['Catholic schools', 'Theologians', 'Students'],
    //     biography: 'Dominican priest, philosopher, and Doctor of the Church. Known as the Angelic Doctor.',
    //     isDominican: true,
    //     order: 'Dominican Order'
    //   },
    //   {
    //     id: 'st-dominic',
    //     name: 'St. Dominic',
    //     feastDay: '2024-08-08',
    //     birthDate: '1170-08-08',
    //     deathDate: '1221-08-06',
    //     canonizationDate: '1234-07-13',
    //     patronages: ['Dominican Order', 'Astronomers', 'Scientists'],
    //     biography: 'Founder of the Order of Preachers (Dominicans).',
    //     isDominican: true,
    //     order: 'Dominican Order'
    //   },
    //   {
    //     id: 'st-catherine-of-siena',
    //     name: 'St. Catherine of Siena',
    //     feastDay: '2024-04-29',
    //     birthDate: '1347-03-25',
    //     deathDate: '1380-04-29',
    //     canonizationDate: '1461-06-29',
    //     patronages: ['Italy', 'Nurses', 'Fire prevention'],
    //     biography: 'Dominican tertiary, mystic, and Doctor of the Church.',
    //     isDominican: true,
    //     order: 'Dominican Order'
    //   }
    // ];

    // dominicanSaints.forEach(saint => {
    //   this.saints.set(saint.id, saint);
    // });
  }



  // Get feasts for a specific date
  public getFeastsForDate(date: Date): Celebration[] {
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check cache first
    const cached = this.getFromCache(this.feastCache, dateString);
    if (cached) {
      return cached;
    }
    
    // Use new calendar function instead of hardcoded data
    const feasts = getCelebrationsForDate(date);
    
    // Cache the result
    this.setCache(this.feastCache, dateString, feasts);
    
    return feasts;
  }

  // Get all saints
  public getAllSaints(): Saint[] {
    return Array.from(this.saints.values());
  }

  // Get Dominican saints
  public getDominicanSaints(): Saint[] {
    return Array.from(this.saints.values()).filter(saint => saint.isDominican);
  }

  // Get saint by ID
  public getSaintById(id: string): Saint | undefined {
    return this.saints.get(id);
  }

  // Get feasts for a date range
  public getFeastsForDateRange(startDate: Date, endDate: Date): Celebration[] {
    const feasts: Celebration[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayFeasts = this.getFeastsForDate(currentDate);
      feasts.push(...dayFeasts);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return feasts;
  }

  // Get upcoming feasts
  public getUpcomingFeasts(days: number = 30): Celebration[] {
    const today = new Date();
    const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return this.getFeastsForDateRange(today, endDate);
  }

  // Get liturgical season for a date
  public getLiturgicalSeason(date: Date): LiturgicalSeason {
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check cache first
    const cached = this.getFromCache(this.seasonCache, dateString);
    if (cached) {
      return cached;
    }
    
    // Use new calendar function
    const season = getLiturgicalSeason(date);
    
    const liturgicalSeason: LiturgicalSeason = {
      name: season.name,
      color: season.color,
      startDate: '', // Not provided by new functions
      endDate: '',   // Not provided by new functions
      description: season.description
    };
    
    // Cache the result
    this.setCache(this.seasonCache, dateString, liturgicalSeason);
    
    return liturgicalSeason;
  }

  // Check if date is a feast day
  public isFeastDay(date: Date): boolean {
    const dateString = format(date, 'yyyy-MM-dd');
    const feasts = this.getFeastsForDate(date);
    return feasts.length > 0;
  }

  // Get next feast day
  public getNextFeastDay(fromDate: Date = new Date()): Celebration | null {
    const upcomingFeasts = this.getUpcomingFeasts(365);
    return upcomingFeasts.length > 0 ? upcomingFeasts[0] : null;
  }

  // Preload current month and adjacent months for better performance
  public preloadCurrentMonth(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Preload current month
    this.preloadDateRange(firstDay, lastDay);
    
    // Preload previous month
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonthLast = new Date(today.getFullYear(), today.getMonth(), 0);
    this.preloadDateRange(prevMonth, prevMonthLast);
    
    // Preload next month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const nextMonthLast = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    this.preloadDateRange(nextMonth, nextMonthLast);
  }

  // Batch preload for calendar view
  public preloadCalendarView(centerDate: Date): void {
    const startDate = new Date(centerDate);
    startDate.setDate(1); // First day of month
    startDate.setMonth(startDate.getMonth() - 1); // Previous month
    
    const endDate = new Date(centerDate);
    endDate.setMonth(endDate.getMonth() + 2); // Two months ahead
    endDate.setDate(0); // Last day of that month
    
    this.preloadDateRange(startDate, endDate);
  }

  // Cleanup method for service destruction
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clearCache();
  }

  // Get cache hit rate statistics
  public getCacheHitRate(): { liturgicalDays: number; feasts: number; seasons: number } {
    // This would require tracking hits/misses, but for now return cache sizes
    return this.getCacheStats();
  }
}

export default LiturgicalCalendarService;
