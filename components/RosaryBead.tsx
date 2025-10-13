/**
 * RosaryBead Component
 * Represents a single bead in the rosary visualization
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { PrayerType } from '../types/rosary-types';

interface RosaryBeadProps {
  type: PrayerType;
  isActive: boolean;
  isCompleted: boolean;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

export default function RosaryBead({ 
  type, 
  isActive, 
  isCompleted, 
  onPress,
  size = 'small'
}: RosaryBeadProps) {
  const { colorScheme } = useTheme();

  const getBeadSize = () => {
    switch (size) {
      case 'large': return 20;
      case 'medium': return 14;
      case 'small': return 10;
    }
  };

  const getBeadColor = () => {
    if (isActive) {
      return Colors[colorScheme ?? 'light'].primary; // Dominican red
    }
    if (isCompleted) {
      return Colors[colorScheme ?? 'light'].dominicanGold;
    }
    return Colors[colorScheme ?? 'light'].border;
  };

  const getBeadIcon = (): 'ellipse' | 'ellipse-outline' | 'radio-button-on' | 'add' => {
    // Sign of Cross and Apostles' Creed are prayed on the crucifix
    if (type === 'sign-of-cross' || type === 'apostles-creed') {
      return 'add'; // Cross symbol
    }
    // Our Father beads are larger and filled
    if (type === 'our-father' || type === 'mystery-announcement') {
      return isActive || isCompleted ? 'ellipse' : 'ellipse-outline';
    }
    // Hail Mary beads are smaller
    if (isActive) return 'radio-button-on';
    return isCompleted ? 'ellipse' : 'ellipse-outline';
  };

  const beadSize = getBeadSize();
  const isLargeBead = type === 'our-father' || type === 'mystery-announcement';
  const isCrucifix = type === 'sign-of-cross' || type === 'apostles-creed';

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.container,
        isActive && styles.activeContainer
      ]}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={getBeadIcon()} 
        size={isCrucifix ? beadSize * 2 : (isLargeBead ? beadSize * 1.5 : beadSize)} 
        color={getBeadColor()} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeContainer: {
    transform: [{ scale: 1.2 }],
  },
});

