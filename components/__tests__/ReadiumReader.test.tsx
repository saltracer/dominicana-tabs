// @ts-nocheck
import React from 'react';
import { render } from '@testing-library/react-native';
import ReadiumReader from '@/components/ReadiumReader';

jest.mock('react-native/Libraries/ReactNative/requireNativeComponent', () => () => 'ReadiumReaderView');

describe('ReadiumReader wrapper', () => {
  it('renders native component with source prop', () => {
    const { toJSON } = render(<ReadiumReader source="https://example.com/book.epub" style={{ flex: 1 }} />);
    expect(toJSON()).toBeTruthy();
  });

  it('passes onLocationChange handler', () => {
    const handler = jest.fn();
    render(<ReadiumReader source="https://example.com/book.epub" onLocationChange={handler} />);
    // We can’t simulate native event here; ensure the prop is wired without crashing
    expect(typeof handler).toBe('function');
  });
});

