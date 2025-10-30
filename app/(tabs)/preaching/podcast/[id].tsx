import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  InteractionManager,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { PodcastService } from '../../../../services/PodcastService';
import { PodcastWithEpisodes, PodcastEpisode } from '../../../../types';
import { refreshFeed, getEpisodesMap, getFeed } from '../../../../lib/podcast/cache';
import { ensureImageCached, imagePathForUrl, fileExists } from '../../../../lib/podcast/storage';
import { usePodcastSubscriptions } from '../../../../hooks/usePodcastSubscriptions';
import { useAuth } from '../../../../contexts/AuthContext';
import { EpisodeListItem } from '../../../../components/EpisodeListItem';
import { usePodcastPlayer } from '../../../../contexts/PodcastPlayerContext';
import { usePodcastPreferences } from '../../../../hooks/usePodcastPreferences';
import HtmlRenderer from '../../../../components/HtmlRenderer';
import PodcastPreferencesModal from '../../../../components/PodcastPreferencesModal';

export default function PodcastDetailScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { id, rssUrl: qRssUrl, podcastTitle: qPodcastTitle, podcastAuthor: qPodcastAuthor, podcastArt: qPodcastArt } = useLocalSearchParams<{ id: string; rssUrl?: string; podcastTitle?: string; podcastAuthor?: string; podcastArt?: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [podcast, setPodcast] = useState<PodcastWithEpisodes | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [artworkPath, setArtworkPath] = useState<string | null>(null);
  const [hasCache, setHasCache] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const mountStartRef = useRef<number>(Date.now());
  const didLogLayoutRef = useRef<boolean>(false);
  const [dbGuidToId, setDbGuidToId] = useState<Map<string, string>>(new Map());
  const [dbAudioToId, setDbAudioToId] = useState<Map<string, string>>(new Map());

  const { subscribe, unsubscribe, isSubscribed: checkIsSubscribed, subscriptions } = usePodcastSubscriptions();
  const { currentEpisode, playEpisode, pause, resume, isPlaying, isPaused } = usePodcastPlayer();
  const { 
    effectiveSpeed, 
    effectiveMaxEpisodes, 
    effectiveAutoDownload, 
    updatePreference, 
    resetToGlobal 
  } = usePodcastPreferences(id!);

  // Memoize style objects for HtmlRenderer to prevent re-renders
  const descriptionStyle = useMemo(() => [
    styles.description, 
    { color: Colors[colorScheme ?? 'light'].text }
  ], [colorScheme]);
  
  const isSubscribed = subscriptions.some(s => s.id === id);

  useEffect(() => {
    if (id) {
      console.log('[PodcastDetail] mount id=', id, { qRssUrl, qPodcastTitle, qPodcastAuthor });
      loadFromCache();
      loadPodcast();
    }
  }, [id]);

  // Log when interactions are complete (approx when UI is fully settled)
  useEffect(() => {
    const startedAt = mountStartRef.current;
    const task = InteractionManager.runAfterInteractions(() => {
      console.log('[PodcastDetail] afterInteractions elapsed=', Date.now() - startedAt, 'ms');
    });
    return () => {
      // Optional cancel if supported
      if ((task as any)?.cancel) (task as any).cancel();
    };
  }, []);

  const loadFromCache = async () => {
    const start = Date.now();
    try {
      console.log('[PodcastDetail] loadFromCache:start');
      const feed = await getFeed(id!);
      console.log('[PodcastDetail] loadFromCache:getFeed elapsed=', Date.now() - start, 'hasFeed=', !!feed);
      const map = await getEpisodesMap(id!);
      const mapKeys = Object.keys(map);
      console.log('[PodcastDetail] loadFromCache:getEpisodesMap elapsed=', Date.now() - start, 'count=', mapKeys.length);
      console.log('[PodcastDetail] cache summary snapshot:', {
        fetchedAt: feed?.fetchedAt || null,
        etag: feed?.etag || null,
        lastModified: feed?.lastModified || null,
        summaryArtUrl: feed?.summary?.artworkUrl || null,
        summaryLocalArt: feed?.summary?.localArtworkPath || null,
        episodeCount: mapKeys.length,
      });
      const epStart = Date.now();
      const episodesFromCache: PodcastEpisode[] = Object.values(map).map((ep) => ({
        id: ep.id,
        podcastId: id!,
        title: ep.title,
        description: ep.description,
        audioUrl: ep.audioUrl,
        duration: ep.duration,
        publishedAt: ep.publishedAt,
        episodeNumber: ep.episodeNumber,
        seasonNumber: ep.seasonNumber,
        guid: ep.guid,
        artworkUrl: ep.artworkUrl,
        fileSize: ep.fileSize,
        mimeType: ep.mimeType,
        createdAt: new Date().toISOString(),
      }));
      console.log('[PodcastDetail] loadFromCache:build episodes elapsed=', Date.now() - epStart);

      if (feed || episodesFromCache.length) {
        const base: PodcastWithEpisodes = {
          id: id!,
          title: feed?.summary.title || 'Podcast',
          description: feed?.summary.description,
          author: feed?.summary.author,
          rssUrl: feed?.uri || '',
          artworkUrl: feed?.summary.artworkUrl,
          websiteUrl: feed?.summary.websiteUrl,
          language: feed?.summary.language || 'en',
          categories: feed?.summary.categories || [],
          isCurated: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          episodes: episodesFromCache,
          episodeCount: episodesFromCache.length,
        };
        setPodcast(base);
        setHasCache(true);
        console.log('[PodcastDetail] loadFromCache:done elapsed=', Date.now() - start);

        // Artwork resolution in background to avoid blocking cache path timing
        (async () => {
          const artStart = Date.now();
          // Prefer feed's cached local path for instant set
          if (feed?.summary?.localArtworkPath) {
            console.log('[PodcastDetail] loadFromCache:art using summary path at', new Date().toISOString());
            setArtworkPath(feed.summary.localArtworkPath);
            return;
          }

          const artUrl = base.artworkUrl;
          if (!artUrl) {
            setArtworkPath(null);
            return;
          }

          try {
            const hashStart = Date.now();
            console.log('[PodcastDetail] loadFromCache:art precheck start at', new Date().toISOString());
            const maybePath = await imagePathForUrl(artUrl);
            const hashElapsed = Date.now() - hashStart;
            console.log('[PodcastDetail] loadFromCache:art path computed in', hashElapsed, 'ms ->', maybePath);

            // Optimistically set path without stat to avoid slow IO. We'll fallback on Image onError.
            setArtworkPath(maybePath);
            return;
          } catch (e) {
            console.warn('[PodcastDetail] loadFromCache:art precheck failed', e);
          }

          ensureImageCached(artUrl)
            .then(({ path }) => {
              console.log('[PodcastDetail] loadFromCache:art cached elapsed=', Date.now() - artStart, 'ms at', new Date().toISOString());
              setArtworkPath(path);
            })
            .catch((e) => {
              console.warn('[PodcastDetail] loadFromCache:art cache failed', e);
              setArtworkPath(null);
            });
        })();
      }
    } catch {
      // ignore cache errors
      console.warn('[PodcastDetail] loadFromCache:error elapsed=', Date.now() - start);
    }
  };

  const loadPodcast = async () => {
    try {
      setLoading(true);
      const start = Date.now();
      console.log('[PodcastDetail] loadPodcast:start');
      let data: any;
      if (qRssUrl) {
        data = { id: id!, rssUrl: qRssUrl, title: qPodcastTitle, author: qPodcastAuthor, artworkUrl: qPodcastArt } as any;
      } else {
        data = await PodcastService.getPodcast(id!);
      }
      // Build DB episode lookup maps (guid -> uuid, audioUrl -> uuid) if available
      try {
        const g2i = new Map<string, string>();
        const a2i = new Map<string, string>();
        const list = (data as any).episodes as PodcastEpisode[] | undefined;
        if (Array.isArray(list)) {
          for (const dbEp of list) {
            if (dbEp.guid) g2i.set(dbEp.guid, dbEp.id);
            if (dbEp.audioUrl) a2i.set(dbEp.audioUrl, dbEp.id);
          }
        }
        setDbGuidToId(g2i);
        setDbAudioToId(a2i);
      } catch {}
      if (!qRssUrl) console.log('[PodcastDetail] loadPodcast:getPodcast elapsed=', Date.now() - start);

      // Refresh from RSS (1h policy) and then load episodes from device cache
      try {
        const rfStart = Date.now();
        await refreshFeed(data.id, data.rssUrl);
        console.log('[PodcastDetail] loadPodcast:refreshFeed elapsed=', Date.now() - rfStart);
        const map = await getEpisodesMap(data.id);
        console.log('[PodcastDetail] loadPodcast:getEpisodesMap elapsed=', Date.now() - start, 'count=', Object.keys(map).length);
        // Build lookup to preserve DB episode ids (UUID) by guid or audioUrl
        const dbByGuid = new Map<string, string>();
        const dbByAudio = new Map<string, string>();
        if (Array.isArray((data as any).episodes)) {
          for (const dbEp of (data as any).episodes as PodcastEpisode[]) {
            if (dbEp.guid) dbByGuid.set(dbEp.guid, dbEp.id);
            if (dbEp.audioUrl) dbByAudio.set(dbEp.audioUrl, dbEp.id);
          }
        }

        const episodesFromCache: PodcastEpisode[] = Object.values(map).map((ep) => ({
          id: (ep.guid && dbByGuid.get(ep.guid)) || dbByAudio.get(ep.audioUrl) || ep.id,
          podcastId: data.id,
          title: ep.title,
          description: ep.description,
          audioUrl: ep.audioUrl,
          duration: ep.duration,
          publishedAt: ep.publishedAt,
          episodeNumber: ep.episodeNumber,
          seasonNumber: ep.seasonNumber,
          guid: ep.guid,
          artworkUrl: ep.artworkUrl,
          fileSize: ep.fileSize,
          mimeType: ep.mimeType,
          createdAt: new Date().toISOString(),
        }));
        setPodcast({ ...data, title: qPodcastTitle || data.title, author: qPodcastAuthor || data.author, artworkUrl: qPodcastArt || data.artworkUrl, episodes: episodesFromCache, episodeCount: episodesFromCache.length });
        const artUrl = data.artworkUrl;
        if (artUrl) {
          try {
            const maybePath = await imagePathForUrl(artUrl);
            // Optimistically set without stat to avoid slow IO on dev
            setArtworkPath(maybePath);
          } catch (e) {
            console.warn('[PodcastDetail] loadPodcast:art precompute failed', e);
            setArtworkPath(null);
          }
        }
        console.log('[PodcastDetail] loadPodcast:done elapsed=', Date.now() - start);
      } catch (e) {
        // Fallback to service-provided episodes if cache path fails
        setPodcast(data);
        console.warn('[PodcastDetail] loadPodcast:cache path failed, using service data. elapsed=', Date.now() - start, e);
      }
    } catch (error) {
      console.error('Error loading podcast:', error);
      Alert.alert('Error', 'Failed to load podcast details');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const start = Date.now();
    console.log('[PodcastDetail] handleRefresh:start');
    try {
      // Force refresh this feed, then reload from cache
      const base = await PodcastService.getPodcast(id!);
      await refreshFeed(base.id, base.rssUrl, { force: true });
      const map = await getEpisodesMap(base.id);
      const episodesFromCache: PodcastEpisode[] = Object.values(map).map((ep) => ({
        id: ep.id,
        podcastId: base.id,
        title: ep.title,
        description: ep.description,
        audioUrl: ep.audioUrl,
        duration: ep.duration,
        publishedAt: ep.publishedAt,
        episodeNumber: ep.episodeNumber,
        seasonNumber: ep.seasonNumber,
        guid: ep.guid,
        artworkUrl: ep.artworkUrl,
        fileSize: ep.fileSize,
        mimeType: ep.mimeType,
        createdAt: new Date().toISOString(),
      }));
      setPodcast({ ...base, episodes: episodesFromCache, episodeCount: episodesFromCache.length });
      console.log('[PodcastDetail] handleRefresh:done elapsed=', Date.now() - start);
    } catch (e) {
      console.warn('[PodcastDetail] handleRefresh:fallback elapsed=', Date.now() - start, e);
      await loadPodcast();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe to podcasts.');
      return;
    }

    if (isSubscribed) {
      const success = await unsubscribe(id!);
      if (success) {
        Alert.alert('Unsubscribed', 'You have unsubscribed from this podcast.');
      }
    } else {
      const success = await subscribe(id!);
      if (success) {
        Alert.alert('Subscribed', 'You are now subscribed to this podcast.');
      }
    }
  };

  const handleEpisodePress = (episode: PodcastEpisode) => {
    // Navigate to episode detail/player using object form to safely encode id
    const isUuid = /^[0-9a-fA-F-]{36}$/.test(episode.id);
    const resolvedId = isUuid
      ? episode.id
      : (episode.guid && dbGuidToId.get(episode.guid))
          || dbAudioToId.get(episode.audioUrl)
          || episode.id;
    const params: { id: string; podcastId?: string; guid?: string; audioUrl?: string; podcastTitle?: string; podcastAuthor?: string; podcastArt?: string } = { id: String(resolvedId) };
    // Always pass context when available to enable cache fallback on episode screen
    if (podcast?.id) params.podcastId = podcast.id;
    if (episode.guid) params.guid = episode.guid;
    if (episode.audioUrl) params.audioUrl = episode.audioUrl;
    // Pass a header snapshot to render immediately on episode page
    if (podcast?.title) params.podcastTitle = podcast.title;
    if (podcast?.author) params.podcastAuthor = podcast.author as string;
    if (artworkPath || podcast?.artworkUrl) params.podcastArt = (artworkPath || podcast?.artworkUrl)!;
    console.log('[PodcastDetail] navigate to episode', resolvedId, params);
    router.push({ pathname: '/preaching/episode/[id]', params });
  };

  const handlePlayEpisode = async (episode: PodcastEpisode) => {
    console.log('[PodcastDetail] handlePlayEpisode called with episode:', episode.title);
    if (currentEpisode?.id === episode.id) {
      if (isPlaying) {
        console.log('[PodcastDetail] Pausing current episode');
        pause();
      } else if (isPaused) {
        console.log('[PodcastDetail] Resuming paused episode');
        resume();
      } else {
        console.log('[PodcastDetail] Playing current episode');
        await playEpisode(episode);
      }
    } else {
      console.log('[PodcastDetail] Playing new episode:', episode.title);
      await playEpisode(episode);
    }
  };

  const sortedEpisodes = podcast?.episodes
    ? [...podcast.episodes].sort((a, b) => {
        const dateA = new Date(a.publishedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || 0).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      })
    : [];

  if (loading && !podcast) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading podcast...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!podcast) return null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      edges={['left', 'right']}
      onLayout={() => {
        if (!didLogLayoutRef.current) {
          didLogLayoutRef.current = true;
          console.log('[PodcastDetail] onLayout (first) elapsed=', Date.now() - mountStartRef.current, 'ms');
        }
      }}
    >
      <FlatList
        data={sortedEpisodes}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <EpisodeListItem
            episode={item}
            onPress={() => handleEpisodePress(item)}
            onPlay={() => handlePlayEpisode(item)}
            isPlaying={currentEpisode?.id === item.id && isPlaying}
            isPaused={currentEpisode?.id === item.id && isPaused}
          />
        )}
        initialNumToRender={12}
        maxToRenderPerBatch={16}
        windowSize={7}
        removeClippedSubviews
        ListHeaderComponent={(
          <>
            {/* Podcast Header - Vertical Layout */}
            <View style={styles.header}>
              {artworkPath || podcast.artworkUrl ? (
                <Image
                  source={{ uri: artworkPath || podcast.artworkUrl }}
                  style={styles.artwork}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.artworkPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                  <Ionicons name="radio" size={64} color={Colors[colorScheme ?? 'light'].primary} />
                </View>
              )}

              <View style={styles.headerInfo}>
                <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {podcast.title}
                </Text>
                {podcast.author && (
                  <Text style={[styles.author, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {podcast.author}
                  </Text>
                )}
                {podcast.episodeCount !== undefined && (
                  <Text style={[styles.episodeCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {podcast.episodeCount} episodes
                  </Text>
                )}
              </View>

              <View style={styles.actionBar}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setShowPreferencesModal(true)}>
                  <Ionicons name="settings-outline" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
                </TouchableOpacity>
                {podcast.websiteUrl && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="link-outline" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {podcast.description && (
              <View style={styles.descriptionContainer}>
                <HtmlRenderer htmlContent={podcast.description} style={descriptionStyle} maxLines={isDescriptionExpanded ? undefined : 3} minimal />
                {podcast.description.length > 200 && (
                  <TouchableOpacity style={styles.readMoreButton} onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                    <Text style={[styles.readMoreText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      {isDescriptionExpanded ? 'Read less' : 'Read more'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {podcast.categories && podcast.categories.length > 0 && (
              <View style={styles.categoriesContainer}>
                {podcast.categories.map((category) => (
                  <View key={category} style={[styles.categoryTag, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                    <Text style={[styles.categoryText, { color: Colors[colorScheme ?? 'light'].primary }]}>{category}</Text>
                  </View>
                ))}
              </View>
            )}

            {user && (
              <View style={styles.subscribeContainer}>
                <TouchableOpacity style={[styles.subscribeButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} onPress={handleSubscribe}>
                  <Ionicons name={isSubscribed ? 'checkmark-circle-outline' : 'add-circle-outline'} size={20} color="#fff" />
                  <Text style={styles.subscribeButtonText}>{isSubscribed ? 'Subscribed' : 'Subscribe'}</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.episodesHeader}>
              <Text style={[styles.episodesTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Episodes</Text>
              <View style={styles.sortButtons}>
                <TouchableOpacity
                  style={[styles.sortButton, { backgroundColor: sortOrder === 'newest' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].surface }]}
                  onPress={() => setSortOrder('newest')}
                >
                  <Text style={[styles.sortButtonText, { color: sortOrder === 'newest' ? '#fff' : Colors[colorScheme ?? 'light'].text }]}>Newest</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, { backgroundColor: sortOrder === 'oldest' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].surface }]}
                  onPress={() => setSortOrder('oldest')}
                >
                  <Text style={[styles.sortButtonText, { color: sortOrder === 'oldest' ? '#fff' : Colors[colorScheme ?? 'light'].text }]}>Oldest</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {/* Podcast Preferences Modal */}
      <PodcastPreferencesModal
        visible={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        podcastId={id!}
        effectiveSpeed={effectiveSpeed}
        effectiveMaxEpisodes={effectiveMaxEpisodes}
        effectiveAutoDownload={effectiveAutoDownload}
        updatePreferences={(updates) => {
          const [key, value] = Object.entries(updates)[0] as [any, any];
          updatePreference(key, value);
        }}
        resetToGlobal={() => resetToGlobal('playbackSpeed')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 16,
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  artworkPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerInfo: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginBottom: 4,
    textAlign: 'center',
  },
  episodeCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  actionButton: {
    padding: 8,
  },
  descriptionContainer: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  subscribeContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  episodesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  episodesTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  episodesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
});
