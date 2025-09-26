/**
 * Centralized state management system
 */

import { ApiResult, ApiError } from '../types/api-types';
import { AppError, ErrorHandler } from './errors';
import { globalCache } from './cache-manager';

export interface StateManagerConfig {
  enableCache: boolean;
  cacheKey?: string;
  retryAttempts: number;
  retryDelay: number;
}

export class StateManager<T> {
  private state: T | null = null;
  private loading = false;
  private error: ApiError | null = null;
  private subscribers = new Set<(state: StateManager<T>) => void>();
  private config: StateManagerConfig;

  constructor(
    private fetcher: () => Promise<T>,
    config: Partial<StateManagerConfig> = {}
  ) {
    this.config = {
      enableCache: true,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Get current state
   */
  getState(): T | null {
    return this.state;
  }

  /**
   * Get loading state
   */
  isLoading(): boolean {
    return this.loading;
  }

  /**
   * Get error state
   */
  getError(): ApiError | null {
    return this.error;
  }

  /**
   * Get complete result
   */
  getResult(): ApiResult<T> {
    return {
      data: this.state,
      error: this.error,
      loading: this.loading,
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: StateManager<T>) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Fetch data with caching and retry logic
   */
  async fetch(forceRefresh = false): Promise<ApiResult<T>> {
    if (this.loading) {
      return this.getResult();
    }

    // Check cache first
    if (this.config.enableCache && this.config.cacheKey && !forceRefresh) {
      const cached = globalCache.get<T>(this.config.cacheKey);
      if (cached) {
        this.state = cached;
        this.error = null;
        this.loading = false;
        this.notifySubscribers();
        return this.getResult();
      }
    }

    this.loading = true;
    this.error = null;
    this.notifySubscribers();

    try {
      const data = await this.fetchWithRetry();
      this.state = data;
      this.error = null;

      // Cache the result
      if (this.config.enableCache && this.config.cacheKey) {
        globalCache.set(this.config.cacheKey, data);
      }

      this.loading = false;
      this.notifySubscribers();
      return this.getResult();
    } catch (error) {
      this.error = ErrorHandler.createApiError(error);
      this.loading = false;
      this.notifySubscribers();
      return this.getResult();
    }
  }

  /**
   * Update state directly
   */
  updateState(newState: T): void {
    this.state = newState;
    this.error = null;
    this.notifySubscribers();
  }

  /**
   * Set error state
   */
  setError(error: ApiError): void {
    this.error = error;
    this.loading = false;
    this.notifySubscribers();
  }

  /**
   * Clear state
   */
  clear(): void {
    this.state = null;
    this.error = null;
    this.loading = false;
    this.notifySubscribers();
  }

  /**
   * Invalidate cache
   */
  invalidateCache(): void {
    if (this.config.cacheKey) {
      globalCache.delete(this.config.cacheKey);
    }
  }

  /**
   * Fetch with retry logic
   */
  private async fetchWithRetry(): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await this.fetcher();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof AppError && !ErrorHandler.shouldRetry(error)) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt - 1));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Notify all subscribers
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this));
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Hook for using state manager in React components
 */
export function useStateManager<T>(
  fetcher: () => Promise<T>,
  config?: Partial<StateManagerConfig>
): StateManager<T> {
  return new StateManager(fetcher, config);
}
