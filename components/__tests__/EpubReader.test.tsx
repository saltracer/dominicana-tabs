import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EpubReader from '../EpubReader';
import BookService from '../../services/BookService';
import { Book } from '../../types';

// Mock the BookService
jest.mock('../../services/BookService');
const mockBookService = BookService as jest.Mocked<typeof BookService>;

// Mock WebView
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  return {
    WebView: ({ onMessage, ...props }: any) => (
      <View testID="webview" {...props} onMessage={onMessage} />
    ),
  };
});

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: any) => children,
}));

const mockBook: Book = {
  id: 'test-book-1',
  title: 'Test Book',
  author: 'Test Author',
  description: 'A test book for testing purposes',
  category: 'theology',
  language: 'English',
  filePath: '/books/test-book.epub',
  coverImage: undefined,
  isDominican: true,
  epubPath: '/books/test-book.epub',
  epubSamplePath: '/books/test-book-sample.epub',
  tags: ['test', 'theology'],
  bookmarks: [],
  readingProgress: {
    bookId: 'test-book-1',
    currentPosition: 0,
    totalPages: 100,
    lastRead: '2024-01-01T00:00:00Z',
    timeSpent: 0
  }
};

describe('EpubReader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBookService.isUserAuthenticated.mockReturnValue(true);
  });

  it('renders correctly with book data', () => {
    const onClose = jest.fn();
    const { getByText, getByTestId } = render(
      <EpubReader book={mockBook} onClose={onClose} />
    );

    expect(getByText('Test Book')).toBeTruthy();
    expect(getByText('Test Author')).toBeTruthy();
    expect(getByTestId('webview')).toBeTruthy();
  });

  it('shows loading state initially', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <EpubReader book={mockBook} onClose={onClose} />
    );

    expect(getByText('Loading book...')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <EpubReader book={mockBook} onClose={onClose} />
    );

    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('handles WebView messages correctly', async () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <EpubReader book={mockBook} onClose={onClose} />
    );

    const webView = getByTestId('webview');
    
    // Simulate READIUM_READY message
    fireEvent(webView, 'message', {
      nativeEvent: {
        data: JSON.stringify({
          type: 'READIUM_READY',
        }),
      },
    });

    await waitFor(() => {
      // Should no longer show loading
      expect(() => getByText('Loading book...')).toThrow();
    });
  });

  it('handles position change messages', async () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <EpubReader book={mockBook} onClose={onClose} />
    );

    const webView = getByTestId('webview');
    
    // Simulate position change
    fireEvent(webView, 'message', {
      nativeEvent: {
        data: JSON.stringify({
          type: 'READIUM_POSITION_CHANGED',
          position: 'chapter1',
          chapter: 2,
          totalChapters: 10,
          progressPercentage: 20,
        }),
      },
    });

    await waitFor(() => {
      expect(getByText('Chapter 2 of 10')).toBeTruthy();
    });
  });

  it('shows bookmark modal when bookmark button is pressed', async () => {
    const onClose = jest.fn();
    mockBookService.isUserAuthenticated.mockReturnValue(true);

    const { getByTestId, getByText } = render(
      <EpubReader book={mockBook} onClose={onClose} />
    );

    const bookmarkButton = getByTestId('bookmark-button');
    fireEvent.press(bookmarkButton);

    await waitFor(() => {
      expect(mockBookService.addBookmark).toHaveBeenCalledWith('test-book-1', {
        bookId: 'test-book-1',
        position: 0,
        note: 'Chapter 1',
      });
    });
  });

  it('handles navigation controls', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <EpubReader book={mockBook} onClose={onClose} />
    );

    const prevButton = getByTestId('prev-chapter-button');
    const nextButton = getByTestId('next-chapter-button');

    fireEvent.press(prevButton);
    fireEvent.press(nextButton);

    // Should not throw errors
    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();
  });

  it('shows login prompt for unauthenticated users', async () => {
    const onClose = jest.fn();
    mockBookService.isUserAuthenticated.mockReturnValue(false);

    const { getByText } = render(
      <EpubReader book={mockBook} onClose={onClose} />
    );

    await waitFor(() => {
      // Should not show bookmark functionality for unauthenticated users
      expect(() => getByTestId('bookmark-button')).toThrow();
    });
  });

  it('saves reading progress when closing', async () => {
    const onClose = jest.fn();
    mockBookService.isUserAuthenticated.mockReturnValue(true);

    const { getByTestId } = render(
      <EpubReader book={mockBook} onClose={onClose} />
    );

    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(mockBookService.updateReadingProgress).toHaveBeenCalled();
    });
  });
});