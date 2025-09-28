import { ReadingProgressService } from '../services/ReadingProgressService';
import { ReadingProgress, ReadingProgressUpdate } from '../types/ReadingProgress';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    upsert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: mockProgress, error: null }))
      }))
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: mockProgress, error: null }))
        }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
};

jest.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}));

const mockProgress: ReadingProgress = {
  id: 'test-id',
  user_id: 'user-123',
  book_id: 'book-456',
  book_title: 'Test Book',
  current_location: '{"href":"chapter1.html","locations":{"progression":0.25}}',
  progress_percentage: 25,
  total_pages: 100,
  current_page: 25,
  last_read_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('ReadingProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveProgress', () => {
    it('should save reading progress successfully', async () => {
      const progressUpdate: ReadingProgressUpdate = {
        book_id: 'book-456',
        book_title: 'Test Book',
        current_location: '{"href":"chapter1.html","locations":{"progression":0.25}}',
        progress_percentage: 25,
        total_pages: 100,
        current_page: 25
      };

      const result = await ReadingProgressService.saveProgress('user-123', progressUpdate);

      expect(mockSupabase.from).toHaveBeenCalledWith('reading_progress');
      expect(result).toEqual(mockProgress);
    });

    it('should handle save progress errors', async () => {
      const error = new Error('Database error');
      mockSupabase.from().upsert().select().single.mockResolvedValueOnce({
        data: null,
        error
      });

      const progressUpdate: ReadingProgressUpdate = {
        book_id: 'book-456',
        book_title: 'Test Book',
        current_location: '{"href":"chapter1.html"}',
        progress_percentage: 25
      };

      await expect(
        ReadingProgressService.saveProgress('user-123', progressUpdate)
      ).rejects.toThrow('Failed to save reading progress: Database error');
    });
  });

  describe('getBookProgress', () => {
    it('should get book progress successfully', async () => {
      const result = await ReadingProgressService.getBookProgress('user-123', 'book-456');

      expect(mockSupabase.from).toHaveBeenCalledWith('reading_progress');
      expect(result).toEqual(mockProgress);
    });

    it('should return null when no progress found', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }
      });

      const result = await ReadingProgressService.getBookProgress('user-123', 'book-456');

      expect(result).toBeNull();
    });
  });

  describe('getUserProgress', () => {
    it('should get user progress successfully', async () => {
      const mockProgressList = [mockProgress];
      mockSupabase.from().select().eq().order.mockResolvedValueOnce({
        data: mockProgressList,
        error: null
      });

      const result = await ReadingProgressService.getUserProgress('user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('reading_progress');
      expect(result).toEqual(mockProgressList);
    });
  });

  describe('getUserStats', () => {
    it('should calculate user stats correctly', async () => {
      const mockProgressList = [
        { ...mockProgress, progress_percentage: 50 },
        { ...mockProgress, progress_percentage: 100, book_id: 'book-789' },
        { ...mockProgress, progress_percentage: 25, book_id: 'book-101' }
      ];
      
      mockSupabase.from().select().eq.mockResolvedValueOnce({
        data: mockProgressList,
        error: null
      });

      const result = await ReadingProgressService.getUserStats('user-123');

      expect(result.total_books_started).toBe(3);
      expect(result.total_books_completed).toBe(1);
      expect(result.average_progress_percentage).toBe(58.33);
      expect(result.recently_read_books).toHaveLength(3);
    });
  });

  describe('deleteProgress', () => {
    it('should delete progress successfully', async () => {
      await ReadingProgressService.deleteProgress('user-123', 'book-456');

      expect(mockSupabase.from).toHaveBeenCalledWith('reading_progress');
    });
  });

  describe('calculateProgressPercentage', () => {
    it('should calculate progress from locator with progression', () => {
      const locator = {
        href: 'chapter1.html',
        locations: { progression: 0.25 }
      };

      const result = ReadingProgressService.calculateProgressPercentage(locator);

      expect(result).toBe(25);
    });

    it('should return 0 for invalid locator', () => {
      const result = ReadingProgressService.calculateProgressPercentage(null);

      expect(result).toBe(0);
    });
  });

  describe('extractPageInfo', () => {
    it('should extract page information correctly', () => {
      const locator = {
        href: 'chapter1.html',
        locations: { 
          progression: 0.25,
          totalProgression: 0.01 // 100 pages total
        }
      };

      const result = ReadingProgressService.extractPageInfo(locator);

      expect(result.totalPages).toBe(100);
      expect(result.currentPage).toBe(25);
    });

    it('should handle missing page information', () => {
      const locator = {
        href: 'chapter1.html',
        locations: { progression: 0.25 }
      };

      const result = ReadingProgressService.extractPageInfo(locator);

      expect(result.totalPages).toBeUndefined();
      expect(result.currentPage).toBeUndefined();
    });
  });
});
