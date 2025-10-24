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
import { UserLiturgyPreferencesService, UserLiturgyPreferencesData } from '../../services/UserLiturgyPreferencesService';

export default function QuickSettingsScreen() {
  const { colorScheme, themeMode, setThemeMode } = useTheme();
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
            Quick Settings
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Most frequently changed preferences
          </Text>
          
          {preferencesLoading ? (
            <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Loading preferences...
              </Text>
            </View>
          ) : liturgyPreferences ? (
            <>
              <LiturgyPreferencesDropdown
                label="Primary Language"
                description="Main language for liturgical content"
                value={liturgyPreferences.primary_language}
                options={availableOptions.languages}
                onValueChange={(value) => updateLiturgyPreference('primary_language', value)}
                icon="language"
              />

              <LiturgyPreferencesDropdown
                label="Font Size"
                description="Text size for liturgical content"
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
                label="Bible Translation"
                description="Preferred Bible translation"
                value={liturgyPreferences.bible_translation}
                options={availableOptions.bibleTranslations}
                onValueChange={(value) => updateLiturgyPreference('bible_translation', value)}
                icon="book"
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
  settingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    padding: 16,
  },
});

