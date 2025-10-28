import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { usePodcastPlayer } from '../contexts/PodcastPlayerContext';
import { PodcastService } from '../services/PodcastService';
import { Podcast } from '../types';
import { router } from 'expo-router';

export default function PodcastMiniPlayer() {
  const { colorScheme } = useTheme();
  const {
    currentEpisode,
    isPlaying,
    isPaused,
    isLoading,
    position,
    duration,
    playEpisode,
    pause,
    resume,
  } = usePodcastPlayer();

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loadingPodcast, setLoadingPodcast] = useState(false);

  console.log('[PodcastMiniPlayer] Rendering with:', {
    currentEpisode: currentEpisode?.title,
    isPlaying,
    isPaused,
    position,
    duration
  });

  // Fetch podcast data when episode changes
  useEffect(() => {
    if (currentEpisode) {
      fetchPodcast();
    } else {
      setPodcast(null);
    }
  }, [currentEpisode?.id]);

  const fetchPodcast = async () => {
    if (!currentEpisode) return;
    
    try {
      setLoadingPodcast(true);
      const podcastData = await PodcastService.getPodcast(currentEpisode.podcastId);
      setPodcast(podcastData);
    } catch (error) {
      console.error('[PodcastMiniPlayer] Error fetching podcast:', error);
      setPodcast(null);
    } finally {
      setLoadingPodcast(false);
    }
  };

  if (!currentEpisode) {
    return null;
  }

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handlePress = () => {
    // Navigate to episode detail screen
    router.push(`/(tabs)/preaching/episode/${currentEpisode.id}`);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  // Determine which artwork to use (episode first, then podcast)
  const artworkUrl = currentEpisode.artworkUrl || podcast?.artworkUrl;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].surface }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Episode Artwork */}
      <View style={styles.artworkContainer}>
        {artworkUrl ? (
          <Image
            source={{ uri: artworkUrl }}
            style={styles.artwork}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.artworkPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Ionicons name="musical-notes" size={20} color="#fff" />
          </View>
        )}
      </View>

      {/* Episode Info */}
      <View style={styles.infoContainer}>
        <Text 
          style={[styles.episodeTitle, { color: Colors[colorScheme ?? 'light'].text }]}
          numberOfLines={1}
        >
          {currentEpisode.title}
        </Text>
        <Text 
          style={[styles.podcastName, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
          numberOfLines={1}
        >
          {podcast?.title || 'Podcast'}
        </Text>
      </View>

      {/* Play/Pause Button */}
      <TouchableOpacity
        style={[
          styles.playButton,
          { backgroundColor: Colors[colorScheme ?? 'light'].primary }
        ]}
        onPress={handlePlayPause}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={16}
            color="#fff"
          />
        )}
      </TouchableOpacity>

      {/* Speed Indicator */}
      <View style={styles.speedContainer}>
        <Text style={[styles.speedText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          1.0x
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar,
            { backgroundColor: Colors[colorScheme ?? 'light'].border }
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: Colors[colorScheme ?? 'light'].primary,
              }
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  artworkContainer: {
    marginRight: 12,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  artworkPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  podcastName: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  speedContainer: {
    marginRight: 8,
  },
  speedText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 2,
    left: 12,
    right: 12,
    height: 2,
  },
  progressBar: {
    height: 2,
    borderRadius: 1,
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
  },
});
