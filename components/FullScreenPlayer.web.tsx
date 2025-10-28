import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { usePodcastPlayer } from '../contexts/PodcastPlayerContext';
import { useQueue } from '../hooks/useQueue';
import { router } from 'expo-router';
import HtmlRenderer from './HtmlRenderer';
import { useIsMobile, useIsTablet, useIsDesktop } from '../hooks/useMediaQuery';

interface FullScreenPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export default function FullScreenPlayer({ visible, onClose }: FullScreenPlayerProps) {
  const { colorScheme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  const {
    currentEpisode,
    isPlaying,
    isPaused,
    position,
    duration,
    playbackSpeed,
    play,
    pause,
    seek,
    setSpeed,
  } = usePodcastPlayer();
  
  const { queue, playNext, playLast } = useQueue();
  const [podcast, setPodcast] = useState<any>(null);
  const [loadingPodcast, setLoadingPodcast] = useState(false);

  // Load podcast data when episode changes
  useEffect(() => {
    if (currentEpisode) {
      setLoadingPodcast(true);
      // This would need to be implemented to fetch podcast by episode
      // For now, we'll use a placeholder
      setPodcast({ title: 'Podcast Title' });
      setLoadingPodcast(false);
    }
  }, [currentEpisode]);

  const handlePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const handleSeek = (newPosition: number) => {
    seek(newPosition);
  };

  const handleSkipBack = () => {
    const newPosition = Math.max(0, position - 15000); // 15 seconds back
    seek(newPosition);
  };

  const handleSkipForward = () => {
    const newPosition = Math.min(duration, position + 30000); // 30 seconds forward
    seek(newPosition);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpeed(parseFloat(e.target.value));
  };

  const handleQueuePress = () => {
    onClose();
    router.push('/(tabs)/preaching/queue');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentEpisode) {
    return null;
  }

  const getArtworkSize = () => {
    if (isMobile) return 200;
    if (isTablet) return 250;
    return 300;
  };

  const artworkSize = getArtworkSize();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Now Playing
          </Text>
          <TouchableOpacity onPress={handleQueuePress} style={styles.queueButton}>
            <Ionicons name="list" size={24} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.mainContent, { maxWidth: isDesktop ? 800 : '100%' }]}>
            {/* Artwork */}
            <View style={styles.artworkContainer}>
              {currentEpisode.artworkUrl || podcast?.artworkUrl ? (
                <Image
                  source={{ uri: currentEpisode.artworkUrl || podcast?.artworkUrl }}
                  style={[styles.artwork, { width: artworkSize, height: artworkSize }]}
                  resizeMode="cover"
                />
              ) : (
                <View style={[
                  styles.artworkPlaceholder, 
                  { 
                    width: artworkSize, 
                    height: artworkSize,
                    backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' 
                  }
                ]}>
                  <Ionicons name="radio" size={artworkSize * 0.4} color={Colors[colorScheme ?? 'light'].primary} />
                </View>
              )}
            </View>

            {/* Episode Info */}
            <View style={styles.episodeInfo}>
              <Text style={[styles.podcastTitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {podcast?.title || 'Podcast'}
              </Text>
              <HtmlRenderer
                htmlContent={currentEpisode.title}
                maxLines={3}
                style={[styles.episodeTitle, { color: Colors[colorScheme ?? 'light'].text }]}
              />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatTime(position)}
              </Text>
              <input
                type="range"
                min="0"
                max={duration}
                value={position}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  height: 6,
                  marginHorizontal: 16,
                  accentColor: Colors[colorScheme ?? 'light'].primary,
                  background: 'transparent',
                }}
              />
              <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatTime(duration)}
              </Text>
            </View>

            {/* Playback Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
                onPress={handleSkipBack}
              >
                <Ionicons name="play-skip-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={handlePlay}
              >
                <Ionicons
                  name={isPaused ? 'play' : isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
                onPress={handleSkipForward}
              >
                <Ionicons name="play-skip-forward" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            </View>

            {/* Speed Control */}
            <View style={styles.speedContainer}>
              <div style={styles.speedSelect}>
                <select
                  value={playbackSpeed}
                  onChange={handleSpeedChange}
                  style={{
                    backgroundColor: Colors[colorScheme ?? 'light'].surface,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: Colors[colorScheme ?? 'light'].border,
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    fontFamily: 'Georgia',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(Colors[colorScheme ?? 'light'].text)}'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 8px center',
                    backgroundSize: '16px',
                    paddingRight: 32,
                  }}
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={1.75}>1.75x</option>
                  <option value={2.0}>2.0x</option>
                  <option value={2.5}>2.5x</option>
                  <option value={3.0}>3.0x</option>
                </select>
              </div>
            </View>

            {/* Queue Info */}
            {queue.length > 0 && (
              <View style={styles.queueInfo}>
                <Text style={[styles.queueText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {queue.length} episode{queue.length !== 1 ? 's' : ''} in queue
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  queueButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainContent: {
    alignSelf: 'center',
    width: '100%',
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  artwork: {
    borderRadius: 16,
  },
  artworkPlaceholder: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  podcastTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Georgia',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  timeText: {
    fontSize: 14,
    width: 50,
    textAlign: 'center',
    fontFamily: 'Georgia',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  speedContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  speedSelect: {
    // Web specific styles for select element
  },
  queueInfo: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  queueText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});
