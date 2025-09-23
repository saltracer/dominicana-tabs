import React, { useState, useEffect, useMemo } from 'react';
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
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { useCalendar } from '../../../../components/CalendarContext';
import PrayerNavigation from '../../../../components/PrayerNavigation';
import PrayerNavButtons from '../../../../components/PrayerNavButtons';
import SwipeNavigationWrapper from '../../../../components/SwipeNavigationWrapper';
import PrayerHourPickerModal from '../../../../components/PrayerHourPickerModal';
import { LiturgicalDay, HourType } from '../../../../types';
import { PrayerStyles, LiturgyStyles } from '../../../../styles';
import { useCompline } from '../../../../hooks/useCompline';
import { LanguageCode } from '../../../../types/compline-types';
import ErrorBoundary from '../../../../components/ErrorBoundary';

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
            style={[styles.quickPickerButton, { /* backgroundColor: Colors[colorScheme ?? 'light'].card */ }]}
            onPress={() => setShowQuickPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={16} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
        </View>


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
              Psalm {complineData.components.psalmody.psalmNumber}
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              {complineData.components.psalmody.antiphon[language]?.text}
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.psalmody.verses[language]?.text}
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              {complineData.components.psalmody.antiphon[language]?.text}
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
              {complineData.components.canticle.antiphon[language]?.text}
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.canticle.content[language]?.text}
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              {complineData.components.canticle.antiphon[language]?.text}
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
      
      {/* Prayer Hour Picker Modal */}
      <PrayerHourPickerModal
        visible={showQuickPicker}
        onClose={() => setShowQuickPicker(false)}
        currentHour="compline"
      />
      
      </SafeAreaView>
    </SwipeNavigationWrapper>
  );
}


const styles = StyleSheet.create({
  ...PrayerStyles,
  ...LiturgyStyles,
  // Unique styles for Compline
  rubric: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default function ComplineScreen() {
  return (
    <ErrorBoundary>
      <ComplineScreenContent />
    </ErrorBoundary>
  );
}
