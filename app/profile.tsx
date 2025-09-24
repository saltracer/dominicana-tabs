import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import AuthGuard from '../components/AuthGuard';
import LiturgyPreferencesDropdown from '../components/LiturgyPreferencesDropdown';
import LiturgyPreferencesToggle from '../components/LiturgyPreferencesToggle';
import SettingsCard from '../components/SettingsCard';
import { UserLiturgyPreferencesService, UserLiturgyPreferencesData } from '../services/UserLiturgyPreferencesService';

function ProfileScreenContent() {
  const { colorScheme, themeMode, setThemeMode } = useTheme();
  const { user, profile, signOut, updateProfile, loading, clearAllAuthData } = useAuth();
  
  // Liturgy preferences state
  const [liturgyPreferences, setLiturgyPreferences] = useState<UserLiturgyPreferencesData | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  
  
  const handleLogin = () => {
    router.push('/auth');
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  // Load liturgy preferences when user is available
  useEffect(() => {
    if (user && !liturgyPreferences && !preferencesLoading) {
      loadLiturgyPreferences();
    }
  }, [user, liturgyPreferences, preferencesLoading]);

  // Debug auth state changes
  useEffect(() => {
    console.log('Profile: Auth state changed', { 
      user: !!user, 
      userId: user?.id, 
      loading, 
      profile: !!profile 
    });
  }, [user, loading, profile]);


  const loadLiturgyPreferences = async () => {
    if (!user) return;
    
    setPreferencesLoading(true);
    try {
      const preferences = await UserLiturgyPreferencesService.getUserPreferences(user.id);
      setLiturgyPreferences(preferences);
    } catch (error) {
      console.error('Error loading liturgy preferences:', error);
      // Set a default preferences object to prevent stuck loading
      setLiturgyPreferences(null);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const updateLiturgyPreference = async (key: keyof UserLiturgyPreferencesData, value: any) => {
    if (!user || !liturgyPreferences) return;

    try {
      const updatedPreferences = { ...liturgyPreferences, [key]: value };
      setLiturgyPreferences(updatedPreferences);

      const result = await UserLiturgyPreferencesService.updateUserPreferences(user.id, {
        [key]: value,
      });

      if (!result.success) {
        // Revert on error
        setLiturgyPreferences(liturgyPreferences);
        Alert.alert('Error', result.error || 'Failed to update preference');
      }
    } catch (error) {
      console.error('Error updating liturgy preference:', error);
      setLiturgyPreferences(liturgyPreferences);
      Alert.alert('Error', 'Failed to update preference');
    }
  };
  
  // Show loading state while auth is initializing
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no user, show login prompt with theme settings
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Header for logged out users */}
          <View style={[styles.profileHeader, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <View style={[styles.avatarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
              <Ionicons name="person-outline" size={40} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: Colors[colorScheme ?? 'light'].text }]}>
                Guest User
              </Text>
              <Text style={[styles.profileStatus, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Not signed in
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
              onPress={handleLogin}
            >
              <Text style={[styles.loginButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Appearance Settings - Available for all users */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
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
                          ? Colors[colorScheme ?? 'light'].primary + '20' // 20% opacity
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
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              About
            </Text>
            
            <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <TouchableOpacity style={styles.aboutRow}>
                <Ionicons name="information-circle" size={24} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.aboutText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  App Version 1.0.0
                </Text>
                <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <TouchableOpacity style={styles.aboutRow}>
                <Ionicons name="help-circle" size={24} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.aboutText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Help & Support
                </Text>
                <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <TouchableOpacity style={styles.aboutRow}>
                <Ionicons name="shield-checkmark" size={24} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.aboutText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Privacy Policy
                </Text>
                <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Prompt */}
          <View style={styles.section}>
            <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <View style={styles.signInPrompt}>
                <Ionicons name="log-in" size={32} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.signInTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Sign in for more features
                </Text>
                <Text style={[styles.signInDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Access your personalized prayer settings, reading progress, and more
                </Text>
                <TouchableOpacity
                  style={[styles.primaryLoginButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                  onPress={handleLogin}
                >
                  <Text style={[styles.primaryLoginButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  // Use profile data or fallback to user data
  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayRole = profile?.role || 'user';

  // Get available options for dropdowns
  const availableOptions = UserLiturgyPreferencesService.getAvailableOptions();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              console.log('Profile: Starting logout...', { user: !!user, loading });
              await signOut();
              console.log('Profile: Logout completed');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleClearAllAuthData = async () => {
    Alert.alert(
      'Clear All Auth Data',
      'This will completely clear all authentication data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllAuthData();
              Alert.alert('Success', 'All authentication data has been cleared.');
            } catch (error) {
              console.error('Clear auth data error:', error);
              Alert.alert('Error', 'Failed to clear auth data.');
            }
          }
        }
      ]
    );
  };

  const handleRiteChange = async (rite: 'roman' | 'dominican') => {
    if (profile && profile.preferences) {
      await updateProfile({
        preferences: {
          ...profile.preferences,
          liturgicalCalendar: {
            ...profile.preferences.liturgicalCalendar,
            preferredRite: rite,
          },
        },
      });
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (profile && profile.preferences) {
      await updateProfile({
        preferences: {
          ...profile.preferences,
          notifications: {
            ...profile.preferences.notifications,
            [key]: value,
          },
        },
      });
    }
  };

  const handleCalendarPreferenceChange = async (key: string, value: boolean) => {
    if (profile && profile.preferences) {
      await updateProfile({
        preferences: {
          ...profile.preferences,
          liturgicalCalendar: {
            ...profile.preferences.liturgicalCalendar,
            [key]: value,
          },
        },
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} testID="profile-container">
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <View style={[styles.avatarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Ionicons name="person" size={40} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: Colors[colorScheme ?? 'light'].text }]}>
              {displayName}
            </Text>
            <Text style={[styles.profileStatus, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {displayRole.charAt(0).toUpperCase() + displayRole.slice(1)} Account
            </Text>
            <Text style={[styles.profileEmail, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
              {displayEmail}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
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
        </View>

        {/* Settings Navigation */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Settings
          </Text>
          
          <SettingsCard
            title="Quick Settings"
            description="Most-used preferences"
            preview={liturgyPreferences ? 
              `${availableOptions.languages.find(l => l.value === liturgyPreferences.primary_language)?.label || 'English'}, ${availableOptions.fontSizes.find(f => f.value === liturgyPreferences.font_size)?.label || 'Medium'}, ${availableOptions.displayModes.find(d => d.value === liturgyPreferences.display_mode)?.label || 'Bilingual'}` 
              : preferencesLoading ? 'Loading...' : 'Not available'
            }
            icon="settings"
            onPress={() => router.push('/settings/quick')}
          />

          <SettingsCard
            title="Language & Display"
            description="Language and text preferences"
            preview={liturgyPreferences ? 
              `${availableOptions.languages.find(l => l.value === liturgyPreferences.primary_language)?.label || 'English'}, ${availableOptions.languages.find(l => l.value === liturgyPreferences.secondary_language)?.label || 'Latin'}` 
              : preferencesLoading ? 'Loading...' : 'Not available'
            }
            icon="globe"
            onPress={() => router.push('/settings/language')}
          />

          <SettingsCard
            title="Audio & Media"
            description="TTS, audio, and chant settings"
            preview={liturgyPreferences ? 
              `TTS: ${liturgyPreferences.tts_enabled ? 'On' : 'Off'}, Chant: ${availableOptions.chantNotations.find(c => c.value === liturgyPreferences.chant_notation)?.label || 'Gregorian'}` 
              : preferencesLoading ? 'Loading...' : 'Not available'
            }
            icon="volume-high"
            onPress={() => router.push('/settings/audio')}
          />

          <SettingsCard
            title="Calendar & Liturgy"
            description="Memorial and calendar preferences"
            preview={liturgyPreferences ? 
              `Memorials: ${availableOptions.memorialPreferences.find(m => m.value === liturgyPreferences.memorial_preference)?.label || 'Both'}, Calendar: ${availableOptions.calendarTypes.find(c => c.value === liturgyPreferences.calendar_type)?.label || 'Dominican'}` 
              : preferencesLoading ? 'Loading...' : 'Not available'
            }
            icon="calendar"
            onPress={() => router.push('/settings/calendar')}
          />

          <SettingsCard
            title="App Settings"
            description="Font size and display options"
            preview={liturgyPreferences ? 
              `Font: ${availableOptions.fontSizes.find(f => f.value === liturgyPreferences.font_size)?.label || 'Medium'}, Rubrics: ${liturgyPreferences.show_rubrics ? 'On' : 'Off'}` 
              : preferencesLoading ? 'Loading...' : 'Not available'
            }
            icon="phone-portrait"
            onPress={() => router.push('/settings/app')}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            About
          </Text>
          
          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <TouchableOpacity style={styles.aboutRow}>
              <Ionicons name="information-circle" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.aboutText, { color: Colors[colorScheme ?? 'light'].text }]}>
                App Version 1.0.0
              </Text>
              <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <TouchableOpacity style={styles.aboutRow}>
              <Ionicons name="help-circle" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.aboutText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Help & Support
              </Text>
              <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <TouchableOpacity style={styles.aboutRow}>
              <Ionicons name="shield-checkmark" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.aboutText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Privacy Policy
              </Text>
              <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Debug Section - Remove in production */}
        {__DEV__ && (
          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Debug Tools
            </Text>
            <TouchableOpacity
              style={[styles.settingRow, { paddingVertical: 12 }]}
              onPress={handleClearAllAuthData}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Clear All Auth Data
                </Text>
                <Text style={[styles.settingDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Completely clear all authentication data
                </Text>
              </View>
              <Ionicons name="trash" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  profileStatus: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 2,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'Georgia',
  },
  settingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  settingDescription: {
    fontSize: 14,
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
  riteOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  riteOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  riteOptionText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'Georgia',
  },
  signInPrompt: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  signInTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  signInDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryLoginButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  primaryLoginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textAlign: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});

export default function ProfileScreen() {
  return <ProfileScreenContent />;
}
