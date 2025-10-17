import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import SettingsCard from '../../components/SettingsCard';
import { UserLiturgyPreferencesService, UserLiturgyPreferencesData } from '../../services/UserLiturgyPreferencesService';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export default function ProfileScreen() {
  const { colorScheme, themeMode, setThemeMode } = useTheme();
  const { user, profile, signOut, loading, profileLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminAuth();
  
  const [liturgyPreferences, setLiturgyPreferences] = useState<UserLiturgyPreferencesData | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  
  const handleLogin = () => {
    router.push('/auth');
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  useEffect(() => {
    if (user && !liturgyPreferences && !preferencesLoading) {
      loadLiturgyPreferences();
    }
  }, [user, liturgyPreferences, preferencesLoading]);

  const loadLiturgyPreferences = async () => {
    if (!user) return;
    
    setPreferencesLoading(true);
    try {
      const { cached, fresh } = await UserLiturgyPreferencesService.getUserPreferencesWithCache(user.id);
      if (cached) setLiturgyPreferences(cached);
      const freshPreferences = await fresh;
      if (freshPreferences && JSON.stringify(freshPreferences) !== JSON.stringify(cached)) {
        setLiturgyPreferences(freshPreferences);
      }
    } catch (error) {
      console.error('Error loading liturgy preferences:', error);
      setLiturgyPreferences(null);
    } finally {
      setPreferencesLoading(false);
    }
  };
  
  if (loading || (user && profileLoading)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            {loading ? 'Loading...' : 'Loading profile...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayRole = profile?.role || 'user';
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
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          }
        }
      ]
    );
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

        {/* Settings Navigation - Organized by Category */}
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
            icon="flash"
            onPress={() => router.push('/profile/quick')}
          />

          <SettingsCard
            title="Prayer"
            description="Liturgy, rosary, and devotions"
            preview={liturgyPreferences ? 
              `${availableOptions.calendarTypes.find(c => c.value === liturgyPreferences.calendar_type)?.label || 'Dominican'}, ${availableOptions.memorialPreferences.find(m => m.value === liturgyPreferences.memorial_preference)?.label || 'Both'}, TTS: ${liturgyPreferences.tts_enabled ? 'On' : 'Off'}` 
              : preferencesLoading ? 'Loading...' : 'Not available'
            }
            icon="book"
            onPress={() => router.push('/profile/prayer')}
          />

          <SettingsCard
            title="Study"
            description="Bible and reading preferences"
            preview={liturgyPreferences ? 
              `${availableOptions.bibleTranslations.find(b => b.value === liturgyPreferences.bible_translation)?.label || 'Douay-Rheims'}, ${availableOptions.fontSizes.find(f => f.value === liturgyPreferences.font_size)?.label || 'Medium'}, Rubrics: ${liturgyPreferences.show_rubrics ? 'On' : 'Off'}` 
              : preferencesLoading ? 'Loading...' : 'Not available'
            }
            icon="school"
            onPress={() => router.push('/profile/study')}
          />

          <SettingsCard
            title="Community"
            description="Calendar and notifications"
            preview="Coming soon"
            icon="people"
            onPress={() => router.push('/profile/community')}
            disabled={true}
          />

          <SettingsCard
            title="Preaching"
            description="Content preferences"
            preview="Coming soon"
            icon="megaphone"
            onPress={() => router.push('/profile/preaching')}
            disabled={true}
          />

          <SettingsCard
            title="Application"
            description="Theme and app settings"
            preview={`${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}, ${liturgyPreferences ? availableOptions.languages.find(l => l.value === liturgyPreferences.primary_language)?.label || 'English' : 'English'}`}
            icon="settings"
            onPress={() => router.push('/profile/application')}
          />

          <SettingsCard
            title="Account"
            description="Profile and security"
            preview={displayName}
            icon="person"
            onPress={() => router.push('/profile/account')}
          />

          {isAdmin && !adminLoading && (
            <SettingsCard
              title="Admin Console"
              description="Manage books, users, and app content"
              icon="shield-checkmark"
              onPress={() => router.push('/admin')}
            />
          )}
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
  loadingText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
});
