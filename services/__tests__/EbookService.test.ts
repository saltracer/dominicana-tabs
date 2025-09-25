import EbookService from '../EbookService';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
};

describe('EbookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('getPublicEbooks', () => {
    it('should fetch public ebooks successfully', async () => {
      const mockEbooks = [
        {
          id: 'ebook-1',
          title: 'Test Book 1',
          author: 'Author 1',
          is_public: true,
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockEbooks,
              error: null,
            }),
          }),
        }),
      });

      const result = await EbookService.getPublicEbooks();
      expect(result).toEqual(mockEbooks);
    });

    it('should throw error when fetch fails', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      await expect(EbookService.getPublicEbooks()).rejects.toThrow(
        'Failed to fetch public ebooks: Database error'
      );
    });
  });

  describe('getAllEbooks', () => {
    it('should fetch all ebooks for authenticated users', async () => {
      const mockEbooks = [
        {
          id: 'ebook-1',
          title: 'Test Book 1',
          author: 'Author 1',
          is_public: true,
        },
        {
          id: 'ebook-2',
          title: 'Test Book 2',
          author: 'Author 2',
          is_public: false,
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockEbooks,
            error: null,
          }),
        }),
      });

      const result = await EbookService.getAllEbooks();
      expect(result).toEqual(mockEbooks);
    });
  });

  describe('getEbooksByCategory', () => {
    it('should fetch ebooks by category', async () => {
      const mockEbooks = [
        {
          id: 'ebook-1',
          title: 'Theology Book',
          category: 'theology',
          is_public: true,
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockEbooks,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await EbookService.getEbooksByCategory('theology');
      expect(result).toEqual(mockEbooks);
    });
  });

  describe('searchEbooks', () => {
    it('should search ebooks by title and author', async () => {
      const mockEbooks = [
        {
          id: 'ebook-1',
          title: 'Search Result',
          author: 'Author',
          is_public: true,
        },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockEbooks,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await EbookService.searchEbooks('search');
      expect(result).toEqual(mockEbooks);
    });
  });

  describe('getUserReadingProgress', () => {
    it('should return null for unauthenticated users', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await EbookService.getUserReadingProgress('ebook-1');
      expect(result).toBeNull();
    });

    it('should fetch reading progress for authenticated users', async () => {
      const mockUser = { id: 'user-1' };
      const mockProgress = {
        id: 'progress-1',
        user_id: 'user-1',
        ebook_id: 'ebook-1',
        current_position: 'chapter1',
        current_chapter: 1,
        total_chapters: 10,
        progress_percentage: 10,
        time_spent: 100,
        last_read_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProgress,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await EbookService.getUserReadingProgress('ebook-1');
      expect(result).toEqual(mockProgress);
    });
  });

  describe('updateReadingProgress', () => {
    it('should throw error for unauthenticated users', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(
        EbookService.updateReadingProgress('ebook-1', {
          current_position: 'chapter1',
          current_chapter: 1,
        })
      ).rejects.toThrow('User must be authenticated to update reading progress');
    });

    it('should update reading progress for authenticated users', async () => {
      const mockUser = { id: 'user-1' };
      const mockProgress = {
        id: 'progress-1',
        user_id: 'user-1',
        ebook_id: 'ebook-1',
        current_position: 'chapter1',
        current_chapter: 1,
        total_chapters: 10,
        progress_percentage: 10,
        time_spent: 100,
        last_read_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProgress,
              error: null,
            }),
          }),
        }),
      });

      const result = await EbookService.updateReadingProgress('ebook-1', {
        current_position: 'chapter1',
        current_chapter: 1,
      });

      expect(result).toEqual(mockProgress);
    });
  });

  describe('addBookmark', () => {
    it('should throw error for unauthenticated users', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(
        EbookService.addBookmark('ebook-1', {
          position: 'chapter1',
          chapter_title: 'Chapter 1',
          note: 'Test note',
        })
      ).rejects.toThrow('User must be authenticated to add bookmarks');
    });

    it('should add bookmark for authenticated users', async () => {
      const mockUser = { id: 'user-1' };
      const mockBookmark = {
        id: 'bookmark-1',
        user_id: 'user-1',
        ebook_id: 'ebook-1',
        position: 'chapter1',
        chapter_title: 'Chapter 1',
        note: 'Test note',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockBookmark,
              error: null,
            }),
          }),
        }),
      });

      const result = await EbookService.addBookmark('ebook-1', {
        position: 'chapter1',
        chapter_title: 'Chapter 1',
        note: 'Test note',
      });

      expect(result).toEqual(mockBookmark);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for authenticated users', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const result = await EbookService.isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false for unauthenticated users', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await EbookService.isAuthenticated();
      expect(result).toBe(false);
    });
  });
});