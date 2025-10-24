import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface SettingsNavigationProps {
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

export default function SettingsNavigation({ activeCategory, onNavigate }: SettingsNavigationProps) {
  const { colorScheme } = useTheme();
  const { isAdmin } = useAdminAuth();

  return (
    <View style={[styles.container, { borderRightColor: Colors[colorScheme ?? 'light'].border }]}>
      <View style={styles.navigation}>
        {settingsCategories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.navItem,
                {
                  backgroundColor: isActive
                    ? Colors[colorScheme ?? 'light'].primary + '15'
                    : 'transparent',
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
                  styles.navText,
                  {
                    color: isActive
                      ? Colors[colorScheme ?? 'light'].primary
                      : Colors[colorScheme ?? 'light'].text,
                    fontWeight: isActive ? '600' : '400',
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

        {/* Admin Console Link (if admin) */}
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
                styles.navText,
                { color: Colors[colorScheme ?? 'light'].primary, fontWeight: '600' },
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    borderRightWidth: 1,
    backgroundColor: 'transparent',
  },
  navigation: {
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    gap: 12,
  },
  navText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  adminItem: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 16,
  },
});
