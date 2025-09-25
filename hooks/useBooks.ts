import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Book, BookCategory, Bookmark, ReadingProgress } from '../types';
import { useAuth } from '../contexts/AuthContext';

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
        .order('title');

      if (error) {
        throw error;
      }

      // Transform database format to app format
      const transformedBooks: Book[] = data.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        year: book.year,
        category: book.category,
        coverImage: book.cover_image,
        description: book.description,
        epubPath: book.epub_path,
        epubSamplePath: book.epub_sample_path,
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
        .select('*');

      if (category && category !== 'all') {
        queryBuilder = queryBuilder.eq('category', category);
      }

      if (query.trim()) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,author.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder.order('title');

      if (error) {
        throw error;
      }

      const transformedBooks: Book[] = data.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        year: book.year,
        category: book.category,
        coverImage: book.cover_image,
        description: book.description,
        epubPath: book.epub_path,
        epubSamplePath: book.epub_sample_path,
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

      return {
        id: data.id,
        title: data.title,
        author: data.author,
        year: data.year,
        category: data.category,
        coverImage: data.cover_image,
        description: data.description,
        epubPath: data.epub_path,
        epubSamplePath: data.epub_sample_path,
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
