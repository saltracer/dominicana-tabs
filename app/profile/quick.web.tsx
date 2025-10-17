import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import LiturgyPreferencesDropdown from '../../components/LiturgyPreferencesDropdown.web';
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
          Quick Settings
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Most frequently changed preferences
        </Text>
      </View>

      {liturgyPreferences ? (
        <View style={styles.settingsContainer}>
          {/* Theme Mode */}
          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.settingHeader}>
              <Text style={[styles.settingLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Theme Mode
              </Text>
              <Text style={[styles.settingDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Choose your preferred color scheme
              </Text>
            </View>
            <View style={styles.themeOptions}>
              {([
                { mode: 'light', icon: 'sunny', label: 'Light' },
                { mode: 'dark', icon: 'moon', label: 'Dark' },
                { mode: 'system', icon: 'settings', label: 'System' }
              ] as const).map(({ mode, label }) => (
                <button
                  key={mode}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: themeMode === mode 
                      ? `2px solid ${Colors[colorScheme ?? 'light'].primary}` 
                      : '1px solid #E0E0E0',
                    backgroundColor: themeMode === mode 
                      ? Colors[colorScheme ?? 'light'].primary + '10' 
                      : 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'Georgia',
                    fontSize: '15px',
                    fontWeight: themeMode === mode ? '600' : '400',
                    color: themeMode === mode 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].text,
                  }}
                  onClick={() => setThemeMode(mode)}
                >
                  {label}
                </button>
              ))}
            </View>
          </View>

          {/* Primary Language */}
          <LiturgyPreferencesDropdown
            label="Primary Language"
            description="Main language for liturgical content"
            value={liturgyPreferences.primary_language}
            options={availableOptions.languages}
            onValueChange={(value) => updateLiturgyPreference('primary_language', value)}
            icon="language"
          />

          {/* Font Size */}
          <LiturgyPreferencesDropdown
            label="Font Size"
            description="Text size for liturgical content"
            value={liturgyPreferences.font_size}
            options={availableOptions.fontSizes}
            onValueChange={(value) => updateLiturgyPreference('font_size', value)}
            icon="text"
          />

          {/* Display Mode */}
          <LiturgyPreferencesDropdown
            label="Display Mode"
            description="How to display multiple languages"
            value={liturgyPreferences.display_mode}
            options={availableOptions.displayModes}
            onValueChange={(value) => updateLiturgyPreference('display_mode', value)}
            icon="layers"
          />

          {/* Bible Translation */}
          <LiturgyPreferencesDropdown
            label="Bible Translation"
            description="Preferred Bible translation"
            value={liturgyPreferences.bible_translation}
            options={availableOptions.bibleTranslations}
            onValueChange={(value) => updateLiturgyPreference('bible_translation', value)}
            icon="book"
          />
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
    gap: 16,
  },
  settingCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingHeader: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
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

