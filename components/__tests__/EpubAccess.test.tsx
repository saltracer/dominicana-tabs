// @ts-nocheck
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import ReaderScreen from '@/app/(tabs)/study/reader/[bookId]';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ bookId: 'summa-theologica' }),
  router: { back: jest.fn() }
}));

describe('ReaderScreen access gating', () => {
  it('prompts login when unauthenticated', () => {
    render(<ReaderScreen />);
    expect(screen.getByText(/You must be logged in/i)).toBeTruthy();
  });
});

