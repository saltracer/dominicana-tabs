// @ts-nocheck
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

type EpubReaderWebProps = {
  signedUrl: string;
  initialLocation?: string;
};

export default function EpubReaderWeb({ signedUrl, initialLocation }: EpubReaderWebProps) {
  const src = useMemo(() => {
    const url = new URL(signedUrl);
    if (initialLocation) url.searchParams.set('loc', initialLocation);
    return url.toString();
  }, [signedUrl, initialLocation]);

  return (
    <View style={styles.container}>
      <iframe src={src} style={styles.iframe as any} title="epub-reader" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  iframe: {
    border: 'none',
    width: '100%',
    height: '100%'
  }
});

