import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, Bookmark, ReadingProgress } from '../types';

interface OfflineBookData {
  book: Book;
  content: string;
  lastUpdated: string;
  isDownloaded: boolean;
}

interface OfflineReadingData {
  bookId: string;
  progress: ReadingProgress;
  bookmarks: Bookmark[];
  annotations: any[];
  lastSync: string;
}

class OfflineStorageService {
  private static readonly BOOKS_KEY = 'offline_books';
  private static readonly READING_DATA_KEY = 'offline_reading_data';
  private static readonly CACHE_KEY = 'epub_cache';

  /**
   * Download and cache a book for offline reading
   */
  async downloadBook(book: Book): Promise<void> {
    try {
      // Simulate downloading book content
      const bookContent = await this.fetchBookContent(book);
      
      const offlineData: OfflineBookData = {
        book,
        content: bookContent,
        lastUpdated: new Date().toISOString(),
        isDownloaded: true
      };

      const existingBooks = await this.getOfflineBooks();
      existingBooks[book.id] = offlineData;
      
      await AsyncStorage.setItem(
        OfflineStorageService.BOOKS_KEY,
        JSON.stringify(existingBooks)
      );

      console.log(`Book ${book.title} downloaded for offline reading`);
    } catch (error) {
      console.error('Error downloading book:', error);
      throw new Error('Failed to download book for offline reading');
    }
  }

  /**
   * Get all offline books
   */
  async getOfflineBooks(): Promise<Record<string, OfflineBookData>> {
    try {
      const data = await AsyncStorage.getItem(OfflineStorageService.BOOKS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting offline books:', error);
      return {};
    }
  }

  /**
   * Check if a book is available offline
   */
  async isBookOffline(bookId: string): Promise<boolean> {
    const offlineBooks = await this.getOfflineBooks();
    return offlineBooks[bookId]?.isDownloaded || false;
  }

  /**
   * Get offline book content
   */
  async getOfflineBookContent(bookId: string): Promise<string | null> {
    const offlineBooks = await this.getOfflineBooks();
    return offlineBooks[bookId]?.content || null;
  }

  /**
   * Remove book from offline storage
   */
  async removeOfflineBook(bookId: string): Promise<void> {
    try {
      const offlineBooks = await this.getOfflineBooks();
      delete offlineBooks[bookId];
      
      await AsyncStorage.setItem(
        OfflineStorageService.BOOKS_KEY,
        JSON.stringify(offlineBooks)
      );
    } catch (error) {
      console.error('Error removing offline book:', error);
    }
  }

  /**
   * Save reading progress offline
   */
  async saveReadingProgress(bookId: string, progress: ReadingProgress): Promise<void> {
    try {
      const readingData = await this.getOfflineReadingData();
      readingData[bookId] = {
        ...readingData[bookId],
        bookId,
        progress,
        lastSync: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        OfflineStorageService.READING_DATA_KEY,
        JSON.stringify(readingData)
      );
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  }

  /**
   * Get offline reading progress
   */
  async getOfflineReadingProgress(bookId: string): Promise<ReadingProgress | null> {
    try {
      const readingData = await this.getOfflineReadingData();
      return readingData[bookId]?.progress || null;
    } catch (error) {
      console.error('Error getting reading progress:', error);
      return null;
    }
  }

  /**
   * Save bookmarks offline
   */
  async saveBookmarks(bookId: string, bookmarks: Bookmark[]): Promise<void> {
    try {
      const readingData = await this.getOfflineReadingData();
      readingData[bookId] = {
        ...readingData[bookId],
        bookId,
        bookmarks,
        lastSync: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        OfflineStorageService.READING_DATA_KEY,
        JSON.stringify(readingData)
      );
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }

  /**
   * Get offline bookmarks
   */
  async getOfflineBookmarks(bookId: string): Promise<Bookmark[]> {
    try {
      const readingData = await this.getOfflineReadingData();
      return readingData[bookId]?.bookmarks || [];
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  }

  /**
   * Save annotations offline
   */
  async saveAnnotations(bookId: string, annotations: any[]): Promise<void> {
    try {
      const readingData = await this.getOfflineReadingData();
      readingData[bookId] = {
        ...readingData[bookId],
        bookId,
        annotations,
        lastSync: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        OfflineStorageService.READING_DATA_KEY,
        JSON.stringify(readingData)
      );
    } catch (error) {
      console.error('Error saving annotations:', error);
    }
  }

  /**
   * Get offline annotations
   */
  async getOfflineAnnotations(bookId: string): Promise<any[]> {
    try {
      const readingData = await this.getOfflineReadingData();
      return readingData[bookId]?.annotations || [];
    } catch (error) {
      console.error('Error getting annotations:', error);
      return [];
    }
  }

  /**
   * Get all offline reading data
   */
  async getOfflineReadingData(): Promise<Record<string, OfflineReadingData>> {
    try {
      const data = await AsyncStorage.getItem(OfflineStorageService.READING_DATA_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting offline reading data:', error);
      return {};
    }
  }

  /**
   * Clear all offline data
   */
  async clearAllOfflineData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OfflineStorageService.BOOKS_KEY);
      await AsyncStorage.removeItem(OfflineStorageService.READING_DATA_KEY);
      await AsyncStorage.removeItem(OfflineStorageService.CACHE_KEY);
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    totalBooks: number;
    totalSize: number;
    lastUpdated: string;
  }> {
    try {
      const offlineBooks = await this.getOfflineBooks();
      const readingData = await this.getOfflineReadingData();
      
      const totalBooks = Object.keys(offlineBooks).length;
      const totalSize = JSON.stringify(offlineBooks).length + JSON.stringify(readingData).length;
      const lastUpdated = new Date().toISOString();

      return {
        totalBooks,
        totalSize,
        lastUpdated
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalBooks: 0,
        totalSize: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Simulate fetching book content (in real implementation, this would fetch from server)
   */
  private async fetchBookContent(book: Book): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return simulated book content
    return `
      <div class="book-content">
        <h1>${book.title}</h1>
        <h2>by ${book.author}</h2>
        <div class="description">${book.description}</div>
        
        <div class="chapter">
          <h3>Chapter 1: Introduction</h3>
          <p>This is the beginning of ${book.title}. The content would be loaded from the actual EPUB file in a real implementation.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </div>
        
        <div class="chapter">
          <h3>Chapter 2: Development</h3>
          <p>In this chapter, we explore the main themes and concepts of the work.</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </div>
        
        <div class="chapter">
          <h3>Chapter 3: Conclusion</h3>
          <p>The final chapter brings together all the concepts discussed throughout the work.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        </div>
      </div>
    `;
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    // In a real implementation, this would check network connectivity
    return navigator.onLine !== false;
  }

  /**
   * Sync offline data when online
   */
  async syncWhenOnline(): Promise<void> {
    if (!this.isOnline()) {
      console.log('Device is offline, skipping sync');
      return;
    }

    try {
      const readingData = await this.getOfflineReadingData();
      
      // In a real implementation, this would sync with the server
      console.log('Syncing offline data with server...', readingData);
      
      // Mark all data as synced
      for (const bookId in readingData) {
        readingData[bookId].lastSync = new Date().toISOString();
      }
      
      await AsyncStorage.setItem(
        OfflineStorageService.READING_DATA_KEY,
        JSON.stringify(readingData)
      );
      
      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }
}

export default new OfflineStorageService();