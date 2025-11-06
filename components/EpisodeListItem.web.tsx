import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PodcastEpisode } from '../types';
import { useTheme } from './ThemeProvider';
import { Colors } from '../constants/Colors';
import { usePodcastDownloads } from '../hooks/usePodcastDownloads';
import HtmlRenderer from './HtmlRenderer';
import { EpisodeMetadataCache } from '../services/EpisodeMetadataCache';
import { PodcastPlaybackService } from '../services/PodcastPlaybackService';

interface EpisodeListItemProps {
  episode: PodcastEpisode;
  onPress: () => void;
  onPlay?: () => void;
  isPlaying?: boolean;
  isPaused?: boolean;
  progress?: number; // Progress percentage 0-1
  showProgress?: boolean;
}

export const EpisodeListItem = React.memo(function EpisodeListItem({
  episode,
  onPress,
  onPlay,
  isPlaying = false,
  isPaused = false,
  progress = 0,
  showProgress = true,
}: EpisodeListItemProps) {
  const { colorScheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [playedStatus, setPlayedStatus] = useState<{ played: boolean; position: number } | null>(null);

  // Memoize theme-dependent styles
  const themeStyles = useMemo(() => {
    const theme = colorScheme ?? 'light';
    return {
      card: { backgroundColor: Colors[theme].card },
      text: Colors[theme].text,
      textSecondary: Colors[theme].textSecondary,
      primary: Colors[theme].primary,
      border: Colors[theme].border,
    };
  }, [colorScheme]);

  // Fetch played status from cache or service
  useEffect(() => {
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
  }, [episode.id]);

  const { 
    isDownloadsEnabled, 
    isEpisodeDownloaded, 
    getDownloadState, 
    downloadEpisode, 
    deleteDownloadedEpisode 
  } = usePodcastDownloads();

  // Download state and handlers
  const isDownloaded = isEpisodeDownloaded(episode.id);
  const downloadState = getDownloadState(episode.id);

  const handleDownload = async () => {
    if (isDownloaded) {
      await deleteDownloadedEpisode(episode.id);
    } else {
      await downloadEpisode(episode);
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = (totalSeconds: number, currentPosition: number): string => {
    const remaining = Math.max(0, totalSeconds - currentPosition);
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const secs = Math.floor(remaining % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} remaining`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')} remaining`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const handlePlay = useCallback((e: any) => {
    e?.stopPropagation();
    if (onPlay) {
      onPlay();
    }
  }, [onPlay]);

  const hasProgress = showProgress && progress > 0 && progress < 1;

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        themeStyles.card,
        isHovered && styles.containerHovered,
      ]}
      onPress={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <HtmlRenderer 
              htmlContent={episode.title}
              maxLines={2}
              style={[styles.title, { color: themeStyles.text }]}
            />
            {(isPlaying || isPaused) && (
              <View style={[styles.playingIndicator, { backgroundColor: themeStyles.primary }]}>
                <Ionicons name="radio" size={12} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.playButton,
                {
                  backgroundColor: isPlaying || isPaused
                    ? themeStyles.primary
                    : Colors[colorScheme ?? 'light'].surface,
                }
              ]}
              onPress={handlePlay}
            >
              <Ionicons
                name={isPaused ? 'play' : isPlaying ? 'pause' : 'play'}
                size={24}
                color={isPlaying || isPaused ? '#fff' : themeStyles.primary}
              />
            </TouchableOpacity>
            
            {/* Download Button */}
            {isDownloadsEnabled && (
              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  {
                    backgroundColor: isDownloaded
                      ? themeStyles.primary
                      : Colors[colorScheme ?? 'light'].surface,
                  }
                ]}
                onPress={handleDownload}
                disabled={downloadState.status === 'downloading'}
              >
                {downloadState.status === 'downloading' ? (
                  <ActivityIndicator size="small" color={themeStyles.primary} />
                ) : (
                  <Ionicons
                    name={isDownloaded ? 'checkmark-circle' : 'cloud-download-outline'}
                    size={20}
                    color={isDownloaded ? '#fff' : themeStyles.textSecondary}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {episode.description && (
          <HtmlRenderer 
            htmlContent={episode.description} 
            maxLines={2}
            style={[styles.description, { color: themeStyles.textSecondary }]}
          />
        )}

        <View style={styles.meta}>
          {playedStatus?.played && (
            <View style={styles.metaItem}>
              <Ionicons name="checkmark-circle" size={14} color="#4caf50" />
              <Text style={[styles.metaText, { color: '#4caf50', fontSize: 12 }]}>
                Played
              </Text>
            </View>
          )}
          {episode.publishedAt && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={themeStyles.textSecondary} />
              <Text style={[styles.metaText, { color: themeStyles.textSecondary }]}>
                {formatDate(episode.publishedAt)}
              </Text>
            </View>
          )}
          {episode.duration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={themeStyles.textSecondary} />
              <Text style={[styles.metaText, { color: themeStyles.textSecondary }]}>
                {formatDuration(episode.duration)}
              </Text>
            </View>
          )}
          {playedStatus && !playedStatus.played && playedStatus.position > 0 && episode.duration && episode.duration > 0 && (
            <View style={styles.metaItem}>
              <Text style={[styles.metaText, { color: themeStyles.textSecondary, fontSize: 12 }]}>
                {formatTimeRemaining(episode.duration, playedStatus.position)}
              </Text>
            </View>
          )}
        </View>

        {hasProgress && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: themeStyles.primary,
                  }
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  containerHovered: {
    transform: [{ scale: 1.02 }],
    elevation: 6,
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  content: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    lineHeight: 22,
    marginBottom: 4,
  },
  playingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Georgia',
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  progressContainer: {
    paddingTop: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
