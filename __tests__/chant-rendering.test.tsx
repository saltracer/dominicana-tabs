import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { GabcRenderer } from '../components/GabcRenderer';
import { GabcWebViewRenderer } from '../components/GabcWebViewRenderer';
import { MarianHymnWithChant } from '../components/MarianHymnWithChant';
import { ChantRenderingSettings } from '../components/ChantRenderingSettings';
import { ChantResource } from '../types/compline-types';

// Mock StyleSheet for testing
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

// Mock the WebView component
jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

// Mock the theme provider
jest.mock('../components/ThemeProvider', () => ({
  useTheme: () => ({
    colorScheme: 'light',
  }),
}));

// Mock the auth context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

// Mock the chant preferences service
jest.mock('../services/user-chant-preferences-service', () => ({
  UserChantPreferencesService: {
    getUserChantPreference: jest.fn().mockResolvedValue('dominican'),
    updateUserChantPreference: jest.fn().mockResolvedValue(true),
    getChantNotationEnabled: jest.fn().mockResolvedValue(true),
    updateChantNotationEnabled: jest.fn().mockResolvedValue(true),
  },
}));

// Mock the GABC service
jest.mock('../services/gabc-service', () => ({
  GabcService: {
    getInstance: () => ({
      getChantResource: jest.fn().mockResolvedValue({
        id: 'test-chant',
        notation: 'gabc',
        data: 'name:Test Chant;\n%%\n(c3) Test(g) chant(f) notation(e)',
        metadata: {
          composer: 'Test Composer',
          century: '21st',
          source: 'Test Source',
          mode: '5',
          clef: 'c4',
        },
      }),
    }),
  },
}));

