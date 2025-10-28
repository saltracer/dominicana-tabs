import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Podcast } from '../types';
import { useTheme } from './ThemeProvider';
import { Colors } from '../constants/Colors';
import HtmlRenderer from './HtmlRenderer';

interface PodcastCardProps {
  podcast: Podcast;
  onPress: () => void;
  onSubscribe?: (podcastId: string) => void;
  isSubscribed?: boolean;
  showSubscribeButton?: boolean;
}

export const PodcastCard = React.memo(function PodcastCard({
  podcast,
  onPress,
  onSubscribe,
  isSubscribed = false,
  showSubscribeButton = true,
}: PodcastCardProps) {
  const { colorScheme } = useTheme();

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
    styles.title, 
    { color: themeStyles.text }
  ], [themeStyles.text]);

  const descriptionStyle = useMemo(() => [
    styles.description, 
    { color: themeStyles.textSecondary }
  ], [themeStyles.textSecondary]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        themeStyles.card,
      ]}
      onPress={onPress}
    >
      <View style={styles.artworkContainer}>
        {podcast.artworkUrl ? (
          <Image
            source={{ uri: podcast.artworkUrl }}
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
          style={titleStyle}
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHovered: {
    transform: [{ scale: 1.02 }],
    elevation: 6,
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  artworkContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  content: {
    flexDirection: 'column',
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
  info: {
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
    lineHeight: 20,
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
  author: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Georgia',
    lineHeight: 18,
    marginBottom: 8,
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
});
