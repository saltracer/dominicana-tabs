// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import ReadiumReader from '@/components/ReadiumReader';
import { useAuth } from '@/contexts/AuthContext';
import { EbooksService } from '@/services/EbooksService';

export default function ReaderScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { isAuthenticated, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      // In real impl, fetch book by id to get filePath then sign
      const filePath = `${bookId}.epub`;
      const url = await EbooksService.getSignedFileUrl(filePath);
      setSignedUrl(url);
      setLoading(false);
    })();
  }, [isAuthenticated, bookId]);

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>You must be logged in to read this book.</Text>
        <TouchableOpacity onPress={login} style={styles.button}>
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
      <ReadiumReader source={signedUrl} style={{ flex: 1 }} />
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

