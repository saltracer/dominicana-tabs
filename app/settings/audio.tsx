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
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import LiturgyPreferencesDropdown from '../../components/LiturgyPreferencesDropdown';
import LiturgyPreferencesToggle from '../../components/LiturgyPreferencesToggle';
import { UserLiturgyPreferencesService, UserLiturgyPreferencesData } from '../../services/UserLiturgyPreferencesService';

export default function AudioSettingsScreen() {
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
      
      await UserLiturgyPreferencesService.updateUserPreferences(user.id, {
        [key]: value,
      });
    } catch (error) {
      console.error('Error updating liturgy preference:', error);
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
            Audio Settings
          </Text>
          
          {preferencesLoading ? (
            <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Loading preferences...
              </Text>
            </View>
          ) : liturgyPreferences ? (
            <>
              <LiturgyPreferencesToggle
                label="Audio Enabled"
                description="Enable audio playback for prayers and readings"
                value={liturgyPreferences.audio_enabled}
                onValueChange={(value) => updateLiturgyPreference('audio_enabled', value)}
                icon="volume-high"
              />
            </>
          ) : (
            <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
                Failed to load preferences
              </Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={loadLiturgyPreferences}
              >
                <Text style={[styles.retryButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Text-to-Speech
          </Text>
          
          {liturgyPreferences && (
            <>
              <LiturgyPreferencesToggle
                label="Text-to-Speech"
                description="Enable spoken word for prayers and readings"
                value={liturgyPreferences.tts_enabled}
                onValueChange={(value) => updateLiturgyPreference('tts_enabled', value)}
                icon="mic"
              />

              <LiturgyPreferencesDropdown
                label="TTS Speed"
                description="Speed of text-to-speech playback"
                value={liturgyPreferences.tts_speed}
                options={availableOptions.ttsSpeeds}
                onValueChange={(value) => updateLiturgyPreference('tts_speed', value)}
                icon="speedometer"
              />
            </>
          )}

          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Chant Notation
          </Text>
          
          {liturgyPreferences && (
            <>
              <LiturgyPreferencesToggle
                label="Chant Notation Enabled"
                description="Show musical notation for chants"
                value={liturgyPreferences.chant_notation_enabled}
                onValueChange={(value) => updateLiturgyPreference('chant_notation_enabled', value)}
                icon="musical-note"
              />

              <LiturgyPreferencesDropdown
                label="Chant Notation"
                description="Type of musical notation to display"
                value={liturgyPreferences.chant_notation}
                options={availableOptions.chantNotations}
                onValueChange={(value) => updateLiturgyPreference('chant_notation', value)}
                icon="musical-notes"
              />
            </>
          )}
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
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 16,
    marginTop: 24,
  },
  settingCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    padding: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
});
