import { supabase } from '../lib/supabase';
import { ReadingProgress, ReadingProgressUpdate, ReadingProgressStats } from '../types/ReadingProgress';

export class ReadingProgressService {
  /**
   * Save or update reading progress for a book
   */
  static async saveProgress(
    userId: string,
    progress: ReadingProgressUpdate
  ): Promise<ReadingProgress> {
    try {
      // First, try to update existing record
      const { data: existingData, error: selectError } = await supabase
        .from('reading_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', progress.book_id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing progress:', selectError);
        throw new Error(`Failed to check existing progress: ${selectError.message}`);
      }

      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('reading_progress')
          .update({
            book_title: progress.book_title,
            current_location: progress.current_location,
            progress_percentage: progress.progress_percentage,
            total_pages: progress.total_pages,
            current_page: progress.current_page,
            last_read_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating reading progress:', error);
          throw new Error(`Failed to update reading progress: ${error.message}`);
        }

        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('reading_progress')
          .insert({
            user_id: userId,
            book_id: progress.book_id,
            book_title: progress.book_title,
            current_location: progress.current_location,
            progress_percentage: progress.progress_percentage,
            total_pages: progress.total_pages,
            current_page: progress.current_page,
            last_read_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting reading progress:', error);
          throw new Error(`Failed to insert reading progress: ${error.message}`);
        }

        return data;
      }
    } catch (error) {
      console.error('ReadingProgressService.saveProgress error:', error);
      throw error;
    }
  }

  /**
   * Get reading progress for a specific book
   */
  static async getBookProgress(
    userId: string,
    bookId: number
  ): Promise<ReadingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No progress found for this book
          return null;
        }
        console.error('Error getting book progress:', error);
        throw new Error(`Failed to get reading progress: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('ReadingProgressService.getBookProgress error:', error);
      throw error;
    }
  }

  /**
   * Get all reading progress for a user
   */
  static async getUserProgress(userId: string): Promise<ReadingProgress[]> {
    try {
      console.log('📚 ReadingProgressService: Getting progress for user:', userId);
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false });

      if (error) {
        console.error('Error getting user progress:', error);
        throw new Error(`Failed to get user reading progress: ${error.message}`);
      }

      console.log('📚 ReadingProgressService: Found progress records:', data?.length || 0, data);
      return data || [];
    } catch (error) {
      console.error('ReadingProgressService.getUserProgress error:', error);
      throw error;
    }
  }

  /**
   * Get reading progress statistics for a user
   */
  static async getUserStats(userId: string): Promise<ReadingProgressStats> {
    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error getting user stats:', error);
        throw new Error(`Failed to get reading statistics: ${error.message}`);
      }

      const progress = data || [];
      
      const totalBooksStarted = progress.length;
      const totalBooksCompleted = progress.filter(p => p.progress_percentage >= 100).length;
      const averageProgressPercentage = progress.length > 0 
        ? progress.reduce((sum, p) => sum + p.progress_percentage, 0) / progress.length 
        : 0;
      
      // Calculate total reading time (simplified - could be enhanced with actual reading time tracking)
      const totalReadingTimeMinutes = progress.length * 30; // Estimate 30 minutes per book started
      
      const recentlyReadBooks = progress
        .sort((a, b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime())
        .slice(0, 5);

      return {
        total_books_started: totalBooksStarted,
        total_books_completed: totalBooksCompleted,
        total_reading_time_minutes: totalReadingTimeMinutes,
        average_progress_percentage: averageProgressPercentage,
        recently_read_books: recentlyReadBooks,
      };
    } catch (error) {
      console.error('ReadingProgressService.getUserStats error:', error);
      throw error;
    }
  }

  /**
   * Delete reading progress for a book
   */
  static async deleteProgress(
    userId: string,
    bookId: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('reading_progress')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId);

      if (error) {
        console.error('Error deleting reading progress:', error);
        throw new Error(`Failed to delete reading progress: ${error.message}`);
      }
    } catch (error) {
      console.error('ReadingProgressService.deleteProgress error:', error);
      throw error;
    }
  }

  /**
   * Calculate progress percentage from Readium locator
   * Uses totalProgression which represents progress through the entire EPUB
   */
  static calculateProgressPercentage(locator: any): number {
    try {
      // Use totalProgression for entire book progress, not just current file
      if (locator?.locations?.totalProgression !== undefined) {
        const percentage = locator.locations.totalProgression * 100;
        return Math.round(Math.max(0, Math.min(100, percentage))); // Clamp between 0-100
      }
      
      // Fallback to regular progression if totalProgression not available
      if (locator?.locations?.progression !== undefined) {
        const percentage = locator.locations.progression * 100;
        return Math.round(Math.max(0, Math.min(100, percentage))); // Clamp between 0-100
      }
      
      // Fallback calculation based on href position
      if (locator?.href) {
        // This is a simplified calculation - in practice, you'd need
        // to know the total number of chapters/sections
        return 0; // Default to 0 if we can't calculate
      }
      
      return 0;
    } catch (error) {
      console.error('Error calculating progress percentage:', error);
      return 0;
    }
  }

  /**
   * Extract page information from Readium locator
   * Uses totalProgression for accurate book-wide page calculation
   */
  static extractPageInfo(locator: any): { totalPages?: number; currentPage?: number } {
    try {
      // Use totalProgression for entire book page calculation
      const totalProgression = locator?.locations?.totalProgression;
      const currentProgression = locator?.locations?.progression;
      
      if (totalProgression && currentProgression !== undefined) {
        // Calculate total pages based on totalProgression
        const totalPages = Math.round(1 / totalProgression);
        
        // Calculate current page based on progression through entire book
        const currentPage = Math.round(currentProgression * totalPages);
        
        return { totalPages, currentPage };
      }
      
      // Fallback if totalProgression not available
      if (currentProgression !== undefined) {
        // This is less accurate but better than nothing
        const estimatedTotalPages = 200; // Default estimate
        const currentPage = Math.round(currentProgression * estimatedTotalPages);
        return { totalPages: estimatedTotalPages, currentPage };
      }

      return {};
    } catch (error) {
      console.error('Error extracting page info:', error);
      return {};
    }
  }
}
