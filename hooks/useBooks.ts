import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Book, BookCategory, Bookmark, ReadingProgress } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { CoverArtCacheService } from '../services/CoverArtCacheService';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('published', true) // Only show published books in public library
        .order('title');

      if (error) {
        throw error;
      }

      // Transform database format to app format
      const transformedBooks: Book[] = await Promise.all(data.map(async book => {
        // Cache cover art for mobile (on web, just use original URL)
        let coverImageUrl = book.cover_image;
        if (Platform.OS !== 'web' && book.cover_image) {
          try {
            const cachedUrl = await CoverArtCacheService.cacheCoverArt(
              String(book.id),
              book.cover_image
            );
            if (cachedUrl) {
              coverImageUrl = cachedUrl;
            }
          } catch (error) {
            console.error('Error caching cover art for book:', book.id, error);
            // Fall back to original URL if caching fails
          }
        }

        return {
          id: book.id,
          title: book.title,
          author: book.author,
          year: book.year,
          categories: book.categories || [],
          coverImage: coverImageUrl,
          description: book.description,
          longDescription: book.long_description, // Map long_description from database
          epubPath: book.epub_path,
          epubSamplePath: book.epub_sample_path,
          published: book.published || false,
          publishedAt: book.published_at,
          createdAt: book.created_at,
          updatedAt: book.updated_at,
          bookmarks: [], // Will be fetched separately
          readingProgress: {
            bookId: book.id,
            currentPosition: 0,
            totalPages: 0,
            lastRead: new Date().toISOString(),
            timeSpent: 0,
          },
        };
      }));

      setBooks(transformedBooks);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async (query: string, category?: BookCategory | 'all') => {
    try {
      setLoading(true);
      setError(null);

      let queryBuilder = supabase
        .from('books')
        .select('*')
        .eq('published', true); // Only show published books in public library

      if (category && category !== 'all') {
        queryBuilder = queryBuilder.contains('categories', [category]);
      }

      if (query.trim()) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder.order('title');

      if (error) {
        throw error;
      }

      const transformedBooks: Book[] = await Promise.all(data.map(async book => {
        // Cache cover art for mobile (on web, just use original URL)
        let coverImageUrl = book.cover_image;
        if (Platform.OS !== 'web' && book.cover_image) {
          try {
            const cachedUrl = await CoverArtCacheService.cacheCoverArt(
              String(book.id),
              book.cover_image
            );
            if (cachedUrl) {
              coverImageUrl = cachedUrl;
            }
          } catch (error) {
            console.error('Error caching cover art for book:', book.id, error);
            // Fall back to original URL if caching fails
          }
        }

        return {
          id: book.id,
          title: book.title,
          author: book.author,
          year: book.year,
          categories: book.categories || [],
          coverImage: coverImageUrl,
          description: book.description,
          longDescription: book.long_description, // Map long_description from database
          epubPath: book.epub_path,
          epubSamplePath: book.epub_sample_path,
          published: book.published || false,
          publishedAt: book.published_at,
          createdAt: book.created_at,
          updatedAt: book.updated_at,
          bookmarks: [],
          readingProgress: {
            bookId: book.id,
            currentPosition: 0,
            totalPages: 0,
            lastRead: new Date().toISOString(),
            timeSpent: 0,
          },
        };
      }));

      setBooks(transformedBooks);
    } catch (err) {
      console.error('Error searching books:', err);
      setError(err instanceof Error ? err.message : 'Failed to search books');
    } finally {
      setLoading(false);
    }
  };

  const getBookById = async (bookId: string): Promise<Book | null> => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (error) {
        throw error;
      }

      // Cache cover art for mobile (on web, just use original URL)
      let coverImageUrl = data.cover_image;
      console.log('🖼️ Original cover URL:', coverImageUrl);
      if (Platform.OS !== 'web' && data.cover_image) {
        try {
          const cachedUrl = await CoverArtCacheService.cacheCoverArt(
            String(data.id),
            data.cover_image
          );
          console.log('🖼️ Cached cover URL:', cachedUrl);
          if (cachedUrl) {
            coverImageUrl = cachedUrl;
          }
        } catch (error) {
          console.error('Error caching cover art for book:', data.id, error);
          // Fall back to original URL if caching fails
        }
      }
      console.log('🖼️ Final cover URL:', coverImageUrl);

      return {
        id: data.id,
        title: data.title,
        author: data.author,
        year: data.year,
        categories: data.categories || [],
        coverImage: coverImageUrl,
        description: data.description,
        longDescription: data.long_description, // Map long_description from database
        epubPath: data.epub_path,
        epubSamplePath: data.epub_sample_path,
        published: data.published || false,
        publishedAt: data.published_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        bookmarks: [],
        readingProgress: {
          bookId: data.id,
          currentPosition: 0,
          totalPages: 0,
          lastRead: new Date().toISOString(),
          timeSpent: 0,
        },
      };
    } catch (err) {
      console.error('Error fetching book:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    error,
    fetchBooks,
    searchBooks,
    getBookById,
  };
};
