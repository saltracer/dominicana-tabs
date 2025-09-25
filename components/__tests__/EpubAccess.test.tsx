// @ts-nocheck
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ReaderScreen from '@/app/(tabs)/study/reader/[bookId]';
import { AuthProvider } from '@/contexts/AuthContext';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ bookId: 'summa-theologica' }),
  router: { back: jest.fn() }
}));

describe('ReaderScreen access gating', () => {
  it('prompts login when unauthenticated', () => {
    render(
      <AuthProvider>
        <ReaderScreen />
      </AuthProvider>
    );
    expect(screen.getByText(/You must be logged in/i)).toBeTruthy();
  });
});

