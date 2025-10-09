/**
 * RosaryDecadeSelector Component
 * Quick navigation buttons for jumping to specific decades
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface RosaryDecadeSelectorProps {
  currentDecade: number;
  onDecadeSelect: (decade: number) => void;
}

export default function RosaryDecadeSelector({ 
  currentDecade, 
  onDecadeSelect 
}: RosaryDecadeSelectorProps) {
  const { colorScheme } = useTheme();

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(decade => (
        <TouchableOpacity
          key={decade}
          style={[
            styles.decadeButton,
            {
              backgroundColor: currentDecade === decade
                ? Colors[colorScheme ?? 'light'].primary
                : Colors[colorScheme ?? 'light'].card,
              borderColor: Colors[colorScheme ?? 'light'].border,
            },
          ]}
          onPress={() => onDecadeSelect(decade)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.decadeText,
              {
                color: currentDecade === decade
                  ? Colors[colorScheme ?? 'light'].dominicanWhite
                  : Colors[colorScheme ?? 'light'].text,
              },
            ]}
          >
            {decade}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  decadeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  decadeText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
});

