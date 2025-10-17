/**
 * Book repository for centralized book data access
 */

import { BaseRepository } from './base-repository';
import { Book, BookCategory } from '../types';
import { SearchParams } from '../types/api-types';
import { AppError, ErrorHandler } from '../lib/errors';
import { globalCache } from '../lib/cache-manager';
import { supabase } from '../lib/supabase';

export interface BookSearchParams extends SearchParams {
  category?: BookCategory | 'all';
  author?: string;
  year?: string;
}

export class BookRepository extends BaseRepository<Book> {
  constructor() {
    super({
      tableName: 'books',
      cacheKey: 'books:v2', // v2 to invalidate old cache with unpublished books
      cacheTtl: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Search books with custom logic
   */
  async searchBooks(params: BookSearchParams) {
    try {
      const cacheKey = this.getCacheKey('search', params);
      const cached = globalCache.get<Book[]>(cacheKey);
      if (cached) {
        return { data: cached, error: null, loading: false };
      }

      let query = supabase.from(this.config.tableName).select('*');

      // Only show published books in public library
      query = query.eq('published', true);

      // Apply category filter
      if (params.category && params.category !== 'all') {
        query = query.eq('category', params.category);
      }

      // Apply author filter
      if (params.author) {
        query = query.ilike('author', `%${params.author}%`);
      }

      // Apply year filter
      if (params.year) {
        query = query.eq('year', params.year);
      }

      // Apply search query
      if (params.query) {
        query = query.or(`title.ilike.%${params.query}%,author.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      // Apply sorting
      if (params.sort) {
        query = query.order(params.sort.field, { ascending: params.sort.direction === 'asc' });
      } else {
        query = query.order('title');
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError('DATABASE_ERROR', 'Failed to search books', error);
      }

      // Transform database format to app format
      const transformedBooks = (data || []).map(this.transformBook);
      globalCache.set(cacheKey, transformedBooks, this.config.cacheTtl);
      return { data: transformedBooks, error: null, loading: false };
    } catch (error) {
      return { data: null, error: ErrorHandler.createApiError(error), loading: false };
    }
  }

  /**
   * Get books by category
   */
  async getByCategory(category: BookCategory) {
    return this.searchBooks({ category, filters: { category } });
  }

  /**
   * Get books by author
   */
  async getByAuthor(author: string) {
    return this.searchBooks({ author });
  }

  /**
   * Transform database book to app book format
   */
  private transformBook(dbBook: any): Book {
    return {
      id: dbBook.id,
      title: dbBook.title,
      author: dbBook.author,
      year: dbBook.year,
      category: dbBook.category,
      coverImage: dbBook.cover_image,
      description: dbBook.description,
      epubPath: dbBook.epub_path,
      epubSamplePath: dbBook.epub_sample_path,
      published: dbBook.published || false,
      publishedAt: dbBook.published_at,
      createdAt: dbBook.created_at,
      updatedAt: dbBook.updated_at,
      bookmarks: [], // Will be fetched separately
      readingProgress: {
        bookId: dbBook.id,
        currentPosition: 0,
        totalPages: 0,
        lastRead: new Date().toISOString(),
        timeSpent: 0,
      },
    };
  }
}

// Export singleton instance
export const bookRepository = new BookRepository();
