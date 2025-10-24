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
              {/* Theme Mode */}
              <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Text style={[styles.settingLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Theme Mode
                </Text>
                <Text style={[styles.settingDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Choose your preferred color scheme
                </Text>
                <View style={styles.themeOptions}>
                  {([
                    { mode: 'light', icon: 'sunny', label: 'Light' },
                    { mode: 'dark', icon: 'moon', label: 'Dark' },
                    { mode: 'system', icon: 'settings', label: 'System' }
                  ] as const).map(({ mode, icon, label }) => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.themeOption,
                        {
                          backgroundColor: themeMode === mode 
                            ? Colors[colorScheme ?? 'light'].primary + '15' 
                            : 'transparent',
                          borderColor: themeMode === mode 
                            ? Colors[colorScheme ?? 'light'].primary 
                            : Colors[colorScheme ?? 'light'].border,
                        },
                      ]}
                      onPress={() => setThemeMode(mode)}
                    >
                      <Ionicons 
                        name={icon} 
                        size={20} 
                        color={themeMode === mode 
                          ? Colors[colorScheme ?? 'light'].primary 
                          : Colors[colorScheme ?? 'light'].textSecondary
                        } 
                      />
                      <Text style={[
                        styles.themeOptionText,
                        {
                          color: themeMode === mode 
                            ? Colors[colorScheme ?? 'light'].primary 
                            : Colors[colorScheme ?? 'light'].text,
                          fontWeight: themeMode === mode ? '600' : '400',
                        },
                      ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

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
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  themeOptionText: {
    fontSize: 15,
    fontFamily: 'Georgia',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    padding: 16,
  },
});

