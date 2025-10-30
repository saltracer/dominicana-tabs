import React, { useState, useEffect, useMemo } from 'react';
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
import FullScreenPlayer from './FullScreenPlayer';
import HtmlRenderer from './HtmlRenderer';

export default function PodcastMiniPlayer() {
  const { colorScheme } = useTheme();
  const {
    currentEpisode,
    isPlaying,
    isPaused,
    isLoading,
    position,
    duration,
    playbackSpeed,
    playEpisode,
    pause,
    resume,
    setSpeed,
  } = usePodcastPlayer();

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loadingPodcast, setLoadingPodcast] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  // Memoize style objects for HtmlRenderer to prevent re-renders
  const episodeTitleStyle = useMemo(() => [
    styles.episodeTitle,
    { color: Colors[colorScheme ?? 'light'].text }
  ], [colorScheme]);

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
    // Open full screen player drawer
    setShowFullScreen(true);
  };

  const handleSpeedPress = () => {
    // Cycle through common speeds: 0.75x -> 1.0x -> 1.25x -> 1.5x -> 2.0x -> 0.75x
    const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
    const currentIndex = speeds.findIndex(speed => Math.abs(speed - playbackSpeed) < 0.01);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
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
    <>
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme ?? 'light'].offWhiteCard }
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
        <HtmlRenderer
          htmlContent={currentEpisode.title}
          maxLines={1}
          style={episodeTitleStyle}
        />
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
            size={18}
            color="#fff"
          />
        )}
      </TouchableOpacity>

      {/* Speed Control */}
      <TouchableOpacity 
        style={styles.speedContainer}
        onPress={handleSpeedPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.speedText, { color: Colors[colorScheme ?? 'light'].text }]}>
          x{playbackSpeed}
        </Text>
      </TouchableOpacity>

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

      <FullScreenPlayer 
        visible={showFullScreen}
        onClose={() => setShowFullScreen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4,
    height: 48, // Fixed height to match feast banner
    borderRadius: 8,
    // marginHorizontal: 8,
    // marginVertical: 4,
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // borderWidth: 1,
    // borderColor: '#ff0000'
  },
  artworkContainer: {
    marginRight: 8,
  },
  artwork: {
    width: 36,
    height: 36,
    borderRadius: 4,
  },
  artworkPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginRight: 4,
    minWidth: 0, // Allow text to truncate properly
    justifyContent: 'center', // Vertically center the text
  },
  episodeTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 1,
    lineHeight: 15, // Fixed line height to prevent expansion
    textAlign: 'left', // Left-align the title
    height: 15, // Fixed height to enforce single line
    overflow: 'hidden', // Hide overflow text
  },
  podcastName: {
    fontSize: 12,
    fontFamily: 'Georgia',
    lineHeight: 12, // Fixed line height to prevent expansion
    height: 12, // Fixed height to enforce single line
    overflow: 'hidden', // Hide overflow text
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  speedContainer: {
    marginRight: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    // backgroundColor: 'rgba(0,0,0,0.08)',
    minWidth: 26,
    alignItems: 'center',
  },
  speedText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
  },
  progressFill: {
    height: 3,
    borderRadius: 1.5,
  },
});
