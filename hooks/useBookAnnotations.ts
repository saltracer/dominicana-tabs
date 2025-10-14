import { useState, useEffect, useCallback } from 'react';
import { BookBookmark, BookHighlight, Annotation, HighlightColor } from '../types';
import { BookAnnotationService } from '../services/BookAnnotationService';

interface UseBookAnnotationsReturn {
  bookmarks: BookBookmark[];
  highlights: BookHighlight[];
  annotations: Annotation[];
  loading: boolean;
  isBookmarked: (location: string) => boolean;
  addBookmark: (location: string, cfi?: string, note?: string) => Promise<boolean>;
  removeBookmark: (id: string) => Promise<boolean>;
  updateBookmarkNote: (id: string, note: string) => Promise<boolean>;
  addHighlight: (
    location: string,
    text: string,
    color: HighlightColor,
    cfiRange?: string,
    note?: string
  ) => Promise<boolean>;
  removeHighlight: (id: string) => Promise<boolean>;
  updateHighlight: (id: string, color?: HighlightColor, note?: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useBookAnnotations(bookId: number): UseBookAnnotationsReturn {
  const [bookmarks, setBookmarks] = useState<BookBookmark[]>([]);
  const [highlights, setHighlights] = useState<BookHighlight[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnnotations = useCallback(async () => {
    try {
      setLoading(true);
      const [bookmarksData, highlightsData, annotationsData] = await Promise.all([
        BookAnnotationService.getBookmarksForBook(bookId),
        BookAnnotationService.getHighlightsForBook(bookId),
        BookAnnotationService.getAllAnnotationsForBook(bookId),
      ]);
      
      setBookmarks(bookmarksData);
      setHighlights(highlightsData);
      setAnnotations(annotationsData);
    } catch (error) {
      console.error('Error loading book annotations:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  const isBookmarked = useCallback((location: string): boolean => {
    return bookmarks.some(bookmark => bookmark.location === location);
  }, [bookmarks]);

  const addBookmark = useCallback(async (
    location: string,
    cfi?: string,
    note?: string
  ): Promise<boolean> => {
    console.log('🪝 useBookAnnotations.addBookmark called:', { bookId, location: location.substring(0, 50) });
    const result = await BookAnnotationService.addBookmark(bookId, location, cfi, note);
    console.log('🪝 Service result:', result ? 'Success' : 'Failed');
    if (result) {
      console.log('🔄 Reloading annotations...');
      await loadAnnotations();
      return true;
    }
    return false;
  }, [bookId, loadAnnotations]);

  const removeBookmark = useCallback(async (id: string): Promise<boolean> => {
    const result = await BookAnnotationService.removeBookmark(id);
    if (result) {
      await loadAnnotations();
      return true;
    }
    return false;
  }, [loadAnnotations]);

  const updateBookmarkNote = useCallback(async (
    id: string,
    note: string
  ): Promise<boolean> => {
    const result = await BookAnnotationService.updateBookmarkNote(id, note);
    if (result) {
      await loadAnnotations();
      return true;
    }
    return false;
  }, [loadAnnotations]);

  const addHighlight = useCallback(async (
    location: string,
    text: string,
    color: HighlightColor,
    cfiRange?: string,
    note?: string
  ): Promise<boolean> => {
    const result = await BookAnnotationService.addHighlight(
      bookId,
      location,
      text,
      color,
      cfiRange,
      note
    );
    if (result) {
      await loadAnnotations();
      return true;
    }
    return false;
  }, [bookId, loadAnnotations]);

  const removeHighlight = useCallback(async (id: string): Promise<boolean> => {
    const result = await BookAnnotationService.removeHighlight(id);
    if (result) {
      await loadAnnotations();
      return true;
    }
    return false;
  }, [loadAnnotations]);

  const updateHighlight = useCallback(async (
    id: string,
    color?: HighlightColor,
    note?: string
  ): Promise<boolean> => {
    const result = await BookAnnotationService.updateHighlight(id, color, note);
    if (result) {
      await loadAnnotations();
      return true;
    }
    return false;
  }, [loadAnnotations]);

  const refresh = useCallback(async () => {
    await loadAnnotations();
  }, [loadAnnotations]);

  return {
    bookmarks,
    highlights,
    annotations,
    loading,
    isBookmarked,
    addBookmark,
    removeBookmark,
    updateBookmarkNote,
    addHighlight,
    removeHighlight,
    updateHighlight,
    refresh,
  };
}

