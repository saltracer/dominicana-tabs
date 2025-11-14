/**
 * Shared Podcast Landing Page - Web
 * View and subscribe to podcasts shared via link
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import { useUserPodcasts } from '../../hooks/useUserPodcasts';
import { useAuth } from '../../contexts/AuthContext';
import { Podcast } from '../../types/podcast-types';
import Footer from '../../components/Footer.web';

export default function SharedPodcastWebScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { getPodcastByShareToken, subscribeViaShareLink, loading: actionLoading } = useUserPodcasts();
  
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPodcast();
  }, [token]);

  const loadPodcast = async () => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await getPodcastByShareToken(token as string);
      if (result) {
        setPodcast(result);
      } else {
        setError('Podcast not found or link expired');
      }
    } catch (err) {
      setError('Failed to load podcast');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe to this podcast.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/auth') },
      ]);
      return;
    }

    if (!token) return;

    const result = await subscribeViaShareLink(token as string);
    if (result.success) {
      Alert.alert(
        'Success',
        'You are now subscribed to this podcast!',
        [{ text: 'View Podcast', onPress: () => router.push(`/(tabs)/preaching/podcast/${podcast?.id}`) }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to subscribe');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading podcast...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !podcast) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {error || 'Podcast Not Found'}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <Footer />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.main}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>

          <View style={styles.header}>
            {podcast.artworkUrl && (
              <Image source={{ uri: podcast.artworkUrl }} style={styles.artwork} />
            )}
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              {podcast.title}
            </Text>
            {podcast.author && (
              <Text style={[styles.author, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                by {podcast.author}
              </Text>
            )}
            {podcast.isCurated && (
              <View style={[styles.badge, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="checkmark-circle" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  Curated
                </Text>
              </View>
            )}
          </View>

          {podcast.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                About
              </Text>
              <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].text }]}>
                {podcast.description}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.subscribeButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].primary },
              actionLoading && styles.disabledButton,
            ]}
            onPress={handleSubscribe}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Add to My Podcasts</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  main: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    padding: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 20,
    cursor: 'pointer' as any,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    cursor: 'pointer' as any,
  },
  subscribeButton: {
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed' as any,
  },
});

