import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import EpubReader from './EpubReader.native';
import type { Ebook } from '../types/ebook';

export interface EbookAccessGateProps {
  isAuthenticated: boolean;
  ebook: Ebook;
  onLoginRequest?: () => void;
  onLocatorChange?: (locator: any) => void;
}

export default function EbookAccessGate({ isAuthenticated, ebook, onLoginRequest, onLocatorChange }: EbookAccessGateProps) {
  if (isAuthenticated && ebook.epubUrl) {
    return (
      <View style={styles.readerContainer}>
        <EpubReader fileUrl={ebook.epubUrl} onLocationChange={onLocatorChange} />
      </View>
    );
  }

  return (
    <View style={styles.infoContainer}>
      {ebook.coverImageUrl ? (
        <Image source={{ uri: ebook.coverImageUrl }} style={styles.cover} resizeMode="cover" />
      ) : null}
      <Text style={styles.title}>{ebook.title}</Text>
      <Text style={styles.author}>{ebook.author}</Text>
      {ebook.description ? <Text style={styles.description}>{ebook.description}</Text> : null}
      {!isAuthenticated && (
        <Button title="Log in to read" onPress={onLoginRequest} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  readerContainer: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  cover: {
    width: 160,
    height: 240,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  author: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
    color: '#666'
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
  },
});

