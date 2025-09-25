import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  networkLatency: number;
  timestamp: string;
}

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

interface PerformanceConfig {
  cacheSize: number;
  maxCacheAge: number;
  enableLazyLoading: boolean;
  enableImageOptimization: boolean;
  enableTextCompression: boolean;
  enableBackgroundProcessing: boolean;
}

class PerformanceService {
  private static readonly CACHE_KEY = 'performance_cache';
  private static readonly METRICS_KEY = 'performance_metrics';
  private static readonly CONFIG_KEY = 'performance_config';

  private cache: Map<string, CacheEntry> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private config: PerformanceConfig = {
    cacheSize: 50 * 1024 * 1024, // 50MB
    maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableTextCompression: true,
    enableBackgroundProcessing: true
  };

  constructor() {
    this.initializePerformance();
  }

  /**
   * Initialize performance service
   */
  private async initializePerformance(): Promise<void> {
    try {
      // Load cache from storage
      await this.loadCache();
      
      // Load performance metrics
      await this.loadMetrics();
      
      // Load configuration
      await this.loadConfig();
      
      // Start background cleanup
      if (this.config.enableBackgroundProcessing) {
        this.startBackgroundCleanup();
      }
      
      console.log('Performance service initialized');
    } catch (error) {
      console.error('Error initializing performance service:', error);
    }
  }

  /**
   * Cache data with automatic cleanup
   */
  async cacheData(key: string, data: any, ttl?: number): Promise<void> {
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      size: this.calculateSize(data),
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Check cache size limit
    await this.enforceCacheSizeLimit();

    this.cache.set(key, entry);
    await this.saveCache();
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    const age = Date.now() - entry.timestamp;
    if (age > this.config.maxCacheAge) {
      this.cache.delete(key);
      await this.saveCache();
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  /**
   * Preload content for better performance
   */
  async preloadContent(content: {
    bookId: string;
    chapters: Array<{ id: string; content: string }>;
  }): Promise<void> {
    if (!this.config.enableLazyLoading) {
      return;
    }

    // Preload chapters in background
    for (const chapter of content.chapters) {
      const key = `chapter_${content.bookId}_${chapter.id}`;
      await this.cacheData(key, chapter.content);
    }
  }

  /**
   * Optimize images for better performance
   */
  async optimizeImage(imageUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}): Promise<string> {
    if (!this.config.enableImageOptimization) {
      return imageUrl;
    }

    // In a real implementation, this would optimize images
    // For now, return the original URL
    return imageUrl;
  }

  /**
   * Compress text content
   */
  async compressText(text: string): Promise<string> {
    if (!this.config.enableTextCompression) {
      return text;
    }

    // Simple text compression (in real implementation, use proper compression)
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Decompress text content
   */
  async decompressText(compressedText: string): Promise<string> {
    // In real implementation, this would decompress text
    return compressedText;
  }

  /**
   * Record performance metrics
   */
  recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    const fullMetrics: PerformanceMetrics = {
      loadTime: metrics.loadTime || 0,
      renderTime: metrics.renderTime || 0,
      memoryUsage: metrics.memoryUsage || 0,
      cacheHitRate: metrics.cacheHitRate || 0,
      networkLatency: metrics.networkLatency || 0,
      timestamp: new Date().toISOString()
    };

    this.metrics.push(fullMetrics);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    this.saveMetrics();
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(): {
    averageLoadTime: number;
    averageRenderTime: number;
    averageMemoryUsage: number;
    cacheHitRate: number;
    recommendations: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageLoadTime: 0,
        averageRenderTime: 0,
        averageMemoryUsage: 0,
        cacheHitRate: 0,
        recommendations: []
      };
    }

    const totalLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0);
    const totalRenderTime = this.metrics.reduce((sum, m) => sum + m.renderTime, 0);
    const totalMemoryUsage = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    const totalCacheHitRate = this.metrics.reduce((sum, m) => sum + m.cacheHitRate, 0);

