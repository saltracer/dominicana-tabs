import BookService from '../BookService';
import { Book } from '../../types';

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the service state
    BookService.initializeBooks();
  });

  describe('getAllBooks', () => {
    it('should return all books', () => {
      const books = BookService.getAllBooks();
      expect(books).toHaveLength(4);
      expect(books[0].title).toBe('Summa Theologica');
    });
  });

  describe('getBooksByCategory', () => {
    it('should return books filtered by category', () => {
      const theologyBooks = BookService.getBooksByCategory('theology');
      expect(theologyBooks).toHaveLength(1);
      expect(theologyBooks[0].category).toBe('theology');
    });

    it('should return all books when category is "all"', () => {
      const allBooks = BookService.getBooksByCategory('all');
      expect(allBooks).toHaveLength(4);
    });
  });

  describe('searchBooks', () => {
    it('should search books by title', () => {
      const results = BookService.searchBooks('Summa');
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Summa');
    });

    it('should search books by author', () => {
      const results = BookService.searchBooks('Aquinas');
      expect(results).toHaveLength(1);
      expect(results[0].author).toContain('Aquinas');
    });

    it('should search books by tags', () => {
      const results = BookService.searchBooks('dominican');
      expect(results).toHaveLength(1);
      expect(results[0].tags).toContain('dominican');
    });
  });

  describe('getBookById', () => {
    it('should return book by id', () => {
      const book = BookService.getBookById('summa-theologica');
      expect(book).toBeDefined();
      expect(book?.title).toBe('Summa Theologica');
    });

    it('should return undefined for non-existent id', () => {
      const book = BookService.getBookById('non-existent');
      expect(book).toBeUndefined();
    });
  });

  describe('updateReadingProgress', () => {
    it('should update reading progress for a book', () => {
      const book = BookService.getBookById('summa-theologica');
      expect(book?.readingProgress.currentPosition).toBe(0);

      BookService.updateReadingProgress('summa-theologica', {
        currentPosition: 100,
        timeSpent: 300,
      });

      const updatedBook = BookService.getBookById('summa-theologica');
      expect(updatedBook?.readingProgress.currentPosition).toBe(100);
      expect(updatedBook?.readingProgress.timeSpent).toBe(300);
    });
  });

  describe('addBookmark', () => {
    it('should add bookmark to a book', () => {
      const initialBookmarks = BookService.getBookById('summa-theologica')?.bookmarks.length || 0;
      
      const bookmark = BookService.addBookmark('summa-theologica', {
        bookId: 'summa-theologica',
        position: 150,
        note: 'Important section',
      });

      expect(bookmark.id).toBeDefined();
      expect(bookmark.position).toBe(150);
      expect(bookmark.note).toBe('Important section');

      const book = BookService.getBookById('summa-theologica');
      expect(book?.bookmarks).toHaveLength(initialBookmarks + 1);
    });
  });

  describe('removeBookmark', () => {
    it('should remove bookmark from a book', () => {
      // First add a bookmark
      const bookmark = BookService.addBookmark('summa-theologica', {
        bookId: 'summa-theologica',
        position: 150,
        note: 'Test bookmark',
      });

      const book = BookService.getBookById('summa-theologica');
      const initialBookmarks = book?.bookmarks.length || 0;

      BookService.removeBookmark('summa-theologica', bookmark.id);

      const updatedBook = BookService.getBookById('summa-theologica');
      expect(updatedBook?.bookmarks).toHaveLength(initialBookmarks - 1);
    });
  });

  describe('getBooksWithProgress', () => {
    it('should return books with reading progress', () => {
      // Update progress for a book
      BookService.updateReadingProgress('summa-theologica', {
        currentPosition: 50,
      });

      const booksWithProgress = BookService.getBooksWithProgress();
      expect(booksWithProgress).toHaveLength(1);
      expect(booksWithProgress[0].id).toBe('summa-theologica');
    });
  });

  describe('authentication', () => {
    it('should check authentication status', () => {
      expect(BookService.isUserAuthenticated()).toBe(false);
      
      BookService.setAuthenticationStatus(true);
      expect(BookService.isUserAuthenticated()).toBe(true);
    });
  });

  describe('getPublicBooks', () => {
    it('should return books with sample content for unauthenticated users', () => {
      BookService.setAuthenticationStatus(false);
      const publicBooks = BookService.getPublicBooks();
      
      expect(publicBooks).toHaveLength(4);
      // Should have sample paths instead of full paths
      expect(publicBooks[0].epubPath).toContain('sample');
    });
  });

  describe('getAuthenticatedBooks', () => {
    it('should return full books for authenticated users', () => {
      BookService.setAuthenticationStatus(true);
      const authenticatedBooks = BookService.getAuthenticatedBooks();
      
      expect(authenticatedBooks).toHaveLength(4);
      // Should have full paths, not sample paths
      expect(authenticatedBooks[0].epubPath).not.toContain('sample');
    });
  });
});