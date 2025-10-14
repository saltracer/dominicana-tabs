/**
 * Cache Type Definitions
 */

export interface CoverCacheEntry {
  filename: string;
  size: number;
  url: string;
  etag?: string;
  lastAccessed: number;
  lastUpdated: number;
  cachedAt: number;
}

export interface CoverCacheMetadata {
  [bookId: string]: CoverCacheEntry;
}

export interface EpubCacheEntry {
  filename: string;
  size: number;
  downloadedAt: number;
  bookTitle: string;
  localPath: string;
}

export interface EpubCacheMetadata {
  [bookId: string]: EpubCacheEntry;
}

export interface CacheSettings {
  coverArtMaxSize: number; // bytes
  coverCacheTTL: number; // milliseconds
  lastCoverUpdateCheck: number;
  enableETagChecking: boolean;
}

export interface CacheStats {
  covers: {
    totalSize: number;
    count: number;
    limit: number;
  };
  epubs: {
    totalSize: number;
    count: number;
  };
  total: {
    size: number;
    count: number;
  };
}

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

