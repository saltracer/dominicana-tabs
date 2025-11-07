import React, { useState, useEffect, useMemo } from 'react';
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
import HtmlRenderer from '../../../../components/HtmlRenderer';
import { useIsMobile, useIsTablet } from '../../../../hooks/useMediaQuery';
import { EpisodeMetadataCache } from '../../../../services/EpisodeMetadataCache';
import { PodcastPlaybackService } from '../../../../services/PodcastPlaybackService';

export default function EpisodeDetailWebScreen() {
  const { colorScheme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [playedStatus, setPlayedStatus] = useState<{ played: boolean; position: number } | null>(null);

  const playbackSpeeds = [0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];

  // Memoize style objects for HtmlRenderer to prevent re-renders
  const titleStyle = useMemo(() => [
    styles.episodeTitle,
    { color: Colors[colorScheme ?? 'light'].text }
  ], [colorScheme]);

  const descriptionStyle = useMemo(() => [
    styles.description, 
    { color: Colors[colorScheme ?? 'light'].text }
  ], [colorScheme]);

  const podcastBadgeStyle = useMemo(() => [
    styles.podcastBadge,
    { 
      backgroundColor: Colors[colorScheme ?? 'light'].surface,
      borderColor: Colors[colorScheme ?? 'light'].border 
    }
  ], [colorScheme]);

  const {
    currentEpisode,
    isPlaying,
    isPaused,
    isLoading: playerLoading,
    position,
    duration,
    playbackSpeed,
    playEpisode,
    pause,
    resume,
    seek,
    setSpeed,
  } = usePodcastPlayer();

  // Sync local speed state with player speed
  useEffect(() => {
    if (currentEpisode?.id === episode?.id && playbackSpeed) {
      setSelectedSpeed(playbackSpeed);
    }
  }, [playbackSpeed, currentEpisode?.id, episode?.id]);

  useEffect(() => {
    if (id) {
      loadEpisode();
    }
  }, [id]);

  // Fetch played status from cache or service
  useEffect(() => {
    if (!episode) return;
    
    let cancelled = false;
    
    const fetchPlayedStatus = async () => {
      // Try cache first
      const cached = EpisodeMetadataCache.get(episode.id);
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
        const progressData = await PodcastPlaybackService.getProgress(episode.id);
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
      if (episodeId === episode.id && metadata && !cancelled) {
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
  }, [episode?.id]);

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

  // Progress percentage - show saved progress if not currently playing
  const progressValue = (() => {
    if (isCurrentEpisode && duration > 0) {
      return (position / duration) * 100;
    } else if (playedStatus && episode.duration && episode.duration > 0) {
      return (playedStatus.position / episode.duration) * 100;
    }
    return 0;
  })();

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

        {/* Header Section */}
        <View style={[styles.headerSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          {/* Artwork */}
          <View style={styles.artworkContainer}>
            {episode.artworkUrl || podcast.artworkUrl ? (
              <Image
                source={{ uri: episode.artworkUrl || podcast.artworkUrl }}
                style={[styles.artwork, isMobile ? styles.artworkMobile : styles.artworkDesktop]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.artworkPlaceholder, isMobile ? styles.artworkMobile : styles.artworkDesktop, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="radio" size={isMobile ? 80 : 100} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
            )}
          </View>

          {/* Podcast Badge */}
          <TouchableOpacity
            style={podcastBadgeStyle}
            onPress={() => router.push(`/(tabs)/preaching/podcast/${podcast.id}`)}
          >
            <Text style={[styles.podcastBadgeText, { color: Colors[colorScheme ?? 'light'].text }]}>
              {podcast.title}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
          </TouchableOpacity>

          {/* Episode Title */}
          <HtmlRenderer 
            htmlContent={episode.title}
            maxLines={3}
            style={titleStyle}
          />

          {/* Episode Meta */}
          <View style={styles.metaContainer}>
            {playedStatus?.played && (
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                <Text style={[styles.metaText, { color: '#4caf50' }]}>
                  Played
                </Text>
              </View>
            )}
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
            {playedStatus && !playedStatus.played && playedStatus.position > 0 && episode.duration && episode.duration > 0 && (
              <View style={styles.metaItem}>
                <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {(() => {
                    const remaining = Math.max(0, episode.duration - playedStatus.position);
                    const hours = Math.floor(remaining / 3600);
                    const minutes = Math.floor((remaining % 3600) / 60);
                    const secs = Math.floor(remaining % 60);
                    if (hours > 0) {
                      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} remaining`;
                    }
                    return `${minutes}:${secs.toString().padStart(2, '0')} remaining`;
                  })()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Playback Controls */}
        <View style={[styles.playbackSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          {/* Main Play Button */}
          <View style={styles.playButtonContainer}>
            <TouchableOpacity
              style={[styles.mainPlayButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
              onPress={handlePlay}
              disabled={playerLoading}
            >
              {playerLoading && isCurrentEpisode ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Ionicons
                  name={isPlayingCurrent ? 'pause' : 'play'}
                  size={32}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            {/* Time Display */}
            <View style={styles.timeRow}>
              <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatTime(isCurrentEpisode ? position : (playedStatus?.position || 0))}
              </Text>
              <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatTime(duration || episode.duration || 0)}
              </Text>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressBar, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}>
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
          </View>

          {/* Secondary Controls */}
          <View style={[styles.secondaryControls, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
            <div style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
              <Ionicons name="speedometer" size={20} color={Colors[colorScheme ?? 'light'].primary} />
              <select
                value={selectedSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                style={{
                  backgroundColor: 'transparent',
                  color: Colors[colorScheme ?? 'light'].text,
                  border: 'none',
                  fontSize: 12,
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
            
            {/* Placeholder for future controls */}
            <div style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].background, opacity: 0.5, cursor: 'not-allowed' }]}>
              <Ionicons name="add-circle-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.controlButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Queue
              </Text>
            </div>
            
            <div style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].background, opacity: 0.5, cursor: 'not-allowed' }]}>
              <Ionicons name="ellipsis-horizontal" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.controlButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                More
              </Text>
            </div>
          </View>
        </View>

        {/* Description */}
        {episode.description && (
          <View style={[styles.descriptionContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.descriptionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              About this episode
            </Text>
            <HtmlRenderer 
              htmlContent={episode.description}
              style={descriptionStyle}
            />
          </View>
        )}
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
  headerSection: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: 20,
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  },
  artworkMobile: {
    width: 200,
    height: 200,
  },
  artworkDesktop: {
    width: 250,
    height: 250,
  },
  artworkPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
  },
  podcastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
    alignSelf: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  podcastBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  episodeTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  playbackSection: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  playButtonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    cursor: 'pointer',
  },
  progressSection: {
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  timeText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    marginTop: 8,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
    borderRadius: 12,
    minWidth: 80,
    cursor: 'pointer',
  },
  controlButtonText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  descriptionContainer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    fontFamily: 'Georgia',
    lineHeight: 24,
  },
});

