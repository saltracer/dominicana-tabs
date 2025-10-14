import { supabase } from '../lib/supabase';
import { BibleBookmark, BibleHighlight, HighlightColor, Annotation } from '../types';
import { getBookInfo } from '../constants/bibleBookOrder';

/**
 * Service for managing Bible annotations (bookmarks and highlights)
 */
export class BibleAnnotationService {
  // ============ BOOKMARKS ============
  
  /**
   * Add a bookmark to a specific Bible verse
   */
  static async addBibleBookmark(
    bookCode: string,
    chapter: number,
    verse: number,
    version: string,
    note?: string
  ): Promise<BibleBookmark | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bible_bookmarks')
        .insert({
          user_id: user.id,
          book_code: bookCode,
          chapter,
          verse,
          version,
          note,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding Bible bookmark:', error);
      return null;
    }
  }

  /**
   * Remove a Bible bookmark by ID
   */
  static async removeBibleBookmark(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bible_bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing Bible bookmark:', error);
      return false;
    }
  }

  /**
   * Update a Bible bookmark's note
   */
  static async updateBibleBookmarkNote(id: string, note: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bible_bookmarks')
        .update({ note })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating Bible bookmark note:', error);
      return false;
    }
  }

  /**
   * Get all Bible bookmarks for a specific chapter
   */
  static async getBibleBookmarksForChapter(
    bookCode: string,
    chapter: number,
    version: string
  ): Promise<BibleBookmark[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bible_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_code', bookCode)
        .eq('chapter', chapter)
        .eq('version', version)
        .order('verse', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Bible bookmarks:', error);
      return [];
    }
  }

  /**
   * Get all Bible bookmarks for a specific book (all chapters)
   */
  static async getBibleBookmarksForBook(
    bookCode: string,
    version: string
  ): Promise<BibleBookmark[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bible_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_code', bookCode)
        .eq('version', version)
        .order('chapter', { ascending: true })
        .order('verse', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Bible bookmarks for book:', error);
      return [];
    }
  }

  /**
   * Check if a specific verse is bookmarked
   */
  static async isVerseBookmarked(
    bookCode: string,
    chapter: number,
    verse: number,
    version: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('bible_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_code', bookCode)
        .eq('chapter', chapter)
        .eq('verse', verse)
        .eq('version', version)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  // ============ HIGHLIGHTS ============
  
  /**
   * Add a highlight to Bible verses (can be single or multi-verse)
   */
  static async addBibleHighlight(
    bookCode: string,
    chapter: number,
    verseStart: number,
    verseEnd: number,
    version: string,
    highlightedText: string,
    color: HighlightColor,
    note?: string
  ): Promise<BibleHighlight | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('bible_highlights')
        .insert({
          user_id: user.id,
          book_code: bookCode,
          chapter,
          verse_start: verseStart,
          verse_end: verseEnd,
          version,
          highlighted_text: highlightedText,
          color,
          note,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding Bible highlight:', error);
      return null;
    }
  }

  /**
   * Remove a Bible highlight by ID
   */
  static async removeBibleHighlight(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bible_highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing Bible highlight:', error);
      return false;
    }
  }

  /**
   * Update a Bible highlight's color and/or note
   */
  static async updateBibleHighlight(
    id: string,
    color?: HighlightColor,
    note?: string
  ): Promise<boolean> {
    try {
      const updates: any = {};
      if (color) updates.color = color;
      if (note !== undefined) updates.note = note;

      const { error } = await supabase
        .from('bible_highlights')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating Bible highlight:', error);
      return false;
    }
  }

  /**
   * Get all Bible highlights for a specific chapter
   */
  static async getBibleHighlightsForChapter(
    bookCode: string,
    chapter: number,
    version: string
  ): Promise<BibleHighlight[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bible_highlights')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_code', bookCode)
        .eq('chapter', chapter)
        .eq('version', version)
        .order('verse_start', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Bible highlights:', error);
      return [];
    }
  }

  /**
   * Get highlight for a specific verse (if it exists)
   */
  static async getHighlightForVerse(
    bookCode: string,
    chapter: number,
    verse: number,
    version: string
  ): Promise<BibleHighlight | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('bible_highlights')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_code', bookCode)
        .eq('chapter', chapter)
        .eq('version', version)
        .lte('verse_start', verse)
        .gte('verse_end', verse)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      return null;
    }
  }

  // ============ COMBINED ANNOTATIONS ============
  
  /**
   * Get all Bible annotations (bookmarks + highlights) for a specific book
   * Returns them in a unified format sorted by location
   */
  static async getAllBibleAnnotationsForBook(
    bookCode: string,
    version: string
  ): Promise<Annotation[]> {
    try {
      const [bookmarks, highlights] = await Promise.all([
        this.getBibleBookmarksForBook(bookCode, version),
        this.getBibleHighlightsForBook(bookCode, version),
      ]);

      const bookInfo = getBookInfo(bookCode);
      const bookName = bookInfo?.abbreviation || bookCode;

      const annotations: Annotation[] = [];

      // Convert bookmarks to annotations
      bookmarks.forEach(bookmark => {
        annotations.push({
          id: bookmark.id,
          type: 'bookmark',
          note: bookmark.note,
          location: `${bookName} ${bookmark.chapter}:${bookmark.verse}`,
          created_at: bookmark.created_at,
          data: bookmark,
        });
      });

      // Convert highlights to annotations
      highlights.forEach(highlight => {
        const verseRange = highlight.verse_start === highlight.verse_end
          ? `${highlight.verse_start}`
          : `${highlight.verse_start}-${highlight.verse_end}`;
        
        annotations.push({
          id: highlight.id,
          type: 'highlight',
          text: highlight.highlighted_text,
          note: highlight.note,
          color: highlight.color,
          location: `${bookName} ${highlight.chapter}:${verseRange}`,
          created_at: highlight.created_at,
          data: highlight,
        });
      });

      // Sort by location (chapter, then verse)
      annotations.sort((a, b) => {
        const aData = a.data as BibleBookmark | BibleHighlight;
        const bData = b.data as BibleBookmark | BibleHighlight;
        
        if (aData.chapter !== bData.chapter) {
          return aData.chapter - bData.chapter;
        }
        
        const aVerse = 'verse' in aData ? aData.verse : aData.verse_start;
        const bVerse = 'verse' in bData ? bData.verse : bData.verse_start;
        return aVerse - bVerse;
      });

      return annotations;
    } catch (error) {
      console.error('Error fetching all Bible annotations:', error);
      return [];
    }
  }

  /**
   * Get all Bible highlights for a specific book (all chapters)
   */
  private static async getBibleHighlightsForBook(
    bookCode: string,
    version: string
  ): Promise<BibleHighlight[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('bible_highlights')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_code', bookCode)
        .eq('version', version)
        .order('chapter', { ascending: true })
        .order('verse_start', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Bible highlights for book:', error);
      return [];
    }
  }
}

