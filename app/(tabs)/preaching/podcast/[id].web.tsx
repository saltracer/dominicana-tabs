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
import { useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { PodcastService } from '../../../../services/PodcastService';
import { PodcastWithEpisodes, PodcastEpisode } from '../../../../types';
import { useMyPodcasts } from '../../../../hooks/useMyPodcasts';
import { useAuth } from '../../../../contexts/AuthContext';
import { EpisodeListItem } from '../../../../components/EpisodeListItem';
import { usePodcastPlayer } from '../../../../contexts/PodcastPlayerContext';
import { usePodcastPreferences } from '../../../../hooks/usePodcastPreferences';
import Footer from '../../../../components/Footer.web';
import HtmlRenderer from '../../../../components/HtmlRenderer';
import PodcastPreferencesModal from '../../../../components/PodcastPreferencesModal.web';
import { useIsMobile, useIsTablet, useIsDesktop } from '../../../../hooks/useMediaQuery';

export default function PodcastDetailWebScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [podcast, setPodcast] = useState<PodcastWithEpisodes | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  const { subscribe, unsubscribe, isSubscribed: checkIsSubscribed, subscriptions } = useMyPodcasts();
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

  const descriptionPreviewStyle = useMemo(() => [
    styles.descriptionPreview, 
    { color: Colors[colorScheme ?? 'light'].textSecondary }
  ], [colorScheme]);
  
  const isSubscribed = subscriptions.some(s => s.id === id);

  useEffect(() => {
    if (id) {
      loadPodcast();
    }
  }, [id]);

  const loadPodcast = async () => {
    try {
      setLoading(true);
      const data = await PodcastService.getPodcast(id!);
      setPodcast(data);
    } catch (error) {
      console.error('Error loading podcast:', error);
      Alert.alert('Error', 'Failed to load podcast details');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPodcast();
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
    router.push(`/(tabs)/preaching/episode/${episode.id}`);
  };

  const sortedEpisodes = podcast?.episodes
    ? [...podcast.episodes].sort((a, b) => {
        const dateA = new Date(a.publishedAt || 0).getTime();
        const dateB = new Date(b.publishedAt || 0).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      })
    : [];

  const handlePlayEpisode = async (episode: PodcastEpisode) => {
    console.log('[PodcastDetail.web] handlePlayEpisode called with episode:', episode.title);
    if (currentEpisode?.id === episode.id) {
      if (isPlaying) {
        console.log('[PodcastDetail.web] Pausing current episode');
        pause();
      } else if (isPaused) {
        console.log('[PodcastDetail.web] Resuming paused episode');
        resume();
      } else {
        console.log('[PodcastDetail.web] Playing current episode');
        await playEpisode(episode, {
          type: 'podcast',
          episodes: sortedEpisodes,
          sourceId: podcast?.id,
        });
      }
    } else {
      console.log('[PodcastDetail.web] Playing new episode:', episode.title);
      await playEpisode(episode, {
        type: 'podcast',
        episodes: sortedEpisodes,
        sourceId: podcast?.id,
      });
    }
  };

  if (loading && !podcast) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading podcast...
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (!podcast) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={[styles.content, { maxWidth: isDesktop ? 1000 : '100%' }]}>
        {/* Podcast Header - Vertical Layout */}
        <View style={styles.header}>
          {/* Artwork */}
          {podcast.artworkUrl ? (
            <Image
              source={{ uri: podcast.artworkUrl }}
              style={[styles.artwork, isDesktop && styles.artworkDesktop]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.artworkPlaceholder, isDesktop && styles.artworkDesktop, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
              <Ionicons name="radio" size={isDesktop ? 80 : 64} color={Colors[colorScheme ?? 'light'].primary} />
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
      </View>
      
      <Footer />

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
    </ScrollView>
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
    minHeight: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
  artworkDesktop: {
    width: 250,
    height: 250,
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
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  actionButton: {
    padding: 8,
    cursor: 'pointer',
  },
  author: {
    fontSize: 18,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  episodeCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  descriptionPreview: {
    fontSize: 16,
    fontFamily: 'Georgia',
    lineHeight: 24,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Georgia',
    lineHeight: 26,
  },
  readMoreButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    cursor: 'pointer',
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
    gap: 8,
    marginBottom: 24,
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
    marginBottom: 24,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    cursor: 'pointer',
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
    marginBottom: 16,
  },
  episodesTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    gap: 12,
  },
});
