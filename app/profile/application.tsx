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

export default function ApplicationSettingsScreen() {
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

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Application Settings
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Configure general app behavior and appearance
          </Text>
          
          {/* Appearance Section */}
          <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Appearance
          </Text>

          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.settingLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Theme Mode
            </Text>
            <View style={styles.radioOptions}>
              {([
                { mode: 'light', icon: 'sunny', label: 'Light' },
                { mode: 'dark', icon: 'moon', label: 'Dark' },
                { mode: 'system', icon: 'settings', label: 'System' }
              ] as const).map(({ mode, icon, label }) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.radioOption,
                    { 
                      backgroundColor: themeMode === mode 
                        ? Colors[colorScheme ?? 'light'].primary + '20'
                        : 'transparent',
                      borderColor: themeMode === mode 
                        ? Colors[colorScheme ?? 'light'].primary 
                        : Colors[colorScheme ?? 'light'].border,
                    }
                  ]}
                  onPress={() => handleThemeChange(mode)}
                >
                  <View style={[
                    styles.radioButton,
                    { 
                      borderColor: themeMode === mode 
                        ? Colors[colorScheme ?? 'light'].primary 
                        : Colors[colorScheme ?? 'light'].border,
                      backgroundColor: themeMode === mode 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].border,
                    }
                  ]}>
                    {themeMode === mode && (
                      <Ionicons 
                        name="checkmark" 
                        size={12} 
                        color={Colors[colorScheme ?? 'light'].dominicanWhite} 
                      />
                    )}
                  </View>
                  <Ionicons 
                    name={icon as any} 
                    size={18} 
                    color={themeMode === mode 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].textSecondary
                    } 
                    style={styles.radioIcon}
                  />
                  <Text style={[
                    styles.radioOptionText, 
                    { 
                      color: themeMode === mode 
                        ? Colors[colorScheme ?? 'light'].text 
                        : Colors[colorScheme ?? 'light'].text 
                    }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {liturgyPreferences && !preferencesLoading ? (
            <>
              {/* Language Section */}
              <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Language
              </Text>

              <LiturgyPreferencesDropdown
                label="Interface Language"
                description="Language for app interface"
                value={liturgyPreferences.primary_language}
                options={availableOptions.languages}
                onValueChange={(value) => updateLiturgyPreference('primary_language', value)}
                icon="language"
              />

              <LiturgyPreferencesDropdown
                label="Font Size"
                description="General font size for the app"
                value={liturgyPreferences.font_size}
                options={availableOptions.fontSizes}
                onValueChange={(value) => updateLiturgyPreference('font_size', value)}
                icon="text"
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
  settingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  radioOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  radioOption: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 4,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioIcon: {
    marginBottom: 6,
  },
  radioOptionText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
});

