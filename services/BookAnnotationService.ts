import { supabase } from '../lib/supabase';
import { BookBookmark, BookHighlight, HighlightColor, Annotation } from '../types';

/**
 * Service for managing EPUB book annotations (bookmarks and highlights)
 */
export class BookAnnotationService {
  // ============ BOOKMARKS ============
  
  /**
   * Add a bookmark to an EPUB book at the current location
   */
  static async addBookmark(
    bookId: number,
    location: string,
    cfi?: string,
    note?: string
  ): Promise<BookBookmark | null> {
    try {
      console.log('💾 BookAnnotationService.addBookmark called:', { bookId, cfi, note });
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 User:', user?.id);
      
      if (!user) {
        console.error('❌ User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('📤 Inserting bookmark into database...');
      const { data, error } = await supabase
        .from('book_bookmarks')
        .insert({
          user_id: user.id,
          book_id: bookId,
          location,
          cfi,
          note,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      console.log('✅ Bookmark saved successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error adding bookmark:', error);
      return null;
    }
  }

  /**
   * Remove a bookmark by ID
   */
  static async removeBookmark(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('book_bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  }

  /**
   * Update a bookmark's note
   */
  static async updateBookmarkNote(id: string, note: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('book_bookmarks')
        .update({ note })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating bookmark note:', error);
      return false;
    }
  }

  /**
   * Get all bookmarks for a specific book
   */
  static async getBookmarksForBook(bookId: number): Promise<BookBookmark[]> {
    try {
      console.log('📖 Fetching bookmarks for book:', bookId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user - returning empty array');
        return [];
      }

      console.log('👤 Fetching for user:', user.id);
      const { data, error } = await supabase
        .from('book_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      console.log('✅ Fetched bookmarks:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching bookmarks:', error);
      return [];
    }
  }

  /**
   * Check if a location is bookmarked
   */
  static async isLocationBookmarked(bookId: number, location: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('book_bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .eq('location', location)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  // ============ HIGHLIGHTS ============
  
  /**
   * Add a highlight to an EPUB book
   */
  static async addHighlight(
    bookId: number,
    location: string,
    highlightedText: string,
    color: HighlightColor,
    cfiRange?: string,
    note?: string
  ): Promise<BookHighlight | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('book_highlights')
        .insert({
          user_id: user.id,
          book_id: bookId,
          location,
          cfi_range: cfiRange,
          highlighted_text: highlightedText,
          color,
          note,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding highlight:', error);
      return null;
    }
  }

  /**
   * Remove a highlight by ID
   */
  static async removeHighlight(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('book_highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing highlight:', error);
      return false;
    }
  }

  /**
   * Update a highlight's color and/or note
   */
  static async updateHighlight(
    id: string,
    color?: HighlightColor,
    note?: string
  ): Promise<boolean> {
    try {
      const updates: any = {};
      if (color) updates.color = color;
      if (note !== undefined) updates.note = note;

      const { error } = await supabase
        .from('book_highlights')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating highlight:', error);
      return false;
    }
  }

  /**
   * Get all highlights for a specific book
   */
  static async getHighlightsForBook(bookId: number): Promise<BookHighlight[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('book_highlights')
        .select('*')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching highlights:', error);
      return [];
    }
  }

  // ============ COMBINED ANNOTATIONS ============
  
  /**
   * Get all annotations (bookmarks + highlights) for a book
   * Returns them in a unified format sorted by creation date
   */
  static async getAllAnnotationsForBook(bookId: number): Promise<Annotation[]> {
    try {
      const [bookmarks, highlights] = await Promise.all([
        this.getBookmarksForBook(bookId),
        this.getHighlightsForBook(bookId),
      ]);

      const annotations: Annotation[] = [];

      // Convert bookmarks to annotations
      bookmarks.forEach(bookmark => {
        annotations.push({
          id: bookmark.id,
          type: 'bookmark',
          note: bookmark.note,
          location: 'Saved Location', // Can be enhanced with chapter info if available
          created_at: bookmark.created_at,
          data: bookmark,
        });
      });

      // Convert highlights to annotations
      highlights.forEach(highlight => {
        annotations.push({
          id: highlight.id,
          type: 'highlight',
          text: highlight.highlighted_text,
          note: highlight.note,
          color: highlight.color,
          location: 'Highlighted Text', // Can be enhanced with chapter info if available
          created_at: highlight.created_at,
          data: highlight,
        });
      });

      // Sort by creation date (newest first)
      annotations.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return annotations;
    } catch (error) {
      console.error('Error fetching all annotations:', error);
      return [];
    }
  }
}

