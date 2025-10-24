import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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

interface SettingsContentProps {
  activeCategory: string;
  isMobile?: boolean;
  onNavigate?: (category: string) => void;
}

// Wrapper component to remove headers from settings pages and fix layout for panel context
const SettingsPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ScrollView 
      style={styles.wrapper}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {children}
    </ScrollView>
  );
};

const settingsCategories = [
  { id: 'quick', label: 'Quick Settings', icon: 'flash' as const },
  { id: 'prayer', label: 'Prayer', icon: 'book' as const },
  { id: 'study', label: 'Study', icon: 'school' as const },
  { id: 'community', label: 'Community', icon: 'people' as const },
  { id: 'preaching', label: 'Preaching', icon: 'megaphone' as const },
  { id: 'application', label: 'Application', icon: 'settings' as const },
  { id: 'account', label: 'Account', icon: 'person' as const },
];

export default function SettingsContent({ activeCategory, isMobile = false, onNavigate }: SettingsContentProps) {
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

  const renderMobileNavigation = () => {
    if (!isMobile || !onNavigate) return null;

    return (
      <View style={[styles.mobileNav, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mobileNavContent}
        >
          {settingsCategories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.mobileNavItem,
                  {
                    backgroundColor: isActive
                      ? Colors[colorScheme ?? 'light'].primary + '15'
                      : 'transparent',
                    borderColor: isActive
                      ? Colors[colorScheme ?? 'light'].primary
                      : 'transparent',
                  },
                ]}
                onPress={() => onNavigate(category.id)}
                accessibilityLabel={category.label}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Ionicons
                  name={category.icon}
                  size={18}
                  color={
                    isActive
                      ? Colors[colorScheme ?? 'light'].primary
                      : Colors[colorScheme ?? 'light'].textSecondary
                  }
                />
                <Text
                  style={[
                    styles.mobileNavText,
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
              style={[styles.mobileNavItem, styles.adminMobileNavItem]}
              onPress={() => onNavigate('admin')}
              accessibilityLabel="Admin Console"
              accessibilityRole="button"
            >
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={Colors[colorScheme ?? 'light'].primary}
              />
              <Text
                style={[
                  styles.mobileNavText,
                  { color: Colors[colorScheme ?? 'light'].primary },
                ]}
              >
                Admin
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={[
      styles.container,
      isMobile && styles.containerMobile
    ]}>
      {renderMobileNavigation()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    minHeight: 0, // Important for flex scrolling
    margin: 16,
  },
  wrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 32, // Extra padding to account for footer
  },
  containerMobile: {
    paddingHorizontal: 8, // Reduce padding on mobile for more content space
  },
  mobileNav: {
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  mobileNavContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  mobileNavText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  adminMobileNavItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
    marginLeft: 8,
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
