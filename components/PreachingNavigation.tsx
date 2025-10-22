import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface PreachingNavigationProps {
  activeTab: 'podcasts' | 'blogs';
}

// Define the tab order for proper navigation direction
const TAB_ORDER = ['podcasts', 'blogs'] as const;

export default function PreachingNavigation({ activeTab }: PreachingNavigationProps) {
  const { colorScheme } = useTheme();
  const router = useRouter();

  const handleTabPress = (tab: string) => {
    if (tab === activeTab) return; // Don't navigate to the same tab
    
    // Use replace instead of push for lateral tab navigation
    // This prevents building up a navigation stack and provides cleaner transitions
    router.replace(`/(tabs)/preaching/${tab}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
      <TouchableOpacity
        style={[
          styles.segment,
          {
            backgroundColor: activeTab === 'podcasts'
              ? Colors[colorScheme ?? 'light'].primary
              : 'transparent',
          },
          styles.firstSegment,
        ]}
        onPress={() => handleTabPress('podcasts')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.segmentText,
          {
            color: activeTab === 'podcasts'
              ? Colors[colorScheme ?? 'light'].textOnRed
              : Colors[colorScheme ?? 'light'].text,
          }
        ]}>
          Podcasts
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.segment,
          {
            backgroundColor: activeTab === 'blogs'
              ? Colors[colorScheme ?? 'light'].primary
              : 'transparent',
          },
          styles.lastSegment,
        ]}
        onPress={() => handleTabPress('blogs')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.segmentText,
          {
            color: activeTab === 'blogs'
              ? Colors[colorScheme ?? 'light'].textOnRed
              : Colors[colorScheme ?? 'light'].text,
          }
        ]}>
          Blogs
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 2,
    elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  firstSegment: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  lastSegment: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

