import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ReadingProgress, Bookmark } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useReadingProgress = (bookId?: string) => {
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchReadingProgress = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let queryBuilder = supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', user.id);

      if (bookId) {
        queryBuilder = queryBuilder.eq('book_id', bookId);
      }

      const { data, error } = await queryBuilder.order('last_read', { ascending: false });

      if (error) {
        throw error;
      }

      const transformedProgress: ReadingProgress[] = data.map(progress => ({
        bookId: progress.book_id,
        currentPosition: progress.current_position,
        totalPages: progress.total_pages,
        lastRead: progress.last_read,
        timeSpent: progress.time_spent,
      }));

      setReadingProgress(transformedProgress);
    } catch (err) {
      console.error('Error fetching reading progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reading progress');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      let queryBuilder = supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id);

      if (bookId) {
        queryBuilder = queryBuilder.eq('book_id', bookId);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const transformedBookmarks: Bookmark[] = data.map(bookmark => ({
        id: bookmark.id,
        bookId: bookmark.book_id,
        position: bookmark.position,
        note: bookmark.note,
        createdAt: bookmark.created_at,
      }));

      setBookmarks(transformedBookmarks);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  };

  const updateReadingProgress = async (progress: Omit<ReadingProgress, 'bookId'> & { bookId: number }) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          book_id: progress.bookId,
          current_position: progress.currentPosition,
          total_pages: progress.totalPages,
          last_read: progress.lastRead,
          time_spent: progress.timeSpent,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setReadingProgress(prev => {
        const existing = prev.find(p => p.bookId === progress.bookId);
        if (existing) {
          return prev.map(p => p.bookId === progress.bookId ? progress : p);
        } else {
          return [...prev, progress];
        }
      });

      return { error: null };
    } catch (err) {
      console.error('Error updating reading progress:', err);
      return { error: err instanceof Error ? err.message : 'Failed to update reading progress' };
    }
  };

  const addBookmark = async (bookmark: Omit<Bookmark, 'id' | 'createdAt'> & { bookId: number }) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          book_id: bookmark.bookId,
          position: bookmark.position,
          note: bookmark.note,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newBookmark: Bookmark = {
        id: data.id,
        bookId: data.book_id,
        position: data.position,
        note: data.note,
        createdAt: data.created_at,
      };

      setBookmarks(prev => [newBookmark, ...prev]);
      return { error: null };
    } catch (err) {
      console.error('Error adding bookmark:', err);
      return { error: err instanceof Error ? err.message : 'Failed to add bookmark' };
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      return { error: null };
    } catch (err) {
      console.error('Error removing bookmark:', err);
      return { error: err instanceof Error ? err.message : 'Failed to remove bookmark' };
    }
  };

  const getProgressForBook = (bookId: number): ReadingProgress | null => {
    return readingProgress.find(p => p.bookId === bookId) || null;
  };

  const getBookmarksForBook = (bookId: number): Bookmark[] => {
    return bookmarks.filter(b => b.bookId === bookId);
  };

  useEffect(() => {
    if (user) {
      fetchReadingProgress();
      fetchBookmarks();
    }
  }, [user, bookId]);

  return {
    readingProgress,
    bookmarks,
    loading,
    error,
    updateReadingProgress,
    addBookmark,
    removeBookmark,
    getProgressForBook,
    getBookmarksForBook,
    refreshProgress: fetchReadingProgress,
    refreshBookmarks: fetchBookmarks,
  };
};
