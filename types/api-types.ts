/**
 * Centralized API and data types for the application
 */

export interface ApiResult<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum cache size
  enabled: boolean;
}

export interface ServiceConfig {
  cache: CacheConfig;
  retry: {
    maxAttempts: number;
    delay: number;
  };
  timeout: number;
}
