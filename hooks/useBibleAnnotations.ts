import { useState, useEffect, useCallback } from 'react';
import { BibleBookmark, BibleHighlight, Annotation, HighlightColor } from '../types';
import { BibleAnnotationService } from '../services/BibleAnnotationService';

interface UseBibleAnnotationsReturn {
  bookmarks: BibleBookmark[];
  highlights: BibleHighlight[];
  annotations: Annotation[];
  loading: boolean;
  isVerseBookmarked: (verse: number) => boolean;
  getHighlightForVerse: (verse: number) => BibleHighlight | undefined;
  addBookmark: (verse: number, note?: string) => Promise<boolean>;
  removeBookmark: (id: string) => Promise<boolean>;
  updateBookmarkNote: (id: string, note: string) => Promise<boolean>;
  addHighlight: (
    verseStart: number,
    verseEnd: number,
    text: string,
    color: HighlightColor,
    note?: string
  ) => Promise<boolean>;
  removeHighlight: (id: string) => Promise<boolean>;
  updateHighlight: (id: string, color?: HighlightColor, note?: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useBibleAnnotations(
  bookCode: string,
  chapter: number,
  version: string
): UseBibleAnnotationsReturn {
  const [bookmarks, setBookmarks] = useState<BibleBookmark[]>([]);
  const [highlights, setHighlights] = useState<BibleHighlight[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnnotations = useCallback(async () => {
    try {
      setLoading(true);
      const [bookmarksData, highlightsData, annotationsData] = await Promise.all([
        BibleAnnotationService.getBibleBookmarksForChapter(bookCode, chapter, version),
        BibleAnnotationService.getBibleHighlightsForChapter(bookCode, chapter, version),
        BibleAnnotationService.getAllBibleAnnotationsForBook(bookCode, version),
      ]);
      
      setBookmarks(bookmarksData);
      setHighlights(highlightsData);
      setAnnotations(annotationsData);
    } catch (error) {
      console.error('Error loading Bible annotations:', error);
    } finally {
      setLoading(false);
    }
  }, [bookCode, chapter, version]);

  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  const isVerseBookmarked = useCallback((verse: number): boolean => {
    return bookmarks.some(bookmark => bookmark.verse === verse);
  }, [bookmarks]);

  const getHighlightForVerse = useCallback((verse: number): BibleHighlight | undefined => {
    return highlights.find(
      highlight => verse >= highlight.verse_start && verse <= highlight.verse_end
    );
  }, [highlights]);

  const addBookmark = useCallback(async (
    verse: number,
    note?: string
  ): Promise<boolean> => {
    const result = await BibleAnnotationService.addBibleBookmark(
      bookCode,
      chapter,
      verse,
      version,
      note
    );
    if (result) {
      await loadAnnotations();
      return true;
    }
    return false;
  }, [bookCode, chapter, version, loadAnnotations]);

  const removeBookmark = useCallback(async (id: string): Promise<boolean> => {
    const result = await BibleAnnotationService.removeBibleBookmark(id);
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
    const result = await BibleAnnotationService.updateBibleBookmarkNote(id, note);
    if (result) {
      await loadAnnotations();
      return true;
    }
    return false;
  }, [loadAnnotations]);

  const addHighlight = useCallback(async (
    verseStart: number,
    verseEnd: number,
    text: string,
    color: HighlightColor,
    note?: string
  ): Promise<boolean> => {
    const result = await BibleAnnotationService.addBibleHighlight(
      bookCode,
      chapter,
      verseStart,
      verseEnd,
      version,
      text,
      color,
      note
    );
    if (result) {
      await loadAnnotations();
      return true;
    }
    return false;
  }, [bookCode, chapter, version, loadAnnotations]);

  const removeHighlight = useCallback(async (id: string): Promise<boolean> => {
    const result = await BibleAnnotationService.removeBibleHighlight(id);
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
    const result = await BibleAnnotationService.updateBibleHighlight(id, color, note);
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
    isVerseBookmarked,
    getHighlightForVerse,
    addBookmark,
    removeBookmark,
    updateBookmarkNote,
    addHighlight,
    removeHighlight,
    updateHighlight,
    refresh,
  };
}

