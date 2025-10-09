/**
 * RosaryMysteryCarousel Component
 * Swipeable carousel for selecting rosary mysteries
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { MysterySet } from '../types/rosary-types';
import { ROSARY_MYSTERIES, getDayOfWeekName } from '../constants/rosaryData';

interface RosaryMysteryCarouselProps {
  selectedMystery: MysterySet;
  onMysteryChange: (mystery: MysterySet) => void;
  showDayIndicator?: boolean;
}

export default function RosaryMysteryCarousel({ 
  selectedMystery, 
  onMysteryChange,
  showDayIndicator = true
}: RosaryMysteryCarouselProps) {
  const { colorScheme } = useTheme();

  const currentIndex = ROSARY_MYSTERIES.findIndex(m => m.name === selectedMystery);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : ROSARY_MYSTERIES.length - 1;
    onMysteryChange(ROSARY_MYSTERIES[newIndex].name);
  };

  const handleNext = () => {
    const newIndex = currentIndex < ROSARY_MYSTERIES.length - 1 ? currentIndex + 1 : 0;
    onMysteryChange(ROSARY_MYSTERIES[newIndex].name);
  };

  const currentMystery = ROSARY_MYSTERIES[currentIndex];

  return (
    <View style={styles.container}>
      {showDayIndicator && (
        <Text style={[styles.dayText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          {getDayOfWeekName()}: {currentMystery.day}
        </Text>
      )}
      
      <View style={styles.carouselContainer}>
        <TouchableOpacity 
          onPress={handlePrevious}
          style={styles.arrowButton}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />
        </TouchableOpacity>

        <View style={styles.mysteryContent}>
          <Ionicons 
            name={currentMystery.icon as any} 
            size={28} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />
          <Text style={[styles.mysteryName, { color: Colors[colorScheme ?? 'light'].text }]}>
            {currentMystery.name}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={handleNext}
          style={styles.arrowButton}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {ROSARY_MYSTERIES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === currentIndex
                  ? Colors[colorScheme ?? 'light'].primary
                  : Colors[colorScheme ?? 'light'].border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 8,
  },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  arrowButton: {
    padding: 8,
  },
  mysteryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 200,
    justifyContent: 'center',
  },
  mysteryName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

