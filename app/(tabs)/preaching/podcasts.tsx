/**
 * Podcasts Page - Native
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { PreachingStyles } from '../../../styles';
import PreachingNavigation from '../../../components/PreachingNavigation';
import { PodcastCard } from '../../../components/PodcastCard';
import { usePodcasts } from '../../../hooks/usePodcasts';
import { usePodcastSubscriptions } from '../../../hooks/usePodcastSubscriptions';
import { refreshFeed } from '../../../lib/podcast/cache';
import { useAuth } from '../../../contexts/AuthContext';
import { usePlaylists } from '../../../hooks/usePlaylists';
import { useDownloadedPlaylist } from '../../../hooks/useDownloadedPlaylist';
import { useQueue } from '../../../hooks/useQueue';
import { getCurated, refreshCurated } from '../../../lib/podcast/cache';

type TabType = 'library' | 'subscriptions' | 'playlists' | 'queue';

export default function PodcastsScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [cachedCurated, setCachedCurated] = useState<any[] | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [promptMode, setPromptMode] = useState<'create' | 'rename'>('create');
  const [promptTargetId, setPromptTargetId] = useState<string | null>(null);

  // Calculate number of columns for grid layout
  const numColumns = useMemo(() => {
    const { width } = Dimensions.get('window');
    return width < 600 ? 2 : width < 900 ? 3 : 4;
  }, []);

  // Load curated podcasts
  const { podcasts: libraryPodcasts, loading: libraryLoading, refetch: refetchLibrary } = usePodcasts({
    search: searchQuery,
    limit: 50,
  });

  // Load user subscriptions (only if authenticated)
  const { subscriptions, loading: subsLoading, subscribe, unsubscribe, refetch: refetchSubs } = usePodcastSubscriptions();
  
  // Load playlists and queue
  const { playlists, loading: playlistsLoading, createPlaylist, renamePlaylist, deletePlaylist } = usePlaylists();
  const { items: downloadedItems } = useDownloadedPlaylist();
  const { queue, loading: queueLoading } = useQueue();

  // Track initial load completion
  useEffect(() => {
    if (!libraryLoading && !subsLoading && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [libraryLoading, subsLoading, hasLoadedOnce]);

  // On first screen mount with subscriptions available, refresh stale feeds (app-start sweep)
  useEffect(() => {
    const runStartupRefresh = async () => {
      if (!user || subsLoading || subscriptions.length === 0) return;
      try {
        // Bound concurrency by simple batching
        const batchSize = 3;
        for (let i = 0; i < subscriptions.length; i += batchSize) {
          const batch = subscriptions.slice(i, i + batchSize);
          await Promise.all(batch.map(p => refreshFeed(p.id, p.rssUrl).catch(() => null)));
        }
      } catch (e) {
        // noop
      }
    };
    runStartupRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, subsLoading]);

  // Load curated cache immediately for fast first paint
  useEffect(() => {
    const loadCache = async () => {
      const cached = await getCurated();
      if (cached?.items) setCachedCurated(cached.items as any[]);
    };
    loadCache();
  }, []);

  // Whenever libraryPodcasts updates, persist into curated cache
  useEffect(() => {
    if (libraryPodcasts && libraryPodcasts.length > 0) {
      setCachedCurated(libraryPodcasts as any[]);
      // refreshCurated stores with 1h policy; we force because we want latest in cache
      void refreshCurated(async () => ({ items: libraryPodcasts as any[] }), { force: true });
    }
  }, [libraryPodcasts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Optimistically show cached curated while refetching
    const cached = await getCurated();
    if (cached?.items) setCachedCurated(cached.items as any[]);
    await Promise.all([refetchLibrary(), user ? refetchSubs() : Promise.resolve()]);
    // After refetch, update curated cache
    if (libraryPodcasts && libraryPodcasts.length > 0) {
      await refreshCurated(async () => ({ items: libraryPodcasts as any[] }), { force: true });
    }
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
    const p = (libraryPodcasts || []).find((x: any) => x.id === podcastId) || (subscriptions || []).find((x: any) => x.id === podcastId);
    const params: any = { id: podcastId };
    if (p?.rssUrl) params.rssUrl = p.rssUrl;
    if (p?.title) params.podcastTitle = p.title;
    if (p?.author) params.podcastAuthor = p.author;
    if (p?.artworkUrl) params.podcastArt = p.artworkUrl;
    router.push({ pathname: '/preaching/podcast/[id]', params });
  };

  const isSubscribed = (podcastId: string) => {
    return subscriptions.some(s => s.id === podcastId);
  };

  const getDisplayData = () => {
    switch (activeTab) {
      case 'library':
        return { 
          data: (cachedCurated && (!hasLoadedOnce || libraryLoading)) ? cachedCurated : libraryPodcasts, 
          loading: libraryLoading, 
          type: 'podcasts' as const 
        };
      case 'subscriptions':
        return { data: subscriptions, loading: subsLoading, type: 'podcasts' as const };
      case 'playlists':
        const downloaded = { id: 'downloaded', name: 'Downloaded', is_builtin: true } as any;
        const list = [downloaded, ...playlists];
        return { data: list, loading: playlistsLoading, type: 'playlists' as const };
      case 'queue':
        return { data: queue, loading: queueLoading, type: 'episodes' as const };
      default:
        return { data: [], loading: false, type: 'podcasts' as const };
    }
  };

  const { data: displayData, loading, type: dataType } = getDisplayData();


  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} 
      edges={['left', 'right']}
    >
      {/* Navigation Control */}
      <PreachingNavigation activeTab="podcasts" />

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
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('subscriptions')}
        >
          <Ionicons 
            name={activeTab === 'subscriptions' ? "bookmark" : "bookmark-outline"}
            size={20}
            color={activeTab === 'subscriptions' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'subscriptions' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary }
          ]}>
            Subscriptions
          </Text>
        </TouchableOpacity>
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
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {(!user && (activeTab === 'subscriptions' || activeTab === 'queue' || activeTab === 'playlists'))
        ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={
                activeTab === 'subscriptions' ? 'person-outline' :
                activeTab === 'playlists' ? 'list-outline' :
                'musical-notes-outline'
              }
              size={64}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {activeTab === 'subscriptions' && 'No subscriptions yet'}
              {activeTab === 'playlists' && 'No playlists yet'}
              {activeTab === 'queue' && 'Queue is empty'}
            </Text>
            <Text style={[styles.emptyDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Login to manage and sync your {activeTab} across devices.</Text>
            <TouchableOpacity
              onPress={() => router.push('/auth')}
              style={{ marginTop: 12, backgroundColor: Colors[colorScheme ?? 'light'].primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#fff', fontFamily: 'Georgia', fontWeight: '600' }}>Login here</Text>
            </TouchableOpacity>
          </View>
        ) : (
          loading && !hasLoadedOnce ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Loading podcasts...</Text>
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
          ) : dataType === 'podcasts' ? (
            <FlatList
              data={displayData as any[]}
              numColumns={numColumns}
              key={numColumns}
              renderItem={({ item: podcast }) => (
                <View style={{ flex: 1, marginHorizontal: 6 }}>
                  <PodcastCard
                    podcast={podcast}
                    onPress={() => handlePodcastPress(podcast.id)}
                    onSubscribe={handleSubscribe}
                    isSubscribed={isSubscribed(podcast.id)}
                    showSubscribeButton={activeTab === 'library'}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={[styles.podcastsContainer, { paddingBottom: 120 }]}
              columnWrapperStyle={numColumns > 1 ? styles.podcastRow : undefined}
              showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            />
          ) : (
            <ScrollView 
              style={styles.scrollView} 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={{ paddingBottom: 120 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
              <View style={styles.podcastsContainer}>
                {dataType === 'playlists' ? (
                  <View>
                    <TouchableOpacity
                      onPress={async () => {
                        setPromptMode('create');
                        setPromptTargetId(null);
                        setPromptValue('');
                        setPromptVisible(true);
                      }}
                      style={{ alignSelf: 'flex-start', marginBottom: 12, backgroundColor: Colors[colorScheme ?? 'light'].primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }}
                      activeOpacity={0.85}
                    >
                      <Text style={{ color: '#fff', fontFamily: 'Georgia', fontWeight: '600' }}>+ New playlist</Text>
                    </TouchableOpacity>
                    {(displayData as any[]).map((playlist) => {
                      return (
                        <TouchableOpacity
                          key={playlist.id}
                          style={[styles.playlistCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                          onPress={() => {
                            if (playlist.id === 'downloaded') {
                              router.push({ pathname: '/preaching/playlists/[id]', params: { id: 'downloaded' } });
                            } else {
                              router.push({ pathname: '/preaching/playlists/[id]', params: { id: playlist.id } });
                            }
                          }}
                        >
                          <View style={styles.playlistIcon}>
                            <Ionicons name={playlist.id === 'downloaded' || playlist.is_builtin ? 'cloud-download' : 'list'} size={24} color={Colors[colorScheme ?? 'light'].primary} />
                          </View>
                          <View style={styles.playlistInfo}>
                            <Text style={[styles.playlistName, { color: Colors[colorScheme ?? 'light'].text }]}>{playlist.name}</Text>
                            <Text style={[styles.playlistMeta, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                              {playlist.id === 'downloaded' || playlist.is_builtin ? 'Downloaded (device)' : 'User Playlist'}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {playlist.id !== 'downloaded' && !playlist.is_builtin && (
                              <TouchableOpacity
                                onPress={async () => {
                                  setPromptMode('rename');
                                  setPromptTargetId(playlist.id);
                                  setPromptValue(playlist.name || '');
                                  setPromptVisible(true);
                                }}
                                style={{ padding: 6 }}
                              >
                                <Ionicons name='pencil' size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
                              </TouchableOpacity>
                            )}
                            {playlist.id !== 'downloaded' && !playlist.is_builtin && (
                              <TouchableOpacity
                                onPress={async () => {
                                  Alert.alert('Delete playlist?', 'This will remove the playlist and its items (episodes remain).', [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Delete', style: 'destructive', onPress: async () => { await deletePlaylist(playlist.id); } },
                                  ]);
                                }}
                                style={{ padding: 6 }}
                              >
                                <Ionicons name='trash' size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
                              </TouchableOpacity>
                            )}
                            <Ionicons name='chevron-forward' size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : dataType === 'episodes' ? (
                  (displayData as any[]).map((episode, index) => (
                    <TouchableOpacity
                      key={episode.id}
                      style={[styles.queueCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                      onPress={() => router.push(`/(tabs)/preaching/episode/${episode.id}`)}
                    >
                      <View style={styles.queuePosition}>
                        <Text style={[styles.queuePositionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>{index + 1}</Text>
                      </View>
                      <View style={styles.queueInfo}>
                        <Text style={[styles.queueTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>{episode.title}</Text>
                        <Text style={[styles.queueMeta, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Podcast Name</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    </TouchableOpacity>
                  ))
                ) : null}
              </View>
              {promptVisible && (
                <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                  <View style={{ width: '100%', maxWidth: 420, borderRadius: 12, padding: 16, backgroundColor: Colors[colorScheme ?? 'light'].card }}>
                    <Text style={{ fontFamily: 'Georgia', fontWeight: '700', fontSize: 16, color: Colors[colorScheme ?? 'light'].text, marginBottom: 8 }}>
                      {promptMode === 'create' ? 'New Playlist' : 'Rename Playlist'}
                    </Text>
                    <TextInput
                      value={promptValue}
                      onChangeText={setPromptValue}
                      placeholder="Playlist name"
                      placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                      style={{ borderWidth: 1, borderColor: Colors[colorScheme ?? 'light'].border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontFamily: 'Georgia', color: Colors[colorScheme ?? 'light'].text }}
                      autoFocus
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                      <TouchableOpacity onPress={() => setPromptVisible(false)} style={{ paddingVertical: 10, paddingHorizontal: 12, marginRight: 8 }}>
                        <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary, fontFamily: 'Georgia' }}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async () => {
                          const name = promptValue.trim();
                          if (!name) return;
                          setPromptVisible(false);
                          if (promptMode === 'create') {
                            await createPlaylist(name);
                          } else if (promptMode === 'rename' && promptTargetId) {
                            await renamePlaylist(promptTargetId, name);
                          }
                        }}
                        style={{ paddingVertical: 10, paddingHorizontal: 12 }}
                      >
                        <Text style={{ color: Colors[colorScheme ?? 'light'].primary, fontFamily: 'Georgia', fontWeight: '700' }}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          )
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
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
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
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
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
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
  podcastsContainer: {
    padding: 16,
  },
  podcastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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

