import { Book, Bookmark, ReadingProgress, BookCategory } from '../types';

class BookService {
  private books: Book[] = [];
  private isAuthenticated: boolean = false;

  /**
   * Initialize the service with sample books
   */
  initializeBooks(): Book[] {
    const sampleBooks: Book[] = [
      {
        id: 'summa-theologica',
        title: 'Summa Theologica',
        author: 'St. Thomas Aquinas',
        category: 'theology',
        language: 'Latin/English',
        filePath: '/books/summa-theologica.epub',
        coverImage: undefined,
        description: 'The masterwork of St. Thomas Aquinas, a comprehensive theological treatise.',
        isDominican: true,
        epubPath: '/books/summa-theologica.epub',
        epubSamplePath: '/books/summa-theologica-sample.epub',
        tags: ['theology', 'philosophy', 'scholasticism', 'dominican'],
        bookmarks: [],
        readingProgress: {
          bookId: 'summa-theologica',
          currentPosition: 0,
          totalPages: 3000,
          lastRead: new Date().toISOString(),
          timeSpent: 0
        }
      },
      {
        id: 'divine-comedy',
        title: 'The Divine Comedy',
        author: 'Dante Alighieri',
        category: 'spirituality',
        language: 'Italian/English',
        filePath: '/books/divine-comedy.epub',
        coverImage: undefined,
        description: 'Dante\'s epic poem describing his journey through Hell, Purgatory, and Paradise.',
        isDominican: false,
        epubPath: '/books/divine-comedy.epub',
        epubSamplePath: '/books/divine-comedy-sample.epub',
        tags: ['poetry', 'medieval', 'spirituality', 'allegory'],
        bookmarks: [],
        readingProgress: {
          bookId: 'divine-comedy',
          currentPosition: 0,
          totalPages: 500,
          lastRead: new Date().toISOString(),
          timeSpent: 0
        }
      },
      {
        id: 'confessions',
        title: 'Confessions',
        author: 'St. Augustine',
        category: 'spirituality',
        language: 'Latin/English',
        filePath: '/books/confessions.epub',
        coverImage: undefined,
        description: 'St. Augustine\'s autobiographical work and theological masterpiece.',
        isDominican: false,
        epubPath: '/books/confessions.epub',
        epubSamplePath: '/books/confessions-sample.epub',
        tags: ['autobiography', 'theology', 'patristic', 'conversion'],
        bookmarks: [],
        readingProgress: {
          bookId: 'confessions',
          currentPosition: 0,
          totalPages: 400,
          lastRead: new Date().toISOString(),
          timeSpent: 0
        }
      },
      {
        id: 'imitation-of-christ',
        title: 'The Imitation of Christ',
        author: 'Thomas à Kempis',
        category: 'spirituality',
        language: 'Latin/English',
        filePath: '/books/imitation-of-christ.epub',
        coverImage: undefined,
        description: 'A classic devotional book on Christian spirituality.',
        isDominican: false,
        epubPath: '/books/imitation-of-christ.epub',
        epubSamplePath: '/books/imitation-of-christ-sample.epub',
        tags: ['devotional', 'spirituality', 'meditation', 'christian'],
        bookmarks: [],
        readingProgress: {
          bookId: 'imitation-of-christ',
          currentPosition: 0,
          totalPages: 300,
          lastRead: new Date().toISOString(),
          timeSpent: 0
        }
      }
    ];

    this.books = sampleBooks;
    return this.books;
  }

  /**
   * Get all books
   */
  getAllBooks(): Book[] {
    return this.books;
  }

  /**
   * Get books by category
   */
  getBooksByCategory(category: BookCategory | 'all'): Book[] {
    if (category === 'all') {
      return this.books;
    }
    return this.books.filter(book => book.category === category);
  }

  /**
   * Search books by title or author
   */
  searchBooks(query: string): Book[] {
    const lowercaseQuery = query.toLowerCase();
    return this.books.filter(book => 
      book.title.toLowerCase().includes(lowercaseQuery) ||
      book.author.toLowerCase().includes(lowercaseQuery) ||
      book.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get a specific book by ID
   */
  getBookById(id: string): Book | undefined {
    return this.books.find(book => book.id === id);
  }

  /**
   * Update reading progress for a book
   */
  updateReadingProgress(bookId: string, progress: Partial<ReadingProgress>): void {
    const book = this.getBookById(bookId);
    if (book) {
      book.readingProgress = {
        ...book.readingProgress,
        ...progress,
        lastRead: new Date().toISOString()
      };
    }
  }

  /**
   * Add a bookmark to a book
   */
  addBookmark(bookId: string, bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark {
    const book = this.getBookById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }

    const newBookmark: Bookmark = {
      id: `bookmark-${Date.now()}`,
      ...bookmark,
      createdAt: new Date().toISOString()
    };

    book.bookmarks.push(newBookmark);
    return newBookmark;
  }

  /**
   * Remove a bookmark from a book
   */
  removeBookmark(bookId: string, bookmarkId: string): void {
    const book = this.getBookById(bookId);
    if (book) {
      book.bookmarks = book.bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
    }
  }

  /**
   * Get books with reading progress (for authenticated users)
   */
  getBooksWithProgress(): Book[] {
    return this.books.filter(book => book.readingProgress.currentPosition > 0);
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Set authentication status
   */
  setAuthenticationStatus(authenticated: boolean): void {
    this.isAuthenticated = authenticated;
  }

  /**
   * Get books that can be accessed by unauthenticated users (sample/preview)
   */
  getPublicBooks(): Book[] {
    return this.books.map(book => ({
      ...book,
      // For unauthenticated users, only show sample content
      epubPath: book.epubSamplePath,
      // Hide full reading progress
      readingProgress: {
        ...book.readingProgress,
        currentPosition: 0,
        timeSpent: 0
      }
    }));
  }

  /**
   * Get full books for authenticated users
   */
  getAuthenticatedBooks(): Book[] {
    return this.books;
  }
}

export default new BookService();