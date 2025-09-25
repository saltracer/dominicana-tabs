import { createClient } from '@supabase/supabase-js';
import { Book, BookCategory, ReadingProgress, Bookmark } from '../types';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface EbookMetadata {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_image_url?: string;
  epub_file_url: string;
  category: BookCategory;
  language: string;
  is_dominican: boolean;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserReadingProgress {
  id: string;
  user_id: string;
  ebook_id: string;
  current_position: string;
  current_chapter: number;
  total_chapters: number;
  progress_percentage: number;
  time_spent: number;
  last_read_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  ebook_id: string;
  position: string;
  chapter_title: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAnnotation {
  id: string;
  user_id: string;
  ebook_id: string;
  position: string;
  selected_text?: string;
  annotation_type: 'highlight' | 'note' | 'bookmark';
  color?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

class EbookService {
  /**
   * Get all public ebooks (for unauthenticated users)
   */
  async getPublicEbooks(): Promise<EbookMetadata[]> {
    const { data, error } = await supabase
      .from('ebooks')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch public ebooks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all ebooks (for authenticated users)
   */
  async getAllEbooks(): Promise<EbookMetadata[]> {
    const { data, error } = await supabase
      .from('ebooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch ebooks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get ebooks by category
   */
  async getEbooksByCategory(category: BookCategory): Promise<EbookMetadata[]> {
    const { data, error } = await supabase
      .from('ebooks')
      .select('*')
      .eq('category', category)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch ebooks by category: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Search ebooks by title or author
   */
  async searchEbooks(query: string): Promise<EbookMetadata[]> {
    const { data, error } = await supabase
      .from('ebooks')
      .select('*')
      .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search ebooks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a specific ebook by ID
   */
  async getEbookById(id: string): Promise<EbookMetadata | null> {
    const { data, error } = await supabase
      .from('ebooks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch ebook: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user's reading progress for a specific ebook
   */
  async getUserReadingProgress(ebookId: string): Promise<UserReadingProgress | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_reading_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('ebook_id', ebookId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch reading progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Update user's reading progress
   */
  async updateReadingProgress(
    ebookId: string,
    progress: {
      current_position?: string;
      current_chapter?: number;
      total_chapters?: number;
      progress_percentage?: number;
      time_spent?: number;
    }
  ): Promise<UserReadingProgress> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to update reading progress');
    }

    const { data, error } = await supabase
      .from('user_reading_progress')
      .upsert({
        user_id: user.id,
        ebook_id: ebookId,
        current_position: progress.current_position,
        current_chapter: progress.current_chapter,
        total_chapters: progress.total_chapters,
        progress_percentage: progress.progress_percentage,
        time_spent: progress.time_spent,
        last_read_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update reading progress: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user's bookmarks for a specific ebook
   */
  async getUserBookmarks(ebookId: string): Promise<UserBookmark[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .eq('ebook_id', ebookId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bookmarks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Add a bookmark
   */
  async addBookmark(
    ebookId: string,
    bookmark: {
      position: string;
      chapter_title: string;
      note?: string;
    }
  ): Promise<UserBookmark> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to add bookmarks');
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: user.id,
        ebook_id: ebookId,
        position: bookmark.position,
        chapter_title: bookmark.chapter_title,
        note: bookmark.note,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add bookmark: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a bookmark
   */
  async deleteBookmark(bookmarkId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to delete bookmarks');
    }

    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete bookmark: ${error.message}`);
    }
  }

  /**
   * Get user's annotations for a specific ebook
   */
  async getUserAnnotations(ebookId: string): Promise<UserAnnotation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_annotations')
      .select('*')
      .eq('user_id', user.id)
      .eq('ebook_id', ebookId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch annotations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Add an annotation
   */
  async addAnnotation(
    ebookId: string,
    annotation: {
      position: string;
      selected_text?: string;
      annotation_type: 'highlight' | 'note' | 'bookmark';
      color?: string;
      note?: string;
    }
  ): Promise<UserAnnotation> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to add annotations');
    }

    const { data, error } = await supabase
      .from('user_annotations')
      .insert({
        user_id: user.id,
        ebook_id: ebookId,
        position: annotation.position,
        selected_text: annotation.selected_text,
        annotation_type: annotation.annotation_type,
        color: annotation.color,
        note: annotation.note,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add annotation: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete an annotation
   */
  async deleteAnnotation(annotationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to delete annotations');
    }

    const { error } = await supabase
      .from('user_annotations')
      .delete()
      .eq('id', annotationId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete annotation: ${error.message}`);
    }
  }

  /**
   * Get user's reading history (all books with progress)
   */
  async getUserReadingHistory(): Promise<(EbookMetadata & { progress: UserReadingProgress })[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_reading_progress')
      .select(`
        *,
        ebooks (*)
      `)
      .eq('user_id', user.id)
      .order('last_read_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch reading history: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item.ebooks,
      progress: item,
    }));
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
}

export default new EbookService();