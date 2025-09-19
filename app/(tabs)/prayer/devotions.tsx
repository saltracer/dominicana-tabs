import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner';
import PrayerNavigation from '../../../components/PrayerNavigation';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { LiturgicalDay } from '../../../types';
import { PrayerStyles } from '../../../styles';

export default function DevotionsScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();



  const popularDevotions = [
    { 
      name: 'Divine Mercy Chaplet', 
      icon: 'heart',
      description: 'Prayer for God\'s mercy and forgiveness',
      duration: '~10 minutes'
    },
    { 
      name: 'Stations of the Cross', 
      icon: 'add',
      description: 'Meditation on Christ\'s passion and death',
      duration: '~20 minutes'
    },
    { 
      name: 'Angelus', 
      icon: 'notifications',
      description: 'Traditional prayer at 6am, noon, and 6pm',
      duration: '~3 minutes'
    },
    { 
      name: 'Regina Caeli', 
      icon: 'moon',
      description: 'Easter prayer replacing the Angelus',
      duration: '~3 minutes'
    },
    { 
      name: 'Litany of the Saints', 
      icon: 'people',
      description: 'Invocation of the saints for intercession',
      duration: '~8 minutes'
    },
    { 
      name: 'Te Deum', 
      icon: 'star',
      description: 'Ancient hymn of praise and thanksgiving',
      duration: '~5 minutes'
    },
  ];

  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Prayer Navigation */}
        <PrayerNavigation activeTab="devotions" />
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Devotions
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Traditional Catholic prayers and devotions
          </Text>
        </View>


        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].primary }
            ]}
          >
            <Ionicons name="heart" size={24} color={Colors[colorScheme ?? 'light'].textOnRed} />
            <Text style={[styles.quickActionText, { color: Colors[colorScheme ?? 'light'].textOnRed }]}>
              Daily Devotion
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].secondary }
            ]}
          >
            <Ionicons name="bookmark" size={24} color={Colors[colorScheme ?? 'light'].textOnRed} />
            <Text style={[styles.quickActionText, { color: Colors[colorScheme ?? 'light'].textOnRed }]}>
              Favorites
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Popular Devotions Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="heart-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Popular Devotions
            </Text>
          </View>
          
          <View style={styles.devotionsGrid}>
            {popularDevotions.map((devotion, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.devotionCard,
                  { backgroundColor: Colors[colorScheme ?? 'light'].card }
                ]}
              >
                <View style={styles.devotionHeader}>
                  <Ionicons 
                    name={devotion.icon as any} 
                    size={24} 
                    color={Colors[colorScheme ?? 'light'].primary} 
                  />
                  <Text style={[styles.duration, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {devotion.duration}
                  </Text>
                </View>
                
                <Text style={[
                  styles.devotionName,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  {devotion.name}
                </Text>
                
                <Text style={[
                  styles.devotionDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary }
                ]}>
                  {devotion.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Coming Soon Section */}
        <View style={styles.section}>
          <View style={[styles.comingSoonCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Ionicons 
              name="construct-outline" 
              size={48} 
              color={Colors[colorScheme ?? 'light'].textMuted} 
            />
            <Text style={[styles.comingSoonTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              More Devotions Coming Soon
            </Text>
            <Text style={[styles.comingSoonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              We're working on adding more traditional Catholic devotions, 
              including seasonal prayers, novenas, and special intentions.
            </Text>
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...PrayerStyles,
  // No unique local styles needed for this component
});
