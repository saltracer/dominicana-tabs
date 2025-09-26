/**
 * Tests for state management system
 */

import { StateManager } from '../lib/state-manager';
import { globalCache } from '../lib/cache-manager';
import { AppError, ErrorHandler } from '../lib/errors';

// Mock cache manager
jest.mock('../lib/cache-manager', () => ({
  globalCache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    invalidate: jest.fn(),
  },
}));

describe('StateManager', () => {
  let mockFetcher: jest.Mock;
  let stateManager: StateManager<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetcher = jest.fn();
    stateManager = new StateManager(mockFetcher);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(stateManager.getState()).toBeNull();
      expect(stateManager.isLoading()).toBe(false);
      expect(stateManager.getError()).toBeNull();
    });
  });

  describe('Fetching Data', () => {
    it('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetcher.mockResolvedValue(mockData);

      const result = await stateManager.fetch();

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(result.loading).toBe(false);
      expect(stateManager.getState()).toEqual(mockData);
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Fetch failed');
      mockFetcher.mockRejectedValue(mockError);

      const result = await stateManager.fetch();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.loading).toBe(false);
      expect(stateManager.getError()).toBeTruthy();
    });

    it('should use cache when available', async () => {
      const cachedData = { id: 1, name: 'Cached' };
      (globalCache.get as jest.Mock).mockReturnValue(cachedData);

      const result = await stateManager.fetch();

      expect(result.data).toEqual(cachedData);
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    it('should fetch fresh data when cache is empty', async () => {
      (globalCache.get as jest.Mock).mockReturnValue(null);
      const freshData = { id: 1, name: 'Fresh' };
      mockFetcher.mockResolvedValue(freshData);

      const result = await stateManager.fetch();

      expect(result.data).toEqual(freshData);
      expect(mockFetcher).toHaveBeenCalled();
    });

    it('should force refresh when requested', async () => {
      const cachedData = { id: 1, name: 'Cached' };
      const freshData = { id: 2, name: 'Fresh' };
      (globalCache.get as jest.Mock).mockReturnValue(cachedData);
      mockFetcher.mockResolvedValue(freshData);

      const result = await stateManager.fetch(true);

      expect(result.data).toEqual(freshData);
      expect(mockFetcher).toHaveBeenCalled();
    });
  });

  describe('Retry Logic', () => {
    it('should retry on failure', async () => {
      const mockError = new Error('Network error');
      mockFetcher
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValue({ id: 1, name: 'Success' });

      const result = await stateManager.fetch();

      expect(result.data).toEqual({ id: 1, name: 'Success' });
      expect(mockFetcher).toHaveBeenCalledTimes(3);
    });

    it('should not retry on non-retryable errors', async () => {
      const appError = new AppError('VALIDATION_ERROR', 'Invalid input');
      mockFetcher.mockRejectedValue(appError);

      const result = await stateManager.fetch();

      expect(result.error).toBeTruthy();
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    it('should use exponential backoff for retries', async () => {
      const mockError = new Error('Network error');
      mockFetcher
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValue({ id: 1, name: 'Success' });

      const startTime = Date.now();
      await stateManager.fetch();
      const endTime = Date.now();

      // Should have taken at least 1 second (1000ms + 2000ms backoff)
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('State Updates', () => {
    it('should update state directly', () => {
      const newState = { id: 1, name: 'Updated' };
      stateManager.updateState(newState);

      expect(stateManager.getState()).toEqual(newState);
      expect(stateManager.getError()).toBeNull();
    });

    it('should set error state', () => {
      const error = ErrorHandler.createApiError(new Error('Test error'));
      stateManager.setError(error);

      expect(stateManager.getError()).toEqual(error);
      expect(stateManager.isLoading()).toBe(false);
    });

    it('should clear state', () => {
      stateManager.updateState({ id: 1, name: 'Test' });
      stateManager.clear();

      expect(stateManager.getState()).toBeNull();
      expect(stateManager.getError()).toBeNull();
      expect(stateManager.isLoading()).toBe(false);
    });
  });

  describe('Subscriptions', () => {
    it('should notify subscribers on state changes', () => {
      const subscriber = jest.fn();
      const unsubscribe = stateManager.subscribe(subscriber);

      stateManager.updateState({ id: 1, name: 'Test' });

      expect(subscriber).toHaveBeenCalledWith(stateManager);
      expect(subscriber).toHaveBeenCalledTimes(1);

      unsubscribe();
      stateManager.updateState({ id: 2, name: 'Test 2' });

      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple subscribers', () => {
      const subscriber1 = jest.fn();
      const subscriber2 = jest.fn();

      stateManager.subscribe(subscriber1);
      stateManager.subscribe(subscriber2);

      stateManager.updateState({ id: 1, name: 'Test' });

      expect(subscriber1).toHaveBeenCalledWith(stateManager);
      expect(subscriber2).toHaveBeenCalledWith(stateManager);
    });
  });

  describe('Cache Integration', () => {
    it('should set cache after successful fetch', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetcher.mockResolvedValue(mockData);

      const stateManagerWithCache = new StateManager(mockFetcher, {
        enableCache: true,
        cacheKey: 'test-key',
      });

      await stateManagerWithCache.fetch();

      expect(globalCache.set).toHaveBeenCalledWith('test-key', mockData);
    });

    it('should not use cache when disabled', async () => {
      (globalCache.get as jest.Mock).mockReturnValue({ id: 1, name: 'Cached' });
      const mockData = { id: 2, name: 'Fresh' };
      mockFetcher.mockResolvedValue(mockData);

      const stateManagerWithoutCache = new StateManager(mockFetcher, {
        enableCache: false,
      });

      await stateManagerWithoutCache.fetch();

      expect(globalCache.get).not.toHaveBeenCalled();
      expect(mockFetcher).toHaveBeenCalled();
    });

    it('should invalidate cache when requested', () => {
      const stateManagerWithCache = new StateManager(mockFetcher, {
        cacheKey: 'test-key',
      });

      stateManagerWithCache.invalidateCache();

      expect(globalCache.delete).toHaveBeenCalledWith('test-key');
    });
  });

  describe('Loading States', () => {
    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockFetcher.mockReturnValue(promise);

      const fetchPromise = stateManager.fetch();
      expect(stateManager.isLoading()).toBe(true);

      resolvePromise!({ id: 1, name: 'Test' });
      await fetchPromise;

      expect(stateManager.isLoading()).toBe(false);
    });

    it('should not fetch when already loading', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockFetcher.mockReturnValue(promise);

      const fetchPromise1 = stateManager.fetch();
      const fetchPromise2 = stateManager.fetch();

      expect(mockFetcher).toHaveBeenCalledTimes(1);

      resolvePromise!({ id: 1, name: 'Test' });
      await Promise.all([fetchPromise1, fetchPromise2]);

      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle AppError correctly', async () => {
      const appError = new AppError('TEST_ERROR', 'Test error message', { field: 'name' });
      mockFetcher.mockRejectedValue(appError);

      const result = await stateManager.fetch();

      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('TEST_ERROR');
      expect(result.error?.message).toBe('Test error message');
      expect(result.error?.details).toEqual({ field: 'name' });
    });

    it('should handle unknown errors', async () => {
      const unknownError = 'String error';
      mockFetcher.mockRejectedValue(unknownError);

      const result = await stateManager.fetch();

      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('UNKNOWN_ERROR');
      expect(result.error?.message).toBe('An unknown error occurred');
    });
  });

  describe('Configuration', () => {
    it('should use custom retry configuration', async () => {
      const mockError = new Error('Network error');
      mockFetcher
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValue({ id: 1, name: 'Success' });

      const customStateManager = new StateManager(mockFetcher, {
        retryAttempts: 2,
        retryDelay: 500,
      });

      const startTime = Date.now();
      await customStateManager.fetch();
      const endTime = Date.now();

      // Should have taken at least 500ms (500ms + 1000ms backoff)
      expect(endTime - startTime).toBeGreaterThanOrEqual(500);
      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });

    it('should use custom cache configuration', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetcher.mockResolvedValue(mockData);

      const customStateManager = new StateManager(mockFetcher, {
        enableCache: true,
        cacheKey: 'custom-key',
        cacheTtl: 10000,
      });

      await customStateManager.fetch();

      expect(globalCache.set).toHaveBeenCalledWith('custom-key', mockData, 10000);
    });
  });
});

describe('useStateManager Hook', () => {
  it('should create StateManager instance', () => {
    const mockFetcher = jest.fn();
    const stateManager = useStateManager(mockFetcher, { cacheKey: 'test' });

    expect(stateManager).toBeInstanceOf(StateManager);
  });
});
