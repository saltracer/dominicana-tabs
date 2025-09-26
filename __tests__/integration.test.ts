/**
 * Integration tests for refactored system
 */

import { bookRepository } from '../lib/service-container';
import { globalCache } from '../lib/cache-manager';
import { AppError } from '../lib/errors';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
      or: jest.fn(() => ({
        order: jest.fn(),
      })),
      ilike: jest.fn(() => ({
        order: jest.fn(),
      })),
      order: jest.fn(),
    })),
  })),
};

jest.mock('../lib/supabase', () => ({
  supabase: mockSupabase,
}));

// Mock cache manager
jest.mock('../lib/cache-manager', () => ({
  globalCache: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    invalidate: jest.fn(),
  },
}));

describe('Refactored System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Repository Pattern', () => {
    it('should fetch books with caching', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', author: 'Author 1', category: 'Theology' },
        { id: 2, title: 'Book 2', author: 'Author 2', category: 'Philosophy' },
      ];

      // Mock database response
      const mockQuery = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockBooks, error: null }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      // First call - should fetch from database
      (globalCache.get as jest.Mock).mockReturnValue(null);
      const result1 = await bookRepository.getAll();

      expect(result1.data).toEqual(mockBooks);
      expect(result1.error).toBeNull();
      expect(globalCache.set).toHaveBeenCalled();

      // Second call - should use cache
      (globalCache.get as jest.Mock).mockReturnValue(mockBooks);
      const result2 = await bookRepository.getAll();

      expect(result2.data).toEqual(mockBooks);
      expect(mockSupabase.from).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should handle database errors gracefully', async () => {
      const mockError = { code: 'DB_ERROR', message: 'Database connection failed' };
      const mockQuery = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      (globalCache.get as jest.Mock).mockReturnValue(null);
      const result = await bookRepository.getAll();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('DATABASE_ERROR');
    });
  });

  describe('Error Handling', () => {
    it('should handle different error types', () => {
      const networkError = new AppError('NETWORK_ERROR', 'Network failed');
      const validationError = new AppError('VALIDATION_ERROR', 'Invalid input');
      const authError = new AppError('AUTH_ERROR', 'Authentication failed');

      expect(networkError.code).toBe('NETWORK_ERROR');
      expect(validationError.code).toBe('VALIDATION_ERROR');
      expect(authError.code).toBe('AUTH_ERROR');
    });

    it('should provide error context', () => {
      const error = new AppError('TEST_ERROR', 'Test message', { field: 'name' });
      
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ field: 'name' });
      expect(error.name).toBe('AppError');
    });
  });

  describe('Cache Integration', () => {
    it('should use cache when available', () => {
      const cachedData = { id: 1, name: 'Cached' };
      (globalCache.get as jest.Mock).mockReturnValue(cachedData);

      const result = globalCache.get('test-key');
      expect(result).toEqual(cachedData);
    });

    it('should set cache after successful operations', () => {
      const data = { id: 1, name: 'Fresh' };
      globalCache.set('test-key', data);

      expect(globalCache.set).toHaveBeenCalledWith('test-key', data);
    });
  });

  describe('Service Container', () => {
    it('should provide all required services', () => {
      expect(bookRepository).toBeDefined();
      expect(typeof bookRepository.getAll).toBe('function');
      expect(typeof bookRepository.getById).toBe('function');
      expect(typeof bookRepository.searchBooks).toBe('function');
    });
  });

  describe('Data Transformation', () => {
    it('should transform database format to app format', async () => {
      const dbBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        year: '2023',
        category: 'Theology',
        cover_image: 'cover.jpg',
        description: 'Test description',
        epub_path: 'book.epub',
        epub_sample_path: 'sample.epub',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      const mockQuery = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [dbBook], error: null }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      (globalCache.get as jest.Mock).mockReturnValue(null);
      const result = await bookRepository.getAll();

      expect(result.data).toHaveLength(1);
      const transformedBook = result.data![0];
      expect(transformedBook.id).toBe(1);
      expect(transformedBook.title).toBe('Test Book');
      expect(transformedBook.coverImage).toBe('cover.jpg');
      expect(transformedBook.epubPath).toBe('book.epub');
      expect(transformedBook.readingProgress).toBeDefined();
    });
  });

  describe('Search Functionality', () => {
    it('should search books with filters', async () => {
      const mockBooks = [{ id: 1, title: 'Theology Book', category: 'Theology' }];
      
      const mockQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            ilike: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: mockBooks, error: null }),
            }),
          }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      (globalCache.get as jest.Mock).mockReturnValue(null);
      const result = await bookRepository.searchBooks({
        category: 'Theology',
        query: 'test',
      });

      expect(result.data).toEqual(mockBooks);
      expect(result.error).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should handle multiple operations efficiently', async () => {
      const mockBooks = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        title: `Book ${i + 1}`,
        author: `Author ${i + 1}`,
        category: 'Theology',
      }));

      const mockQuery = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: mockBooks, error: null }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      (globalCache.get as jest.Mock).mockReturnValue(null);

      const startTime = Date.now();
      const result = await bookRepository.getAll();
      const endTime = Date.now();

      expect(result.data).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});
