// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { EbooksService } from '@/services/EbooksService';
import { useAuth } from '@/contexts/AuthContext';

export default function BookDetailsScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { isAuthenticated, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await EbooksService.getBookById(String(bookId));
      setBook(data);
      setLoading(false);
    })();
  }, [bookId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.center}>
        <Text>Book not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author}</Text>
      <Text style={styles.description}>{book.description}</Text>

      {!isAuthenticated ? (
        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Login to Read</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push({ pathname: '/(tabs)/study/reader/[bookId]', params: { bookId } })}
        >
          <Text style={styles.buttonText}>Open Reader</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  author: { fontSize: 16, marginBottom: 12 },
  description: { fontSize: 14, opacity: 0.8, marginBottom: 20 },
  button: { paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderRadius: 6 },
  buttonText: { fontWeight: '600' },
});

