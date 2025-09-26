import React from 'react';
import { render } from '@testing-library/react-native';
import { EpubReader } from '../components/EpubReader';

// Mock the ReadiumView component
jest.mock('react-native-readium', () => ({
  ReadiumView: ({ file }: { file: { url: string } }) => {
    const { View, Text } = require('react-native');
    return (
      <View testID="readium-view">
        <Text>EPUB Reader - {file.url}</Text>
      </View>
    );
  },
}));

// Mock the supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        createSignedUrl: jest.fn(),
      })),
    },
  },
}));

describe('EpubReader', () => {
  const mockBook = {
    id: 1,
    title: 'Test Book',
    author: 'Test Author',
    year: '2023',
    category: 'Philosophy',
    coverImage: 'https://example.com/cover.jpg',
    description: 'A test book description',
    epubPath: 'https://example.com/storage/v1/object/public/epub_files/test-book.epub',
    epubSamplePath: 'https://example.com/storage/v1/object/public/epub_files/test-book-sample.epub',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    bookmarks: [],
    readingProgress: {
      bookId: 1,
      currentPosition: 0,
      totalPages: 0,
      lastRead: '2023-01-01T00:00:00Z',
      timeSpent: 0,
    },
  };

  const mockOnClose = jest.fn();

  it('renders loading state initially', () => {
    const { getByText } = render(
      <EpubReader book={mockBook} onClose={mockOnClose} />
    );
    
    expect(getByText('Loading book...')).toBeTruthy();
  });

  it('renders error state when book has no epub path', () => {
    const bookWithoutEpub = { ...mockBook, epubPath: null };
    const { getByText } = render(
      <EpubReader book={bookWithoutEpub} onClose={mockOnClose} />
    );
    
    expect(getByText('This book is not available for reading.')).toBeTruthy();
  });
});