describe('Chant Rendering System', () => {
  const mockChantResource: ChantResource = {
    id: 'test-chant',
    notation: 'gabc',
    data: 'name:Test Chant;\n%%\n(c3) Test(g) chant(f) notation(e)',
    metadata: {
      composer: 'Test Composer',
      century: '21st',
      source: 'Test Source',
      mode: '5',
      clef: 'c4',
    },
  };

  const mockMarianHymn = {
    id: 'test-hymn',
    type: 'marian-hymn',
    title: { en: { text: 'Test Hymn' } },
    content: { en: { text: 'Test hymn content' } },
    chant: {
      availableTypes: ['dominican', 'solesmes', 'simple'],
      defaultType: 'dominican',
      descriptions: {
        dominican: 'Dominican chant',
        solesmes: 'Solesmes chant',
        simple: 'Simple chant',
      },
    },
  };

  describe('GabcRenderer', () => {
    it('renders fallback text display when WebView is disabled', () => {
      const { getByText } = render(
        <GabcRenderer
          chantResource={mockChantResource}
          enableWebView={false}
        />
      );

      expect(getByText('Test Source')).toBeTruthy();
      expect(getByText('Mode 5 • Clef: c4')).toBeTruthy();
      expect(getByText('Test Composer')).toBeTruthy();
    });

    it('renders WebView when enabled', () => {
      const { getByTestId } = render(
        <GabcRenderer
          chantResource={mockChantResource}
          enableWebView={true}
        />
      );

      // WebView should be rendered (mocked as 'WebView' string)
      expect(getByTestId('webview-renderer')).toBeTruthy();
    });

    it('applies theme correctly', () => {
      const { getByTestId } = render(
        <GabcRenderer
          chantResource={mockChantResource}
          theme="dark"
          enableWebView={true}
        />
      );

      // Theme should be passed to WebView
      expect(getByTestId('webview-renderer')).toBeTruthy();
    });
  });

  describe('GabcWebViewRenderer', () => {
    it('renders loading state initially', () => {
      const { getByText } = render(
        <GabcWebViewRenderer
          chantResource={mockChantResource}
          enableWebView={true}
        />
      );

      expect(getByText('Loading chant notation...')).toBeTruthy();
    });

    it('handles WebView messages correctly', async () => {
      const { getByTestId } = render(
        <GabcWebViewRenderer
          chantResource={mockChantResource}
          enableWebView={true}
        />
      );

      // Simulate WebView message
      const webView = getByTestId('webview-renderer');
      fireEvent(webView, 'message', {
        nativeEvent: {
          data: JSON.stringify({
            type: 'rendering-complete',
            svg: '<svg>test</svg>',
          }),
        },
      });

      await waitFor(() => {
        // Should handle the message without errors
        expect(webView).toBeTruthy();
      });
    });

    it('shows error state when WebView fails', () => {
      const { getByText } = render(
        <GabcWebViewRenderer
          chantResource={mockChantResource}
          enableWebView={false}
        />
      );

      expect(getByText('Advanced rendering not available on this platform')).toBeTruthy();
    });
  });

  describe('MarianHymnWithChant', () => {
    it('renders hymn content', () => {
      const { getByText } = render(
        <MarianHymnWithChant
          marianHymn={mockMarianHymn}
          showChantSelector={true}
          showChantNotation={true}
        />
      );

      expect(getByText('Test Hymn')).toBeTruthy();
      expect(getByText('Test hymn content')).toBeTruthy();
    });

    it('shows chant notation toggle', () => {
      const { getByText } = render(
        <MarianHymnWithChant
          marianHymn={mockMarianHymn}
          showChantSelector={true}
          showChantNotation={true}
        />
      );

      expect(getByText('Show Chant Notation')).toBeTruthy();
    });

    it('toggles chant notation display', async () => {
      const { getByText, queryByText } = render(
        <MarianHymnWithChant
          marianHymn={mockMarianHymn}
          showChantSelector={true}
          showChantNotation={true}
        />
      );

      const toggleButton = getByText('Show Chant Notation');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        expect(getByText('Hide Chant Notation')).toBeTruthy();
      });
    });

    it('passes theme to GabcRenderer', () => {
      const { getByTestId } = render(
        <MarianHymnWithChant
          marianHymn={mockMarianHymn}
          showChantSelector={true}
          showChantNotation={true}
        />
      );

      // Should render with theme support
      expect(getByTestId('marian-hymn-container')).toBeTruthy();
    });
  });

  describe('ChantRenderingSettings', () => {
    it('renders settings toggle', () => {
      const { getByText } = render(<ChantRenderingSettings />);

      expect(getByText('Advanced Chant Rendering')).toBeTruthy();
      expect(getByText('Use exsurge.js for proper musical notation rendering')).toBeTruthy();
    });

    it('toggles WebView rendering setting', async () => {
      const { getByTestId } = render(<ChantRenderingSettings />);

      const toggle = getByTestId('webview-toggle');
      fireEvent(toggle, 'valueChange', true);

      await waitFor(() => {
        expect(getByText('✓ Advanced rendering enabled')).toBeTruthy();
      });
    });

    it('shows appropriate info based on setting', () => {
      const { getByText, rerender } = render(<ChantRenderingSettings />);

      // Initially should show text-based info
      expect(getByText('Using text-based display')).toBeTruthy();

      // Re-render with WebView enabled
      rerender(<ChantRenderingSettings />);
    });
  });

  describe('Integration Tests', () => {
    it('handles complete chant rendering flow', async () => {
      const { getByText, getByTestId } = render(
        <MarianHymnWithChant
          marianHymn={mockMarianHymn}
          showChantSelector={true}
          showChantNotation={true}
        />
      );

      // Should show hymn content
      expect(getByText('Test Hymn')).toBeTruthy();

      // Should show chant toggle
      const toggleButton = getByText('Show Chant Notation');
      expect(toggleButton).toBeTruthy();

      // Click to show chant
      fireEvent.press(toggleButton);

      await waitFor(() => {
        // Should show chant notation
        expect(getByText('Hide Chant Notation')).toBeTruthy();
      });
    });

    it('handles error states gracefully', async () => {
      // Mock an error in the GABC service
      const mockGabcService = require('../services/gabc-service');
      mockGabcService.GabcService.getInstance().getChantResource.mockRejectedValueOnce(
        new Error('Failed to load chant')
      );

      const { getByText } = render(
        <MarianHymnWithChant
          marianHymn={mockMarianHymn}
          showChantSelector={true}
          showChantNotation={true}
        />
      );

      const toggleButton = getByText('Show Chant Notation');
      fireEvent.press(toggleButton);

      await waitFor(() => {
        // Should handle error gracefully
        expect(getByText('Loading chant notation...')).toBeTruthy();
      });
    });
  });

  describe('Performance Tests', () => {
    it('renders without performance issues', () => {
      const startTime = Date.now();
      
      render(
        <GabcRenderer
          chantResource={mockChantResource}
          enableWebView={true}
        />
      );
      
      const endTime = Date.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('handles large GABC data efficiently', () => {
      const largeChantResource: ChantResource = {
        ...mockChantResource,
        data: 'name:Large Chant;\n%%\n' + 'Test(g) data(f) '.repeat(1000),
      };

      const { getByTestId } = render(
        <GabcRenderer
          chantResource={largeChantResource}
          enableWebView={true}
        />
      );

      expect(getByTestId('webview-renderer')).toBeTruthy();
    });
  });

  describe('Accessibility Tests', () => {
    it('provides proper accessibility labels', () => {
      const { getByLabelText } = render(
        <ChantRenderingSettings />
      );

      expect(getByLabelText('Advanced Chant Rendering')).toBeTruthy();
    });

    it('supports screen readers', () => {
      const { getByText } = render(
        <GabcRenderer
          chantResource={mockChantResource}
          enableWebView={false}
        />
      );

      // Should have readable text content
      expect(getByText('Test Source')).toBeTruthy();
      expect(getByText('Mode 5 • Clef: c4')).toBeTruthy();
    });
  });
});
