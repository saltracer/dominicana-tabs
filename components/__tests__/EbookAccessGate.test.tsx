import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import EbookAccessGate from '../EbookAccessGate';

const baseEbook = {
  id: 'book-1',
  title: 'Test Title',
  author: 'Test Author',
  description: 'Test description',
};

describe('EbookAccessGate', () => {
  it('renders info when not authenticated', () => {
    render(
      <EbookAccessGate isAuthenticated={false} ebook={baseEbook as any} />
    );

    expect(screen.getByText('Test Title')).toBeTruthy();
    expect(screen.getByText('Test Author')).toBeTruthy();
    expect(screen.getByText('Test description')).toBeTruthy();
    expect(screen.getByText('Log in to read')).toBeTruthy();
  });

  it('calls onLoginRequest when login button pressed', () => {
    const onLoginRequest = jest.fn();
    render(
      <EbookAccessGate isAuthenticated={false} ebook={baseEbook as any} onLoginRequest={onLoginRequest} />
    );

    fireEvent.press(screen.getByText('Log in to read'));
    expect(onLoginRequest).toHaveBeenCalled();
  });

  it('renders reader when authenticated and epubUrl provided', () => {
    const ebook = { ...baseEbook, epubUrl: 'https://example.com/book.epub' };
    render(
      <EbookAccessGate isAuthenticated={true} ebook={ebook as any} />
    );

    // The ReadiumView is mocked to render null or children; ensure no login button
    expect(screen.queryByText('Log in to read')).toBeNull();
  });
});

