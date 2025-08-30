import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import FeastBanner from '../../components/FeastBanner.web';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { LiturgicalDay, HourType } from '../../types';

export default function PrayerScreen() {
  const { colorScheme } = useTheme();
  const [liturgicalDay, setLiturgicalDay] = useState<LiturgicalDay | null>(null);
  const [selectedHour, setSelectedHour] = useState<HourType>('lauds');

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

  const prayerHours: { type: HourType; name: string; time: string; icon: string; description: string }[] = [
    { 
      type: 'office_of_readings', 
      name: 'Office of Readings', 
      time: 'Any time', 
      icon: 'book-outline',
      description: 'Scripture and patristic readings'
    },
    { 
      type: 'lauds', 
      name: 'Lauds (Morning Prayer)', 
      time: '6:00 AM', 
      icon: 'sunny-outline',
      description: 'Morning praise and thanksgiving'
    },
    { 
      type: 'terce', 
      name: 'Terce (Mid-Morning)', 
      time: '9:00 AM', 
      icon: 'time-outline',
      description: 'Mid-morning prayer'
    },
    { 
      type: 'sext', 
      name: 'Sext (Midday)', 
      time: '12:00 PM', 
      icon: 'sunny',
      description: 'Noon prayer'
    },
    { 
      type: 'none', 
      name: 'None (Mid-Afternoon)', 
      time: '3:00 PM', 
      icon: 'time',
      description: 'Afternoon prayer'
    },
    { 
      type: 'vespers', 
      name: 'Vespers (Evening Prayer)', 
      time: '6:00 PM', 
      icon: 'moon-outline',
      description: 'Evening praise and intercession'
    },
    { 
      type: 'compline', 
      name: 'Compline (Night Prayer)', 
      time: '9:00 PM', 
      icon: 'moon',
      description: 'Night prayer before rest'
    },
  ];

  const rosaryMysteries = [
    { 
      name: 'Joyful Mysteries', 
      day: 'Monday & Saturday', 
      icon: 'happy-outline',
      description: 'The Annunciation, Visitation, Nativity, Presentation, and Finding in the Temple'
    },
    { 
      name: 'Sorrowful Mysteries', 
      day: 'Tuesday & Friday', 
      icon: 'heart-outline',
      description: 'The Agony in the Garden, Scourging, Crowning with Thorns, Carrying the Cross, and Crucifixion'
    },
    { 
      name: 'Glorious Mysteries', 
      day: 'Wednesday & Sunday', 
      icon: 'star-outline',
      description: 'The Resurrection, Ascension, Descent of the Holy Spirit, Assumption, and Coronation'
    },
    { 
      name: 'Luminous Mysteries', 
      day: 'Thursday', 
      icon: 'flash-outline',
      description: 'The Baptism, Wedding at Cana, Proclamation of the Kingdom, Transfiguration, and Institution of the Eucharist'
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <View style={styles.pageTitleSection}>
            <Ionicons 
              name="heart" 
              size={48} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <View style={styles.pageTitleText}>
              <Text style={[styles.pageTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Prayer
              </Text>
              <Text style={[styles.pageSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Liturgy of the Hours & Dominican Rosary
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: Colors[colorScheme ?? 'light'].primary }
              ]}
            >
              <Ionicons name="play-circle" size={32} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
              <View style={styles.quickActionContent}>
                <Text style={[styles.quickActionTitle, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Start Current Hour
                </Text>
                <Text style={[styles.quickActionDescription, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Begin the appropriate prayer for this time
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.quickActionCard,
                { backgroundColor: Colors[colorScheme ?? 'light'].secondary }
              ]}
            >
              <Ionicons name="rose" size={32} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
              <View style={styles.quickActionContent}>
                <Text style={[styles.quickActionTitle, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Pray Rosary
                </Text>
                <Text style={[styles.quickActionDescription, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Traditional Dominican Rosary with meditations
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Liturgy of the Hours Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="time-outline" 
              size={32} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <View style={styles.sectionHeaderText}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Liturgy of the Hours
              </Text>
              <Text style={[styles.sectionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                The official prayer of the Church, prayed throughout the day
              </Text>
            </View>
          </View>
          
          <View style={styles.prayerHoursGrid}>
            {prayerHours.map((hour) => (
              <TouchableOpacity
                key={hour.type}
                style={[
                  styles.prayerHourCard,
                  { 
                    backgroundColor: Colors[colorScheme ?? 'light'].card,
                    borderColor: selectedHour === hour.type 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].border,
                  }
                ]}
                onPress={() => setSelectedHour(hour.type)}
              >
                <View style={styles.prayerHourHeader}>
                  <Ionicons 
                    name={hour.icon as any} 
                    size={28} 
                    color={selectedHour === hour.type 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].textSecondary
                    } 
                  />
                  <Text style={[
                    styles.prayerHourTime,
                    { color: Colors[colorScheme ?? 'light'].textSecondary }
                  ]}>
                    {hour.time}
                  </Text>
                </View>
                <Text style={[
                  styles.prayerHourName,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  {hour.name}
                </Text>
                <Text style={[
                  styles.prayerHourDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary }
                ]}>
                  {hour.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rosary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="rose-outline" 
              size={32} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <View style={styles.sectionHeaderText}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Dominican Rosary
              </Text>
              <Text style={[styles.sectionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                The traditional rosary as prayed by the Order of Preachers
              </Text>
            </View>
          </View>
          
          <View style={styles.rosaryGrid}>
            {rosaryMysteries.map((mystery, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.rosaryCard,
                  { backgroundColor: Colors[colorScheme ?? 'light'].card }
                ]}
              >
                <View style={styles.rosaryCardHeader}>
                  <Ionicons 
                    name={mystery.icon as any} 
                    size={32} 
                    color={Colors[colorScheme ?? 'light'].primary} 
                  />
                  <View style={[styles.rosaryDayBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                    <Text style={[styles.rosaryDayText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                      {mystery.day}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.rosaryMysteryName,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  {mystery.name}
                </Text>
                <Text style={[
                  styles.rosaryMysteryDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary }
                ]}>
                  {mystery.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feast Banner */}
        <View style={styles.feastBannerContainer}>
          <FeastBanner 
            liturgicalDay={liturgicalDay} 
            onDateChange={handleDateChange}
          />
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
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'Georgia',
  },
  pageHeader: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  pageTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitleText: {
    marginLeft: 16,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  quickActionsSection: {
    marginBottom: 48,
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 12,
  },
  quickActionContent: {
    flex: 1,
    marginLeft: 16,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
    opacity: 0.9,
  },
  section: {
    marginBottom: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  sectionHeaderText: {
    flex: 1,
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
  },
  prayerHoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  prayerHourCard: {
    flex: 1,
    minWidth: 200,
    padding: 24,
    borderWidth: 2,
    margin: 10,
  },
  prayerHourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerHourName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  prayerHourTime: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  prayerHourDescription: {
    fontSize: 14,
  },
  rosaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rosaryCard: {
    flex: 1,
    minWidth: 250,
    padding: 24,
    margin: 10,
  },
  rosaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rosaryDayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rosaryDayText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  rosaryMysteryName: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  rosaryMysteryDescription: {
    fontSize: 14,
  },
  feastBannerContainer: {
    marginTop: 32,
    marginBottom: 48,
  },
});
