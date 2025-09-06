import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface CommunityNavigationProps {
  activeTab: 'calendar' | 'saints' | 'provinces';
}

export default function CommunityNavigation({ activeTab }: CommunityNavigationProps) {
  const { colorScheme } = useTheme();
  const router = useRouter();

  const handleTabPress = (tab: string) => {
    router.push(`/(tabs)/community/${tab}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
      <TouchableOpacity
        style={[
          styles.segment,
          {
            backgroundColor: activeTab === 'calendar'
              ? Colors[colorScheme ?? 'light'].primary
              : 'transparent',
          },
          styles.firstSegment,
        ]}
        onPress={() => handleTabPress('calendar')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.segmentText,
          {
            color: activeTab === 'calendar'
              ? Colors[colorScheme ?? 'light'].dominicanWhite
              : Colors[colorScheme ?? 'light'].text,
          }
        ]}>
          Calendar
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.segment,
          {
            backgroundColor: activeTab === 'saints'
              ? Colors[colorScheme ?? 'light'].primary
              : 'transparent',
          }
        ]}
        onPress={() => handleTabPress('saints')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.segmentText,
          {
            color: activeTab === 'saints'
              ? Colors[colorScheme ?? 'light'].dominicanWhite
              : Colors[colorScheme ?? 'light'].text,
          }
        ]}>
          Saints
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.segment,
          {
            backgroundColor: activeTab === 'provinces'
              ? Colors[colorScheme ?? 'light'].primary
              : 'transparent',
          },
          styles.lastSegment,
        ]}
        onPress={() => handleTabPress('provinces')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.segmentText,
          {
            color: activeTab === 'provinces'
              ? Colors[colorScheme ?? 'light'].dominicanWhite
              : Colors[colorScheme ?? 'light'].text,
          }
        ]}>
          Provinces
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
