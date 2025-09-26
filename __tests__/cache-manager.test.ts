/**
 * Tests for cache manager system
 */

import { CacheManager } from '../lib/cache-manager';
import { CacheConfig } from '../types/api-types';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let config: CacheConfig;

  beforeEach(() => {
    config = {
      ttl: 1000, // 1 second
      maxSize: 3,
      enabled: true,
    };
    cacheManager = new CacheManager(config);
  });

  describe('Basic Operations', () => {
    it('should set and get data', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };

      cacheManager.set(key, data);
      const result = cacheManager.get(key);

      expect(result).toEqual(data);
    });

    it('should return null for non-existent key', () => {
      const result = cacheManager.get('non-existent');
      expect(result).toBeNull();
    });

    it('should check if key exists', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };

      expect(cacheManager.has(key)).toBe(false);

      cacheManager.set(key, data);
      expect(cacheManager.has(key)).toBe(true);
    });

    it('should delete specific key', () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };

      cacheManager.set(key, data);
      expect(cacheManager.has(key)).toBe(true);

      const deleted = cacheManager.delete(key);
      expect(deleted).toBe(true);
      expect(cacheManager.has(key)).toBe(false);
    });

    it('should clear all data', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');

      cacheManager.clear();

      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBeNull();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire data after TTL', async () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };

      cacheManager.set(key, data);
      expect(cacheManager.get(key)).toEqual(data);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(cacheManager.get(key)).toBeNull();
    });

    it('should not expire data before TTL', async () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };

      cacheManager.set(key, data);

      // Wait for half of TTL
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(cacheManager.get(key)).toEqual(data);
    });

    it('should use custom TTL when provided', async () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test' };
      const customTtl = 500; // 0.5 seconds

      cacheManager.set(key, data, customTtl);

      // Wait for custom TTL to expire
      await new Promise(resolve => setTimeout(resolve, 600));

      expect(cacheManager.get(key)).toBeNull();
    });
  });

  describe('Cache Size Management', () => {
    it('should respect max size limit', () => {
      // Fill cache to max size
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.set('key3', 'value3');

      // Add one more item (should trigger eviction)
      cacheManager.set('key4', 'value4');

      // Should have evicted least used item
      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBe('value2');
      expect(cacheManager.get('key3')).toBe('value3');
      expect(cacheManager.get('key4')).toBe('value4');
    });

    it('should evict least used items', () => {
      // Fill cache
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.set('key3', 'value3');

      // Access key2 and key3 to make them more recently used
      cacheManager.get('key2');
      cacheManager.get('key3');

      // Add new item (should evict key1 as least used)
      cacheManager.set('key4', 'value4');

      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBe('value2');
      expect(cacheManager.get('key3')).toBe('value3');
      expect(cacheManager.get('key4')).toBe('value4');
    });

    it('should handle multiple evictions when needed', () => {
      const largeConfig = {
        ttl: 1000,
        maxSize: 2,
        enabled: true,
      };
      const smallCache = new CacheManager(largeConfig);

      // Fill cache
      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');

      // Add item that requires evicting 25% (0.5 items, rounded up to 1)
      smallCache.set('key3', 'value3');

      // Should have evicted 1 item
      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.get('key3')).toBe('value3');
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate by pattern', () => {
      cacheManager.set('user:1', 'user1');
      cacheManager.set('user:2', 'user2');
      cacheManager.set('post:1', 'post1');
      cacheManager.set('post:2', 'post2');

      // Invalidate all user entries
      cacheManager.invalidate('user:.*');

      expect(cacheManager.get('user:1')).toBeNull();
      expect(cacheManager.get('user:2')).toBeNull();
      expect(cacheManager.get('post:1')).toBe('post1');
      expect(cacheManager.get('post:2')).toBe('post2');
    });

    it('should handle invalid pattern gracefully', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');

      // Invalid regex should not affect cache
      cacheManager.invalidate('invalid[regex');

      expect(cacheManager.get('key1')).toBe('value1');
      expect(cacheManager.get('key2')).toBe('value2');
    });
  });

  describe('Cache Statistics', () => {
    it('should provide cache statistics', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');

      const stats = cacheManager.getStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(3);
      expect(stats.enabled).toBe(true);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toHaveProperty('key');
      expect(stats.entries[0]).toHaveProperty('age');
      expect(stats.entries[0]).toHaveProperty('accessCount');
      expect(stats.entries[0]).toHaveProperty('lastAccessed');
    });

    it('should track access count and last accessed time', () => {
      cacheManager.set('key1', 'value1');

      // Access the key multiple times
      cacheManager.get('key1');
      cacheManager.get('key1');

      const stats = cacheManager.getStats();
      const entry = stats.entries.find(e => e.key === 'key1');

      expect(entry?.accessCount).toBe(2);
      expect(entry?.lastAccessed).toBeGreaterThan(0);
    });
  });

  describe('Cache Disabled', () => {
    it('should not store data when cache is disabled', () => {
      const disabledConfig = {
        ttl: 1000,
        maxSize: 3,
        enabled: false,
      };
      const disabledCache = new CacheManager(disabledConfig);

      disabledCache.set('key1', 'value1');
      expect(disabledCache.get('key1')).toBeNull();
      expect(disabledCache.has('key1')).toBe(false);
    });

    it('should not check cache when disabled', () => {
      const disabledConfig = {
        ttl: 1000,
        maxSize: 3,
        enabled: false,
      };
      const disabledCache = new CacheManager(disabledConfig);

      expect(disabledCache.get('key1')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined values', () => {
      cacheManager.set('null-key', null);
      cacheManager.set('undefined-key', undefined);

      expect(cacheManager.get('null-key')).toBeNull();
      expect(cacheManager.get('undefined-key')).toBeUndefined();
    });

    it('should handle empty strings and zero values', () => {
      cacheManager.set('empty-string', '');
      cacheManager.set('zero', 0);
      cacheManager.set('false', false);

      expect(cacheManager.get('empty-string')).toBe('');
      expect(cacheManager.get('zero')).toBe(0);
      expect(cacheManager.get('false')).toBe(false);
    });

    it('should handle large objects', () => {
      const largeObject = {
        id: 1,
        data: new Array(1000).fill('test'),
        nested: {
          level1: {
            level2: {
              level3: 'deep value',
            },
          },
        },
      };

      cacheManager.set('large-object', largeObject);
      const result = cacheManager.get('large-object');

      expect(result).toEqual(largeObject);
    });

    it('should handle concurrent access', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => {
        return new Promise<void>(resolve => {
          setTimeout(() => {
            cacheManager.set(`key${i}`, `value${i}`);
            resolve();
          }, Math.random() * 10);
        });
      });

      await Promise.all(promises);
      
      // All keys should be set (some may be evicted due to size limits)
      let foundCount = 0;
      for (let i = 0; i < 10; i++) {
        if (cacheManager.get(`key${i}`) === `value${i}`) {
          foundCount++;
        }
      }
      
      // Should have at least some keys (due to size limits, not all may be present)
      expect(foundCount).toBeGreaterThan(0);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory with expired entries', async () => {
      // Set many entries
      for (let i = 0; i < 100; i++) {
        cacheManager.set(`key${i}`, `value${i}`);
      }

      const initialStats = cacheManager.getStats();

      // Wait for all entries to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Access expired entries (should be cleaned up)
      for (let i = 0; i < 100; i++) {
        cacheManager.get(`key${i}`);
      }

      const finalStats = cacheManager.getStats();

      // Should have cleaned up expired entries
      expect(finalStats.size).toBe(0);
      expect(finalStats.size).toBeLessThan(initialStats.size);
    });

    it('should handle rapid set/get operations', () => {
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        cacheManager.set(`key${i}`, `value${i}`);
        cacheManager.get(`key${i}`);
      }

      const stats = cacheManager.getStats();
      expect(stats.size).toBeLessThanOrEqual(config.maxSize);
    });
  });

  describe('Configuration Changes', () => {
    it('should handle TTL changes', () => {
      const shortTtlCache = new CacheManager({
        ttl: 100,
        maxSize: 10,
        enabled: true,
      });

      shortTtlCache.set('key1', 'value1');

      // Should still be valid
      expect(shortTtlCache.get('key1')).toBe('value1');

      // Wait for TTL to expire
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(shortTtlCache.get('key1')).toBeNull();
          resolve();
        }, 150);
      });
    });

    it('should handle max size changes', () => {
      const smallCache = new CacheManager({
        ttl: 1000,
        maxSize: 2,
        enabled: true,
      });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      // Should have evicted one item
      const stats = smallCache.getStats();
      expect(stats.size).toBeLessThanOrEqual(2);
    });
  });
});
