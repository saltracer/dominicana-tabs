import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ReadiumView } from 'react-native-readium';
import type { ReaderLocator, ReaderSettings } from '../types/ebook';

export interface EpubReaderProps {
  fileUrl: string;
  initialLocator?: ReaderLocator;
  settings?: ReaderSettings;
  onLocationChange?: (locator: ReaderLocator) => void;
  onError?: (error: Error | unknown) => void;
}

export function EpubReader({ fileUrl, initialLocator, settings, onLocationChange, onError }: EpubReaderProps) {
  const file = useMemo(() => ({ url: fileUrl }), [fileUrl]);

  return (
    <View style={styles.container}>
      <ReadiumView
        file={file as any}
        locator={initialLocator as any}
        settings={settings as any}
        onLocationChange={(loc: any) => {
          if (onLocationChange) {
            onLocationChange(loc as ReaderLocator);
          }
        }}
        onError={(err: any) => {
          if (onError) {
            onError(err);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default EpubReader;

