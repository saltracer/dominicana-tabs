import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import LiturgyPreferencesDropdown from '../../components/LiturgyPreferencesDropdown';
import LiturgyPreferencesToggle from '../../components/LiturgyPreferencesToggle';
import { UserLiturgyPreferencesService, UserLiturgyPreferencesData } from '../../services/UserLiturgyPreferencesService';

export default function StudySettingsScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [liturgyPreferences, setLiturgyPreferences] = useState<UserLiturgyPreferencesData | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  const availableOptions = UserLiturgyPreferencesService.getAvailableOptions();

  const loadLiturgyPreferences = async () => {
    if (!user?.id) return;
    
    setPreferencesLoading(true);
    try {
      const { cached, fresh } = await UserLiturgyPreferencesService.getUserPreferencesWithCache(user.id);
      if (cached) setLiturgyPreferences(cached);
      const freshPreferences = await fresh;
      if (freshPreferences) setLiturgyPreferences(freshPreferences);
    } catch (error) {
      console.error('Error loading liturgy preferences:', error);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const updateLiturgyPreference = async (key: keyof UserLiturgyPreferencesData, value: any) => {
    if (!user?.id || !liturgyPreferences) return;

    try {
      const updatedPreferences = { ...liturgyPreferences, [key]: value };
      setLiturgyPreferences(updatedPreferences);
      
      await UserLiturgyPreferencesService.updateUserPreferences(user.id, {
        [key]: value,
      });
    } catch (error) {
      console.error('Error updating liturgy preference:', error);
      setLiturgyPreferences(liturgyPreferences);
    }
  };

  useEffect(() => {
    loadLiturgyPreferences();
  }, [user?.id]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Study Settings
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Configure preferences for Bible reading and study materials
          </Text>
          
          {liturgyPreferences && !preferencesLoading ? (
            <>
              {/* Bible Section */}
              <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Bible & Scripture
              </Text>

              <LiturgyPreferencesDropdown
                label="Bible Translation"
                description="Preferred Bible translation"
                value={liturgyPreferences.bible_translation}
                options={availableOptions.bibleTranslations}
                onValueChange={(value) => updateLiturgyPreference('bible_translation', value)}
                icon="book"
              />

              <LiturgyPreferencesToggle
                label="Show Rubrics"
                description="Display liturgical instructions"
                value={liturgyPreferences.show_rubrics}
                onValueChange={(value) => updateLiturgyPreference('show_rubrics', value)}
                icon="list"
              />

              {/* Display Section */}
              <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Display Preferences
              </Text>

              <LiturgyPreferencesDropdown
                label="Font Size"
                description="Text size for reading"
                value={liturgyPreferences.font_size}
                options={availableOptions.fontSizes}
                onValueChange={(value) => updateLiturgyPreference('font_size', value)}
                icon="text"
              />

              <LiturgyPreferencesDropdown
                label="Display Mode"
                description="How to display multiple languages"
                value={liturgyPreferences.display_mode}
                options={availableOptions.displayModes}
                onValueChange={(value) => updateLiturgyPreference('display_mode', value)}
                icon="layers"
              />

              <LiturgyPreferencesDropdown
                label="Primary Language"
                description="Main language for study materials"
                value={liturgyPreferences.primary_language}
                options={availableOptions.languages}
                onValueChange={(value) => updateLiturgyPreference('primary_language', value)}
                icon="language"
              />

              <LiturgyPreferencesDropdown
                label="Secondary Language"
                description="Secondary language for parallel reading"
                value={liturgyPreferences.secondary_language}
                options={availableOptions.languages}
                onValueChange={(value) => updateLiturgyPreference('secondary_language', value)}
                icon="globe"
              />
            </>
          ) : null}
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
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 24,
    marginBottom: 12,
  },
});

