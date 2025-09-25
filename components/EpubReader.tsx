// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type EpubReaderProps = {
  signedUrl: string;
  initialLocation?: string;
};

export default function EpubReader(props: EpubReaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>EPUB Reader is not yet implemented on this platform.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholder: {
    fontSize: 14
  }
});

