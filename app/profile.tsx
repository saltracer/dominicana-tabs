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

function ProfileScreenContent() {
  const { colorScheme, themeMode, setThemeMode } = useTheme();
  const { user, profile, signOut, updateProfile, loading, clearAllAuthData } = useAuth();
  
  
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

  // If no user, show login prompt
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Please log in to view your profile
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  // Use profile data or fallback to user data
  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayRole = profile?.role || 'user';

  const [notifications, setNotifications] = useState(profile?.preferences?.notifications?.enabled ?? true);
  const [prayerReminders, setPrayerReminders] = useState(profile?.preferences?.notifications?.prayerReminders ?? true);
  const [feastDayAlerts, setFeastDayAlerts] = useState(profile?.preferences?.notifications?.feastDayAlerts ?? true);
  const [showDominicanFeasts, setShowDominicanFeasts] = useState(profile?.preferences?.liturgicalCalendar?.showDominicanFeasts ?? true);
  const [preferredRite, setPreferredRite] = useState<'roman' | 'dominican'>(
    (profile?.preferences?.liturgicalCalendar?.preferredRite as 'roman' | 'dominican') ?? 'dominican'
  );

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setNotifications(profile.preferences.notifications.enabled);
      setPrayerReminders(profile.preferences.notifications.prayerReminders);
      setFeastDayAlerts(profile.preferences.notifications.feastDayAlerts);
      setShowDominicanFeasts(profile.preferences.liturgicalCalendar.showDominicanFeasts);
      setPreferredRite(profile.preferences.liturgicalCalendar.preferredRite);
    }
  }, [profile]);

  const handleLogin = () => {
    router.push('/auth');
  };

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
              // Show success message
              Alert.alert('Success', 'You have been logged out successfully.');
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

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  const handleRiteChange = async (rite: 'roman' | 'dominican') => {
    setPreferredRite(rite);
    if (profile) {
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
    if (profile) {
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
    if (profile) {
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
          <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
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
          </View>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: user ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].primary }]}
            onPress={user ? handleLogout : handleLogin}
          >
            <Text style={[styles.loginButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              {user ? 'Logout' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Sections */}
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Liturgical Preferences
          </Text>
          
          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Show Dominican Feasts
                </Text>
                <Text style={[styles.settingDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Display Dominican-specific feast days
                </Text>
              </View>
              <Switch
                value={showDominicanFeasts}
                onValueChange={(value) => {
                  setShowDominicanFeasts(value);
                  handleCalendarPreferenceChange('showDominicanFeasts', value);
                }}
                trackColor={{ false: Colors[colorScheme ?? 'light'].border, true: Colors[colorScheme ?? 'light'].primary }}
                thumbColor={Colors[colorScheme ?? 'light'].dominicanWhite}
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.settingLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Preferred Rite
            </Text>
            <View style={styles.riteOptions}>
              {(['roman', 'dominican'] as const).map((rite) => (
                <TouchableOpacity
                  key={rite}
                  style={[
                    styles.riteOption,
                    { 
                      backgroundColor: preferredRite === rite 
                        ? Colors[colorScheme ?? 'light'].primary 
                        : Colors[colorScheme ?? 'light'].surface,
                      borderColor: Colors[colorScheme ?? 'light'].border,
                    }
                  ]}
                  onPress={() => handleRiteChange(rite)}
                >
                  <Text style={[
                    styles.riteOptionText,
                    { 
                      color: preferredRite === rite 
                        ? Colors[colorScheme ?? 'light'].dominicanWhite 
                        : Colors[colorScheme ?? 'light'].dominicanBlack
                    }
                  ]}>
                    {rite.charAt(0).toUpperCase() + rite.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Notifications
          </Text>
          
          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Enable Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Receive app notifications
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={(value) => {
                  setNotifications(value);
                  handleNotificationChange('enabled', value);
                }}
                trackColor={{ false: Colors[colorScheme ?? 'light'].border, true: Colors[colorScheme ?? 'light'].primary }}
                thumbColor={Colors[colorScheme ?? 'light'].dominicanWhite}
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Prayer Reminders
                </Text>
                <Text style={[styles.settingDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Daily prayer time reminders
                </Text>
              </View>
              <Switch
                value={prayerReminders}
                onValueChange={(value) => {
                  setPrayerReminders(value);
                  handleNotificationChange('prayerReminders', value);
                }}
                trackColor={{ false: Colors[colorScheme ?? 'light'].border, true: Colors[colorScheme ?? 'light'].primary }}
                thumbColor={Colors[colorScheme ?? 'light'].dominicanWhite}
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Feast Day Alerts
                </Text>
                <Text style={[styles.settingDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Notifications for important feast days
                </Text>
              </View>
              <Switch
                value={feastDayAlerts}
                onValueChange={(value) => {
                  setFeastDayAlerts(value);
                  handleNotificationChange('feastDayAlerts', value);
                }}
                trackColor={{ false: Colors[colorScheme ?? 'light'].border, true: Colors[colorScheme ?? 'light'].primary }}
                thumbColor={Colors[colorScheme ?? 'light'].dominicanWhite}
              />
            </View>
          </View>
        </View>

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
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default function ProfileScreen() {
  return (
    <AuthGuard>
      <ProfileScreenContent />
    </AuthGuard>
  );
}
