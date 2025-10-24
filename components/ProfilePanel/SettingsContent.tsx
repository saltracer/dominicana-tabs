import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';

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
}

// Wrapper component to remove headers from settings pages
const SettingsPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <View style={styles.wrapper}>
      {children}
    </View>
  );
};

export default function SettingsContent({ activeCategory }: SettingsContentProps) {
  const { colorScheme } = useTheme();

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
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      showsVerticalScrollIndicator={false}
    >
      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
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
