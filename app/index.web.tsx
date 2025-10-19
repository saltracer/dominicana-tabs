import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';
import Footer from '@/components/Footer.web';
import { useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/useMediaQuery';
import { spacing } from '@/constants/Spacing';

export default function Index() {
  const { colorScheme } = useTheme();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const fourPillars = [
    {
      title: 'Prayer',
      description: 'Deepen your spiritual life with the Liturgy of the Hours and the Holy Rosary.',
      icon: 'heart-outline',
      link: '/(tabs)/prayer',
      linkText: 'Explore Prayer Resources'
    },
    {
      title: 'Study',
      description: 'Access classical Catholic texts and theological resources in our digital library.',
      icon: 'library-outline',
      link: '/(tabs)/study',
      linkText: 'Browse Study Materials'
    },
    {
      title: 'Community',
      description: 'Explore the liturgical calendar, Dominican saints, and provincial territories.',
      icon: 'people-outline',
      link: '/(tabs)/community',
      linkText: 'Discover Our Community'
    },
    {
      title: 'Preaching',
      description: 'Find inspiration through daily reflections and preaching resources.',
      icon: 'chatbubble-outline',
      link: '/(tabs)/preaching',
      linkText: 'Access Preaching Materials'
    }
  ];

  return (
    <ScrollView 
      style={Object.assign({}, styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background })}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Hero Section */}
      <View style={Object.assign(
        {},
        styles.heroSection,
        isMobile ? styles.heroSectionMobile : {},
        isTablet ? styles.heroSectionTablet : {}
      )}>
        <Text style={Object.assign(
          {},
          styles.heroTitle, 
          isMobile ? styles.heroTitleMobile : {},
          isTablet ? styles.heroTitleTablet : {},
          { color: Colors[colorScheme ?? 'light'].primary }
        )}>
          Dominicana
        </Text>
        <Text style={Object.assign(
          {},
          styles.heroDescription,
          isMobile ? styles.heroDescriptionMobile : {},
          { color: Colors[colorScheme ?? 'light'].text }
        )}>
          A digital companion for the Order of Preachers supporting prayer, study, community, and preaching.
        </Text>
        
        <View style={Object.assign({}, styles.heroButtons, isMobile ? styles.heroButtonsMobile : {})}>
          <Link 
            href="/(tabs)/prayer"
            // @ts-ignore - className is web-only
            className="primary-button"
            style={Object.assign(
              {},
              styles.primaryButton,
              isMobile ? styles.primaryButtonMobile : {},
              { backgroundColor: Colors[colorScheme ?? 'light'].primary }
            )}
          >
            <Text style={Object.assign({}, styles.primaryButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite })}>
              Pray the Liturgy of Hours
            </Text>
          </Link>
          
          <TouchableOpacity
            // @ts-ignore - className is web-only
            className="secondary-button"
            style={Object.assign(
              {},
              styles.secondaryButton,
              isMobile ? styles.secondaryButtonMobile : {},
              { borderColor: Colors[colorScheme ?? 'light'].primary }
            )}
          >
            <Text style={Object.assign({}, styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].primary })}>
              View Today's Celebration
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Four Pillars Section */}
      <View style={Object.assign(
        {},
        styles.pillarsSection,
        isMobile ? styles.pillarsSectionMobile : {}
      )}>
        <Text style={Object.assign(
          {},
          styles.pillarsTitle,
          isMobile ? styles.pillarsTitleMobile : {},
          { color: Colors[colorScheme ?? 'light'].text }
        )}>
          The Four Pillars
        </Text>
        <View style={Object.assign({}, styles.pillarsAccent, { backgroundColor: Colors[colorScheme ?? 'light'].primary })} />
        
        <View style={Object.assign(
          {},
          styles.pillarsGrid,
          isMobile ? styles.pillarsGridMobile : {},
          isTablet ? styles.pillarsGridTablet : {}
        )}>
          {fourPillars.map((pillar, index) => (
            <Link key={index} href={pillar.link as any} asChild>
              <TouchableOpacity
                // @ts-ignore - className is web-only  
                className="pillar-card"
                style={Object.assign(
                  {},
                  styles.pillarCard,
                  isMobile ? styles.pillarCardMobile : {},
                  { backgroundColor: Colors[colorScheme ?? 'light'].card },
                  (hoveredCard === index && !isMobile) ? styles.pillarCardHover : {}
                )}
                {...(!isMobile && {
                  onMouseEnter: () => setHoveredCard(index),
                  onMouseLeave: () => setHoveredCard(null),
                } as any)}
                accessibilityLabel={`${pillar.title} - ${pillar.description}`}
                accessibilityRole="link"
              >
                <Ionicons 
                  name={pillar.icon as any} 
                  size={isMobile ? 40 : 32} 
                  color={Colors[colorScheme ?? 'light'].primary} 
                  style={styles.pillarIcon}
                />
                <Text style={Object.assign(
                  {},
                  styles.pillarTitle,
                  isMobile ? styles.pillarTitleMobile : {},
                  { color: Colors[colorScheme ?? 'light'].primary }
                )}>
                  {pillar.title}
                </Text>
                <Text style={Object.assign(
                  {},
                  styles.pillarDescription,
                  isMobile ? styles.pillarDescriptionMobile : {},
                  { color: Colors[colorScheme ?? 'light'].text }
                )}>
                  {pillar.description}
                </Text>
                <View style={styles.pillarLink}>
                  <Text style={Object.assign(
                    {},
                    styles.pillarLinkText,
                    { color: Colors[colorScheme ?? 'light'].primary }
                  )}>
                    {pillar.linkText}
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={14} 
                    color={Colors[colorScheme ?? 'light'].primary} 
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>
            </Link>
          ))}
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl + spacing.xl, // 80px
    paddingHorizontal: spacing.lg,
  },
  heroSectionMobile: {
    paddingVertical: spacing.xxl - 8, // 40px
    paddingHorizontal: spacing.md,
  },
  heroSectionTablet: {
    paddingVertical: spacing.xxl + spacing.md, // 64px
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  heroTitleMobile: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  heroTitleTablet: {
    fontSize: 40,
    marginBottom: spacing.lg,
  },
  heroDescription: {
    fontSize: 20,
    marginBottom: spacing.xxl,
    textAlign: 'center',
    maxWidth: 600,
  },
  heroDescriptionMobile: {
    fontSize: 18,
    marginBottom: spacing.xl,
    maxWidth: '100%',
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroButtonsMobile: {
    flexDirection: 'column',
    width: '100%',
  },
  primaryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  primaryButtonMobile: {
    width: '100%',
    alignItems: 'center',
    minHeight: 48,
    marginRight: 0,
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderRadius: 8,
  },
  secondaryButtonMobile: {
    width: '100%',
    alignItems: 'center',
    minHeight: 48,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pillarsSection: {
    paddingVertical: spacing.xxl + spacing.xl, // 80px
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  pillarsSectionMobile: {
    paddingVertical: spacing.xxl - 8, // 40px
    paddingHorizontal: spacing.md,
  },
  pillarsTitle: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pillarsTitleMobile: {
    fontSize: 28,
    marginBottom: spacing.md,
  },
  pillarsAccent: {
    width: 60,
    height: 3,
    marginBottom: spacing.xxl,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'stretch',
    maxWidth: 1200,
    marginHorizontal: -12, // Negative margin for card spacing
  },
  pillarsGridMobile: {
    flexDirection: 'column',
    width: '100%',
    marginHorizontal: 0,
  },
  pillarsGridTablet: {
    marginHorizontal: -8,
  },
  pillarCard: {
    minWidth: 280,
    maxWidth: 320,
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    margin: 12, // Spacing between cards
  },
  pillarCardMobile: {
    minWidth: '100%',
    maxWidth: '100%',
    borderRadius: 12,
    padding: spacing.lg,
    margin: 0,
    marginBottom: spacing.md,
  },
  pillarCardHover: {
    transform: [{ translateY: -4 }],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  pillarIcon: {
    marginBottom: spacing.md,
  },
  pillarTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pillarTitleMobile: {
    fontSize: 22,
  },
  pillarDescription: {
    fontSize: 16,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 24,
  },
  pillarDescriptionMobile: {
    fontSize: 15,
    lineHeight: 22,
  },
  pillarLink: {
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarLinkText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
