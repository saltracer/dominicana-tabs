import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { HourType } from '../types';

interface PrayerNavButtonsProps {
  currentHour: HourType;
}

const prayerHours = [
  { route: 'office-of-readings', name: 'Office of Readings', type: 'office_of_readings' as HourType },
  { route: 'lauds', name: 'Lauds', type: 'lauds' as HourType },
  { route: 'terce', name: 'Terce', type: 'terce' as HourType },
  { route: 'sext', name: 'Sext', type: 'sext' as HourType },
  { route: 'none', name: 'None', type: 'none' as HourType },
  { route: 'vespers', name: 'Vespers', type: 'vespers' as HourType },
  { route: 'compline', name: 'Compline', type: 'compline' as HourType },
];

// Get current canonical hour based on time for smart "next" suggestions
const getCurrentCanonicalHour = (): HourType => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 6 && hour < 12) return 'lauds';
  if (hour >= 12 && hour < 15) return 'sext';
  if (hour >= 15 && hour < 18) return 'none';
  if (hour >= 18 && hour < 21) return 'vespers';
  return 'compline';
};

export default function PrayerNavButtons({ currentHour }: PrayerNavButtonsProps) {
  const { colorScheme } = useTheme();
  
  const currentIndex = prayerHours.findIndex(hour => hour.type === currentHour);
  const previousHour = currentIndex > 0 ? prayerHours[currentIndex - 1] : null;
  const nextHour = currentIndex < prayerHours.length - 1 ? prayerHours[currentIndex + 1] : null;
  
  // Smart next hour suggestion based on time
  const currentCanonicalHour = getCurrentCanonicalHour();
  const suggestedNextHour = prayerHours.find(hour => hour.type === currentCanonicalHour);
  const shouldShowSuggestion = suggestedNextHour && suggestedNextHour.type !== currentHour;

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: Colors[colorScheme ?? 'light'].background, 
        borderTopColor: Colors[colorScheme ?? 'light'].border,
      }
    ]}>
      <View style={styles.buttonRow}>
        {/* Previous Hour Button - Show button or placeholder */}
        {previousHour ? (
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.previousButton,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderColor: Colors[colorScheme ?? 'light'].border,
                borderWidth: 1,
              }
            ]}
            onPress={() => router.push(`/(tabs)/prayer/liturgy-hours/${previousHour.route}` as any)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={Colors[colorScheme ?? 'light'].text}
            />
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.buttonHour, { color: Colors[colorScheme ?? 'light'].text }]}>
                {previousHour.name}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.navButton, styles.previousButton]} />
        )}

      {/* Complete Prayer Button */}
      <TouchableOpacity
        style={[
          styles.completeButton,
          { backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderColor: Colors[colorScheme ?? 'light'].primary,
            borderWidth: 1,
           }
        ]}
        onPress={() => router.push('/(tabs)/prayer')}
        activeOpacity={0.7}
      >
        <Ionicons name="checkmark" size={20} color={Colors[colorScheme ?? 'light'].primary} />
        <Text style={[styles.completeText, { color: Colors[colorScheme ?? 'light'].primary }]}>
          Complete
        </Text>
      </TouchableOpacity>

        {/* Next Hour Button - Show button or placeholder */}
        {nextHour ? (
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderColor: Colors[colorScheme ?? 'light'].border,
                borderWidth: 1,
              }
            ]}
            onPress={() => router.push(`/(tabs)/prayer/liturgy-hours/${nextHour.route}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.buttonHour, { color: Colors[colorScheme ?? 'light'].text }]}>
                {nextHour.name}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={Colors[colorScheme ?? 'light'].text}
            />
          </TouchableOpacity>
        ) : (
          <View style={[styles.navButton, styles.nextButton]} />
        )}
      </View>

      {/* Smart suggestion for current canonical hour */}
      {shouldShowSuggestion && (
        <View style={styles.suggestionContainer}>
          <TouchableOpacity
            style={[
              styles.suggestionButton,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].secondary,
                borderColor: Colors[colorScheme ?? 'light'].secondary,
              }
            ]}
            onPress={() => suggestedNextHour && router.push(`/(tabs)/prayer/liturgy-hours/${suggestedNextHour.route}` as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="time" size={16} color={Colors[colorScheme ?? 'light'].background} />
            <Text style={[styles.suggestionText, { color: Colors[colorScheme ?? 'light'].background }]}>
              Current Hour: {suggestedNextHour?.name}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    //borderWidth: 1,
    minHeight: 40,
  },
  previousButton: {
    marginRight: 6,
  },
  nextButton: {
    marginLeft: 6,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'Georgia',
  },
  buttonHour: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 1,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 6,
    minWidth: 80,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginLeft: 6,
  },
  suggestionContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginLeft: 4,
  },
});