    const analytics = {
      averageLoadTime: totalLoadTime / this.metrics.length,
      averageRenderTime: totalRenderTime / this.metrics.length,
      averageMemoryUsage: totalMemoryUsage / this.metrics.length,
      cacheHitRate: totalCacheHitRate / this.metrics.length,
      recommendations: this.generateRecommendations()
    };

    return analytics;
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem(PerformanceService.CACHE_KEY);
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): {
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    oldestEntry: string;
    newestEntry: string;
  } {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const totalHits = entries.filter(entry => entry.accessCount > 0).length;
    
    const timestamps = entries.map(entry => entry.timestamp);
    const oldestTimestamp = Math.min(...timestamps);
    const newestTimestamp = Math.max(...timestamps);

    return {
      totalEntries: entries.length,
      totalSize,
      hitRate: totalAccesses > 0 ? (totalHits / totalAccesses) * 100 : 0,
      oldestEntry: new Date(oldestTimestamp).toISOString(),
      newestEntry: new Date(newestTimestamp).toISOString()
    };
  }

  /**
   * Update performance configuration
   */
  async updateConfig(newConfig: Partial<PerformanceConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await this.saveConfig();
  }

  /**
   * Get performance configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    // Start monitoring memory usage, render times, etc.
    console.log('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    // Stop monitoring
    console.log('Performance monitoring stopped');
  }

  /**
   * Load cache from storage
   */
  private async loadCache(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(PerformanceService.CACHE_KEY);
      if (data) {
        const cacheData = JSON.parse(data);
        this.cache = new Map(Object.entries(cacheData));
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }

  /**
   * Save cache to storage
   */
  private async saveCache(): Promise<void> {
    try {
      const cacheData = Object.fromEntries(this.cache);
      await AsyncStorage.setItem(
        PerformanceService.CACHE_KEY,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  /**
   * Load performance metrics
   */
  private async loadMetrics(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(PerformanceService.METRICS_KEY);
      if (data) {
        this.metrics = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }

  /**
   * Save performance metrics
   */
  private async saveMetrics(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        PerformanceService.METRICS_KEY,
        JSON.stringify(this.metrics)
      );
    } catch (error) {
      console.error('Error saving metrics:', error);
    }
  }

  /**
   * Load configuration
   */
  private async loadConfig(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(PerformanceService.CONFIG_KEY);
      if (data) {
        this.config = { ...this.config, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  /**
   * Save configuration
   */
  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        PerformanceService.CONFIG_KEY,
        JSON.stringify(this.config)
      );
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  /**
   * Enforce cache size limit
   */
  private async enforceCacheSizeLimit(): Promise<void> {
    const currentSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);

    if (currentSize > this.config.cacheSize) {
      // Remove oldest entries until under limit
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

      let size = currentSize;
      for (const [key, entry] of entries) {
        if (size <= this.config.cacheSize) break;
        
        this.cache.delete(key);
        size -= entry.size;
      }
    }
  }

  /**
   * Start background cleanup
   */
  private startBackgroundCleanup(): void {
    // Clean up expired cache entries every hour
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60 * 60 * 1000);
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.maxCacheAge) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      this.saveCache();
    }
  }

  /**
   * Calculate data size
   */
  private calculateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const analytics = this.getPerformanceAnalytics();

    if (analytics.averageLoadTime > 3000) {
      recommendations.push('Consider enabling lazy loading for better performance');
    }

    if (analytics.averageMemoryUsage > 100 * 1024 * 1024) { // 100MB
      recommendations.push('High memory usage detected. Consider reducing cache size');
    }

    if (analytics.cacheHitRate < 50) {
      recommendations.push('Low cache hit rate. Consider increasing cache size or TTL');
    }

    if (analytics.averageRenderTime > 1000) {
      recommendations.push('Slow rendering detected. Consider optimizing images and text');
    }

    return recommendations;
  }
}

export default new PerformanceService();