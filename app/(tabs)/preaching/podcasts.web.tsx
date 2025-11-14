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
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import Footer from '../../../components/Footer.web';
import { PodcastCard } from '../../../components/PodcastCard.web';
import { usePodcasts } from '../../../hooks/usePodcasts';
import { useMyPodcasts } from '../../../hooks/useMyPodcasts';
import { useAuth } from '../../../contexts/AuthContext';
import { useIsMobile, useIsTablet, useIsDesktop } from '../../../hooks/useMediaQuery';
import { usePlaylists } from '../../../hooks/usePlaylists';
import { useQueue } from '../../../hooks/useQueue';
import AddCustomPodcastModal from '../../../components/AddCustomPodcastModal.web';

type TabType = 'library' | 'my_podcasts' | 'playlists' | 'queue';

export default function PodcastsWebScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [showAddPodcastModal, setShowAddPodcastModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Load curated podcasts
  const { podcasts: libraryPodcasts, loading: libraryLoading, refetch: refetchLibrary } = usePodcasts({
    search: searchQuery,
    limit: 50,
  });

  // Load user subscriptions (only if authenticated)
  const { subscriptions, loading: subsLoading, subscribe, unsubscribe, refetch: refetchSubs } = useMyPodcasts();
  
  // Load playlists and queue
  const { playlists, loading: playlistsLoading, refetch: refetchPlaylists } = usePlaylists();
  const { queue, loading: queueLoading } = useQueue();

  // Refresh playlists when screen comes into focus (e.g., after renaming/deleting in detail screen)
  useFocusEffect(
    React.useCallback(() => {
      // Refetch playlists to ensure changes made in detail screen are reflected
      refetchPlaylists();
    }, [refetchPlaylists])
  );

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
      case 'my_podcasts':
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
        <View style={[styles.tabContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('library')}
          >
            <Ionicons 
              name={activeTab === 'library' ? "library" : "library-outline"}
              size={20}
              color={activeTab === 'library' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'library' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              Library
            </Text>
          </TouchableOpacity>
          {user && (
            <TouchableOpacity
              style={styles.tab}
              onPress={() => setActiveTab('my_podcasts')}
            >
              <Ionicons 
                name={activeTab === 'my_podcasts' ? "bookmark" : "bookmark-outline"}
                size={20}
                color={activeTab === 'my_podcasts' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary}
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === 'my_podcasts' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary }
              ]}>
                My Podcasts
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('playlists')}
          >
            <Ionicons 
              name={activeTab === 'playlists' ? "list" : "list-outline"}
              size={20}
              color={activeTab === 'playlists' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'playlists' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              Playlists
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('queue')}
          >
            <Ionicons 
              name={activeTab === 'queue' ? "musical-notes" : "musical-notes-outline"}
              size={20}
              color={activeTab === 'queue' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'queue' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              Queue
            </Text>
          </TouchableOpacity>
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
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Add Custom Podcast Button - Show when search is active */}
        {user && isSearchFocused && (activeTab === 'library' || activeTab === 'my_podcasts') && (
          <TouchableOpacity
            style={[styles.addCustomButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            onPress={() => setShowAddPodcastModal(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.addCustomButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Add new podcast via link
            </Text>
          </TouchableOpacity>
        )}

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
                activeTab === 'my_podcasts' ? 'person-outline' :
                activeTab === 'playlists' ? 'list-outline' :
                'list'
              } 
              size={64} 
              color={Colors[colorScheme ?? 'light'].textSecondary} 
            />
            <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {activeTab === 'library' && 'No podcasts found'}
              {activeTab === 'my_podcasts' && 'No podcasts yet'}
              {activeTab === 'playlists' && 'No playlists yet'}
              {activeTab === 'queue' && 'Queue is empty'}
            </Text>
            <Text style={[styles.emptyDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {activeTab === 'library' && 'Try adjusting your search or check back later for new content.'}
              {activeTab === 'my_podcasts' && 'Browse the curated library to discover podcasts to subscribe to.'}
              {activeTab === 'playlists' && 'Create your first playlist to organize your favorite episodes.'}
              {activeTab === 'queue' && 'Add episodes to your queue to see them here.'}
            </Text>
          </View>
        ) : (
          <View style={styles.podcastsGrid}>
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
              (displayData as any[]).map((playlist, index) => {
                const isBuiltin = playlist.id === 'downloaded' || playlist.is_builtin || playlist.isSystem;
                // Generate accent color based on playlist index for variety
                const accentColors = [
                  Colors[colorScheme ?? 'light'].primary,
                  '#6366f1',
                  '#8b5cf6',
                  '#ec4899',
                  '#f59e0b',
                  '#10b981',
                ];
                const accentColor = accentColors[index % accentColors.length];
                const iconName = isBuiltin ? "cloud-download" : 
                               index === 0 ? "musical-notes" : 
                               index === 1 ? "bookmark" : 
                               index === 2 ? "star" : 
                               "list";
                
                return (
                  <View key={playlist.id} style={{ width: columnWidth as any, padding: isMobile ? 8 : 12 }}>
                    <TouchableOpacity
                      style={[
                        styles.playlistCard, 
                        { 
                          backgroundColor: Colors[colorScheme ?? 'light'].card,
                          borderLeftWidth: 4,
                          borderLeftColor: accentColor,
                        }
                      ]}
                      onPress={() => router.push(`/(tabs)/preaching/playlists/${playlist.id}` as any)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.playlistIcon,
                        { backgroundColor: accentColor + '15' }
                      ]}>
                        <Ionicons 
                          name={iconName} 
                          size={28} 
                          color={accentColor} 
                        />
                      </View>
                      <View style={styles.playlistInfo}>
                        <Text 
                          style={[styles.playlistName, { color: Colors[colorScheme ?? 'light'].text }]}
                          numberOfLines={2}
                        >
                          {playlist.name}
                        </Text>
                        <Text style={[styles.playlistMeta, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                          {isBuiltin ? 'System Playlist' : 'User Playlist'}
                          {playlist.updated_at && ' • '}
                          {playlist.updated_at && (
                            new Date(playlist.updated_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          )}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })
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

      {/* Add Custom Podcast Modal */}
      <AddCustomPodcastModal
        visible={showAddPodcastModal}
        onClose={() => setShowAddPodcastModal(false)}
        onSuccess={() => {
          refetchSubs();
          setSearchQuery('');
        }}
      />
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
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 2,
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
    flexWrap: 'wrap',
    gap: 16,
    padding: 16,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: 80,
  },
  playlistIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playlistInfo: {
    flex: 1,
    minWidth: 0,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 6,
    lineHeight: 24,
  },
  playlistMeta: {
    fontSize: 13,
    fontFamily: 'Georgia',
    lineHeight: 18,
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
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    gap: 8,
    cursor: 'pointer' as any,
  },
  addCustomButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

