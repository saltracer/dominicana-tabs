import React, { useState, useEffect, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { PodcastService } from '../../../../services/PodcastService';
import { PodcastWithEpisodes, PodcastEpisode } from '../../../../types';
import { refreshFeed, getEpisodesMap, getFeed } from '../../../../lib/podcast/cache';
import { ensureImageCached } from '../../../../lib/podcast/storage';
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [podcast, setPodcast] = useState<PodcastWithEpisodes | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [artworkPath, setArtworkPath] = useState<string | null>(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const { subscribe, unsubscribe, isSubscribed: checkIsSubscribed, subscriptions } = usePodcastSubscriptions();
  const { currentEpisode, playEpisode, pause, resume, isPlaying, isPaused } = usePodcastPlayer();
  const { 
    effectiveSpeed, 
    effectiveMaxEpisodes, 
    effectiveAutoDownload, 
    updatePreferences, 
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
      loadFromCache();
      loadPodcast();
    }
  }, [id]);

  const loadFromCache = async () => {
    try {
      const feed = await getFeed(id!);
      const map = await getEpisodesMap(id!);
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
        const artUrl = base.artworkUrl;
        if (artUrl) {
          try {
            const { path } = await ensureImageCached(artUrl);
            setArtworkPath(path);
          } catch {
            setArtworkPath(null);
          }
        } else {
          setArtworkPath(null);
        }
      }
    } catch {
      // ignore cache errors
    }
  };

  const loadPodcast = async () => {
    try {
      setLoading(true);
      const data = await PodcastService.getPodcast(id!);

      // Refresh from RSS (1h policy) and then load episodes from device cache
      try {
        await refreshFeed(data.id, data.rssUrl);
        const map = await getEpisodesMap(data.id);
        const episodesFromCache: PodcastEpisode[] = Object.values(map).map((ep) => ({
          id: ep.id,
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
        setPodcast({ ...data, episodes: episodesFromCache, episodeCount: episodesFromCache.length });
        const artUrl = data.artworkUrl;
        if (artUrl) {
          try {
            const { path } = await ensureImageCached(artUrl);
            setArtworkPath(path);
          } catch {
            setArtworkPath(null);
          }
        }
      } catch (e) {
        // Fallback to service-provided episodes if cache path fails
        setPodcast(data);
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
    } catch (e) {
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
    // Navigate to episode detail/player
    router.push(`/(tabs)/preaching/episode/${episode.id}`);
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
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Podcast Header - Vertical Layout */}
        <View style={styles.header}>
          {/* Artwork */}
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

          {/* Podcast Info */}
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

          {/* Action Bar */}
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowPreferencesModal(true)}
            >
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

        {/* Description */}
        {podcast.description && (
          <View style={styles.descriptionContainer}>
            <HtmlRenderer 
              htmlContent={podcast.description}
              style={descriptionStyle}
              maxLines={isDescriptionExpanded ? undefined : 3}
            />
            {podcast.description.length > 200 && (
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                <Text style={[styles.readMoreText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  {isDescriptionExpanded ? 'Read less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Categories */}
        {podcast.categories && podcast.categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            {podcast.categories.map((category) => (
              <View
                key={category}
                style={[styles.categoryTag, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}
              >
                <Text style={[styles.categoryText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  {category}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Subscribe Button */}
        {user && (
          <View style={styles.subscribeContainer}>
            <TouchableOpacity
              style={[styles.subscribeButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
              onPress={handleSubscribe}
            >
              <Ionicons 
                name={isSubscribed ? "checkmark-circle-outline" : "add-circle-outline"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.subscribeButtonText}>
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Text>
            </TouchableOpacity>
          </View>
        )}


        {/* Episodes Header */}
        <View style={styles.episodesHeader}>
          <Text style={[styles.episodesTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Episodes
          </Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                { backgroundColor: sortOrder === 'newest' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].surface }
              ]}
              onPress={() => setSortOrder('newest')}
            >
              <Text style={[
                styles.sortButtonText,
                { color: sortOrder === 'newest' ? '#fff' : Colors[colorScheme ?? 'light'].text }
              ]}>
                Newest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortButton,
                { backgroundColor: sortOrder === 'oldest' ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].surface }
              ]}
              onPress={() => setSortOrder('oldest')}
            >
              <Text style={[
                styles.sortButtonText,
                { color: sortOrder === 'oldest' ? '#fff' : Colors[colorScheme ?? 'light'].text }
              ]}>
                Oldest
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Episodes List */}
        {sortedEpisodes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              No episodes available
            </Text>
          </View>
        ) : (
          <View style={styles.episodesContainer}>
            {sortedEpisodes.map((episode) => (
              <EpisodeListItem
                key={episode.id}
                episode={episode}
                onPress={() => handleEpisodePress(episode)}
                onPlay={() => handlePlayEpisode(episode)}
                isPlaying={currentEpisode?.id === episode.id && isPlaying}
                isPaused={currentEpisode?.id === episode.id && isPaused}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Podcast Preferences Modal */}
      <PodcastPreferencesModal
        visible={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        podcastId={id!}
        effectiveSpeed={effectiveSpeed}
        effectiveMaxEpisodes={effectiveMaxEpisodes}
        effectiveAutoDownload={effectiveAutoDownload}
        updatePreferences={updatePreferences}
        resetToGlobal={resetToGlobal}
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
