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
import { LiturgicalDay, HourType } from '../../../types';

export default function LiturgyOfTheHoursWebScreen() {
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

  const prayerHours: { type: HourType; name: string; time: string; icon: string }[] = [
    { type: 'office_of_readings', name: 'Office of Readings', time: 'Any time', icon: 'book-outline' },
    { type: 'lauds', name: 'Lauds (Morning Prayer)', time: '6:00 AM', icon: 'sunny-outline' },
    { type: 'terce', name: 'Terce (Mid-Morning)', time: '9:00 AM', icon: 'time-outline' },
    { type: 'sext', name: 'Sext (Midday)', time: '12:00 PM', icon: 'sunny' },
    { type: 'none', name: 'None (Mid-Afternoon)', time: '3:00 PM', icon: 'time' },
    { type: 'vespers', name: 'Vespers (Evening Prayer)', time: '6:00 PM', icon: 'moon-outline' },
    { type: 'compline', name: 'Compline (Night Prayer)', time: '9:00 PM', icon: 'moon' },
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
            Liturgy of the Hours
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            The official prayer of the Church
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
              Start Current Hour
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].secondary }
            ]}
          >
            <Ionicons name="calendar" size={24} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            <Text style={[styles.quickActionText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Today's Readings
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Prayer Hours Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="time-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Prayer Hours
            </Text>
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
                <Ionicons 
                  name={hour.icon as any} 
                  size={24} 
                  color={selectedHour === hour.type 
                    ? Colors[colorScheme ?? 'light'].primary 
                    : Colors[colorScheme ?? 'light'].textSecondary
                  } 
                />
                <Text style={[
                  styles.prayerHourName,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  {hour.name}
                </Text>
                <Text style={[
                  styles.prayerHourTime,
                  { color: Colors[colorScheme ?? 'light'].textSecondary }
                ]}>
                  {hour.time}
                </Text>
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
  prayerHoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerHourCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prayerHourName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Georgia',
  },
  prayerHourTime: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Georgia',
  },
});
