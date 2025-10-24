import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// Import the existing settings components
import QuickSettingsScreen from '../../app/profile/quick';
import PrayerSettingsScreen from '../../app/profile/prayer';
import StudySettingsScreen from '../../app/profile/study';
import CommunitySettingsScreen from '../../app/profile/community';
import PreachingSettingsScreen from '../../app/profile/preaching';
import ApplicationSettingsScreen from '../../app/profile/application';
import AccountSettingsScreen from '../../app/profile/account';

interface SettingsContentNativeProps {
  activeCategory: string;
  onNavigate: (category: string) => void;
}

const settingsCategories = [
  { id: 'quick', label: 'Quick Settings', icon: 'flash' as const },
  { id: 'prayer', label: 'Prayer', icon: 'book' as const },
  { id: 'study', label: 'Study', icon: 'school' as const },
  { id: 'community', label: 'Community', icon: 'people' as const },
  { id: 'preaching', label: 'Preaching', icon: 'megaphone' as const },
  { id: 'application', label: 'Application', icon: 'settings' as const },
  { id: 'account', label: 'Account', icon: 'person' as const },
];

// Wrapper component to remove headers from settings pages and handle SafeAreaView conflicts
const SettingsPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.wrapper}>
      {children}
    </View>
  );
};


export default function SettingsContentNative({ activeCategory, onNavigate }: SettingsContentNativeProps) {
  const { colorScheme } = useTheme();
  const { isAdmin } = useAdminAuth();

  const renderContent = () => {
    switch (activeCategory) {
      case 'quick':
        return (
          <SettingsPageWrapper>
            <QuickSettingsScreen />
          </SettingsPageWrapper>
        );
      case 'prayer':
        return (
          <SettingsPageWrapper>
            <PrayerSettingsScreen />
          </SettingsPageWrapper>
        );
      case 'study':
        return (
          <SettingsPageWrapper>
            <StudySettingsScreen />
          </SettingsPageWrapper>
        );
      case 'community':
        return (
          <SettingsPageWrapper>
            <CommunitySettingsScreen />
          </SettingsPageWrapper>
        );
      case 'preaching':
        return (
          <SettingsPageWrapper>
            <PreachingSettingsScreen />
          </SettingsPageWrapper>
        );
      case 'application':
        return (
          <SettingsPageWrapper>
            <ApplicationSettingsScreen />
          </SettingsPageWrapper>
        );
      case 'account':
        return (
          <SettingsPageWrapper>
            <AccountSettingsScreen />
          </SettingsPageWrapper>
        );
      default:
        return (
          <View style={[styles.placeholder, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.placeholderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Select a settings category
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Navigation Tabs */}
      <ScrollView 
        horizontal 
        style={[styles.tabBar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarContent}
      >
        {settingsCategories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tab,
                isActive && {
                  backgroundColor: Colors[colorScheme ?? 'light'].primary + '15',
                  borderBottomWidth: 2,
                  borderBottomColor: Colors[colorScheme ?? 'light'].primary,
                },
              ]}
              onPress={() => onNavigate(category.id)}
              accessibilityLabel={category.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={category.icon}
                size={20}
                color={
                  isActive
                    ? Colors[colorScheme ?? 'light'].primary
                    : Colors[colorScheme ?? 'light'].textSecondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive
                      ? Colors[colorScheme ?? 'light'].primary
                      : Colors[colorScheme ?? 'light'].text,
                  },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Admin Tab (if admin) */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.tab, styles.adminTab]}
            onPress={() => onNavigate('admin')}
            accessibilityLabel="Admin Console"
            accessibilityRole="button"
          >
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={Colors[colorScheme ?? 'light'].primary}
            />
            <Text
              style={[
                styles.tabText,
                { color: Colors[colorScheme ?? 'light'].primary },
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Content Area */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabBarContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  adminTab: {
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    padding: 16,
    paddingBottom: 32, // Extra padding to account for footer
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
});
