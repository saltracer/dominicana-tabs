import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PodcastEpisode } from '../types';
import { useTheme } from './ThemeProvider';
import { Colors } from '../constants/Colors';

interface EpisodeListItemProps {
  episode: PodcastEpisode;
  onPress: () => void;
  onPlay?: () => void;
  isPlaying?: boolean;
  isPaused?: boolean;
  progress?: number; // Progress percentage 0-1
  showProgress?: boolean;
}

export function EpisodeListItem({
  episode,
  onPress,
  onPlay,
  isPlaying = false,
  isPaused = false,
  progress = 0,
  showProgress = true,
}: EpisodeListItemProps) {
  const { colorScheme } = useTheme();

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds % 60}`;
    }
    return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
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

  const handlePlay = (e: any) => {
    e?.stopPropagation();
    if (onPlay) {
      onPlay();
    }
  };

  const hasProgress = showProgress && progress > 0 && progress < 1;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
              {episode.title}
            </Text>
            {(isPlaying || isPaused) && (
              <View style={[styles.playingIndicator, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <Ionicons name="radio" size={12} color="#fff" />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.playButton,
              {
                backgroundColor: isPlaying || isPaused
                  ? Colors[colorScheme ?? 'light'].primary
                  : Colors[colorScheme ?? 'light'].surface,
              }
            ]}
            onPress={handlePlay}
          >
            <Ionicons
              name={isPaused ? 'play' : isPlaying ? 'pause' : 'play'}
              size={20}
              color={isPlaying || isPaused ? '#fff' : Colors[colorScheme ?? 'light'].primary}
            />
          </TouchableOpacity>
        </View>

        {episode.description && (
          <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={2}>
            {episode.description}
          </Text>
        )}

        <View style={styles.meta}>
          {episode.publishedAt && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatDate(episode.publishedAt)}
              </Text>
            </View>
          )}
          {episode.duration && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatDuration(episode.duration)}
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
                    backgroundColor: Colors[colorScheme ?? 'light'].primary,
                  }
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  content: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  playingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Georgia',
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
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
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
