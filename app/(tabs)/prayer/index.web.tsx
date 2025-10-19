import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import PrayerNavigation from '../../../components/PrayerNavigation';
import { PrayerStyles } from '../../../styles';
import Footer from '../../../components/Footer.web';

export default function PrayerIndexWeb() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();

  const prayerOptions = [
    {
      name: 'Liturgy of the Hours',
      description: 'The official prayer of the Church',
      icon: 'time',
      route: '/(tabs)/prayer/liturgy',
      color: Colors[colorScheme ?? 'light'].primary,
    },
    {
      name: 'Holy Rosary',
      description: 'Meditate on the mysteries of Christ',
      icon: 'flower',
      route: '/(tabs)/prayer/rosary',
      color: Colors[colorScheme ?? 'light'].secondary,
    },
    {
      name: 'Devotions',
      description: 'Traditional Catholic prayers',
      icon: 'heart',
      route: '/(tabs)/prayer/devotions',
      color: Colors[colorScheme ?? 'light'].primary,
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Prayer Navigation */}
      <PrayerNavigation activeTab="prayer" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Prayer
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Draw near to God through prayer
        </Text>
      </View>

      {/* Prayer Options */}
      <View style={styles.section}>
        {prayerOptions.map((option, index) => (
          <TouchableOpacity
            key={option.name}
            style={[
              styles.prayerOptionCard,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderColor: Colors[colorScheme ?? 'light'].border,
              }
            ]}
            onPress={() => router.push(option.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.prayerOptionContent}>
              <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].background}
                />
              </View>
              <View style={styles.prayerOptionText}>
                <Text style={[styles.prayerOptionName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {option.name}
                </Text>
                <Text style={[styles.prayerOptionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {option.description}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={Colors[colorScheme ?? 'light'].textSecondary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ...PrayerStyles,
  prayerOptionCard: {
    ...PrayerStyles.card,
    marginBottom: 12,
    borderWidth: 1,
  },
  prayerOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  prayerOptionText: {
    flex: 1,
  },
  prayerOptionName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  prayerOptionDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Georgia',
  },
});

