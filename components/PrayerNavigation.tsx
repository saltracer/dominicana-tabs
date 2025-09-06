import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface PrayerNavigationProps {
  activeTab: 'liturgy' | 'rosary' | 'devotions';
}

export default function PrayerNavigation({ activeTab }: PrayerNavigationProps) {
  const { colorScheme } = useTheme();
  const router = useRouter();

  const handleTabPress = (tab: string) => {
    router.push(`/(tabs)/prayer/${tab}` as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
      <TouchableOpacity
        style={[
          styles.segment,
          {
            backgroundColor: activeTab === 'liturgy'
              ? Colors[colorScheme ?? 'light'].primary
              : 'transparent',
          },
          styles.firstSegment,
        ]}
        onPress={() => handleTabPress('liturgy')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.segmentText,
          {
            color: activeTab === 'liturgy'
              ? Colors[colorScheme ?? 'light'].dominicanWhite
              : Colors[colorScheme ?? 'light'].text,
          }
        ]}>
          Liturgy
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.segment,
          {
            backgroundColor: activeTab === 'rosary'
              ? Colors[colorScheme ?? 'light'].primary
              : 'transparent',
          }
        ]}
        onPress={() => handleTabPress('rosary')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.segmentText,
          {
            color: activeTab === 'rosary'
              ? Colors[colorScheme ?? 'light'].dominicanWhite
              : Colors[colorScheme ?? 'light'].text,
          }
        ]}>
          Rosary
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.segment,
          {
            backgroundColor: activeTab === 'devotions'
              ? Colors[colorScheme ?? 'light'].primary
              : 'transparent',
          },
          styles.lastSegment,
        ]}
        onPress={() => handleTabPress('devotions')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.segmentText,
          {
            color: activeTab === 'devotions'
              ? Colors[colorScheme ?? 'light'].dominicanWhite
              : Colors[colorScheme ?? 'light'].text,
          }
        ]}>
          Devotions
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
