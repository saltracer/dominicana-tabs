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
import { usePodcastSubscriptions } from '../../../../hooks/usePodcastSubscriptions';
import { useAuth } from '../../../../contexts/AuthContext';
import { EpisodeListItem } from '../../../../components/EpisodeListItem';
import { usePodcastPlayer } from '../../../../contexts/PodcastPlayerContext';
import { usePodcastPreferences } from '../../../../hooks/usePodcastPreferences';
import Footer from '../../../../components/Footer.web';
import HtmlRenderer from '../../../../components/HtmlRenderer';
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
        await playEpisode(episode);
      }
    } else {
      console.log('[PodcastDetail.web] Playing new episode:', episode.title);
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
        {/* Podcast Header */}
        <View style={[styles.header, { flexDirection: isMobile ? 'column' : 'row' }]}>
          {podcast.artworkUrl ? (
            <Image
              source={{ uri: podcast.artworkUrl }}
              style={[styles.artwork, isMobile && styles.artworkMobile]}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.artworkPlaceholder, isMobile && styles.artworkMobile, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
              <Ionicons name="radio" size={64} color={Colors[colorScheme ?? 'light'].primary} />
            </View>
          )}

          <View style={[styles.headerInfo, isMobile && styles.headerInfoMobile]}>
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
            {podcast.description && (
              <HtmlRenderer 
                htmlContent={podcast.description}
                maxLines={3}
                style={descriptionPreviewStyle}
              />
            )}
          </View>
        </View>

        {/* Description */}
        {!isMobile && podcast.description && (
          <View style={styles.descriptionContainer}>
            <HtmlRenderer 
              htmlContent={podcast.description}
              style={descriptionStyle}
            />
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
        )}

        {/* Podcast Preferences */}
        {user && isSubscribed && (
          <View style={[styles.preferencesContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.preferencesTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Podcast Preferences
            </Text>
            
            {/* Playback Speed */}
            <View style={styles.preferenceItem}>
              <Text style={[styles.preferenceLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Playback Speed
              </Text>
              <View style={styles.speedButtons}>
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0].map((speed) => (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.speedButton,
                      { 
                        backgroundColor: effectiveSpeed === speed 
                          ? Colors[colorScheme ?? 'light'].primary 
                          : Colors[colorScheme ?? 'light'].background,
                        borderColor: Colors[colorScheme ?? 'light'].border,
                      }
                    ]}
                    onPress={() => updatePreferences({ playbackSpeed: speed })}
                  >
                    <Text style={[
                      styles.speedButtonText,
                      { 
                        color: effectiveSpeed === speed 
                          ? '#fff' 
                          : Colors[colorScheme ?? 'light'].text 
                      }
                    ]}>
                      {speed}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Max Episodes to Keep */}
            <View style={styles.preferenceItem}>
              <Text style={[styles.preferenceLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Max Episodes to Keep
              </Text>
              <View style={styles.episodeButtons}>
                {[10, 25, 50, 100].map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.episodeButton,
                      { 
                        backgroundColor: effectiveMaxEpisodes === count 
                          ? Colors[colorScheme ?? 'light'].primary 
                          : Colors[colorScheme ?? 'light'].background,
                        borderColor: Colors[colorScheme ?? 'light'].border,
                      }
                    ]}
                    onPress={() => updatePreferences({ maxEpisodesToKeep: count })}
                  >
                    <Text style={[
                      styles.episodeButtonText,
                      { 
                        color: effectiveMaxEpisodes === count 
                          ? '#fff' 
                          : Colors[colorScheme ?? 'light'].text 
                      }
                    ]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Auto Download */}
            <View style={styles.preferenceItem}>
              <Text style={[styles.preferenceLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Auto Download
              </Text>
              <TouchableOpacity
                style={[
                  styles.autoDownloadButton,
                  { 
                    backgroundColor: effectiveAutoDownload 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].background,
                    borderColor: Colors[colorScheme ?? 'light'].border,
                  }
                ]}
                onPress={() => updatePreferences({ autoDownload: !effectiveAutoDownload })}
              >
                <Ionicons 
                  name={effectiveAutoDownload ? "checkmark" : "close"} 
                  size={16} 
                  color={effectiveAutoDownload ? '#fff' : Colors[colorScheme ?? 'light'].text} 
                />
                <Text style={[
                  styles.autoDownloadText,
                  { 
                    color: effectiveAutoDownload 
                      ? '#fff' 
                      : Colors[colorScheme ?? 'light'].text 
                  }
                ]}>
                  {effectiveAutoDownload ? 'Enabled' : 'Disabled'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reset to Global */}
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
              onPress={() => resetToGlobal()}
            >
              <Ionicons name="refresh" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.resetText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Reset to Global Settings
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
    gap: 24,
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  artworkMobile: {
    width: 150,
    height: 150,
    alignSelf: 'center',
  },
  artworkPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerInfoMobile: {
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
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
  preferencesContainer: {
    marginBottom: 32,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  preferencesTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 20,
  },
  preferenceItem: {
    marginBottom: 20,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  speedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
    cursor: 'pointer',
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  episodeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  episodeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
    cursor: 'pointer',
  },
  episodeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  autoDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    alignSelf: 'flex-start',
    cursor: 'pointer',
  },
  autoDownloadText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
    cursor: 'pointer',
  },
  resetText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});
