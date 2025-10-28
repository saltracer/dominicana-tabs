import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useQueue } from '../../../hooks/useQueue';
import { usePodcastPlayer } from '../../../contexts/PodcastPlayerContext';
import { PodcastEpisode } from '../../../types';
import { router } from 'expo-router';
import HtmlRenderer from '../../../components/HtmlRenderer';

export default function QueueScreen() {
  const { colorScheme } = useTheme();
  const { queue, loading, error, clearQueue, removeFromQueue, reorderQueue, saveAsPlaylist } = useQueue();
  const { currentEpisode, playEpisode } = usePodcastPlayer();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Queue will auto-refresh when the hook loads
    setRefreshing(false);
  };

  const handlePlayEpisode = async (episode: PodcastEpisode) => {
    try {
      await playEpisode(episode);
    } catch (err) {
      console.error('Error playing episode:', err);
      Alert.alert('Error', 'Failed to play episode');
    }
  };

  const handleRemoveFromQueue = async (episode: PodcastEpisode) => {
    Alert.alert(
      'Remove from Queue',
      `Remove "${episode.title}" from queue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromQueue(episode.id);
            } catch (err) {
              console.error('Error removing episode from queue:', err);
              Alert.alert('Error', 'Failed to remove episode from queue');
            }
          },
        },
      ]
    );
  };

  const handleClearQueue = () => {
    Alert.alert(
      'Clear Queue',
      'Remove all episodes from queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearQueue();
            } catch (err) {
              console.error('Error clearing queue:', err);
              Alert.alert('Error', 'Failed to clear queue');
            }
          },
        },
      ]
    );
  };

  const handleSaveAsPlaylist = () => {
    Alert.prompt(
      'Save as Playlist',
      'Enter a name for this playlist:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (name) => {
            if (!name || name.trim() === '') {
              Alert.alert('Error', 'Please enter a playlist name');
              return;
            }
            try {
              const playlist = await saveAsPlaylist(name.trim());
              Alert.alert('Success', 'Queue saved as playlist');
              router.push(`/(tabs)/preaching/playlists/${playlist.id}`);
            } catch (err) {
              console.error('Error saving queue as playlist:', err);
              Alert.alert('Error', 'Failed to save queue as playlist');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const renderQueueItem = ({ item: episode, index }: { item: PodcastEpisode; index: number }) => {
    const isCurrentEpisode = currentEpisode?.id === episode.id;

    return (
      <TouchableOpacity
        style={[
          styles.queueItem,
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderLeftColor: isCurrentEpisode ? Colors[colorScheme ?? 'light'].primary : 'transparent',
          }
        ]}
        onPress={() => handlePlayEpisode(episode)}
        activeOpacity={0.7}
      >
        <View style={styles.episodeInfo}>
          {/* Episode Artwork */}
          <View style={styles.artworkContainer}>
            {episode.artworkUrl ? (
              <Image
                source={{ uri: episode.artworkUrl }}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.artworkPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="radio" size={20} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
            )}
          </View>

          {/* Episode Details */}
          <View style={styles.details}>
            <HtmlRenderer
              htmlContent={episode.title}
              maxLines={2}
              style={[styles.episodeTitle, { color: Colors[colorScheme ?? 'light'].text }]}
            />
            <Text style={[styles.podcastName, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={1}>
              Podcast Name
            </Text>
            {episode.duration && (
              <Text style={[styles.duration, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {Math.floor(episode.duration / 60)}:{(episode.duration % 60).toString().padStart(2, '0')}
              </Text>
            )}
          </View>

          {/* Position and Controls */}
          <View style={styles.controls}>
            <Text style={[styles.position, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {index + 1}
            </Text>
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
              onPress={() => handleRemoveFromQueue(episode)}
            >
              <Ionicons name="close" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Playing Indicator */}
        {isCurrentEpisode && (
          <View style={[styles.playingIndicator, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Ionicons name="radio" size={12} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
      <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
        Queue is Empty
      </Text>
      <Text style={[styles.emptyDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        Add episodes to your queue to see them here
      </Text>
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
        onPress={() => router.push('/(tabs)/preaching/podcasts')}
      >
        <Text style={styles.browseButtonText}>Browse Podcasts</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && queue.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Queue ({queue.length})
        </Text>
        {queue.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
              onPress={handleSaveAsPlaylist}
            >
              <Ionicons name="bookmark" size={20} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
              onPress={handleClearQueue}
            >
              <Ionicons name="trash" size={20} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Queue List */}
      {queue.length > 0 ? (
        <FlatList
          data={queue}
          keyExtractor={(item) => item.id}
          renderItem={renderQueueItem}
          style={styles.queueList}
          contentContainerStyle={styles.queueContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors[colorScheme ?? 'light'].text}
            />
          }
        />
      ) : (
        renderEmptyState()
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  queueList: {
    flex: 1,
  },
  queueContent: {
    padding: 16,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    position: 'relative',
  },
  episodeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artworkContainer: {
    marginRight: 12,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  artworkPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginRight: 8,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  podcastName: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  controls: {
    alignItems: 'center',
    gap: 8,
  },
  position: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Georgia',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
});
