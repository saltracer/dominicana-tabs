/**
 * Podcasts Page - Native
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { ReduceMotion } from 'react-native-reanimated';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { PreachingStyles } from '../../../styles';
import PreachingNavigation from '../../../components/PreachingNavigation';
import { PodcastCard } from '../../../components/PodcastCard';
import { usePodcasts } from '../../../hooks/usePodcasts';
import { useMyPodcasts } from '../../../hooks/useMyPodcasts';
import { refreshFeed } from '../../../lib/podcast/cache';
import { useAuth } from '../../../contexts/AuthContext';
import { usePlaylists } from '../../../hooks/usePlaylists';
import { useDownloadedPlaylist } from '../../../hooks/useDownloadedPlaylist';
import { useQueue } from '../../../hooks/useQueue';
import { getCurated, refreshCurated } from '../../../lib/podcast/cache';
import * as Haptics from 'expo-haptics';
import AddCustomPodcastModal from '../../../components/AddCustomPodcastModal';

type TabType = 'library' | 'my_podcasts' | 'playlists' | 'queue';

export default function PodcastsScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(user ? 'my_podcasts' : 'library');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [cachedCurated, setCachedCurated] = useState<any[] | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptValue, setPromptValue] = useState('');
  const [promptMode, setPromptMode] = useState<'create' | 'rename'>('create');
  const [promptTargetId, setPromptTargetId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastDragIndexRef = useRef<number>(-1);
  const [showAddPodcastModal, setShowAddPodcastModal] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
  const { subscriptions, loading: subsLoading, subscribe, unsubscribe, refetch: refetchSubs } = useMyPodcasts();
  
  // Load playlists and queue
  const { playlists, loading: playlistsLoading, createPlaylist, renamePlaylist, deletePlaylist, updatePlaylistsOrder, refetch: refetchPlaylists } = usePlaylists();
  const { items: downloadedItems } = useDownloadedPlaylist();
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

  // Filter data based on search query
  const filterData = <T extends any[]>(
    data: T,
    searchQuery: string,
    getSearchableText: (item: T[0]) => string
  ): T => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();
    return data.filter(item => 
      getSearchableText(item).toLowerCase().includes(query)
    ) as T;
  };

  const getDisplayData = () => {
    switch (activeTab) {
      case 'library':
        // Library uses server-side search via usePodcasts
        return { 
          data: (cachedCurated && (!hasLoadedOnce || libraryLoading)) ? cachedCurated : libraryPodcasts, 
          loading: libraryLoading, 
          type: 'podcasts' as const 
        };
      case 'my_podcasts':
        // Client-side filter for subscriptions
        const filteredSubscriptions = filterData(
          subscriptions,
          searchQuery,
          (podcast) => `${podcast.title} ${podcast.author || ''} ${podcast.description || ''}`
        );
        return { data: filteredSubscriptions, loading: subsLoading, type: 'podcasts' as const };
      case 'playlists':
        // Client-side filter for playlists
        const downloaded = { id: 'downloaded', name: 'Downloaded', is_builtin: true, display_order: -1 } as any;
        const allPlaylists = [downloaded, ...playlists];
        const filteredPlaylists = filterData(
          allPlaylists,
          searchQuery,
          (playlist) => playlist.name || ''
        );
        return { data: filteredPlaylists, loading: playlistsLoading, type: 'playlists' as const };
      case 'queue':
        // Client-side filter for queue episodes
        const filteredQueue = filterData(
          queue,
          searchQuery,
          (episode) => `${episode.title} ${episode.podcastTitle || ''} ${episode.description || ''}`
        );
        return { data: filteredQueue, loading: queueLoading, type: 'episodes' as const };
      default:
        return { data: [], loading: false, type: 'podcasts' as const };
    }
  };

  const { data: displayData, loading, type: dataType } = getDisplayData();

  const handlePlaylistDragEnd = async ({ data: newData }: { data: any[] }) => {
    setIsDragging(false);
    lastDragIndexRef.current = -1; // Reset drag tracking
    
    if (__DEV__) {
      console.log('[Podcasts] 🎯 Drag ended, new order:', newData.map((p, idx) => ({ 
        index: idx, 
        id: p.id, 
        name: p.name, 
        display_order: p.display_order 
      })));
    }
    
    // Filter out the Downloaded playlist (should stay at top)
    const userPlaylists = newData.filter(p => p.id !== 'downloaded' && !p.is_builtin);
    
    if (__DEV__) {
      console.log('[Podcasts] User playlists after drag:', userPlaylists.map((p, idx) => ({ 
        newIndex: idx, 
        id: p.id, 
        name: p.name, 
        oldDisplayOrder: p.display_order,
        newDisplayOrder: idx
      })));
      
      console.log('[Podcasts] Original playlists order:', playlists.map((p, idx) => ({
        index: idx,
        id: p.id,
        name: p.name,
        display_order: p.display_order
      })));
    }
    
    // Check if order actually changed by comparing the sequence of IDs
    const newIdSequence = userPlaylists.map(p => p.id).join(',');
    const originalIdSequence = playlists.map(p => p.id).join(',');
    const orderChanged = newIdSequence !== originalIdSequence;
    
    if (__DEV__) {
      console.log('[Podcasts] Order comparison:', {
        newSequence: newIdSequence,
        originalSequence: originalIdSequence,
        changed: orderChanged
      });
    }
    
    if (!orderChanged) {
      if (__DEV__) console.log('[Podcasts] ⚠️ No order change detected, skipping update');
      return;
    }
    
    // Update order in backend (exclude built-in playlists)
    try {
      if (__DEV__) console.log('[Podcasts] 📤 Updating playlist order...');
      await updatePlaylistsOrder(userPlaylists);
      if (__DEV__) console.log('[Podcasts] ✅ Playlist order updated successfully');
      // Haptic feedback on successful reorder
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('[Podcasts] ❌ Failed to update playlist order:', error);
      // Haptic feedback on error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to reorder playlists. Please try again.');
    }
  };

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
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder={
            activeTab === 'library' ? 'Search podcasts...' :
            activeTab === 'my_podcasts' ? 'Search your podcasts...' :
            activeTab === 'playlists' ? 'Search playlists...' :
            'Search queue...'
          }
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

      {(!user && (activeTab === 'my_podcasts' || activeTab === 'queue' || activeTab === 'playlists'))
        ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={
                activeTab === 'my_podcasts' ? 'person-outline' :
                activeTab === 'playlists' ? 'list-outline' :
                'musical-notes-outline'
              }
              size={64}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {activeTab === 'my_podcasts' && 'No podcasts yet'}
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
                    showSubscribeButton={activeTab === 'library' || activeTab === 'my_podcasts'}
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
          ) : dataType === 'playlists' ? (
            <View style={{ flex: 1 }}>
              <View style={[styles.podcastsContainer, { paddingBottom: 0 }]}>
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
              </View>
              <DraggableFlatList
                data={displayData as any[]}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
                onDragEnd={handlePlaylistDragEnd}
                onDragBegin={(index) => {
                  setIsDragging(true);
                  // Haptic feedback when drag begins
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  // Track initial position for crossing detection
                  lastDragIndexRef.current = index;
                }}
                onPlaceholderIndexChange={(index) => {
                  // Haptic feedback when playlist crosses over another playlist
                  if (lastDragIndexRef.current !== -1 && index !== lastDragIndexRef.current) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    lastDragIndexRef.current = index;
                  }
                }}
                activationDistance={20}
                animationConfig={{
                  reduceMotion: ReduceMotion.Never,
                }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                renderItem={({ item: playlist, drag, isActive, getIndex }: RenderItemParams<any>) => {
                  const isBuiltin = playlist.id === 'downloaded' || playlist.is_builtin;
                  const index = getIndex?.() ?? 0;
                  
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
                  const iconName = isBuiltin ? 'cloud-download' : 
                                 index === 0 ? 'musical-notes' : 
                                 index === 1 ? 'bookmark' : 
                                 index === 2 ? 'star' : 
                                 'list';
                  
                  return (
                    <ScaleDecorator>
                      <TouchableOpacity
                        style={[
                          styles.playlistCard, 
                          { 
                            backgroundColor: Colors[colorScheme ?? 'light'].card,
                            borderLeftWidth: 4,
                            borderLeftColor: accentColor,
                          },
                          isActive && { opacity: 0.8 }
                        ]}
                        onPress={() => {
                          if (playlist.id === 'downloaded') {
                            router.push({ pathname: '/preaching/playlists/[id]', params: { id: 'downloaded' } });
                          } else {
                            router.push({ pathname: '/preaching/playlists/[id]', params: { id: playlist.id } });
                          }
                        }}
                        onLongPress={!isBuiltin ? drag : undefined}
                        disabled={isActive}
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
                            {isBuiltin ? 'Downloaded (device)' : 'User Playlist'}
                            {playlist.updated_at && ' • '}
                            {playlist.updated_at && (
                              new Date(playlist.updated_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })
                            )}
                          </Text>
                        </View>
                        {!isBuiltin && (
                          <TouchableOpacity onLongPress={drag} style={{ padding: 8, marginLeft: 4 }}>
                            <Ionicons name="reorder-three" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    </ScaleDecorator>
                  );
                }}
              />
            </View>
          ) : dataType === 'episodes' ? (
            <ScrollView 
              style={styles.scrollView} 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={{ paddingBottom: 120 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
              <View style={styles.podcastsContainer}>
                {dataType === 'episodes' ? (
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
            </ScrollView>
          ) : null
        )}
      
      {/* Prompt Modal */}
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

      {/* Add Custom Podcast Modal */}
      <AddCustomPodcastModal
        visible={showAddPodcastModal}
        onClose={() => setShowAddPodcastModal(false)}
        onSuccess={() => {
          refetchSubs();
          setSearchQuery('');
        }}
      />
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
    padding: 20,
    marginBottom: 14,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
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
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addCustomButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

