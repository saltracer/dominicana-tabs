/**
 * Comprehensive tests for refactored components
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useData, useDataWithRetry, useDataWithCache, usePaginatedData, useSearch } from '../hooks/useData';
import { useBooks, useBooksByCategory, useBookSearch, useBook, useBooksWithFilters, useBookStats } from '../hooks/useBooksRefactored';
import { bookRepository } from '../lib/service-container';
import { globalCache } from '../lib/cache-manager';
import { AppError } from '../lib/errors';

// Mock the service container
jest.mock('../lib/service-container', () => ({
  bookRepository: {
    getAll: jest.fn(),
    getById: jest.fn(),
    searchBooks: jest.fn(),
    getByCategory: jest.fn(),
    search: jest.fn(),
  },
}));

// Mock the cache manager
jest.mock('../lib/cache-manager', () => ({
  globalCache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    invalidate: jest.fn(),
  },
}));

describe('useData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetcher = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useData(mockFetcher));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('should handle errors correctly', async () => {
    const mockError = new Error('Test error');
    const mockFetcher = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useData(mockFetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toBe('Test error');
  });

  it('should refetch data when refetch is called', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetcher = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useData(mockFetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });

  it('should mutate data when mutate is called', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetcher = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useData(mockFetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newData = { id: 2, name: 'Updated' };
    act(() => {
      result.current.mutate(newData);
    });

    expect(result.current.data).toEqual(newData);
  });

  it('should clear data when clear is called', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetcher = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useData(mockFetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});

describe('useDataWithRetry Hook', () => {
  it('should retry on failure', async () => {
    const mockFetcher = jest.fn()
      .mockRejectedValueOnce(new Error('First attempt failed'))
      .mockRejectedValueOnce(new Error('Second attempt failed'))
      .mockResolvedValue({ id: 1, name: 'Success' });

    const { result } = renderHook(() => useDataWithRetry(mockFetcher, { retryAttempts: 3 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetcher).toHaveBeenCalledTimes(3);
    expect(result.current.data).toEqual({ id: 1, name: 'Success' });
  });
});

describe('useDataWithCache Hook', () => {
  it('should use cache when available', async () => {
    const cachedData = { id: 1, name: 'Cached' };
    (globalCache.get as jest.Mock).mockReturnValue(cachedData);

    const mockFetcher = jest.fn().mockResolvedValue({ id: 2, name: 'Fresh' });

    const { result } = renderHook(() => useDataWithCache(mockFetcher, 'test-key'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(cachedData);
    expect(mockFetcher).not.toHaveBeenCalled();
  });
});

describe('usePaginatedData Hook', () => {
  it('should handle pagination correctly', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
      total: 10,
      page: 1,
      limit: 2,
    });

    const { result } = renderHook(() => usePaginatedData(mockFetcher, { page: 1, limit: 2 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.totalPages).toBe(5);
    expect(result.current.pagination.total).toBe(10);
    expect(result.current.pagination.hasNext).toBe(true);
    expect(result.current.pagination.hasPrev).toBe(false);
  });
});

describe('useSearch Hook', () => {
  it('should debounce search queries', async () => {
    const mockFetcher = jest.fn().mockResolvedValue([{ id: 1, name: 'Test' }]);

    const { result } = renderHook(() => useSearch(mockFetcher, { debounceMs: 100 }));

    act(() => {
      result.current.search('test');
    });

    // Should not call fetcher immediately
    expect(mockFetcher).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalledWith('test', {});
    }, { timeout: 200 });
  });
});

describe('useBooks Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all books', async () => {
    const mockBooks = [{ id: 1, title: 'Book 1' }, { id: 2, title: 'Book 2' }];
    (bookRepository.getAll as jest.Mock).mockResolvedValue({ data: mockBooks, error: null });

    const { result } = renderHook(() => useBooks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBooks);
    expect(bookRepository.getAll).toHaveBeenCalled();
  });

  it('should handle errors when fetching books', async () => {
    const mockError = new AppError('DATABASE_ERROR', 'Failed to fetch books');
    (bookRepository.getAll as jest.Mock).mockResolvedValue({ data: null, error: mockError });

    const { result } = renderHook(() => useBooks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeTruthy();
  });
});

describe('useBooksByCategory Hook', () => {
  it('should fetch books by category', async () => {
    const mockBooks = [{ id: 1, title: 'Theology Book', category: 'Theology' }];
    (bookRepository.getByCategory as jest.Mock).mockResolvedValue({ data: mockBooks, error: null });

    const { result } = renderHook(() => useBooksByCategory('Theology'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBooks);
    expect(bookRepository.getByCategory).toHaveBeenCalledWith('Theology');
  });

  it('should fetch all books when category is "all"', async () => {
    const mockBooks = [{ id: 1, title: 'Book 1' }, { id: 2, title: 'Book 2' }];
    (bookRepository.getAll as jest.Mock).mockResolvedValue({ data: mockBooks, error: null });

    const { result } = renderHook(() => useBooksByCategory('all'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBooks);
    expect(bookRepository.getAll).toHaveBeenCalled();
  });
});

describe('useBookSearch Hook', () => {
  it('should search books with query', async () => {
    const mockBooks = [{ id: 1, title: 'Search Result' }];
    (bookRepository.searchBooks as jest.Mock).mockResolvedValue({ data: mockBooks, error: null });

    const { result } = renderHook(() => useBookSearch());

    act(() => {
      result.current.search('test query');
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockBooks);
    });

    expect(bookRepository.searchBooks).toHaveBeenCalledWith({
      query: 'test query',
      filters: {},
      category: undefined,
      author: undefined,
      year: undefined,
    });
  });
});

describe('useBook Hook', () => {
  it('should fetch single book by ID', async () => {
    const mockBook = { id: 1, title: 'Single Book' };
    (bookRepository.getById as jest.Mock).mockResolvedValue({ data: mockBook, error: null });

    const { result } = renderHook(() => useBook(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBook);
    expect(bookRepository.getById).toHaveBeenCalledWith(1);
  });

  it('should not fetch when bookId is not provided', () => {
    const { result } = renderHook(() => useBook(''));

    expect(result.current.loading).toBe(false);
    expect(bookRepository.getById).not.toHaveBeenCalled();
  });
});

describe('useBooksWithFilters Hook', () => {
  it('should fetch books with filters', async () => {
    const mockBooks = [{ id: 1, title: 'Filtered Book' }];
    (bookRepository.searchBooks as jest.Mock).mockResolvedValue({ data: mockBooks, error: null });

    const filters = {
      category: 'Theology' as const,
      author: 'Thomas Aquinas',
      year: '2023',
      searchQuery: 'test',
    };

    const { result } = renderHook(() => useBooksWithFilters(filters));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBooks);
    expect(bookRepository.searchBooks).toHaveBeenCalledWith({
      query: 'test',
      category: 'Theology',
      author: 'Thomas Aquinas',
      year: '2023',
    });
  });
});

describe('useBookStats Hook', () => {
  it('should calculate book statistics', async () => {
    const mockBooks = [
      { id: 1, title: 'Book 1', author: 'Author 1', category: 'Theology', year: '2023' },
      { id: 2, title: 'Book 2', author: 'Author 2', category: 'Philosophy', year: '2023' },
      { id: 3, title: 'Book 3', author: 'Author 1', category: 'Theology', year: '2022' },
    ];

    (bookRepository.getAll as jest.Mock).mockResolvedValue({ data: mockBooks, error: null });
    (bookRepository.search as jest.Mock).mockResolvedValue({ data: mockBooks, error: null });

    const { result } = renderHook(() => useBookStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      totalBooks: 3,
      categoryCounts: { Theology: 2, Philosophy: 1 },
      totalAuthors: 2,
      totalYears: 2,
    });
  });
});

describe('Error Handling', () => {
  it('should handle AppError correctly', async () => {
    const appError = new AppError('VALIDATION_ERROR', 'Invalid input', { field: 'name' });
    const mockFetcher = jest.fn().mockRejectedValue(appError);

    const { result } = renderHook(() => useData(mockFetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.code).toBe('VALIDATION_ERROR');
    expect(result.current.error?.message).toBe('Invalid input');
    expect(result.current.error?.details).toEqual({ field: 'name' });
  });
});

describe('Cache Integration', () => {
  it('should use cache when available', async () => {
    const cachedData = { id: 1, name: 'Cached' };
    (globalCache.get as jest.Mock).mockReturnValue(cachedData);

    const mockFetcher = jest.fn().mockResolvedValue({ id: 2, name: 'Fresh' });

    const { result } = renderHook(() => useDataWithCache(mockFetcher, 'test-key'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(cachedData);
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('should fetch fresh data when cache is empty', async () => {
    (globalCache.get as jest.Mock).mockReturnValue(null);

    const freshData = { id: 1, name: 'Fresh' };
    const mockFetcher = jest.fn().mockResolvedValue(freshData);

    const { result } = renderHook(() => useDataWithCache(mockFetcher, 'test-key'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(freshData);
    expect(mockFetcher).toHaveBeenCalled();
    expect(globalCache.set).toHaveBeenCalledWith('test-key', freshData, undefined);
  });
});
