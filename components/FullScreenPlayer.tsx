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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { usePodcastPlayer } from '../contexts/PodcastPlayerContext';
import { useQueue } from '../hooks/useQueue';
import { router } from 'expo-router';
import HtmlRenderer from './HtmlRenderer';
import { PodcastService } from '../services/PodcastService';
import { Podcast } from '../types';
import SpeedSelectorModal from './SpeedSelectorModal';
import { ensureImageCached } from '../lib/podcast/storage';
import { EpisodeMetadataCache } from '../services/EpisodeMetadataCache';
import { PodcastPlaybackService } from '../services/PodcastPlaybackService';

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
    resume,
    pause,
    seek,
    setSpeed,
  } = usePodcastPlayer();
  
  const { queue, playNext, playLast } = useQueue();
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loadingPodcast, setLoadingPodcast] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [artworkPath, setArtworkPath] = useState<string | null>(null);
  const [playedStatus, setPlayedStatus] = useState<{ played: boolean; position: number } | null>(null);

  // Memoize style objects for HtmlRenderer to prevent re-renders
  const episodeTitleStyle = useMemo(() => [
    styles.episodeTitle,
    { color: Colors[colorScheme ?? 'light'].text }
  ], [colorScheme]);

  const descriptionStyle = useMemo(() => [
    styles.description,
    { color: Colors[colorScheme ?? 'light'].textSecondary }
  ], [colorScheme]);

  // Load podcast data when episode changes
  useEffect(() => {
    if (currentEpisode) {
      loadPodcastData();
      const artUrl = currentEpisode.artworkUrl;
      if (artUrl) {
        ensureImageCached(artUrl)
          .then(({ path }) => setArtworkPath(path))
          .catch(() => setArtworkPath(null));
      } else {
        setArtworkPath(null);
      }
    }
  }, [currentEpisode?.id]);

  // Fetch played status from cache or service
  useEffect(() => {
    if (!currentEpisode) return;
    
    let cancelled = false;
    
    const fetchPlayedStatus = async () => {
      // Try cache first
      const cached = EpisodeMetadataCache.get(currentEpisode.id);
      if (cached) {
        if (!cancelled) {
          setPlayedStatus({
            played: cached.played,
            position: cached.playbackPosition,
          });
        }
        return;
      }
      
      // Fallback to service
      try {
        const progressData = await PodcastPlaybackService.getProgress(currentEpisode.id);
        if (!cancelled) {
          setPlayedStatus({
            played: progressData?.played || false,
            position: progressData?.position || 0,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setPlayedStatus({ played: false, position: 0 });
        }
      }
    };
    
    fetchPlayedStatus();
    
    // Subscribe to cache updates
    const unsubscribe = EpisodeMetadataCache.subscribe((episodeId, metadata) => {
      if (episodeId === currentEpisode.id && metadata && !cancelled) {
        setPlayedStatus({
          played: metadata.played,
          position: metadata.playbackPosition,
        });
      }
    });
    
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [currentEpisode?.id]);

  const loadPodcastData = async () => {
    if (!currentEpisode) return;
    
    setLoadingPodcast(true);
    try {
      // Try to fetch podcast by episode.podcastId first (works for RSS-cached episodes)
      if (currentEpisode.podcastId) {
        try {
          const podcastData = await PodcastService.getPodcast(currentEpisode.podcastId);
          setPodcast(podcastData);
          setLoadingPodcast(false);
          return;
        } catch (e) {
          if (__DEV__) console.log('[FullScreenPlayer] Could not fetch podcast by podcastId, trying by episodeId');
        }
      }
      
      // Fallback: try to get podcast via episode ID (for DB episodes)
      const podcastData = await PodcastService.getPodcastByEpisodeId(currentEpisode.id);
      setPodcast(podcastData);
    } catch (error) {
      // Expected for RSS-cached episodes not in database - use fallback
      if (__DEV__) console.log('[FullScreenPlayer] Episode not in DB, using fallback podcast info');
      // Set a fallback podcast object
      setPodcast({
        id: 'unknown',
        title: 'Unknown Podcast',
        description: '',
        author: '',
        rssUrl: '',
        artworkUrl: undefined,
        websiteUrl: undefined,
        language: 'en',
        categories: [],
        isCurated: false,
        isActive: true,
        createdBy: undefined,
        lastFetchedAt: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setLoadingPodcast(false);
    }
  };

  // Artwork priority helper
  const getArtworkUrl = () => {
    return artworkPath || currentEpisode?.artworkUrl || podcast?.artworkUrl || null;
  };

  // Get responsive artwork size
  const getArtworkSize = () => {
    return 280; // Mobile size for now
  };

  const handlePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
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

  const handleSpeedChange = (speed: number) => {
    setSpeed(speed);
  };

  const handleSliderChange = (value: number) => {
    const newPosition = (value / 100) * duration;
    seek(newPosition);
  };

  const handlePodcastPress = () => {
    if (podcast) {
      onClose();
      router.push(`/(tabs)/preaching/podcast/${podcast.id}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

  const artworkSize = getArtworkSize();
  const artworkUrl = getArtworkUrl();

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
                <Ionicons name="radio" size={80} color={Colors[colorScheme ?? 'light'].primary} />
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
                    {formatDate(currentEpisode.publishedAt)}
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
                    {(() => {
                      const remaining = Math.max(0, currentEpisode.duration - playedStatus.position);
                      const hours = Math.floor(remaining / 3600);
                      const minutes = Math.floor((remaining % 3600) / 60);
                      const secs = Math.floor(remaining % 60);
                      if (hours > 0) {
                        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} left`;
                      }
                      return `${minutes}:${secs.toString().padStart(2, '0')} left`;
                    })()}
                  </Text>
                </View>
              )}
            </View>
          </View>


          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {formatTime(position)}
            </Text>
            <Slider
              value={duration > 0 ? (position / duration) * 100 : 0}
              onValueChange={handleSliderChange}
              minimumValue={0}
              maximumValue={100}
              minimumTrackTintColor={Colors[colorScheme ?? 'light'].primary}
              maximumTrackTintColor={Colors[colorScheme ?? 'light'].border}
              thumbTintColor={Colors[colorScheme ?? 'light'].primary}
              style={styles.slider}
            />
            <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {formatTime(duration)}
            </Text>
          </View>

          {/* Playback Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.skipButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
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
              style={[styles.skipButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
              onPress={handleSkipForward}
            >
              <Ionicons name="play-skip-forward" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          </View>

          {/* Speed Control */}
          <View style={styles.speedContainer}>
            <TouchableOpacity
              style={[styles.speedButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
              onPress={() => setShowSpeedModal(true)}
            >
              <Ionicons name="speedometer" size={20} color={Colors[colorScheme ?? 'light'].primary} />
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
        </ScrollView>

        {/* Speed Selector Modal */}
        <SpeedSelectorModal
          visible={showSpeedModal}
          currentSpeed={playbackSpeed}
          onSelectSpeed={handleSpeedChange}
          onClose={() => setShowSpeedModal(false)}
        />
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
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
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
