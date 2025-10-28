/**
 * Podcasts Page - Web
 */

import React, { useState, useMemo, useEffect } from 'react';
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
import { usePlaylists } from '../../../hooks/usePlaylists';
import { useQueue } from '../../../hooks/useQueue';

type TabType = 'library' | 'subscriptions' | 'playlists' | 'queue';

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
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Load curated podcasts
  const { podcasts: libraryPodcasts, loading: libraryLoading, refetch: refetchLibrary } = usePodcasts({
    search: searchQuery,
    limit: 50,
  });

  // Load user subscriptions (only if authenticated)
  const { subscriptions, loading: subsLoading, subscribe, unsubscribe, refetch: refetchSubs } = usePodcastSubscriptions();
  
  // Load playlists and queue
  const { playlists, loading: playlistsLoading } = usePlaylists();
  const { queue, loading: queueLoading } = useQueue();

  // Track initial load completion
  useEffect(() => {
    if (!libraryLoading && !subsLoading && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [libraryLoading, subsLoading, hasLoadedOnce]);

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

  const getDisplayData = () => {
    switch (activeTab) {
      case 'library':
        return { data: libraryPodcasts, loading: libraryLoading, type: 'podcasts' as const };
      case 'subscriptions':
        return { data: subscriptions, loading: subsLoading, type: 'podcasts' as const };
      case 'playlists':
        return { data: playlists, loading: playlistsLoading, type: 'playlists' as const };
      case 'queue':
        return { data: queue, loading: queueLoading, type: 'episodes' as const };
      default:
        return { data: [], loading: false, type: 'podcasts' as const };
    }
  };

  const { data: displayData, loading, type: dataType } = getDisplayData();

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
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={[styles.tabContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
          contentContainerStyle={styles.tabContent}
        >
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
              Library
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
                Subscriptions ({subscriptions.length})
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'playlists' && { borderBottomColor: Colors[colorScheme ?? 'light'].primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab('playlists')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'playlists' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              Playlists ({playlists.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'queue' && { borderBottomColor: Colors[colorScheme ?? 'light'].primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab('queue')}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === 'queue' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              Queue ({queue.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>

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
        {loading && !hasLoadedOnce ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Loading podcasts...
            </Text>
          </View>
        ) : displayData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={
                activeTab === 'library' ? 'radio-outline' :
                activeTab === 'subscriptions' ? 'person-outline' :
                activeTab === 'playlists' ? 'list-outline' :
                'list'
              } 
              size={64} 
              color={Colors[colorScheme ?? 'light'].textSecondary} 
            />
            <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {activeTab === 'library' && 'No podcasts found'}
              {activeTab === 'subscriptions' && 'No subscriptions yet'}
              {activeTab === 'playlists' && 'No playlists yet'}
              {activeTab === 'queue' && 'Queue is empty'}
            </Text>
            <Text style={[styles.emptyDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {activeTab === 'library' && 'Try adjusting your search or check back later for new content.'}
              {activeTab === 'subscriptions' && 'Browse the curated library to discover podcasts to subscribe to.'}
              {activeTab === 'playlists' && 'Create your first playlist to organize your favorite episodes.'}
              {activeTab === 'queue' && 'Add episodes to your queue to see them here.'}
            </Text>
          </View>
        ) : (
          <View style={[styles.podcastsGrid, { width: '100%', flexWrap: 'wrap' }]}>
            {dataType === 'podcasts' ? (
              (displayData as any[]).map((podcast) => (
                <View key={podcast.id} style={{ width: columnWidth as any, padding: isMobile ? 8 : 12 }}>
                  <PodcastCard
                    podcast={podcast}
                    onPress={() => handlePodcastPress(podcast.id)}
                    onSubscribe={handleSubscribe}
                    isSubscribed={isSubscribed(podcast.id)}
                    showSubscribeButton={activeTab === 'library'}
                  />
                </View>
              ))
            ) : dataType === 'playlists' ? (
              (displayData as any[]).map((playlist) => (
                <View key={playlist.id} style={{ width: columnWidth as any, padding: isMobile ? 8 : 12 }}>
                  <TouchableOpacity
                    style={[styles.playlistCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                    onPress={() => router.push(`/(tabs)/preaching/playlists/${playlist.id}` as any)}
                  >
                    <View style={styles.playlistIcon}>
                      <Ionicons 
                        name={playlist.isSystem ? "cloud-download" : "list"} 
                        size={24} 
                        color={Colors[colorScheme ?? 'light'].primary} 
                      />
                    </View>
                    <View style={styles.playlistInfo}>
                      <Text style={[styles.playlistName, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {playlist.name}
                      </Text>
                      <Text style={[styles.playlistMeta, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {playlist.isSystem ? 'System Playlist' : 'User Playlist'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
                  </TouchableOpacity>
                </View>
              ))
            ) : dataType === 'episodes' ? (
              (displayData as any[]).map((episode, index) => (
                <View key={episode.id} style={{ width: columnWidth as any, padding: isMobile ? 8 : 12 }}>
                  <TouchableOpacity
                    style={[styles.queueCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                    onPress={() => router.push(`/(tabs)/preaching/episode/${episode.id}`)}
                  >
                    <View style={styles.queuePosition}>
                      <Text style={[styles.queuePositionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.queueInfo}>
                      <Text style={[styles.queueTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
                        {episode.title}
                      </Text>
                      <Text style={[styles.queueMeta, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        Podcast Name
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
                  </TouchableOpacity>
                </View>
              ))
            ) : null}
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
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 24,
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginRight: 8,
    cursor: 'pointer',
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
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    cursor: 'pointer',
  },
  playlistIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    cursor: 'pointer',
  },
  queuePosition: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  queuePositionText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  queueInfo: {
    flex: 1,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  queueMeta: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
});

