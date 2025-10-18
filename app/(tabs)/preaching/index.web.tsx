/**
 * Preaching Landing Page - Web Only
 * Information about the Dominican preaching pillar with navigation to resources
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { GlobalStyles } from '../../../styles';
import Footer from '../../../components/Footer.web';

export default function PreachingIndexWeb() {
  const { colorScheme } = useTheme();

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} 
      edges={['left', 'right']}
    >
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Ionicons name="chatbubble" size={48} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          </View>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Preaching
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            The Dominican Pillar of Proclamation
          </Text>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Saint Dominic founded the Order of Preachers with one primary mission: to preach the Gospel and 
            combat heresy through the proclamation of truth. The very name of our Order—Order of Preachers—
            reflects this fundamental charism. We are called above all else to be heralds of Christ, bringing 
            the light of the Gospel to a world in need of divine truth.
          </Text>
          
          <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Dominican preaching is not merely an activity but flows from the whole of our life. Through prayer, 
            study, and community life, we prepare ourselves to share the fruits of our contemplation with others. 
            Our preaching takes many forms—from the pulpit to the classroom, from spiritual direction to the 
            written word, and now through digital media.
          </Text>

          <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            The Dominican tradition of preaching emphasizes clarity, truth, and charity. We seek to understand 
            deeply before we speak, to proclaim the truth with confidence yet humility, and to do so always in 
            service of salvation. This sacred task remains as urgent today as it was in the 13th century.
          </Text>
        </View>

        {/* Quote Section */}
        <View style={[styles.quoteCard, { 
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderLeftColor: Colors[colorScheme ?? 'light'].primary,
        }]}>
          <Ionicons name="quote" size={24} color={Colors[colorScheme ?? 'light'].primary} style={styles.quoteIcon} />
          <Text style={[styles.quoteText, { color: Colors[colorScheme ?? 'light'].text }]}>
            "Go forth and set the world on fire."
          </Text>
          <Text style={[styles.quoteAttribution, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            — Saint Dominic
          </Text>
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Preaching Resources
          </Text>
          
          <TouchableOpacity
            style={[
              styles.resourceCard,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderColor: Colors[colorScheme ?? 'light'].border,
              }
            ]}
            onPress={() => router.push('/(tabs)/preaching/podcasts')}
            activeOpacity={0.7}
          >
            <View style={styles.resourceContent}>
              <View style={[styles.resourceIcon, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}>
                <Ionicons 
                  name="mic" 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].background}
                />
              </View>
              <View style={styles.resourceText}>
                <Text style={[styles.resourceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Podcasts
                </Text>
                <Text style={[styles.resourceDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Listen to homilies and teachings from Dominican friars
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={Colors[colorScheme ?? 'light'].textSecondary}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resourceCard,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderColor: Colors[colorScheme ?? 'light'].border,
              }
            ]}
            onPress={() => router.push('/(tabs)/preaching/blogs')}
            activeOpacity={0.7}
          >
            <View style={styles.resourceContent}>
              <View style={[styles.resourceIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <Ionicons 
                  name="document-text" 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].background}
                />
              </View>
              <View style={styles.resourceText}>
                <Text style={[styles.resourceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Blog & Reflections
                </Text>
                <Text style={[styles.resourceDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Read theological reflections and spiritual writings
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={Colors[colorScheme ?? 'light'].textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 26,
  },
  contentSection: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    maxWidth: 800,
    alignSelf: 'center',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Georgia',
    marginBottom: 20,
    textAlign: 'justify',
  },
  quoteCard: {
    marginHorizontal: 32,
    marginVertical: 24,
    padding: 24,
    borderRadius: 12,
    borderLeftWidth: 4,
    maxWidth: 800,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quoteIcon: {
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  quoteAttribution: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'right',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  resourceCard: {
    marginHorizontal: 32,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 800,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  resourceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resourceText: {
    flex: 1,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Georgia',
  },
});
