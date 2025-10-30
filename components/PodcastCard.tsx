import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Podcast } from '../types';
import { useTheme } from './ThemeProvider';
import { Colors } from '../constants/Colors';
import HtmlRenderer from './HtmlRenderer';
import { ensureImageCached } from '../lib/podcast/storage';

interface PodcastCardProps {
  podcast: Podcast;
  onPress: () => void;
  onSubscribe?: (podcastId: string) => void;
  isSubscribed?: boolean;
  showSubscribeButton?: boolean;
  compact?: boolean;
}

export const PodcastCard = React.memo(function PodcastCard({
  podcast,
  onPress,
  onSubscribe,
  isSubscribed = false,
  showSubscribeButton = true,
  compact = false,
}: PodcastCardProps) {
  const { colorScheme } = useTheme();
  const [localArtwork, setLocalArtwork] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (podcast.artworkUrl) {
        try {
          const { path } = await ensureImageCached(podcast.artworkUrl);
          if (!cancelled) setLocalArtwork(path);
        } catch {
          if (!cancelled) setLocalArtwork(null);
        }
      } else {
        setLocalArtwork(null);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [podcast.artworkUrl]);

  const handleSubscribe = useCallback((e: any) => {
    e?.stopPropagation();
    if (onSubscribe) {
      onSubscribe(podcast.id);
    }
  }, [onSubscribe, podcast.id]);

  // Memoize theme-dependent styles
  const themeStyles = useMemo(() => {
    const theme = colorScheme ?? 'light';
    return {
      card: { backgroundColor: Colors[theme].card },
      primary: Colors[theme].primary,
      text: Colors[theme].text,
      textSecondary: Colors[theme].textSecondary,
      primary20: Colors[theme].primary + '20',
    };
  }, [colorScheme]);

  // Memoize style objects for HtmlRenderer to prevent re-renders
  const titleStyle = useMemo(() => [
    styles.compactTitle, 
    { color: themeStyles.text }
  ], [themeStyles.text]);

  const fullTitleStyle = useMemo(() => [
    styles.title, 
    { color: themeStyles.text }
  ], [themeStyles.text]);

  const descriptionStyle = useMemo(() => [
    styles.description, 
    { color: themeStyles.textSecondary }
  ], [themeStyles.textSecondary]);

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, themeStyles.card]}
        onPress={onPress}
      >
        <View style={styles.compactContent}>
          {localArtwork || podcast.artworkUrl ? (
            <Image
              source={{ uri: localArtwork || podcast.artworkUrl }}
              style={styles.compactArtwork}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.compactArtworkPlaceholder, { backgroundColor: themeStyles.primary20 }]}>
              <Ionicons name="radio" size={24} color={themeStyles.primary} />
            </View>
          )}
          <View style={styles.compactInfo}>
            <HtmlRenderer 
              htmlContent={podcast.title}
              maxLines={1}
              style={titleStyle}
            />
            {podcast.author && (
              <Text style={[styles.compactAuthor, { color: themeStyles.textSecondary }]} numberOfLines={1}>
                {podcast.author}
              </Text>
            )}
          </View>
          {showSubscribeButton && onSubscribe && (
            <TouchableOpacity
              style={[
                styles.subscribeButton,
                { 
                  backgroundColor: isSubscribed 
                    ? themeStyles.primary 
                    : 'transparent',
                  borderColor: themeStyles.primary,
                }
              ]}
              onPress={handleSubscribe}
            >
              <Ionicons
                name={isSubscribed ? 'checkmark' : 'add'}
                size={20}
                color={isSubscribed ? '#fff' : themeStyles.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, themeStyles.card]}
      onPress={onPress}
    >
      <View style={styles.artworkContainer}>
        {localArtwork || podcast.artworkUrl ? (
          <Image
            source={{ uri: localArtwork || podcast.artworkUrl }}
            style={styles.artwork}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.artworkPlaceholder, { backgroundColor: themeStyles.primary20 }]}>
            <Ionicons name="radio" size={40} color={themeStyles.primary} />
          </View>
        )}
        {showSubscribeButton && onSubscribe && (
          <TouchableOpacity
            style={[
              styles.subscribeButton,
              { 
                backgroundColor: isSubscribed 
                  ? themeStyles.primary 
                  : 'rgba(0,0,0,0.6)',
                borderColor: isSubscribed ? themeStyles.primary : 'transparent',
              }
            ]}
            onPress={handleSubscribe}
          >
            <Ionicons
              name={isSubscribed ? 'checkmark' : 'add'}
              size={18}
              color={isSubscribed ? '#fff' : '#fff'}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        <HtmlRenderer 
          htmlContent={podcast.title}
          maxLines={2}
          style={fullTitleStyle}
        />
        {podcast.author && (
          <Text style={[styles.author, { color: themeStyles.textSecondary }]} numberOfLines={1}>
            {podcast.author}
          </Text>
        )}
        <View style={styles.metadata}>
          {podcast.categories && podcast.categories.length > 0 && (
            <View style={[styles.categoryTag, { backgroundColor: themeStyles.primary20 }]}>
              <Text style={[styles.categoryText, { color: themeStyles.primary }]}>
                {podcast.categories[0]}
              </Text>
            </View>
          )}
          {(podcast as any).episodeCount !== undefined && (
            <View style={styles.episodeCount}>
              <Ionicons name="musical-notes" size={12} color={themeStyles.textSecondary} />
              <Text style={[styles.episodeCountText, { color: themeStyles.textSecondary }]}>
                {(podcast as any).episodeCount} eps
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactCard: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
  },
  artworkContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  content: {
    flexDirection: 'column',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  artworkPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactArtwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  compactArtworkPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  compactInfo: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  author: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  compactAuthor: {
    fontSize: 13,
    fontFamily: 'Georgia',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Georgia',
    marginBottom: 8,
    lineHeight: 18,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  categories: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  episodeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  episodeCountText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  subscribeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
