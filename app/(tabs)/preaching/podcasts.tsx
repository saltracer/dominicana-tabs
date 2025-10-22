/**
 * Podcasts Page - Native
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { PreachingStyles } from '../../../styles';
import PreachingNavigation from '../../../components/PreachingNavigation';

export default function PodcastsScreen() {
  const { colorScheme } = useTheme();

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} 
      edges={['left', 'right']}
    >
      {/* Navigation Control */}
      <PreachingNavigation activeTab="podcasts" />

      {/* Content */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={styles.contentContainer}>
          <View style={styles.placeholderContainer}>
            <View style={[styles.iconCircle, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <Ionicons name="mic" size={64} color={Colors[colorScheme ?? 'light'].primary} />
            </View>
            
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Podcasts
            </Text>
            
            <Text style={[styles.comingSoon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Coming Soon
            </Text>
            
            <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              We're working on bringing you homilies, spiritual talks, and theological discussions from 
              Dominican friars around the world. Check back soon for inspiring audio content.
            </Text>

            <View style={[styles.featureList, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.featureTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                What's Coming:
              </Text>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Weekly homilies from Dominican preachers
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Theological discussions and lectures
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Spiritual reflections and meditations
                </Text>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Lives of Dominican saints
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...PreachingStyles,
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoon: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 40,
  },
  featureList: {
    padding: 24,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    flex: 1,
  },
});

