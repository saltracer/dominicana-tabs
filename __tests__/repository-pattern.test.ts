/**
 * Tests for repository pattern implementation
 */

import { BookRepository } from '../repositories/book-repository';
import { BaseRepository } from '../repositories/base-repository';
import { AppError } from '../lib/errors';
import { globalCache } from '../lib/cache-manager';
import { supabase } from '../lib/supabase';

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
      limit: jest.fn(),
      range: jest.fn(),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
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

describe('BaseRepository', () => {
  let repository: BaseRepository<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new BaseRepository({
      tableName: 'test_table',
      cacheKey: 'test_cache',
      cacheTtl: 5000,
    });
  });

  describe('getAll', () => {
    it('should return cached data when available', async () => {
      const cachedData = [{ id: 1, name: 'Cached' }];
      (globalCache.get as jest.Mock).mockReturnValue(cachedData);

      const result = await repository.getAll();

      expect(result.data).toEqual(cachedData);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should fetch from database when cache is empty', async () => {
      (globalCache.get as jest.Mock).mockReturnValue(null);
      const mockData = [{ id: 1, name: 'Fresh' }];
      
      const mockQuery = {
        select: jest.fn().mockReturnValue({
          then: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await repository.getAll();

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(globalCache.set).toHaveBeenCalledWith('test_cache:all:', mockData, 5000);
    });

    it('should handle database errors', async () => {
      (globalCache.get as jest.Mock).mockReturnValue(null);
      const mockError = { code: 'DB_ERROR', message: 'Database error' };
      
      const mockQuery = {
        select: jest.fn().mockReturnValue({
          then: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await repository.getAll();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
      expect(result.error?.code).toBe('DATABASE_ERROR');
    });

    it('should handle pagination parameters', async () => {
      (globalCache.get as jest.Mock).mockReturnValue(null);
      const mockData = [{ id: 1, name: 'Item 1' }];
      
      const mockQuery = {
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            range: jest.fn().mockReturnValue({
              then: jest.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await repository.getAll({ limit: 10, offset: 20 });

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.range).toHaveBeenCalledWith(20, 29);
    });
  });

  describe('getById', () => {
    it('should return cached data when available', async () => {
      const cachedData = { id: 1, name: 'Cached' };
      (globalCache.get as jest.Mock).mockReturnValue(cachedData);

      const result = await repository.getById(1);

      expect(result.data).toEqual(cachedData);
      expect(result.error).toBeNull();
    });

    it('should fetch from database when cache is empty', async () => {
      (globalCache.get as jest.Mock).mockReturnValue(null);
      const mockData = { id: 1, name: 'Fresh' };
      
      const mockQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await repository.getById(1);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should return null for not found records', async () => {
      (globalCache.get as jest.Mock).mockReturnValue(null);
      
      const mockQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116', message: 'Not found' } 
            }),
          }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await repository.getById(999);

      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('search', () => {
    it('should apply filters correctly', async () => {
      (globalCache.get as jest.Mock).mockReturnValue(null);
      const mockData = [{ id: 1, name: 'Filtered' }];
      
      const mockQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            then: jest.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await repository.search({
        filters: { category: 'test' },
        query: 'search term',
      });

      expect(mockQuery.eq).toHaveBeenCalledWith('category', 'test');
    });
  });

  describe('create', () => {
    it('should create new record and invalidate cache', async () => {
      const newData = { name: 'New Item' };
      const createdData = { id: 1, name: 'New Item' };
      
      const mockQuery = {
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: createdData, error: null }),
          }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await repository.create(newData);

      expect(result.data).toEqual(createdData);
      expect(result.error).toBeNull();
      expect(globalCache.invalidate).toHaveBeenCalledWith('test_cache');
    });
  });

  describe('update', () => {
    it('should update record and invalidate cache', async () => {
      const updateData = { name: 'Updated Item' };
      const updatedData = { id: 1, name: 'Updated Item' };
      
      const mockQuery = {
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updatedData, error: null }),
            }),
          }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await repository.update(1, updateData);

      expect(result.data).toEqual(updatedData);
      expect(result.error).toBeNull();
      expect(globalCache.invalidate).toHaveBeenCalledWith('test_cache');
    });
  });

  describe('delete', () => {
    it('should delete record and invalidate cache', async () => {
      const mockQuery = {
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await repository.delete(1);

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(globalCache.invalidate).toHaveBeenCalledWith('test_cache');
    });
  });
});

describe('BookRepository', () => {
  let bookRepository: BookRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    bookRepository = new BookRepository();
  });

  describe('searchBooks', () => {
    it('should search books with category filter', async () => {
      (globalCache.get as jest.Mock).mockReturnValue(null);
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

      const result = await bookRepository.searchBooks({
        category: 'Theology',
        query: 'test',
      });

      expect(result.data).toEqual(mockBooks);
      expect(result.error).toBeNull();
    });

    it('should transform database books to app format', async () => {
      (globalCache.get as jest.Mock).mockReturnValue(null);
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
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [dbBook], error: null }),
          }),
        }),
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await bookRepository.searchBooks({});

      expect(result.data).toHaveLength(1);
      const transformedBook = result.data![0];
      expect(transformedBook.id).toBe(1);
      expect(transformedBook.title).toBe('Test Book');
      expect(transformedBook.coverImage).toBe('cover.jpg');
      expect(transformedBook.epubPath).toBe('book.epub');
      expect(transformedBook.readingProgress).toBeDefined();
    });
  });

  describe('getByCategory', () => {
    it('should fetch books by category', async () => {
      const mockBooks = [{ id: 1, title: 'Theology Book' }];
      (bookRepository.searchBooks as jest.Mock).mockResolvedValue({
        data: mockBooks,
        error: null,
      });

      const result = await bookRepository.getByCategory('Theology');

      expect(result.data).toEqual(mockBooks);
      expect(bookRepository.searchBooks).toHaveBeenCalledWith({
        category: 'Theology',
        filters: { category: 'Theology' },
      });
    });
  });

  describe('getByAuthor', () => {
    it('should fetch books by author', async () => {
      const mockBooks = [{ id: 1, title: 'Author Book' }];
      (bookRepository.searchBooks as jest.Mock).mockResolvedValue({
        data: mockBooks,
        error: null,
      });

      const result = await bookRepository.getByAuthor('Thomas Aquinas');

      expect(result.data).toEqual(mockBooks);
      expect(bookRepository.searchBooks).toHaveBeenCalledWith({
        author: 'Thomas Aquinas',
        filters: { author: 'Thomas Aquinas' },
      });
    });
  });
});

