/**
 * Study Landing Page - Web Only
 * Information about the Dominican study pillar with navigation to resources
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
import { StudyStyles } from '../../../styles';
import Footer from '../../../components/Footer.web';

export default function StudyIndexWeb() {
  const { colorScheme } = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ flexGrow: 1 }}
    >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Ionicons name="book" size={48} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          </View>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Study
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            The Dominican Pillar of Intellectual Life
          </Text>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            The Order of Preachers was founded on the principle that effective preaching requires deep study and 
            understanding of Sacred Scripture, theology, and philosophy. Saint Dominic recognized that to preach 
            the Gospel authentically, his friars needed to be thoroughly educated in the truths of the faith.
          </Text>
          
          <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            From the earliest days of the Order, Dominicans have been at the forefront of theological and 
            philosophical inquiry. Great teachers like Saint Thomas Aquinas and Saint Albert the Great exemplify 
            the Dominican commitment to pursuing truth through rigorous intellectual engagement with Scripture, 
            tradition, and reason.
          </Text>

          <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
            This pillar of Dominican life remains as vital today as it was in the 13th century. Through prayer, 
            study, and contemplation of divine truth, we prepare ourselves to preach with wisdom and authority.
          </Text>
        </View>

        {/* Quote Section */}
        <View style={[styles.quoteCard, { 
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderLeftColor: Colors[colorScheme ?? 'light'].primary,
        }]}>
          <Ionicons name="quote" size={24} color={Colors[colorScheme ?? 'light'].primary} style={styles.quoteIcon} />
          <Text style={[styles.quoteText, { color: Colors[colorScheme ?? 'light'].text }]}>
            "To contemplate and to give to others the fruits of contemplation."
          </Text>
          <Text style={[styles.quoteAttribution, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            — Dominican Motto
          </Text>
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Study Resources
          </Text>
          
          <TouchableOpacity
            style={[
              styles.resourceCard,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderColor: Colors[colorScheme ?? 'light'].border,
              }
            ]}
            onPress={() => router.push('/(tabs)/study/bible')}
            activeOpacity={0.7}
          >
            <View style={styles.resourceContent}>
              <View style={[styles.resourceIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <Ionicons 
                  name="book" 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].background}
                />
              </View>
              <View style={styles.resourceText}>
                <Text style={[styles.resourceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Holy Bible
                </Text>
                <Text style={[styles.resourceDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Read and study Sacred Scripture with the Douay-Rheims translation
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
            onPress={() => router.push('/(tabs)/study/library')}
            activeOpacity={0.7}
          >
            <View style={styles.resourceContent}>
              <View style={[styles.resourceIcon, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}>
                <Ionicons 
                  name="library" 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].background}
                />
              </View>
              <View style={styles.resourceText}>
                <Text style={[styles.resourceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Catholic Library
                </Text>
                <Text style={[styles.resourceDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Browse classic works of theology, philosophy, and spirituality
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
  ...StudyStyles,
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

