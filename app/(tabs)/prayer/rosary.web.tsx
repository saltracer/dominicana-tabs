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
import FeastBanner from '../../../components/FeastBanner';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { LiturgicalDay } from '../../../types';

export default function RosaryWebScreen() {
  const { colorScheme } = useTheme();
  const [liturgicalDay, setLiturgicalDay] = useState<LiturgicalDay | null>(null);
  const [selectedMystery, setSelectedMystery] = useState<string | null>(null);

  useEffect(() => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const today = new Date();
    const day = calendarService.getLiturgicalDay(today);
    setLiturgicalDay(day);
  }, []);

  const handleDateChange = (date: Date) => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const day = calendarService.getLiturgicalDay(date);
    setLiturgicalDay(day);
  };

  const rosaryMysteries = [
    { 
      name: 'Joyful Mysteries', 
      day: 'Monday & Saturday', 
      icon: 'happy-outline',
      description: 'The Annunciation, Visitation, Nativity, Presentation, and Finding in the Temple',
      mysteries: [
        'The Annunciation',
        'The Visitation',
        'The Nativity',
        'The Presentation',
        'The Finding in the Temple'
      ]
    },
    { 
      name: 'Sorrowful Mysteries', 
      day: 'Tuesday & Friday', 
      icon: 'heart-outline',
      description: 'The Agony in the Garden, Scourging, Crowning with Thorns, Carrying the Cross, and Crucifixion',
      mysteries: [
        'The Agony in the Garden',
        'The Scourging at the Pillar',
        'The Crowning with Thorns',
        'The Carrying of the Cross',
        'The Crucifixion'
      ]
    },
    { 
      name: 'Glorious Mysteries', 
      day: 'Wednesday & Sunday', 
      icon: 'star-outline',
      description: 'The Resurrection, Ascension, Descent of the Holy Spirit, Assumption, and Coronation',
      mysteries: [
        'The Resurrection',
        'The Ascension',
        'The Descent of the Holy Spirit',
        'The Assumption',
        'The Coronation of Mary'
      ]
    },
    { 
      name: 'Luminous Mysteries', 
      day: 'Thursday', 
      icon: 'flash-outline',
      description: 'The Baptism, Wedding at Cana, Proclamation of the Kingdom, Transfiguration, and Institution of the Eucharist',
      mysteries: [
        'The Baptism of Jesus',
        'The Wedding at Cana',
        'The Proclamation of the Kingdom',
        'The Transfiguration',
        'The Institution of the Eucharist'
      ]
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Dominican Rosary
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            The prayer of the saints
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
            <Ionicons name="play-circle" size={24} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            <Text style={[styles.quickActionText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Start Rosary
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].secondary }
            ]}
          >
            <Ionicons name="rose" size={24} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            <Text style={[styles.quickActionText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Today's Mystery
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Rosary Mysteries Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="rose-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Rosary Mysteries
            </Text>
          </View>
          
          <View style={styles.rosaryGrid}>
            {rosaryMysteries.map((mystery, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.rosaryCard,
                  { 
                    backgroundColor: Colors[colorScheme ?? 'light'].card,
                    borderColor: selectedMystery === mystery.name 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].border,
                    borderWidth: selectedMystery === mystery.name ? 2 : 1,
                  }
                ]}
                onPress={() => setSelectedMystery(selectedMystery === mystery.name ? null : mystery.name)}
              >
                <Ionicons 
                  name={mystery.icon as any} 
                  size={28} 
                  color={selectedMystery === mystery.name 
                    ? Colors[colorScheme ?? 'light'].primary 
                    : Colors[colorScheme ?? 'light'].textSecondary
                  } 
                />
                <Text style={[
                  styles.rosaryMysteryName,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  {mystery.name}
                </Text>
                <Text style={[
                  styles.rosaryMysteryDay,
                  { color: Colors[colorScheme ?? 'light'].textSecondary }
                ]}>
                  {mystery.day}
                </Text>
                
                {/* Show mysteries when selected */}
                {selectedMystery === mystery.name && (
                  <View style={styles.mysteriesList}>
                    {mystery.mysteries.map((mysteryName, idx) => (
                      <Text key={idx} style={[styles.mysteryItem, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {idx + 1}. {mysteryName}
                      </Text>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: 'Georgia',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Georgia',
  },
  rosaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rosaryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rosaryMysteryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Georgia',
  },
  rosaryMysteryDay: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Georgia',
  },
  mysteriesList: {
    marginTop: 12,
    width: '100%',
  },
  mysteryItem: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'Georgia',
  },
});
