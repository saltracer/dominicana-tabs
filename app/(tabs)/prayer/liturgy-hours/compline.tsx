import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { useCalendar } from '../../../../components/CalendarContext';
import PrayerNavigation from '../../../../components/PrayerNavigation';
import PrayerHoursNavigation from '../../../../components/PrayerHoursNavigation';
import PrayerNavButtons from '../../../../components/PrayerNavButtons';
import SwipeNavigationWrapper from '../../../../components/SwipeNavigationWrapper';
import { LiturgicalDay, HourType } from '../../../../types';
import { useCompline } from '../../../../hooks/useCompline';
import { LanguageCode } from '../../../../types/compline-types';
import ErrorBoundary from '../../../../components/ErrorBoundary';
import { PrayerStyles } from '../../../../styles';

function ComplineScreenContent() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showQuickPicker, setShowQuickPicker] = useState(false);
  
  // Memoize the date to prevent infinite re-renders
  const targetDate = useMemo(() => {
    return liturgicalDay ? new Date(liturgicalDay.date) : new Date();
  }, [liturgicalDay?.date]);
  
  // Get Compline data using the new hook
  const { complineData, loading, error } = useCompline(
    targetDate,
    { language }
  );

  // Initialize the component
  useEffect(() => {
    if (liturgicalDay && !isInitialized) {
      setIsInitialized(true);
    }
  }, [liturgicalDay]);

  // Show loading state only if not initialized or still loading
  if (!isInitialized || loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading Compline...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !complineData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            {error || 'Failed to load Compline data'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SwipeNavigationWrapper currentHour="compline">
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Clean Header */}
        <View style={styles.cleanHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/prayer')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Compline
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Night Prayer • {liturgicalDay?.season.name || 'Loading...'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.quickPickerButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            onPress={() => setShowQuickPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={16} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
        </View>

        {/* Prayer Hours Navigation */}
        <PrayerHoursNavigation currentHour="compline" />

        {/* Opening */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="moon" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Opening
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.opening.content[language]?.text}
            </Text>
          </View>
        </View>


        {/* Examination of Conscience */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="search-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Examination of Conscience
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            {complineData.components.examinationOfConscience.rubric && (
              <Text style={[styles.rubric, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {complineData.components.examinationOfConscience.rubric[language]?.text}
              </Text>
            )}
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.examinationOfConscience.content[language]?.text}
            </Text>
          </View>
        </View>

        {/* Hymn */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="musical-notes-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Hymn
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.hymn.title[language]?.text || 'Night Hymn'}
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.hymn.content[language]?.text}
            </Text>
          </View>
        </View>

        {/* Psalm */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="book-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Psalm
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Psalm {complineData.components.psalmody.psalmNumber}: Answer me when I call
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Antiphon: {complineData.components.psalmody.antiphon[language]?.text}
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.psalmody.verses[language]?.text}
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Antiphon: {complineData.components.psalmody.antiphon[language]?.text}
            </Text>
          </View>
        </View>

        {/* Reading */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="library-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Short Reading
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {complineData.components.reading.source[language]?.text}
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.reading.content[language]?.text}
            </Text>
          </View>
        </View>

        {/* Responsory */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="repeat-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Responsory
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.responsory.content[language]?.text}
            </Text>
          </View>
        </View>

        {/* Canticle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="star-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Canticle of Simeon
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Antiphon: {complineData.components.canticle.antiphon[language]?.text}
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.canticle.content[language]?.text}
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Antiphon: {complineData.components.canticle.antiphon[language]?.text}
            </Text>
          </View>
        </View>

        {/* Concluding Prayer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="heart-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Concluding Prayer
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.concludingPrayer.content[language]?.text}
            </Text>
            <Text style={[styles.amen, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Amen.
            </Text>
          </View>
        </View>

        {/* Final Blessing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="shield-checkmark-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Final Blessing
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.finalBlessing.content[language]?.text}
            </Text>
          </View>
        </View>
        {/* Prayer Navigation Buttons */}
        <PrayerNavButtons currentHour="compline" />
      </ScrollView>
      
      {/* Quick picker modal */}
      <Modal
        visible={showQuickPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuickPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowQuickPicker(false)}
        >
          <View style={[styles.quickPickerModal, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Choose Prayer Hour
            </Text>
            {[
              { route: 'office-of-readings', name: 'Office of Readings', icon: 'book' },
              { route: 'lauds', name: 'Lauds', icon: 'sunny' },
              { route: 'terce', name: 'Terce', icon: 'time' },
              { route: 'sext', name: 'Sext', icon: 'sunny' },
              { route: 'none', name: 'None', icon: 'time' },
              { route: 'vespers', name: 'Vespers', icon: 'moon' },
              { route: 'compline', name: 'Compline', icon: 'moon' },
            ].map((hour) => (
              <TouchableOpacity
                key={hour.route}
                style={[styles.modalHourItem, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}
                onPress={() => {
                  setShowQuickPicker(false);
                  router.push(`/(tabs)/prayer/liturgy-hours/${hour.route}` as any);
                }}
              >
                <View style={styles.modalHourContent}>
                  <Ionicons name={hour.icon as any} size={20} color={Colors[colorScheme ?? 'light'].primary} />
                  <Text style={[styles.modalHourName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {hour.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
      
      </SafeAreaView>
    </SwipeNavigationWrapper>
  );
}


const styles = StyleSheet.create({
  ...PrayerStyles,
  // Add unique local styles for liturgy hours
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  contentText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  antiphon: {
    fontSize: 16,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  amen: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Georgia',
  },
  rubric: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  // Override header for liturgy hours layout
  cleanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Georgia',
    opacity: 0.8,
  },
  quickPickerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickPickerModal: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalHourItem: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  modalHourContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHourName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginLeft: 12,
  },
  // Override section title for liturgy hours
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Georgia',
  },
});

export default function ComplineScreen() {
  return (
    <ErrorBoundary>
      <ComplineScreenContent />
    </ErrorBoundary>
  );
}
