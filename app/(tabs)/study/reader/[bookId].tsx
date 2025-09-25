// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import EpubReaderWeb from '@/components/EpubReader.web';

export default function ReaderScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const onRequireLogin = () => {
    Alert.alert('Login Required', 'Please login to read this book.', [
      { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
      { text: 'Login', onPress: () => setIsAuthenticated(true) }
    ]);
  };

  useMemo(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    // TODO: Replace with Supabase signed URL retrieval
    setTimeout(() => {
      setSignedUrl(`/reader.html?book=${encodeURIComponent(String(bookId))}`);
      setLoading(false);
    }, 300);
  }, [isAuthenticated, bookId]);

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>You must be logged in to read this book.</Text>
        <TouchableOpacity onPress={onRequireLogin} style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || !signedUrl) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EpubReaderWeb signedUrl={signedUrl} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  text: { fontSize: 16, marginBottom: 12 },
  button: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderRadius: 6 },
  buttonText: { fontWeight: '600' }
});

