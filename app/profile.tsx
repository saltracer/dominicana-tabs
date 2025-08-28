import React, { useState } from 'react';
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

export default function ProfileScreen() {
  const { colorScheme, themeMode, setThemeMode } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [prayerReminders, setPrayerReminders] = useState(true);
  const [feastDayAlerts, setFeastDayAlerts] = useState(true);
  const [showDominicanFeasts, setShowDominicanFeasts] = useState(true);
  const [preferredRite, setPreferredRite] = useState<'roman' | 'dominican'>('dominican');

  const handleLogin = () => {
    Alert.alert(
      'Login',
      'Would you like to log in to sync your preferences across devices?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Login', 
          onPress: () => {
            setIsLoggedIn(true);
            Alert.alert('Success', 'You are now logged in.');
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            setIsLoggedIn(false);
            Alert.alert('Logged Out', 'You have been logged out successfully.');
          }
        }
      ]
    );
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  const handleRiteChange = (rite: 'roman' | 'dominican') => {
    setPreferredRite(rite);
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
              {isLoggedIn ? 'John Doe' : 'Guest User'}
            </Text>
            <Text style={[styles.profileStatus, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {isLoggedIn ? 'Dominican Friar' : 'Anonymous Access'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: isLoggedIn ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].primary }]}
            onPress={isLoggedIn ? handleLogout : handleLogin}
          >
            <Text style={[styles.loginButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              {isLoggedIn ? 'Logout' : 'Login'}
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
                onValueChange={setShowDominicanFeasts}
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
                onValueChange={setNotifications}
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
                onValueChange={setPrayerReminders}
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
                onValueChange={setFeastDayAlerts}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
});
