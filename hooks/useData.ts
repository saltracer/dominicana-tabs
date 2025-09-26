/**
 * Standardized data fetching hooks
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResult, ApiError } from '../types/api-types';
import { StateManager, StateManagerConfig } from '../lib/state-manager';
import { AppError, ErrorHandler } from '../lib/errors';

export interface UseDataOptions extends Partial<StateManagerConfig> {
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchInterval?: number;
}

/**
 * Generic data fetching hook
 */
export function useData<T>(
  fetcher: () => Promise<T>,
  options: UseDataOptions = {}
): {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  refetch: (forceRefresh?: boolean) => Promise<ApiResult<T>>;
  mutate: (data: T) => void;
  clear: () => void;
} {
  const [stateManager] = useState(() => new StateManager(fetcher, options));
  const [data, setData] = useState<T | null>(stateManager.getState());
  const [error, setError] = useState<ApiError | null>(stateManager.getError());
  const [loading, setLoading] = useState<boolean>(stateManager.isLoading());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = stateManager.subscribe((manager) => {
      setData(manager.getState());
      setError(manager.getError());
      setLoading(manager.isLoading());
    });

    return unsubscribe;
  }, [stateManager]);

  // Initial fetch
  useEffect(() => {
    if (options.enabled !== false) {
      stateManager.fetch(options.refetchOnMount !== false);
    }
  }, [stateManager, options.enabled, options.refetchOnMount]);

  // Refetch interval
  useEffect(() => {
    if (options.refetchInterval && options.refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        stateManager.fetch(true);
      }, options.refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [stateManager, options.refetchInterval]);

  const refetch = useCallback(async (forceRefresh = false) => {
    return stateManager.fetch(forceRefresh);
  }, [stateManager]);

  const mutate = useCallback((newData: T) => {
    stateManager.updateState(newData);
  }, [stateManager]);

  const clear = useCallback(() => {
    stateManager.clear();
  }, [stateManager]);

  return {
    data,
    error,
    loading,
    refetch,
    mutate,
    clear,
  };
}

/**
 * Hook for fetching data with automatic retry
 */
export function useDataWithRetry<T>(
  fetcher: () => Promise<T>,
  options: UseDataOptions & { retryAttempts?: number; retryDelay?: number } = {}
) {
  const { retryAttempts = 3, retryDelay = 1000, ...restOptions } = options;
  
  return useData(fetcher, {
    ...restOptions,
    retryAttempts,
    retryDelay,
  });
}

/**
 * Hook for fetching data with cache
 */
export function useDataWithCache<T>(
  fetcher: () => Promise<T>,
  cacheKey: string,
  options: UseDataOptions & { cacheTtl?: number } = {}
) {
  const { cacheTtl = 5 * 60 * 1000, ...restOptions } = options;
  
  return useData(fetcher, {
    ...restOptions,
    cacheKey,
    cacheTtl,
  });
}

/**
 * Hook for paginated data
 */
export function usePaginatedData<T>(
  fetcher: (page: number, limit: number) => Promise<{ data: T[]; total: number; page: number; limit: number }>,
  options: UseDataOptions & { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 10, ...restOptions } = options;
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const { data, error, loading, refetch } = useData(
    () => fetcher(currentPage, limit),
    restOptions
  );

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Update pagination info when data changes
  useEffect(() => {
    if (data) {
      setTotalPages(Math.ceil(data.total / data.limit));
      setTotal(data.total);
    }
  }, [data]);

  return {
    data: data?.data || null,
    error,
    loading,
    refetch,
    pagination: {
      currentPage,
      totalPages,
      total,
      limit,
      goToPage,
      nextPage,
      prevPage,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
}

/**
 * Hook for search functionality
 */
export function useSearch<T>(
  fetcher: (query: string, filters?: Record<string, any>) => Promise<T[]>,
  options: UseDataOptions & { debounceMs?: number } = {}
) {
  const { debounceMs = 300, ...restOptions } = options;
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce query
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debounceMs]);

  const { data, error, loading, refetch } = useData(
    () => fetcher(debouncedQuery, filters),
    {
      ...restOptions,
      enabled: debouncedQuery.length > 0,
    }
  );

  const search = useCallback((newQuery: string, newFilters?: Record<string, any>) => {
    setQuery(newQuery);
    if (newFilters) {
      setFilters(newFilters);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setFilters({});
  }, []);

  return {
    data,
    error,
    loading,
    refetch,
    query,
    filters,
    search,
    clearSearch,
  };
}
