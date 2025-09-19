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
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner';
import PrayerNavigation from '../../../components/PrayerNavigation';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { LiturgicalDay, HourType } from '../../../types';
import { PrayerStyles } from '../../../styles';

export default function LiturgyOfTheHoursScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const [selectedHour, setSelectedHour] = useState<HourType>('lauds');



  const prayerHours: { type: HourType; name: string; time: string; icon: string; route: string }[] = [
    { type: 'office_of_readings', name: 'Office of Readings', time: 'Any time', icon: 'book', route: 'office-of-readings' },
    { type: 'lauds', name: 'Lauds (Morning Prayer)', time: '6:00 AM', icon: 'sunny', route: 'lauds' },
    { type: 'terce', name: 'Terce (Mid-Morning)', time: '9:00 AM', icon: 'time', route: 'terce' },
    { type: 'sext', name: 'Sext (Midday)', time: '12:00 PM', icon: 'sunny', route: 'sext' },
    { type: 'none', name: 'None (Mid-Afternoon)', time: '3:00 PM', icon: 'time', route: 'none' },
    { type: 'vespers', name: 'Vespers (Evening Prayer)', time: '6:00 PM', icon: 'moon', route: 'vespers' },
    { type: 'compline', name: 'Compline (Night Prayer)', time: '9:00 PM', icon: 'moon', route: 'compline' },
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
        <PrayerNavigation activeTab="liturgy" />

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
              { backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderWidth: 1,
                borderColor: Colors[colorScheme ?? 'light'].primary }
            ]}
          >
            <Ionicons name="play-circle" size={24} color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.quickActionText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Current Hour
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderWidth: 1,
                borderColor: Colors[colorScheme ?? 'light'].secondary }
            ]}
          >
            <Ionicons name="calendar" size={24} color={Colors[colorScheme ?? 'light'].secondary} />
            <Text style={[styles.quickActionText, { color: Colors[colorScheme ?? 'light'].secondary }]}>
              Today's Readings
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Prayer Hours Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="time" 
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
                    borderColor: Colors[colorScheme ?? 'light'].border,
                  }
                ]}
                onPress={() => router.push(`/(tabs)/prayer/liturgy-hours/${hour.route}` as any)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={hour.icon as any} 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].primary}
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
                <Ionicons 
                  name="chevron-forward" 
                  size={16} 
                  color={Colors[colorScheme ?? 'light'].textSecondary}
                  style={styles.chevron}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Feast Banner at Bottom */}
      {/* <FeastBanner 
        liturgicalDay={liturgicalDay} 
      /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...PrayerStyles,
  // No unique local styles needed for this component
});
