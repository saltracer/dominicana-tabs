/**
 * RosaryMiniPlayer - Web Implementation
 * Mini player for rosary audio displayed in feast banner carousel
 * CRITICAL: Maintains exact 48px height to match feast banner dimensions
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { useRosaryPlayer } from '../contexts/RosaryPlayerContext';
import { router } from 'expo-router';

// Rosary logo artwork
const ROSARY_ARTWORK = require('../assets/images/dominicana_logo-icon-red.png');

export default function RosaryMiniPlayer() {
  const { colorScheme } = useTheme();
  const {
    currentMystery,
    currentBeadTitle,
    currentBeadNumber,
    totalBeadsInDecade,
    isPlaying,
    isPaused,
    isLoading,
    currentSpeed,
    pause,
    resume,
    setSpeed,
  } = useRosaryPlayer();

  // Memoize style objects to prevent re-renders
  const mysteryStyle = useMemo(() => [
    styles.mysteryTitle,
    { color: Colors[colorScheme ?? 'light'].text }
  ], [colorScheme]);

  const beadStyle = useMemo(() => [
    styles.beadTitle,
    { color: Colors[colorScheme ?? 'light'].textSecondary }
  ], [colorScheme]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handlePress = () => {
    // Navigate to rosary screen (preserving playback)
    router.push('/(tabs)/prayer/rosary');
  };

  const handleSpeedPress = () => {
    // Cycle through common speeds: 0.75x -> 1.0x -> 1.25x -> 1.5x -> 1.75x -> 2.0x -> 0.75x
    const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
    const currentIndex = speeds.findIndex(speed => Math.abs(speed - currentSpeed) < 0.01);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  };

  // Format bead title with number if applicable
  const formatBeadTitle = () => {
    if (currentBeadNumber && totalBeadsInDecade) {
      return `${currentBeadTitle} ${currentBeadNumber}/${totalBeadsInDecade}`;
    }
    return currentBeadTitle || 'Starting...';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].offWhiteCard }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Rosary Artwork */}
      <View style={styles.artworkContainer}>
        <Image
          source={ROSARY_ARTWORK}
          style={styles.artwork}
          resizeMode="cover"
        />
      </View>

      {/* Rosary Info */}
      <View style={styles.infoContainer}>
        <Text 
          style={mysteryStyle}
          numberOfLines={1}
        >
          {currentMystery || 'Rosary'}
        </Text>
        <Text 
          style={beadStyle}
          numberOfLines={1}
        >
          {formatBeadTitle()}
        </Text>
      </View>

      {/* Play/Pause Button */}
      <TouchableOpacity
        style={[
          styles.playButton,
          { backgroundColor: Colors[colorScheme ?? 'light'].primary }
        ]}
        onPress={handlePlayPause}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={18}
            color="#fff"
          />
        )}
      </TouchableOpacity>

      {/* Speed Control */}
      <TouchableOpacity 
        style={styles.speedContainer}
        onPress={handleSpeedPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.speedText, { color: Colors[colorScheme ?? 'light'].text }]}>
          {currentSpeed}x
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4,
    height: 48, // CRITICAL: Fixed height to match feast banner
    borderRadius: 8,
  },
  artworkContainer: {
    marginRight: 8,
  },
  artwork: {
    width: 36,
    height: 36,
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
    marginRight: 4,
    minWidth: 0, // Allow text to truncate properly
    justifyContent: 'center', // Vertically center the text
  },
  mysteryTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 1,
    lineHeight: 15, // Fixed line height to prevent expansion
    textAlign: 'left',
    height: 15, // Fixed height to enforce single line
    overflow: 'hidden', // Hide overflow text
  },
  beadTitle: {
    fontSize: 12,
    fontFamily: 'Georgia',
    lineHeight: 12, // Fixed line height to prevent expansion
    height: 12, // Fixed height to enforce single line
    overflow: 'hidden', // Hide overflow text
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  speedContainer: {
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});

