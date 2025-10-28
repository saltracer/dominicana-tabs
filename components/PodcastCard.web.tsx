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
      <View style={styles.content}>
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
        
        <View style={styles.info}>
          <View style={styles.header}>
            <HtmlRenderer 
              htmlContent={podcast.title}
              maxLines={2}
              style={titleStyle}
            />
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
                  size={18}
                  color={isSubscribed ? '#fff' : themeStyles.primary}
                />
              </TouchableOpacity>
            )}
          </View>
          
          {podcast.author && (
            <Text style={[styles.author, { color: themeStyles.textSecondary }]} numberOfLines={1}>
              {podcast.author}
            </Text>
          )}
          
          {podcast.description && (
            <HtmlRenderer 
              htmlContent={podcast.description}
              maxLines={3}
              style={descriptionStyle}
            />
          )}
          
          {podcast.categories && podcast.categories.length > 0 && (
            <View style={styles.categories}>
              {podcast.categories.slice(0, 2).map((category) => (
                <View
                  key={category}
                  style={[styles.categoryTag, { backgroundColor: themeStyles.primary20 }]}
                >
                  <Text style={[styles.categoryText, { color: themeStyles.primary }]}>
                    {category}
                  </Text>
                </View>
              ))}
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
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHovered: {
    transform: [{ translateY: -4 }],
    elevation: 6,
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  content: {
    gap: 12,
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  artworkPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    minHeight: 44, // Accommodate 2 lines
  },
  subscribeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  author: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Georgia',
    lineHeight: 18,
    minHeight: 54, // Accommodate 3 lines
  },
  categories: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
});