describe('Error Handling', () => {
  it('should handle AppError correctly', async () => {
    const repository = new BaseRepository({
      tableName: 'test_table',
      cacheKey: 'test_cache',
    });

    const mockError = { code: 'DB_ERROR', message: 'Database error' };
    const mockQuery = {
      select: jest.fn().mockReturnValue({
        then: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      }),
    };
    mockSupabase.from.mockReturnValue(mockQuery);

    const result = await repository.getAll();

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
    expect(result.error?.code).toBe('DATABASE_ERROR');
    expect(result.error?.message).toBe('Failed to fetch test_table');
  });

  it('should handle unknown errors', async () => {
    const repository = new BaseRepository({
      tableName: 'test_table',
      cacheKey: 'test_cache',
    });

    const mockQuery = {
      select: jest.fn().mockReturnValue({
        then: jest.fn().mockRejectedValue(new Error('Unknown error')),
      }),
    };
    mockSupabase.from.mockReturnValue(mockQuery);

    const result = await repository.getAll();

    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
    expect(result.error?.code).toBe('UNKNOWN_ERROR');
  });
});

describe('Cache Integration', () => {
  it('should use cache when available', async () => {
    const repository = new BaseRepository({
      tableName: 'test_table',
      cacheKey: 'test_cache',
    });

    const cachedData = [{ id: 1, name: 'Cached' }];
    (globalCache.get as jest.Mock).mockReturnValue(cachedData);

    const result = await repository.getAll();

    expect(result.data).toEqual(cachedData);
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('should set cache after successful fetch', async () => {
    const repository = new BaseRepository({
      tableName: 'test_table',
      cacheKey: 'test_cache',
      cacheTtl: 5000,
    });

    (globalCache.get as jest.Mock).mockReturnValue(null);
    const mockData = [{ id: 1, name: 'Fresh' }];
    
    const mockQuery = {
      select: jest.fn().mockReturnValue({
        then: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      }),
    };
    mockSupabase.from.mockReturnValue(mockQuery);

    await repository.getAll();

    expect(globalCache.set).toHaveBeenCalledWith('test_cache:all:', mockData, 5000);
  });

  it('should invalidate cache on create/update/delete', async () => {
    const repository = new BaseRepository({
      tableName: 'test_table',
      cacheKey: 'test_cache',
    });

    const mockQuery = {
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
        }),
      }),
    };
    mockSupabase.from.mockReturnValue(mockQuery);

    await repository.create({ name: 'Test' });

    expect(globalCache.invalidate).toHaveBeenCalledWith('test_cache');
  });
});
