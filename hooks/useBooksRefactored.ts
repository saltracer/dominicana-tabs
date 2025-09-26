/**
 * Refactored useBooks hook using new patterns
 */

import { useData, useSearch } from './useData';
import { bookRepository } from '../lib/service-container';
import { Book, BookCategory } from '../types';
import { BookSearchParams } from '../repositories/book-repository';

/**
 * Hook for fetching all books
 */
export function useBooks() {
  return useData(
    () => bookRepository.getAll().then(result => result.data || []),
    {
      cacheKey: 'books:all',
      cacheTtl: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook for fetching books by category
 */
export function useBooksByCategory(category: BookCategory | 'all') {
  return useData(
    () => {
      if (category === 'all') {
        return bookRepository.getAll().then(result => result.data || []);
      }
      return bookRepository.getByCategory(category).then(result => result.data || []);
    },
    {
      cacheKey: `books:category:${category}`,
      cacheTtl: 5 * 60 * 1000,
    }
  );
}

/**
 * Hook for searching books
 */
export function useBookSearch() {
  return useSearch<Book>(
    (query: string, filters?: Record<string, any>) => {
      const searchParams: BookSearchParams = {
        query,
        filters,
        category: filters?.category,
        author: filters?.author,
        year: filters?.year,
      };
      return bookRepository.searchBooks(searchParams).then(result => result.data || []);
    },
    {
      debounceMs: 300,
      cacheKey: 'books:search',
      cacheTtl: 2 * 60 * 1000, // 2 minutes for search results
    }
  );
}

/**
 * Hook for fetching a single book by ID
 */
export function useBook(bookId: string | number) {
  return useData(
    () => bookRepository.getById(bookId).then(result => result.data),
    {
      cacheKey: `books:${bookId}`,
      cacheTtl: 10 * 60 * 1000, // 10 minutes for individual books
      enabled: !!bookId,
    }
  );
}

/**
 * Hook for books with advanced filtering
 */
export function useBooksWithFilters(filters: {
  category?: BookCategory | 'all';
  author?: string;
  year?: string;
  searchQuery?: string;
}) {
  return useData(
    () => {
      const searchParams: BookSearchParams = {
        query: filters.searchQuery,
        category: filters.category,
        author: filters.author,
        year: filters.year,
      };
      return bookRepository.searchBooks(searchParams).then(result => result.data || []);
    },
    {
      cacheKey: `books:filters:${JSON.stringify(filters)}`,
      cacheTtl: 5 * 60 * 1000,
    }
  );
}

/**
 * Hook for book statistics
 */
export function useBookStats() {
  return useData(
    async () => {
      const [allBooks, categories] = await Promise.all([
        bookRepository.getAll(),
        bookRepository.search({ filters: {} }), // Get all for counting
      ]);

      if (allBooks.error || categories.error) {
        throw new Error('Failed to fetch book statistics');
      }

      const books = allBooks.data || [];
      const categoryCounts = books.reduce((acc, book) => {
        acc[book.category] = (acc[book.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalBooks: books.length,
        categoryCounts,
        totalAuthors: new Set(books.map(book => book.author)).size,
        totalYears: new Set(books.map(book => book.year).filter(Boolean)).size,
      };
    },
    {
      cacheKey: 'books:stats',
      cacheTtl: 15 * 60 * 1000, // 15 minutes for stats
    }
  );
}
