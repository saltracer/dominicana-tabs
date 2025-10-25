import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import LiturgyPreferencesDropdown from '../../components/LiturgyPreferencesDropdown.web';
import LiturgyPreferencesToggle from '../../components/LiturgyPreferencesToggle.web';
import RosaryFinalPrayersEditor from '../../components/RosaryFinalPrayersEditor.web';
import { UserLiturgyPreferencesService, UserLiturgyPreferencesData } from '../../services/UserLiturgyPreferencesService';

export default function PrayerSettingsScreen() {
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
          Prayer Settings
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Configure preferences for Liturgy of the Hours, Rosary, and Devotions
        </Text>
      </View>

      {liturgyPreferences ? (
        <View style={styles.settingsContainer}>
          {/* Liturgy of the Hours Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Liturgy of the Hours
            </Text>

            <LiturgyPreferencesDropdown
              label="Calendar Type"
              description="Choose your liturgical calendar"
              value={liturgyPreferences.calendar_type}
              options={availableOptions.calendarTypes}
              onValueChange={(value) => updateLiturgyPreference('calendar_type', value)}
              icon="calendar-outline"
            />

            <LiturgyPreferencesDropdown
              label="Memorial Preference"
              description="Which memorials to display"
              value={liturgyPreferences.memorial_preference}
              options={availableOptions.memorialPreferences}
              onValueChange={(value) => updateLiturgyPreference('memorial_preference', value)}
              icon="calendar"
            />

            <LiturgyPreferencesDropdown
              label="Primary Language"
              description="Main language for prayers"
              value={liturgyPreferences.primary_language}
              options={availableOptions.languages}
              onValueChange={(value) => updateLiturgyPreference('primary_language', value)}
              icon="language"
            />

            <LiturgyPreferencesDropdown
              label="Secondary Language"
              description="Secondary language for bilingual display"
              value={liturgyPreferences.secondary_language}
              options={availableOptions.languages}
              onValueChange={(value) => updateLiturgyPreference('secondary_language', value)}
              icon="globe"
            />
          </View>

          {/* Chant & Music Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Chant & Music
            </Text>

            <LiturgyPreferencesToggle
              label="Chant Notation Enabled"
              description="Show musical notation for chants"
              value={liturgyPreferences.chant_notation_enabled}
              onValueChange={(value) => updateLiturgyPreference('chant_notation_enabled', value)}
              icon="musical-note"
            />

            {liturgyPreferences.chant_notation_enabled && (
              <LiturgyPreferencesDropdown
                label="Chant Notation"
                description="Type of musical notation to display"
                value={liturgyPreferences.chant_notation}
                options={availableOptions.chantNotations}
                onValueChange={(value) => updateLiturgyPreference('chant_notation', value)}
                icon="musical-notes"
              />
            )}

            <LiturgyPreferencesToggle
              label="Audio Enabled"
              description="Enable audio playback for prayers and readings"
              value={liturgyPreferences.audio_enabled}
              onValueChange={(value) => updateLiturgyPreference('audio_enabled', value)}
              icon="volume-high"
            />
          </View>

          {/* Text-to-Speech Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Text-to-Speech
            </Text>

            <LiturgyPreferencesToggle
              label="Text-to-Speech"
              description="Enable spoken word for prayers and readings"
              value={liturgyPreferences.tts_enabled}
              onValueChange={(value) => updateLiturgyPreference('tts_enabled', value)}
              icon="mic"
            />

            {liturgyPreferences.tts_enabled && (
              <LiturgyPreferencesDropdown
                label="TTS Speed"
                description="Speed of text-to-speech playback"
                value={liturgyPreferences.tts_speed}
                options={availableOptions.ttsSpeeds}
                onValueChange={(value) => updateLiturgyPreference('tts_speed', value)}
                icon="speedometer"
              />
            )}

            {/* Rosary Section */}
            <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Rosary
            </Text>

            <LiturgyPreferencesDropdown
              label="Rosary Voice"
              description="Select the narrator voice for audio-guided rosary"
              value={liturgyPreferences.rosary_voice || 'alphonsus'}
              options={[
                { label: 'Alphonsus', value: 'alphonsus' },
                { label: 'Catherine', value: 'catherine' },
              ]}
              onValueChange={(value) => updateLiturgyPreference('rosary_voice', value)}
              icon="mic-outline"
            />

            <LiturgyPreferencesToggle
              label="Show Mystery Meditations"
              description="Display full meditations or brief announcements"
              value={liturgyPreferences.show_mystery_meditations ?? true}
              onValueChange={(value) => updateLiturgyPreference('show_mystery_meditations', value)}
              icon="book-outline"
            />

            <RosaryFinalPrayersEditor
              userId={user.id}
              initialConfig={liturgyPreferences.rosary_final_prayers || [
                { id: 'hail_holy_queen', order: 1 },
                { id: 'versicle_response', order: 2 },
                { id: 'rosary_prayer', order: 3 }
              ]}
              onSave={async (config) => {
                await updateLiturgyPreference('rosary_final_prayers', config);
              }}
            />
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

