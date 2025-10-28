import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { PodcastService } from '../../../../services/PodcastService';
import { PodcastEpisode, Podcast } from '../../../../types';
import { usePodcastPlayer } from '../../../../contexts/PodcastPlayerContext';
import { useIsMobile, useIsTablet } from '../../../../hooks/useMediaQuery';

export default function EpisodeDetailWebScreen() {
  const { colorScheme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);

  const playbackSpeeds = [0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];

  const {
    currentEpisode,
    isPlaying,
    isPaused,
    isLoading: playerLoading,
    position,
    duration,
    playEpisode,
    pause,
    resume,
    seek,
    setSpeed,
  } = usePodcastPlayer();

  useEffect(() => {
    if (id) {
      loadEpisode();
    }
  }, [id]);

  const loadEpisode = async () => {
    try {
      setLoading(true);
      const episodeData = await PodcastService.getEpisode(id!);
      setEpisode(episodeData);

      const podcastData = await PodcastService.getPodcast(episodeData.podcastId);
      setPodcast(podcastData);
    } catch (error) {
      console.error('Error loading episode:', error);
      Alert.alert('Error', 'Failed to load episode');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    console.log('[EpisodeDetail.web] handlePlay called with episode:', episode?.title);
    if (!episode) return;
    
    if (currentEpisode?.id === episode.id) {
      if (isPlaying) {
        console.log('[EpisodeDetail.web] Pausing current episode');
        pause();
      } else if (isPaused) {
        console.log('[EpisodeDetail.web] Resuming paused episode');
        resume();
      } else {
        console.log('[EpisodeDetail.web] Playing current episode');
        await playEpisode(episode);
      }
    } else {
      console.log('[EpisodeDetail.web] Playing new episode:', episode.title);
      await playEpisode(episode);
    }
  };

  const handleSeek = (value: number) => {
    seek(value);
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    setSpeed(speed);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading episode...
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (!episode || !podcast) return null;

  const isCurrentEpisode = currentEpisode?.id === episode.id;
  const isPlayingCurrent = isCurrentEpisode && isPlaying;

  // Progress percentage
  const progressValue = isCurrentEpisode && duration > 0 ? (position / duration) * 100 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Episode
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.mainContent, { flexDirection: isMobile ? 'column' : 'row' }]}>
          {/* Left Column - Artwork */}
          <View style={[styles.artworkSection, isMobile && styles.artworkSectionMobile]}>
            {episode.artworkUrl || podcast.artworkUrl ? (
              <Image
                source={{ uri: episode.artworkUrl || podcast.artworkUrl }}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.artworkPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="radio" size={80} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
            )}
          </View>

          {/* Right Column - Details & Controls */}
          <View style={styles.detailsSection}>
            {/* Podcast Info */}
            <TouchableOpacity
              style={styles.podcastInfo}
              onPress={() => router.push(`/(tabs)/preaching/podcast/${podcast.id}`)}
            >
              <Text style={[styles.podcastTitle, { color: Colors[colorScheme ?? 'light'].primary }]}>
                {podcast.title}
              </Text>
              {podcast.author && (
                <Text style={[styles.podcastAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {podcast.author}
                </Text>
              )}
            </TouchableOpacity>

            {/* Episode Title */}
            <Text style={[styles.episodeTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {episode.title}
            </Text>

            {/* Episode Meta */}
            <View style={styles.metaContainer}>
              {episode.publishedAt && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
                  <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {new Date(episode.publishedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {episode.duration && (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
                  <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {Math.floor(episode.duration / 60)} minutes
                  </Text>
                </View>
              )}
            </View>

            {/* Playback Controls */}
            <View style={styles.controlsContainer}>
              {/* Progress Bar with Controls */}
              <View style={styles.progressContainer}>
                {/* Play Button */}
                <TouchableOpacity
                  style={[styles.playButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                  onPress={handlePlay}
                  disabled={playerLoading}
                >
                  {playerLoading && isCurrentEpisode ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Ionicons
                      name={isPlayingCurrent ? 'pause' : 'play'}
                      size={24}
                      color="#fff"
                    />
                  )}
                </TouchableOpacity>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressTrack, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${progressValue}%`,
                          backgroundColor: Colors[colorScheme ?? 'light'].primary,
                        }
                      ]}
                    />
                  </View>
                  <View style={styles.timeContainer}>
                    <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {formatTime(isCurrentEpisode ? position : 0)}
                    </Text>
                    <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {formatTime(duration || episode.duration || 0)}
                    </Text>
                  </View>
                </View>

                {/* Speed Control */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: 4,
                }}>
                  <Ionicons name="speedometer" size={20} color={Colors[colorScheme ?? 'light'].text} />
                  <select
                    value={selectedSpeed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    style={{
                      backgroundColor: Colors[colorScheme ?? 'light'].surface,
                      color: Colors[colorScheme ?? 'light'].text,
                      border: `1px solid ${Colors[colorScheme ?? 'light'].border}`,
                      borderRadius: 4,
                      padding: '4px 8px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      fontFamily: 'Georgia',
                    }}
                  >
                    {playbackSpeeds.map((speed) => (
                      <option key={speed} value={speed}>
                        {speed}x
                      </option>
                    ))}
                  </select>
                </div>
              </View>
            </View>

            {/* Description */}
            {episode.description && (
              <View style={styles.descriptionContainer}>
                <div 
                  style={{
                    color: Colors[colorScheme ?? 'light'].text,
                    fontSize: 16,
                    lineHeight: '26px',
                    fontFamily: 'Georgia',
                  }}
                  dangerouslySetInnerHTML={{ __html: episode.description }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  mainContent: {
    gap: 48,
  },
  artworkSection: {
    flex: 1,
    alignItems: 'center',
  },
  artworkSectionMobile: {
    marginBottom: 0,
  },
  artwork: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1,
    borderRadius: 12,
  },
  artworkPlaceholder: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsSection: {
    flex: 1,
  },
  podcastInfo: {
    marginBottom: 16,
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  podcastAuthor: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  episodeTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  controlsContainer: {
    marginBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Georgia',
  },
});
