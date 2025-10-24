import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface SettingsCategory {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface SettingsNavigationProps {
  activeCategory: string;
  onNavigate: (category: string) => void;
}

const settingsCategories: SettingsCategory[] = [
  { id: 'quick', label: 'Quick Settings', icon: 'flash', route: '/profile/quick' },
  { id: 'prayer', label: 'Prayer', icon: 'book', route: '/profile/prayer' },
  { id: 'study', label: 'Study', icon: 'school', route: '/profile/study' },
  { id: 'community', label: 'Community', icon: 'people', route: '/profile/community' },
  { id: 'preaching', label: 'Preaching', icon: 'megaphone', route: '/profile/preaching' },
  { id: 'application', label: 'Application', icon: 'settings', route: '/profile/application' },
  { id: 'account', label: 'Account', icon: 'person', route: '/profile/account' },
];

export default function SettingsNavigation({ activeCategory, onNavigate }: SettingsNavigationProps) {
  const { colorScheme } = useTheme();
  const { isAdmin } = useAdminAuth();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.navItems}>
        {settingsCategories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.navItem,
                isActive && {
                  backgroundColor: Colors[colorScheme ?? 'light'].primary + '15',
                  borderLeftWidth: 3,
                  borderLeftColor: Colors[colorScheme ?? 'light'].primary,
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
                  styles.navItemText,
                  {
                    color: isActive
                      ? Colors[colorScheme ?? 'light'].primary
                      : Colors[colorScheme ?? 'light'].text,
                  },
                ]}
              >
                {category.label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={
                  isActive
                    ? Colors[colorScheme ?? 'light'].primary
                    : Colors[colorScheme ?? 'light'].textSecondary
                }
              />
            </TouchableOpacity>
          );
        })}

        {/* Admin Link (if admin) */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.navItem, styles.adminItem]}
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
                styles.navItemText,
                { color: Colors[colorScheme ?? 'light'].primary },
              ]}
            >
              Admin Console
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors[colorScheme ?? 'light'].primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  navItems: {
    paddingVertical: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  navItemText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '500',
    flex: 1,
  },
  adminItem: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 16,
  },
});
