/**
 * Community Landing Page - Web Only (Redesigned)
 * Information about the Dominican community pillar with navigation to resources
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

export default function CommunityIndexWeb() {
  const { colorScheme } = useTheme();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const resources = [
    {
      name: 'Liturgical Calendar',
      description: 'Explore the feasts and celebrations of the Church year',
      icon: 'calendar',
      route: '/(tabs)/community/calendar',
      color: Colors[colorScheme ?? 'light'].primary,
    },
    {
      name: 'Dominican Saints',
      description: 'Discover the holy men and women of the Dominican Order',
      icon: 'star',
      route: '/(tabs)/community/saints',
      color: Colors[colorScheme ?? 'light'].secondary,
    },
    {
      name: 'Dominican Provinces',
      description: 'Explore Dominican communities around the world',
      icon: 'globe',
      route: '/(tabs)/community/provinces',
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
          <View style={[styles.iconCircle, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}>
            <Ionicons name="people" size={isMobile ? 40 : 56} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          </View>
          <Text style={[
            styles.title,
            { color: Colors[colorScheme ?? 'light'].text },
            isMobile && styles.titleMobile
          ]}>
            Community
          </Text>
          <Text style={[
            styles.subtitle,
            { color: Colors[colorScheme ?? 'light'].textSecondary },
            isMobile && styles.subtitleMobile
          ]}>
            The Dominican Pillar of Communal Life
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
            From its founding, the Order of Preachers has been built on the foundation of communal life. 
            Saint Dominic established communities of friars who would live, pray, and study together, 
            supporting one another in their mission to preach the Gospel and save souls.
          </Text>
          
          <Text style={[
            styles.bodyText,
            { color: Colors[colorScheme ?? 'light'].text },
            isMobile && styles.bodyTextMobile
          ]}>
            Dominican community is not merely functional—it is integral to our identity. Living in community 
            allows us to grow in charity, practice humility, and discern God's will together. We form a global 
            community dedicated to bringing Christ to the world.
          </Text>
        </View>

        {/* Quote Section */}
        <View style={[
          styles.quoteSection,
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderLeftColor: Colors[colorScheme ?? 'light'].secondary,
          },
          isMobile && styles.quoteSectionMobile
        ]}>
          <Ionicons name="chatbox-ellipses-outline" size={32} color={Colors[colorScheme ?? 'light'].secondary} style={styles.quoteIcon} />
          <Text style={[
            styles.quoteText,
            { color: Colors[colorScheme ?? 'light'].text },
            isMobile && styles.quoteTextMobile
          ]}>
            "See how good and pleasant it is when brothers live together in unity!"
          </Text>
          <Text style={[
            styles.quoteAttribution,
            { color: Colors[colorScheme ?? 'light'].textSecondary }
          ]}>
            — Psalm 133:1
          </Text>
        </View>

        {/* Resources Grid */}
        <View style={styles.resourcesSection}>
          <Text style={[
            styles.sectionTitle,
            { color: Colors[colorScheme ?? 'light'].text },
            isMobile && styles.sectionTitleMobile
          ]}>
            Explore Community Resources
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
                    color={Colors[colorScheme ?? 'light'].secondary}
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
