import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import LiturgyPreferencesDropdown from '../../components/LiturgyPreferencesDropdown.web';
import LiturgyPreferencesToggle from '../../components/LiturgyPreferencesToggle.web';
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
      const preferences = await UserLiturgyPreferencesService.getUserPreferences(user.id);
      setLiturgyPreferences(preferences);
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
      
      const result = await UserLiturgyPreferencesService.updateUserPreferences(user.id, {
        [key]: value,
      });

      if (!result.success) {
        setLiturgyPreferences(liturgyPreferences);
        Alert.alert('Error', result.error || 'Failed to update preference');
      }
    } catch (error) {
      console.error('Error updating liturgy preference:', error);
      setLiturgyPreferences(liturgyPreferences);
    }
  };

  useEffect(() => {
    loadLiturgyPreferences();
  }, [user?.id]);

  if (preferencesLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading preferences...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Study Settings
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Configure preferences for Bible reading, annotations, and study materials
        </Text>
      </View>

      {liturgyPreferences ? (
        <View style={styles.settingsContainer}>
          {/* Bible Reading Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
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
          </View>

          {/* Display Preferences Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
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
          </View>

          {/* Annotations & Notes Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Annotations & Notes
            </Text>

            <View style={[styles.infoCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Annotation preferences are automatically saved as you use them throughout the app.
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={[styles.errorCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
            Failed to load preferences
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  settingsContainer: {
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    lineHeight: 22,
  },
  errorCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
});

