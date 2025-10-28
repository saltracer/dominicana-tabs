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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { usePodcastPlayer } from '../contexts/PodcastPlayerContext';
import { useQueue } from '../hooks/useQueue';
import { router } from 'expo-router';
import HtmlRenderer from './HtmlRenderer';

interface FullScreenPlayerProps {
  visible: boolean;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FullScreenPlayer({ visible, onClose }: FullScreenPlayerProps) {
  const { colorScheme } = useTheme();
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

  const handleSpeedChange = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
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
          {/* Artwork */}
          <View style={styles.artworkContainer}>
            {currentEpisode.artworkUrl || podcast?.artworkUrl ? (
              <Image
                source={{ uri: currentEpisode.artworkUrl || podcast?.artworkUrl }}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.artworkPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="radio" size={80} color={Colors[colorScheme ?? 'light'].primary} />
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
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${duration > 0 ? (position / duration) * 100 : 0}%`,
                    backgroundColor: Colors[colorScheme ?? 'light'].primary,
                  },
                ]}
              />
              <TouchableOpacity
                style={[
                  styles.progressThumb,
                  {
                    left: `${duration > 0 ? (position / duration) * 100 : 0}%`,
                    backgroundColor: Colors[colorScheme ?? 'light'].primary,
                  },
                ]}
                onPress={() => {}} // Handle seeking
              />
            </View>
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
            <TouchableOpacity
              style={[styles.speedButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
              onPress={handleSpeedChange}
            >
              <Text style={[styles.speedText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {playbackSpeed}x
              </Text>
            </TouchableOpacity>
          </View>

          {/* Queue Info */}
          {queue.length > 0 && (
            <View style={styles.queueInfo}>
              <Text style={[styles.queueText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {queue.length} episode{queue.length !== 1 ? 's' : ''} in queue
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
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
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  artworkPlaceholder: {
    width: 200,
    height: 200,
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
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    marginHorizontal: 16,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
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
  speedButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  speedText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
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
