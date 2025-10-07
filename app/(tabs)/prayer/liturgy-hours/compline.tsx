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
import ChantWebView from '../../../../components/ChantWebView';

function ComplineScreenContent() {
  const theme = useTheme();
  const colorScheme = theme?.colorScheme ?? 'light';
  const { liturgicalDay } = useCalendar();
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showQuickPicker, setShowQuickPicker] = useState(false);

  // Early return if theme is not available
  if (!theme) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#ffffff' }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: '#000000' }]}>
            Loading theme...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Memoize the date to prevent infinite re-renders
  const targetDate = useMemo(() => {
    // console.warn('🗓️ COMPLINE DATE DEBUG START');
    // console.warn('📅 liturgicalDay:', liturgicalDay);
    // console.warn('📅 liturgicalDay?.date:', liturgicalDay?.date);
    
    // Create a pure date object without time components to avoid timezone issues
    let date: Date;
    if (liturgicalDay) {
      // Parse the YYYY-MM-DD string directly to create a date-only object
      const [year, month, day] = liturgicalDay.date.split('-').map(Number);
      date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    } else {
      // Create a date-only object for today
      const today = new Date();
      date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
    
    // console.warn('📅 Generated targetDate (date-only):', date.toString());
    // console.warn('📅 targetDate.toLocaleDateString():', date.toLocaleDateString());
    // console.warn('📅 targetDate.toLocaleTimeString():', date.toLocaleTimeString());
    // console.warn('📅 targetDate.getDay():', date.getDay());
    // console.warn('📅 targetDate timezone offset:', date.getTimezoneOffset());
    // console.warn('🗓️ COMPLINE DATE DEBUG END');
    
    return date;
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
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
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Examination of Conscience
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            {complineData.components.examinationOfConscience.rubric && (
              <Text style={[styles.rubric, { color: Colors[colorScheme ?? 'light'].primary, marginBottom: -12 }]}>
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

        {/* Psalm(s) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.psalmody.secondPsalm ? 'Psalms' : 'Psalm'}
            </Text>
          </View>
          
          {/* First Psalm */}
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Psalm {complineData.components.psalmody.psalmNumber}
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.psalmody.antiphon[language]?.text}
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.psalmody.verses?.[language]?.text || 
               (complineData.components.psalmody.scriptureRef ? 'Loading psalm...' : 'Psalm content not available')}
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.psalmody.antiphon[language]?.text}
            </Text>
          </View>

          {/* Second Psalm (if exists) */}
          {complineData.components.psalmody.secondPsalm && (
            <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card, marginTop: 16 }]}>
              <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Psalm {complineData.components.psalmody.secondPsalm.psalmNumber}
              </Text>
              <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].text }]}>
                {complineData.components.psalmody.secondPsalm.antiphon[language]?.text}
              </Text>
              <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
                {complineData.components.psalmody.secondPsalm.verses?.[language]?.text || 
                 (complineData.components.psalmody.secondPsalm.scriptureRef ? 'Loading psalm...' : 'Psalm content not available')}
              </Text>
              <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].text }]}>
                {complineData.components.psalmody.secondPsalm.antiphon[language]?.text}
              </Text>
            </View>
          )}
        </View>

        {/* Reading */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Short Reading
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {complineData.components.reading.source[language]?.text}
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.reading.verses?.[language]?.text || 'Loading reading...'}
            </Text>
          </View>
        </View>

        {/* Responsory */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
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
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Canticle of Simeon
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.canticle.antiphon[language]?.text}
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.canticle.verses?.[language]?.text || 
               (complineData.components.canticle.scriptureRef ? 'Loading canticle...' : complineData.components.canticle.content[language]?.text)}
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.canticle.antiphon[language]?.text}
            </Text>
          </View>
        </View>

        {/* Concluding Prayer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
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

        {/* Marian Hymn */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.marianHymn.title[language]?.text || 'Marian Hymn'}
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              {complineData.components.marianHymn.content[language]?.text}
            </Text>
          </View>
          
          {/* Chant Preferences */}
          <ChantWebView 
            chantName={complineData.components.marianHymn.id}
            style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            onLoadEnd={() => {
              console.log('Chant preferences loaded');
            }}
            onError={(error) => {
              console.warn('Chant WebView error:', error);
            }}
          />
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
