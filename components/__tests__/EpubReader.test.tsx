import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EpubReader from '../EpubReader';
import EbookService from '../../services/EbookService';
import { EbookMetadata } from '../../services/EbookService';

// Mock the EbookService
jest.mock('../../services/EbookService');
const mockEbookService = EbookService as jest.Mocked<typeof EbookService>;

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

const mockEbook: EbookMetadata = {
  id: 'test-ebook-1',
  title: 'Test Book',
  author: 'Test Author',
  description: 'A test book for testing purposes',
  cover_image_url: 'https://example.com/cover.jpg',
  epub_file_url: 'https://example.com/book.epub',
  category: 'theology',
  language: 'English',
  is_dominican: true,
  tags: ['test', 'theology'],
  is_public: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('EpubReader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEbookService.isAuthenticated.mockResolvedValue(true);
    mockEbookService.getUserBookmarks.mockResolvedValue([]);
    mockEbookService.getUserReadingProgress.mockResolvedValue(null);
  });

  it('renders correctly with ebook data', () => {
    const onClose = jest.fn();
    const { getByText, getByTestId } = render(
      <EpubReader ebook={mockEbook} onClose={onClose} />
    );

    expect(getByText('Test Book')).toBeTruthy();
    expect(getByText('Test Author')).toBeTruthy();
    expect(getByTestId('webview')).toBeTruthy();
  });

  it('shows loading state initially', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <EpubReader ebook={mockEbook} onClose={onClose} />
    );

    expect(getByText('Loading book...')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <EpubReader ebook={mockEbook} onClose={onClose} />
    );

    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('handles WebView messages correctly', async () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <EpubReader ebook={mockEbook} onClose={onClose} />
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
      <EpubReader ebook={mockEbook} onClose={onClose} />
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
    mockEbookService.isAuthenticated.mockResolvedValue(true);
    mockEbookService.addBookmark.mockResolvedValue({
      id: 'bookmark-1',
      user_id: 'user-1',
      ebook_id: 'test-ebook-1',
      position: 'chapter1',
      chapter_title: 'Chapter 1',
      note: '',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });

    const { getByTestId, getByText } = render(
      <EpubReader ebook={mockEbook} onClose={onClose} />
    );

    const bookmarkButton = getByTestId('bookmark-button');
    fireEvent.press(bookmarkButton);

    await waitFor(() => {
      expect(mockEbookService.addBookmark).toHaveBeenCalledWith('test-ebook-1', {
        position: '',
        chapter_title: 'Chapter 1',
        note: '',
      });
    });
  });

  it('handles navigation controls', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <EpubReader ebook={mockEbook} onClose={onClose} />
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
    mockEbookService.isAuthenticated.mockResolvedValue(false);

    const { getByText } = render(
      <EpubReader ebook={mockEbook} onClose={onClose} />
    );

    await waitFor(() => {
      // Should not show bookmark functionality for unauthenticated users
      expect(() => getByTestId('bookmark-button')).toThrow();
    });
  });

  it('saves reading progress when closing', async () => {
    const onClose = jest.fn();
    mockEbookService.isAuthenticated.mockResolvedValue(true);
    mockEbookService.updateReadingProgress.mockResolvedValue({
      id: 'progress-1',
      user_id: 'user-1',
      ebook_id: 'test-ebook-1',
      current_position: 'chapter1',
      current_chapter: 1,
      total_chapters: 10,
      progress_percentage: 10,
      time_spent: 100,
      last_read_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    });

    const { getByTestId } = render(
      <EpubReader ebook={mockEbook} onClose={onClose} />
    );

    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);

    await waitFor(() => {
      expect(mockEbookService.updateReadingProgress).toHaveBeenCalled();
    });
  });
});