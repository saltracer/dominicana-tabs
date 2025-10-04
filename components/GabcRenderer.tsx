import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native';
import { ChantResource } from '@/types/compline-types';
import { GabcWebViewRenderer } from './GabcWebViewRenderer';

interface GabcRendererProps {
  chantResource: ChantResource;
  width?: number;
  height?: number;
  style?: any;
  theme?: 'light' | 'dark';
  enableWebView?: boolean;
}

export const GabcRenderer: React.FC<GabcRendererProps> = ({
  chantResource,
  width,
  height,
  style,
  theme = 'light',
  enableWebView = true
}) => {
  const containerRef = useRef<View>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chantResource && chantResource.data) {
      renderGabc();
    }
  }, [chantResource]);

  const formatGabcData = (gabcData: string): string => {
    // Format GABC data for better readability
    const lines = gabcData.split('\n');
    const formattedLines = lines.map(line => {
      // Add some spacing and formatting
      if (line.trim().startsWith('name:')) {
        return `📝 ${line.trim()}`;
      } else if (line.trim().startsWith('office-part:')) {
        return `🎵 ${line.trim()}`;
      } else if (line.trim().startsWith('mode:')) {
        return `🎼 ${line.trim()}`;
      } else if (line.trim().startsWith('book:')) {
        return `📚 ${line.trim()}`;
      } else if (line.trim().startsWith('transcriber:')) {
        return `✍️ ${line.trim()}`;
      } else if (line.trim() === '%%') {
        return '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
      } else if (line.trim().length > 0) {
        return `   ${line.trim()}`;
      }
      return line;
    });
    
    return formattedLines.join('\n');
  };

  const renderGabc = async () => {
    try {
      setIsLoaded(false);
      setError(null);

      // For React Native, we'll show a simplified representation
      // In a production app, you would integrate with a native SVG library
      // or use a web view with exsurge.js
      
      console.log('Rendering GABC for React Native:', {
        chantResource: chantResource.id,
        metadata: chantResource.metadata,
        dataLength: chantResource.data.length
      });

      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsLoaded(true);
    } catch (error) {
      console.error('Error rendering GABC:', error);
      setError(error instanceof Error ? error.message : 'Failed to render chant');
      setIsLoaded(true);
    }
  };

  if (error) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to display chant notation
          </Text>
          <Text style={styles.errorSubtext}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  // Use WebView renderer if enabled and supported
  if (enableWebView && Platform.OS !== 'web') {
    return (
      <GabcWebViewRenderer
        chantResource={chantResource}
        width={width}
        height={height}
        style={style}
        theme={theme}
        enableWebView={enableWebView}
      />
    );
  }

  // Fallback to text-based display
  return (
    <View style={[styles.container, style]}>
      <View 
        style={[
          styles.renderer,
          { 
            width: width || '100%',
            height: height || 300,
            minHeight: 200
          }
        ]}
      >
        {isLoaded ? (
          <View style={styles.chantDisplay}>
            <Text style={styles.chantTitle}>
              {chantResource.metadata.source || 'Gregorian Chant'}
            </Text>
            <Text style={styles.chantMode}>
              Mode {chantResource.metadata.mode || 'Unknown'} • Clef: {chantResource.metadata.clef || 'c4'}
            </Text>
            <Text style={styles.chantInfo}>
              {chantResource.metadata.composer || 'Traditional'}
            </Text>
            <View style={styles.gabcContainer}>
              <Text style={styles.gabcLabel}>GABC Notation:</Text>
              <ScrollView 
                style={styles.gabcScrollView}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                <Text style={styles.gabcText}>
                  {formatGabcData(chantResource.data)}
                </Text>
              </ScrollView>
            </View>
            <Text style={styles.chantNote}>
              Note: This is the raw GABC notation. For musical rendering, exsurge.js integration is required.
            </Text>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading chant notation...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  renderer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '500',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chantDisplay: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chantTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
    textAlign: 'center',
  },
  chantMode: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  chantClef: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  chantInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  chantData: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  chantNote: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
  gabcContainer: {
    width: '100%',
    marginTop: 12,
    marginBottom: 8,
  },
  gabcLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  gabcScrollView: {
    maxHeight: 200,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gabcText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    padding: 12,
    lineHeight: 16,
  },
});
