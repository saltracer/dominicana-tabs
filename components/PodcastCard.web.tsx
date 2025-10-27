import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Podcast } from '../types';
import { useTheme } from './ThemeProvider';
import { Colors } from '../constants/Colors';

interface PodcastCardProps {
  podcast: Podcast;
  onPress: () => void;
  onSubscribe?: (podcastId: string) => void;
  isSubscribed?: boolean;
  showSubscribeButton?: boolean;
}

export function PodcastCard({
  podcast,
  onPress,
  onSubscribe,
  isSubscribed = false,
  showSubscribeButton = true,
}: PodcastCardProps) {
  const { colorScheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const handleSubscribe = (e: any) => {
    e?.stopPropagation();
    if (onSubscribe) {
      onSubscribe(podcast.id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: Colors[colorScheme ?? 'light'].card },
        isHovered && styles.cardHovered,
      ]}
      onPress={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
              {podcast.title}
            </Text>
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
            <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={3}>
              {podcast.description}
            </Text>
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
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
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
