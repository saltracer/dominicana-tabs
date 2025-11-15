import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { usePodcastPlayer } from '../contexts/PodcastPlayerContext';
import { useQueue } from '../hooks/useQueue';
import { router } from 'expo-router';
import HtmlRenderer from './HtmlRenderer';
import { useIsMobile, useIsTablet, useIsDesktop } from '../hooks/useMediaQuery';
import {
  formatTime,
  formatTimeRemaining,
  formatDate,
  calculateSliderPosition,
  getArtworkUrl,
  calculateProgressPercentage,
} from '../utils/podcastUtils';
import { usePodcastControls } from '../hooks/usePodcastControls';
import { usePodcastData } from '../hooks/usePodcastData';
import { useEpisodePlayedStatus } from '../hooks/useEpisodePlayedStatus';

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
    seek,
    setSpeed,
  } = usePodcastPlayer();
  
  const { skipBack, skipForward, playPause } = usePodcastControls();
  
  const { queue, playNext, playLast } = useQueue();
  const { podcast, loading: loadingPodcast } = usePodcastData(currentEpisode);
  const playedStatus = useEpisodePlayedStatus(currentEpisode?.id || null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Memoize style objects for HtmlRenderer to prevent re-renders
  const episodeTitleStyle = useMemo(() => [
    styles.episodeTitle,
    { color: Colors[colorScheme ?? 'light'].text }
  ], [colorScheme]);

  const descriptionStyle = useMemo(() => [
    styles.description,
    { color: Colors[colorScheme ?? 'light'].textSecondary }
  ], [colorScheme]);


  // Artwork URL with priority: episode → podcast
  const artworkUrl = getArtworkUrl(currentEpisode, podcast);

  const handleSeek = (newPosition: number) => {
    seek(newPosition);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpeed(parseFloat(e.target.value));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = calculateSliderPosition(parseFloat(e.target.value), duration);
    seek(newPosition);
  };

  const handlePodcastPress = () => {
    if (podcast) {
      onClose();
      router.push(`/(tabs)/preaching/podcast/${podcast.id}`);
    }
  };

  const handleQueuePress = () => {
    onClose();
    router.push('/(tabs)/preaching/queue');
  };

  if (!currentEpisode) {
    return null;
  }

  const getArtworkSize = () => {
    if (isMobile) return 280;
    if (isTablet) return 320;
    return 360;
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
              {loadingPodcast ? (
                <View style={[styles.artworkPlaceholder, { width: artworkSize, height: artworkSize }]}>
                  <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
                </View>
              ) : artworkUrl ? (
                <Image
                  source={{ uri: artworkUrl }}
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
              <TouchableOpacity onPress={handlePodcastPress} disabled={!podcast}>
                <Text style={[
                  styles.podcastTitle, 
                  { 
                    color: podcast ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary 
                  }
                ]}>
                  {podcast?.title || 'Loading...'}
                </Text>
              </TouchableOpacity>
              <HtmlRenderer
                htmlContent={currentEpisode.title}
                maxLines={3}
                style={episodeTitleStyle}
              />
              
              {/* Episode Meta */}
              <View style={styles.metaContainer}>
                {playedStatus?.played && (
                  <View style={styles.metaItem}>
                    <Ionicons name="checkmark-circle" size={14} color="#4caf50" />
                    <Text style={[styles.metaText, { color: '#4caf50' }]}>
                      Played
                    </Text>
                  </View>
                )}
                {currentEpisode.publishedAt && (
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {formatDate(currentEpisode.publishedAt, { absolute: true })}
                    </Text>
                  </View>
                )}
                {currentEpisode.duration && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {Math.floor(currentEpisode.duration / 60)} min
                    </Text>
                  </View>
                )}
                {playedStatus && !playedStatus.played && playedStatus.position > 0 && currentEpisode.duration && currentEpisode.duration > 0 && (
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary, fontSize: 12 }]}>
                      {formatTimeRemaining(currentEpisode.duration, playedStatus.position)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Episode Description */}
            {currentEpisode.description && (
              <View style={styles.descriptionContainer}>
                <HtmlRenderer 
                  htmlContent={currentEpisode.description}
                  maxLines={isDescriptionExpanded ? undefined : 5}
                  style={descriptionStyle}
                />
                {currentEpisode.description.length > 200 && (
                  <TouchableOpacity 
                    onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    style={styles.readMoreButton}
                  >
                    <Text style={[styles.readMoreText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      {isDescriptionExpanded ? 'Read less' : 'Read more'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatTime(position)}
              </Text>
              <input
                type="range"
                min="0"
                max="100"
                value={calculateProgressPercentage(position, duration)}
                onChange={handleSliderChange}
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
                style={[styles.skipButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
                onPress={skipBack}
              >
                <FontAwesome name="rotate-left" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={playPause}
              >
                <Ionicons
                  name={isPaused ? 'play' : isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.skipButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
                onPress={skipForward}
              >
                <FontAwesome name="rotate-right" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            </View>

            {/* Speed Control */}
            <View style={styles.speedContainer}>
              <div style={[styles.speedButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                <Ionicons name="speedometer" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <select
                  value={playbackSpeed}
                  onChange={handleSpeedChange}
                  style={{
                    backgroundColor: 'transparent',
                    color: Colors[colorScheme ?? 'light'].text,
                    border: 'none',
                    fontSize: 16,
                    fontWeight: 'bold',
                    fontFamily: 'Georgia',
                    outline: 'none',
                    cursor: 'pointer',
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
    marginVertical: 40,
    paddingHorizontal: 20,
  },
  artwork: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  artworkPlaceholder: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  episodeInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  podcastTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Georgia',
    textAlign: 'center',
    cursor: 'pointer',
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  descriptionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
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
    gap: 20,
  },
  skipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  speedContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
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
