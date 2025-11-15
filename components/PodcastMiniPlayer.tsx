import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { usePodcastPlayer } from '../contexts/PodcastPlayerContext';
import { router } from 'expo-router';
import FullScreenPlayer from './FullScreenPlayer';
import HtmlRenderer from './HtmlRenderer';
import { ensureImageCached } from '../lib/podcast/storage';
import { 
  getNextSpeed, 
  SPEED_OPTIONS,
  getArtworkUrl,
  formatTimeRemaining,
} from '../utils/podcastUtils';
import { usePodcastControls } from '../hooks/usePodcastControls';
import { usePodcastData } from '../hooks/usePodcastData';

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
    setSpeed,
  } = usePodcastPlayer();
  
  const { skipBack, skipForward, playPause } = usePodcastControls();
  const { podcast, loading: loadingPodcast } = usePodcastData(currentEpisode);

  const [showFullScreen, setShowFullScreen] = useState(false);
  const [artworkPath, setArtworkPath] = useState<string | null>(null);

  // Memoize style objects for HtmlRenderer to prevent re-renders
  const episodeTitleStyle = useMemo(() => [
    styles.episodeTitle,
    { color: Colors[colorScheme ?? 'light'].text }
  ], [colorScheme]);

  // console.log('[PodcastMiniPlayer] Rendering with:', {
  //   currentEpisode: currentEpisode?.title,
  //   isPlaying,
  //   isPaused,
  //   position,
  //   duration
  // });

  // Cache artwork when episode changes (native only)
  useEffect(() => {
    if (currentEpisode) {
      const artUrl = currentEpisode.artworkUrl || podcast?.artworkUrl;
      if (artUrl) {
        try {
          ensureImageCached(artUrl)
            .then(({ path }) => setArtworkPath(path))
            .catch((e) => {
              console.warn('[PodcastMiniPlayer] Image cache skipped:', e);
              setArtworkPath(null);
            });
        } catch (e) {
          setArtworkPath(null);
        }
      } else {
        setArtworkPath(null);
      }
    } else {
      setArtworkPath(null);
    }
  }, [currentEpisode?.id, currentEpisode?.artworkUrl, podcast?.artworkUrl]);

  if (!currentEpisode) {
    return null;
  }

  const handlePress = () => {
    // Open full screen player drawer
    setShowFullScreen(true);
  };

  const handleSpeedPress = () => {
    const nextSpeed = getNextSpeed(playbackSpeed, SPEED_OPTIONS);
    setSpeed(nextSpeed);
  };

  // Determine which artwork to use (episode first, then cached path, then podcast)
  const artworkUrl = getArtworkUrl(currentEpisode, podcast, artworkPath);

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
          {podcast?.title || 'Podcast'} {duration > 0 && formatTimeRemaining(duration, position)} ({playbackSpeed}x)
        </Text>
      </View>

      {/* Skip Back Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={skipBack}
        activeOpacity={0.7}
      >
        <FontAwesome
          name="rotate-left"
          size={30}
          color={Colors[colorScheme ?? 'light'].text}
        />
      </TouchableOpacity>

      {/* Play/Pause Button */}
      <TouchableOpacity
        style={[
          styles.playButton,
          { backgroundColor: Colors[colorScheme ?? 'light'].primary }
        ]}
        onPress={playPause}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color="#fff"
          />
        )}
      </TouchableOpacity>

      {/* Skip Forward Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={skipForward}
        activeOpacity={0.7}
      >
        <FontAwesome
          name="rotate-right"
          size={30}
          color={Colors[colorScheme ?? 'light'].text}
        />
      </TouchableOpacity>

      {/* Speed Control */}
      {/* <TouchableOpacity 
        style={styles.speedContainer}
        onPress={handleSpeedPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.speedText, { color: Colors[colorScheme ?? 'light'].text }]}>
          x{playbackSpeed}
        </Text>
      </TouchableOpacity> */}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  skipButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
});
