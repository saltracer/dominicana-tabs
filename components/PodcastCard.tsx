import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  compact?: boolean;
}

export function PodcastCard({
  podcast,
  onPress,
  onSubscribe,
  isSubscribed = false,
  showSubscribeButton = true,
  compact = false,
}: PodcastCardProps) {
  const { colorScheme } = useTheme();

  const handleSubscribe = (e: any) => {
    e?.stopPropagation();
    if (onSubscribe) {
      onSubscribe(podcast.id);
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
        onPress={onPress}
      >
        <View style={styles.compactContent}>
          {podcast.artworkUrl ? (
            <Image
              source={{ uri: podcast.artworkUrl }}
              style={styles.compactArtwork}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.compactArtworkPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
              <Ionicons name="radio" size={24} color={Colors[colorScheme ?? 'light'].primary} />
            </View>
          )}
          <View style={styles.compactInfo}>
            <HtmlRenderer 
              htmlContent={podcast.title}
              maxLines={1}
              style={[styles.compactTitle, { color: Colors[colorScheme ?? 'light'].text }]}
            />
            {podcast.author && (
              <Text style={[styles.compactAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={1}>
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
                    ? Colors[colorScheme ?? 'light'].primary 
                    : 'transparent',
                  borderColor: Colors[colorScheme ?? 'light'].primary,
                }
              ]}
              onPress={handleSubscribe}
            >
              <Ionicons
                name={isSubscribed ? 'checkmark' : 'add'}
                size={20}
                color={isSubscribed ? '#fff' : Colors[colorScheme ?? 'light'].primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
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
          <View style={[styles.artworkPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
            <Ionicons name="radio" size={40} color={Colors[colorScheme ?? 'light'].primary} />
          </View>
        )}
        <View style={styles.info}>
          <View style={styles.header}>
            <HtmlRenderer 
              htmlContent={podcast.title}
              maxLines={2}
              style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}
            />
            {showSubscribeButton && onSubscribe && (
              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  { 
                    backgroundColor: isSubscribed 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : 'transparent',
                    borderColor: Colors[colorScheme ?? 'light'].primary,
                  }
                ]}
                onPress={handleSubscribe}
              >
                <Ionicons
                  name={isSubscribed ? 'checkmark' : 'add'}
                  size={18}
                  color={isSubscribed ? '#fff' : Colors[colorScheme ?? 'light'].primary}
                />
              </TouchableOpacity>
            )}
          </View>
          {podcast.author && (
            <Text style={[styles.author, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={1}>
              {podcast.author}
            </Text>
          )}
          {podcast.description && (
            <HtmlRenderer 
              htmlContent={podcast.description}
              maxLines={2}
              style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
            />
          )}
          {podcast.categories && podcast.categories.length > 0 && (
            <View style={styles.categories}>
              {podcast.categories.slice(0, 2).map((category) => (
                <View
                  key={category}
                  style={[styles.categoryTag, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}
                >
                  <Text style={[styles.categoryText, { color: Colors[colorScheme ?? 'light'].primary }]}>
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
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
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
  content: {
    flexDirection: 'row',
    gap: 12,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  artwork: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  artworkPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
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
    flex: 1,
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
    marginBottom: 6,
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
  subscribeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
