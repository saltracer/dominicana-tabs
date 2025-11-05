/**
 * Artwork Cache Service
 * Pre-resolves and caches artwork paths with batch verification to eliminate redundant fileExists checks
 */

import { imagePathForUrl, fileExists, ensureImageCached } from '../lib/podcast/storage';

export interface ArtworkCacheEntry {
  url: string;
  localPath: string | null;
  verified: boolean;
  verifiedAt: number;
  size?: number;
}

export class ArtworkCache {
  private static cache = new Map<string, ArtworkCacheEntry>();
  private static readonly VERIFICATION_TTL = 5 * 60 * 1000; // 5 minutes
  private static pendingDownloads = new Map<string, Promise<string | null>>();

  /**
   * Get artwork path for URL (returns cached result or triggers background download)
   */
  static async get(url: string): Promise<string | null> {
    if (!url) return null;

    const cached = this.cache.get(url);
    
    // Return cached path if verified recently
    if (cached?.verified) {
      const now = Date.now();
      if (now - cached.verifiedAt <= this.VERIFICATION_TTL) {
        return cached.localPath;
      }
    }

    // Check if download is already pending
    const pending = this.pendingDownloads.get(url);
    if (pending) {
      return pending;
    }

    // Start new download/verification
    const downloadPromise = this.fetchAndCache(url);
    this.pendingDownloads.set(url, downloadPromise);

    try {
      const result = await downloadPromise;
      return result;
    } finally {
      this.pendingDownloads.delete(url);
    }
  }

  /**
   * Get artwork paths for multiple URLs in batch (optimized)
   */
  static async getMany(urls: string[]): Promise<Map<string, string | null>> {
    if (urls.length === 0) return new Map();

    const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
    const result = new Map<string, string | null>();
    const toFetch: string[] = [];
    const now = Date.now();

    // First pass: collect cached and mark what needs fetching
    for (const url of uniqueUrls) {
      const cached = this.cache.get(url);
      
      if (cached?.verified && now - cached.verifiedAt <= this.VERIFICATION_TTL) {
        // Recent verified cache hit
        result.set(url, cached.localPath);
      } else {
        // Needs fetching/verification
        toFetch.push(url);
      }
    }

    // Batch fetch missing/stale URLs
    if (toFetch.length > 0) {
      const fetched = await this.batchFetchAndCache(toFetch);
      fetched.forEach((path, url) => {
        result.set(url, path);
      });
    }

    return result;
  }

  /**
   * Batch verify artwork paths (check fileExists for all at once)
   */
  static async batchVerify(urls: string[]): Promise<Map<string, boolean>> {
    if (urls.length === 0) return new Map();

    const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
    const pathPromises = uniqueUrls.map(async url => {
      const path = await imagePathForUrl(url);
      return { url, path };
    });

    const paths = await Promise.all(pathPromises);
    
    // Check existence in parallel
    const existsPromises = paths.map(async ({ url, path }) => {
      const exists = await fileExists(path);
      return { url, path, exists };
    });

    const results = await Promise.all(existsPromises);
    const verificationMap = new Map<string, boolean>();
    const now = Date.now();

    results.forEach(({ url, path, exists }) => {
      verificationMap.set(url, exists);
      
      // Update cache with verification result
      this.cache.set(url, {
        url,
        localPath: exists ? path : null,
        verified: true,
        verifiedAt: now,
      });
    });

    if (__DEV__) {
      const verified = Array.from(verificationMap.values()).filter(Boolean).length;
      console.log(`[ArtworkCache] Batch verified ${verified}/${urls.length} artwork files`);
    }

    return verificationMap;
  }

  /**
   * Prefetch and cache artwork for URLs
   */
  static async prefetch(urls: string[]): Promise<void> {
    if (urls.length === 0) return;

    const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
    
    // Don't block on this, run in background
    void this.batchFetchAndCache(uniqueUrls);
  }

  /**
   * Invalidate cache entry for URL
   */
  static invalidate(url: string): void {
    this.cache.delete(url);
  }

