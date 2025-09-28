export interface ReadingProgress {
  id?: string;
  user_id: string;
  book_id: string;
  book_title: string;
  current_location: string; // Readium locator string
  progress_percentage: number; // 0-100
  last_read_at: string; // ISO timestamp
  total_pages?: number;
  current_page?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ReadingProgressUpdate {
  book_id: string;
  book_title: string;
  current_location: string;
  progress_percentage: number;
  total_pages?: number;
  current_page?: number;
}

export interface ReadingProgressStats {
  total_books_started: number;
  total_books_completed: number;
  total_reading_time_minutes: number;
  average_progress_percentage: number;
  recently_read_books: ReadingProgress[];
}
