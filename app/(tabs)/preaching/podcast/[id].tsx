import React, { useState, useEffect } from 'react';
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
import { usePodcastSubscriptions } from '../../../../hooks/usePodcastSubscriptions';
import { useAuth } from '../../../../contexts/AuthContext';
import { EpisodeListItem } from '../../../../components/EpisodeListItem';
import { usePodcastPlayer } from '../../../../hooks/usePodcastPlayer';

export default function PodcastDetailScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [podcast, setPodcast] = useState<PodcastWithEpisodes | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const { subscribe, unsubscribe, isSubscribed: checkIsSubscribed, subscriptions } = usePodcastSubscriptions();
  const { currentEpisode, playEpisode, pause, resume, isPlaying, isPaused } = usePodcastPlayer();
  
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
    // Navigate to episode detail/player
    router.push(`/(tabs)/preaching/episode/${episode.id}`);
  };

  const handlePlayEpisode = async (episode: PodcastEpisode) => {
    if (currentEpisode?.id === episode.id) {
      if (isPlaying) {
        pause();
      } else if (isPaused) {
        resume();
      } else {
        await playEpisode(episode);
      }
    } else {
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
        {/* Podcast Header */}
        <View style={styles.header}>
          {podcast.artworkUrl ? (
            <Image
              source={{ uri: podcast.artworkUrl }}
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
        </View>

        {/* Description */}
        {podcast.description && (
          <View style={styles.descriptionContainer}>
            <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].text }]}>
              {podcast.description}
            </Text>
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
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  artwork: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  artworkPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  episodeCount: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  descriptionContainer: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
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
