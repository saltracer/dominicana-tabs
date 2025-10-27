/**
 * Podcasts Page - Web
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import Footer from '../../../components/Footer.web';
import { PodcastCard } from '../../../components/PodcastCard.web';
import { usePodcasts } from '../../../hooks/usePodcasts';
import { usePodcastSubscriptions } from '../../../hooks/usePodcastSubscriptions';
import { useAuth } from '../../../contexts/AuthContext';
import { useIsMobile, useIsTablet, useIsDesktop } from '../../../hooks/useMediaQuery';

type TabType = 'library' | 'subscriptions';

export default function PodcastsWebScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Load curated podcasts
  const { podcasts: libraryPodcasts, loading: libraryLoading, refetch: refetchLibrary } = usePodcasts({
    search: searchQuery,
    limit: 50,
  });

  // Load user subscriptions (only if authenticated)
  const { subscriptions, loading: subsLoading, subscribe, unsubscribe, refetch: refetchSubs } = usePodcastSubscriptions();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchLibrary(), user ? refetchSubs() : Promise.resolve()]);
    setRefreshing(false);
  };

  const handleSubscribe = async (podcastId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe to podcasts.');
      return;
    }

    const isSubscribed = subscriptions.some(s => s.id === podcastId);
    if (isSubscribed) {
      const success = await unsubscribe(podcastId);
      if (success) {
        Alert.alert('Unsubscribed', 'You have unsubscribed from this podcast.');
      }
    } else {
      const success = await subscribe(podcastId);
      if (success) {
        Alert.alert('Subscribed', 'You are now subscribed to this podcast.');
      }
    }
  };

  const handlePodcastPress = (podcastId: string) => {
    router.push(`/(tabs)/preaching/podcast/${podcastId}`);
  };

  const isSubscribed = (podcastId: string) => {
    return subscriptions.some(s => s.id === podcastId);
  };

  const displayPodcasts = activeTab === 'library' ? libraryPodcasts : subscriptions;
  const loading = activeTab === 'library' ? libraryLoading : subsLoading;

  // Responsive column configuration
  const numColumns = useMemo(() => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    if (isDesktop && width < 1200) return 3;
    return 4; // Wide desktop
  }, [isMobile, isTablet, isDesktop, width]);

  const columnWidth = `${100 / numColumns - 1}%`;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Podcasts
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Discover and listen to spiritual talks and theological discussions
          </Text>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'library' && { borderBottomColor: Colors[colorScheme ?? 'light'].primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab('library')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'library' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              Curated Library
            </Text>
          </TouchableOpacity>
          {user && (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'subscriptions' && { borderBottomColor: Colors[colorScheme ?? 'light'].primary, borderBottomWidth: 2 }
              ]}
              onPress={() => setActiveTab('subscriptions')}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === 'subscriptions' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary }
              ]}>
                My Subscriptions ({subscriptions.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Search podcasts..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Loading podcasts...
            </Text>
          </View>
        ) : displayPodcasts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="radio-outline" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {activeTab === 'library' 
                ? 'No podcasts found' 
                : 'No subscriptions yet'}
            </Text>
            <Text style={[styles.emptyDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {activeTab === 'library'
                ? 'Try adjusting your search or check back later for new content.'
                : 'Browse the curated library to discover podcasts to subscribe to.'}
            </Text>
          </View>
        ) : (
          <View style={[styles.podcastsGrid, { width: '100%', flexWrap: 'wrap' }]}>
            {displayPodcasts.map((podcast) => (
              <View key={podcast.id} style={{ width: columnWidth, padding: isMobile ? 8 : 12 }}>
                <PodcastCard
                  podcast={podcast}
                  onPress={() => handlePodcastPress(podcast.id)}
                  onSubscribe={handleSubscribe}
                  isSubscribed={isSubscribed(podcast.id)}
                  showSubscribeButton={activeTab === 'library'}
                />
              </View>
            ))}
          </View>
        )}

        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 24,
  },
  podcastsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
});

