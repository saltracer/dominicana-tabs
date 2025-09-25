import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ReaderLocator, ReaderSettings } from '../types/ebook';

export interface EpubReaderWebProps {
  fileUrl: string;
  initialLocator?: ReaderLocator;
  settings?: ReaderSettings;
}

export default function EpubReaderWeb({ fileUrl }: EpubReaderWebProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        EPUB reading is available on iOS and Android in the development build. Selected file: {fileUrl}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  message: {
    textAlign: 'center',
  },
});

