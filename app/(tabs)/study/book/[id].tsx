import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import EbookAccessGate from '../../../../components/EbookAccessGate';
import EbookService from '../../../../services/EbookService';
import type { Ebook } from '../../../../types/ebook';

export default function BookDetailScreen() {
  const raw = useLocalSearchParams();
  const params = (raw ?? {}) as { id: string };
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const meta = await EbookService.getBookMetadata(params.id as string);
        if (isMounted) setEbook(meta);
      } catch (e) {
        Alert.alert('Error', 'Unable to load book details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [params.id]);

  const onLoginRequest = useCallback(() => {
    Alert.alert('Login', 'Implement navigation to login.');
  }, []);

  if (loading || !ebook) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <EbookAccessGate
      isAuthenticated={isAuthenticated}
      ebook={ebook}
      onLoginRequest={onLoginRequest}
      onLocatorChange={(loc) => {
        EbookService.saveReadingLocator(ebook.id, loc as any).catch(() => {});
      }}
    />
  );
}

