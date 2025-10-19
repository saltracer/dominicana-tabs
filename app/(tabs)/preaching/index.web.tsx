/**
 * Preaching Landing Page - Web Only (Redesigned)
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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useIsMobile, useIsTablet } from '../../../hooks/useMediaQuery';
import { spacing } from '../../../constants/Spacing';
import Footer from '../../../components/Footer.web';

export default function PreachingIndexWeb() {
  const { colorScheme } = useTheme();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const resources = [
    {
      name: 'Podcasts',
      description: 'Listen to homilies and teachings from Dominican friars',
      icon: 'mic',
      route: '/(tabs)/preaching/podcasts',
      color: Colors[colorScheme ?? 'light'].secondary,
    },
    {
      name: 'Blog & Reflections',
      description: 'Read theological reflections and spiritual writings',
      icon: 'document-text',
      route: '/(tabs)/preaching/blogs',
      color: Colors[colorScheme ?? 'light'].primary,
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Hero Section */}
      <View style={[
        styles.hero,
        { backgroundColor: Colors[colorScheme ?? 'light'].lightBackground },
        isMobile && styles.heroMobile
      ]}>
        <View style={[styles.heroContent, isMobile && styles.heroContentMobile]}>
          <View style={[styles.iconCircle, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Ionicons name="chatbubble" size={isMobile ? 40 : 56} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          </View>
          <Text style={[
            styles.title,
            { color: Colors[colorScheme ?? 'light'].text },
            isMobile && styles.titleMobile
          ]}>
            Preaching
          </Text>
          <Text style={[
            styles.subtitle,
            { color: Colors[colorScheme ?? 'light'].textSecondary },
            isMobile && styles.subtitleMobile
          ]}>
            The Dominican Pillar of Proclamation
          </Text>
        </View>
      </View>

      {/* Main Content Container */}
      <View style={[
        styles.mainContent,
        isMobile && styles.mainContentMobile
      ]}>
        {/* Introduction Section */}
        <View style={[styles.introSection, isMobile && styles.introSectionMobile]}>
          <Text style={[
            styles.introText,
            { color: Colors[colorScheme ?? 'light'].text },
            isMobile && styles.introTextMobile
          ]}>
            Saint Dominic founded the Order of Preachers with one primary mission: to preach the Gospel and 
            combat heresy through the proclamation of truth. The very name of our Order—Order of Preachers—
            reflects this fundamental charism. We are called above all else to be heralds of Christ.
          </Text>
          
          <Text style={[
            styles.bodyText,
            { color: Colors[colorScheme ?? 'light'].text },
            isMobile && styles.bodyTextMobile
          ]}>
            Dominican preaching flows from the whole of our life. Through prayer, study, and community life, 
            we prepare ourselves to share the fruits of our contemplation with others. The Dominican tradition 
            of preaching emphasizes clarity, truth, and charity.
          </Text>
        </View>

        {/* Quote Section */}
        <View style={[
          styles.quoteSection,
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderLeftColor: Colors[colorScheme ?? 'light'].primary,
          },
          isMobile && styles.quoteSectionMobile
        ]}>
          <Ionicons name="chatbox-ellipses-outline" size={32} color={Colors[colorScheme ?? 'light'].primary} style={styles.quoteIcon} />
          <Text style={[
            styles.quoteText,
            { color: Colors[colorScheme ?? 'light'].text },
            isMobile && styles.quoteTextMobile
          ]}>
            "Go forth and set the world on fire."
          </Text>
          <Text style={[
            styles.quoteAttribution,
            { color: Colors[colorScheme ?? 'light'].textSecondary }
          ]}>
            — Saint Dominic
          </Text>
        </View>

        {/* Resources Grid */}
        <View style={styles.resourcesSection}>
          <Text style={[
            styles.sectionTitle,
            { color: Colors[colorScheme ?? 'light'].text },
            isMobile && styles.sectionTitleMobile
          ]}>
            Explore Preaching Resources
          </Text>
          
          <View style={[
            styles.resourcesGrid,
            isMobile && styles.resourcesGridMobile,
            isTablet && !isMobile && styles.resourcesGridTablet
          ]}>
            {resources.map((resource, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.resourceCard,
                  { 
                    backgroundColor: Colors[colorScheme ?? 'light'].card,
                    borderColor: Colors[colorScheme ?? 'light'].border,
                  },
                  isMobile && styles.resourceCardMobile
                ]}
                onPress={() => router.push(resource.route as any)}
                activeOpacity={0.7}
                // @ts-ignore - web only
                className="resource-card"
              >
                <View style={[styles.resourceIconLarge, { backgroundColor: resource.color }]}>
                  <Ionicons 
                    name={resource.icon as any} 
                    size={32} 
                    color={Colors[colorScheme ?? 'light'].dominicanWhite}
                  />
                </View>
                <Text style={[
                  styles.resourceName,
                  { color: Colors[colorScheme ?? 'light'].text },
                  isMobile && styles.resourceNameMobile
                ]}>
                  {resource.name}
                </Text>
                <Text style={[
                  styles.resourceDescription,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                  isMobile && styles.resourceDescriptionMobile
                ]}>
                  {resource.description}
                </Text>
                <View style={styles.resourceArrow}>
                  <Ionicons 
                    name="arrow-forward" 
                    size={20} 
                    color={Colors[colorScheme ?? 'light'].primary}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Hero Section
  hero: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  heroMobile: {
    paddingVertical: spacing.xl, // 32px
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxl + spacing.md, // 64px
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl, // 32px
  },
  heroContentMobile: {
    paddingVertical: spacing.xl, // 32px
    paddingHorizontal: spacing.lg, // 24px
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg, // 24px
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: spacing.sm, // 8px
    textAlign: 'center',
  },
  titleMobile: {
    fontSize: 36,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 28,
  },
  subtitleMobile: {
    fontSize: 18,
    lineHeight: 26,
  },
  
  // Main Content
  mainContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl, // 32px
    paddingVertical: spacing.xxl, // 48px
  },
  mainContentMobile: {
    paddingHorizontal: spacing.lg, // 24px
    paddingVertical: spacing.xl, // 32px
  },
  
  // Introduction
  introSection: {
    marginBottom: spacing.xxl, // 48px
  },
  introSectionMobile: {
    marginBottom: spacing.xl, // 32px
  },
  introText: {
    fontSize: 20,
    lineHeight: 32,
    fontFamily: 'Georgia',
    marginBottom: spacing.lg, // 24px
    fontWeight: '500',
  },
  introTextMobile: {
    fontSize: 18,
    lineHeight: 28,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Georgia',
  },
  bodyTextMobile: {
    fontSize: 16,
    lineHeight: 24,
  },
  
  // Quote Section
  quoteSection: {
    padding: spacing.xl, // 32px
    borderRadius: 16,
    borderLeftWidth: 6,
    marginBottom: spacing.xxl + spacing.md, // 64px
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  quoteSectionMobile: {
    padding: spacing.lg, // 24px
    borderRadius: 12,
    marginBottom: spacing.xl, // 32px
  },
  quoteIcon: {
    marginBottom: spacing.md, // 16px
  },
  quoteText: {
    fontSize: 24,
    lineHeight: 36,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    marginBottom: spacing.md, // 16px
  },
  quoteTextMobile: {
    fontSize: 20,
    lineHeight: 30,
  },
  quoteAttribution: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'right',
  },
  
  // Resources Section
  resourcesSection: {
    marginBottom: spacing.xl, // 32px
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: spacing.xl, // 32px
    textAlign: 'center',
  },
  sectionTitleMobile: {
    fontSize: 28,
    marginBottom: spacing.lg, // 24px
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm, // -8px (for gap)
  },
  resourcesGridMobile: {
    flexDirection: 'column',
    marginHorizontal: 0,
  },
  resourcesGridTablet: {
    justifyContent: 'center',
  },
  resourceCard: {
    width: '48%',
    marginHorizontal: spacing.sm, // 8px
    marginBottom: spacing.md, // 16px
    padding: spacing.xl, // 32px
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    alignItems: 'center',
  },
  resourceCardMobile: {
    width: '100%',
    marginHorizontal: 0,
    padding: spacing.lg, // 24px
  },
  resourceIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg, // 24px
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resourceName: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: spacing.sm, // 8px
    textAlign: 'center',
  },
  resourceNameMobile: {
    fontSize: 20,
  },
  resourceDescription: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: spacing.md, // 16px
  },
  resourceDescriptionMobile: {
    fontSize: 14,
    lineHeight: 20,
  },
  resourceArrow: {
    marginTop: 'auto',
  },
});