  /**
   * Invalidate multiple URLs
   */
  static invalidateMany(urls: string[]): void {
    urls.forEach(url => this.cache.delete(url));
  }

  /**
   * Clear all cached artwork data
   */
  static clear(): void {
    this.cache.clear();
    this.pendingDownloads.clear();
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    size: number;
    verified: number;
    pending: number;
  } {
    let verified = 0;
    const now = Date.now();

    this.cache.forEach(entry => {
      if (entry.verified && now - entry.verifiedAt <= this.VERIFICATION_TTL) {
        verified++;
      }
    });

    return {
      size: this.cache.size,
      verified,
      pending: this.pendingDownloads.size,
    };
  }

  /**
   * Internal: fetch and cache single artwork
   */
  private static async fetchAndCache(url: string): Promise<string | null> {
    try {
      const path = await imagePathForUrl(url);
      const exists = await fileExists(path);

      if (exists) {
        // Already cached on disk
        this.cache.set(url, {
          url,
          localPath: path,
          verified: true,
          verifiedAt: Date.now(),
        });
        return path;
      }

      // Download and cache
      const { path: downloadedPath } = await ensureImageCached(url);
      
      this.cache.set(url, {
        url,
        localPath: downloadedPath,
        verified: true,
        verifiedAt: Date.now(),
      });

      return downloadedPath;
    } catch (error) {
      if (__DEV__) {
        console.warn(`[ArtworkCache] Failed to fetch artwork for ${url}:`, error);
      }

      // Cache the failure
      this.cache.set(url, {
        url,
        localPath: null,
        verified: true,
        verifiedAt: Date.now(),
      });

      return null;
    }
  }

  /**
   * Internal: batch fetch and cache multiple artworks
   */
  private static async batchFetchAndCache(urls: string[]): Promise<Map<string, string | null>> {
    const result = new Map<string, string | null>();

    // First, get all paths
    const pathMappings = await Promise.all(
      urls.map(async url => ({
        url,
        path: await imagePathForUrl(url),
      }))
    );

    // Check which ones exist in parallel
    const existsChecks = await Promise.all(
      pathMappings.map(async ({ url, path }) => ({
        url,
        path,
        exists: await fileExists(path),
      }))
    );

    const now = Date.now();
    const toDownload: typeof existsChecks = [];

    // Process existing files
    existsChecks.forEach(({ url, path, exists }) => {
      if (exists) {
        result.set(url, path);
        this.cache.set(url, {
          url,
          localPath: path,
          verified: true,
          verifiedAt: now,
        });
      } else {
        toDownload.push({ url, path, exists: false });
      }
    });

    // Download missing files in parallel (with concurrency limit)
    const CONCURRENCY = 3;
    const downloadBatches: typeof toDownload[] = [];
    for (let i = 0; i < toDownload.length; i += CONCURRENCY) {
      downloadBatches.push(toDownload.slice(i, i + CONCURRENCY));
    }

    for (const batch of downloadBatches) {
      const downloads = await Promise.allSettled(
        batch.map(async ({ url }) => {
          try {
            const { path } = await ensureImageCached(url);
            return { url, path };
          } catch (error) {
            if (__DEV__) {
              console.warn(`[ArtworkCache] Failed to download ${url}:`, error);
            }
            return { url, path: null };
          }
        })
      );

      downloads.forEach(download => {
        if (download.status === 'fulfilled') {
          const { url, path } = download.value;
          result.set(url, path);
          this.cache.set(url, {
            url,
            localPath: path,
            verified: true,
            verifiedAt: now,
          });
        }
      });
    }

    // Cache failures for URLs that weren't downloaded
    toDownload.forEach(({ url }) => {
      if (!result.has(url)) {
        result.set(url, null);
        this.cache.set(url, {
          url,
          localPath: null,
          verified: true,
          verifiedAt: now,
        });
      }
    });

    if (__DEV__) {
      const successful = Array.from(result.values()).filter(Boolean).length;
      console.log(`[ArtworkCache] Batch processed ${successful}/${urls.length} artworks`);
    }

    return result;
  }
}

