import React from 'react';
import { render } from '@testing-library/react-native';
import EpubReader from '../EpubReader.native';

describe('EpubReader', () => {
  it('renders without crashing with minimal props', () => {
    const { toJSON } = render(<EpubReader fileUrl="https://example.com/book.epub" />);
    expect(toJSON()).toBeTruthy();
  });
});

