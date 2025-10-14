/**
 * Cache Configuration Constants
 */

export const CACHE_CONFIG = {
  // Cover Art
  COVER_ART_MAX_SIZE: 50 * 1024 * 1024, // 50 MB
  COVER_ART_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  ENABLE_ETAG_CHECKING: true,
  
  // Downloads
  MAX_CONCURRENT_DOWNLOADS: 3,
  DOWNLOAD_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  
  // Storage Keys
  COVER_CACHE_METADATA_KEY: 'cover-art-cache-metadata',
  EPUB_CACHE_METADATA_KEY: 'epub-cache-metadata',
  CACHE_SETTINGS_KEY: 'cache-settings',
  
  // Directory Names
  COVER_DIR: 'covers',
  EPUB_DIR: 'epubs',
};

export const DEFAULT_CACHE_SETTINGS = {
  coverArtMaxSize: CACHE_CONFIG.COVER_ART_MAX_SIZE,
  coverCacheTTL: CACHE_CONFIG.COVER_ART_TTL,
  lastCoverUpdateCheck: 0,
  enableETagChecking: CACHE_CONFIG.ENABLE_ETAG_CHECKING,
};

