/**
 * Community Landing Page - Web Only
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
import { GlobalStyles } from '../../../styles';
import Footer from '../../../components/Footer.web';

export default function CommunityIndexWeb() {
  const { colorScheme } = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ flexGrow: 1 }}
    >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}>
            <Ionicons name="people" size={48} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          </View>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Community
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            The Dominican Pillar of Communal Life
          </Text>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            From its founding, the Order of Preachers has been built on the foundation of communal life. 
            Saint Dominic established communities of friars who would live, pray, and study together, 
            supporting one another in their mission to preach the Gospel and save souls.
          </Text>
          
          <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Dominican community is not merely functional—it is integral to our identity. Living in community 
            allows us to grow in charity, practice humility, and discern God's will together. Through our 
            common life, we witness to the world the joy and power of Christian brotherhood and sisterhood, 
            united in Christ.
          </Text>

          <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            The Dominican family extends far beyond individual communities. We are part of a worldwide family 
            that includes friars, nuns, sisters, laity, and cooperators across every continent. United by our 
            common charism and devotion to preaching truth, we form a global community dedicated to bringing 
            Christ to the world.
          </Text>
        </View>

        {/* Quote Section */}
        <View style={[styles.quoteCard, { 
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderLeftColor: Colors[colorScheme ?? 'light'].secondary,
        }]}>
          <Ionicons name="chatbox-ellipses" size={24} color={Colors[colorScheme ?? 'light'].secondary} style={styles.quoteIcon} />
          <Text style={[styles.quoteText, { color: Colors[colorScheme ?? 'light'].text }]}>
            "See how good and pleasant it is when brothers live together in unity!"
          </Text>
          <Text style={[styles.quoteAttribution, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            — Psalm 133:1
          </Text>
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Community Resources
          </Text>
          
          <TouchableOpacity
            style={[
              styles.resourceCard,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderColor: Colors[colorScheme ?? 'light'].border,
              }
            ]}
            onPress={() => router.push('/(tabs)/community/calendar')}
            activeOpacity={0.7}
          >
            <View style={styles.resourceContent}>
              <View style={[styles.resourceIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <Ionicons 
                  name="calendar" 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].background}
                />
              </View>
              <View style={styles.resourceText}>
                <Text style={[styles.resourceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Liturgical Calendar
                </Text>
                <Text style={[styles.resourceDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Explore the feasts and celebrations of the Church year
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
            onPress={() => router.push('/(tabs)/community/saints')}
            activeOpacity={0.7}
          >
            <View style={styles.resourceContent}>
              <View style={[styles.resourceIcon, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}>
                <Ionicons 
                  name="star" 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].background}
                />
              </View>
              <View style={styles.resourceText}>
                <Text style={[styles.resourceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Dominican Saints
                </Text>
                <Text style={[styles.resourceDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Discover the holy men and women of the Dominican Order
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
            onPress={() => router.push('/(tabs)/community/provinces')}
            activeOpacity={0.7}
          >
            <View style={styles.resourceContent}>
              <View style={[styles.resourceIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <Ionicons 
                  name="globe" 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].background}
                />
              </View>
              <View style={styles.resourceText}>
                <Text style={[styles.resourceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Dominican Provinces
                </Text>
                <Text style={[styles.resourceDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Explore Dominican communities around the world
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

