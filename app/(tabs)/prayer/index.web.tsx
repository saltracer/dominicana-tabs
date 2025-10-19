/**
 * Prayer Landing Page - Web Only
 * Information about the Dominican prayer pillar with navigation to resources
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
import { PrayerStyles } from '../../../styles';
import Footer from '../../../components/Footer.web';

export default function PrayerIndexWeb() {
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
          <Ionicons name="heart" size={48} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
        </View>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Prayer
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          The Dominican Pillar of Spiritual Life
        </Text>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Prayer is the lifeblood of Dominican life. From the very beginning, Saint Dominic exemplified 
          the centrality of prayer in the life of a preacher. He was known to spend entire nights in prayer, 
          interceding for sinners and drawing strength from communion with God. His deep prayer life became 
          the wellspring from which his powerful preaching flowed.
        </Text>
        
        <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
          The Dominican tradition of prayer is rich and diverse, encompassing both liturgical and personal 
          devotions. The Liturgy of the Hours forms the backbone of our communal prayer, sanctifying each 
          moment of the day. The Holy Rosary, entrusted to Saint Dominic by Our Lady herself, remains a 
          treasured meditation on the mysteries of Christ's life, death, and resurrection.
        </Text>

        <Text style={[styles.bodyText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Through faithful prayer, we open ourselves to receive grace, deepen our relationship with God, 
          and prepare our hearts to share the Gospel with others. Prayer is not separate from our preaching—
          it is the very foundation that makes authentic proclamation of truth possible.
        </Text>
      </View>

      {/* Quote Section */}
      <View style={[styles.quoteCard, { 
        backgroundColor: Colors[colorScheme ?? 'light'].card,
        borderLeftColor: Colors[colorScheme ?? 'light'].primary,
      }]}>
        <Ionicons name="chatbox-ellipses" size={24} color={Colors[colorScheme ?? 'light'].primary} style={styles.quoteIcon} />
        <Text style={[styles.quoteText, { color: Colors[colorScheme ?? 'light'].text }]}>
          "Speak with God before you speak about God."
        </Text>
        <Text style={[styles.quoteAttribution, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          — Dominican Wisdom
        </Text>
      </View>

      {/* Resources Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Prayer Resources
        </Text>
        
        <TouchableOpacity
          style={[
            styles.resourceCard,
            { 
              backgroundColor: Colors[colorScheme ?? 'light'].card,
              borderColor: Colors[colorScheme ?? 'light'].border,
            }
          ]}
          onPress={() => router.push('/(tabs)/prayer/liturgy')}
          activeOpacity={0.7}
        >
          <View style={styles.resourceContent}>
            <View style={[styles.resourceIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
              <Ionicons 
                name="time" 
                size={24} 
                color={Colors[colorScheme ?? 'light'].background}
              />
            </View>
            <View style={styles.resourceText}>
              <Text style={[styles.resourceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                Liturgy of the Hours
              </Text>
              <Text style={[styles.resourceDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Pray the official prayer of the Church throughout the day
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
          onPress={() => router.push('/(tabs)/prayer/rosary')}
          activeOpacity={0.7}
        >
          <View style={styles.resourceContent}>
            <View style={[styles.resourceIcon, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}>
              <Ionicons 
                name="flower" 
                size={24} 
                color={Colors[colorScheme ?? 'light'].background}
              />
            </View>
            <View style={styles.resourceText}>
              <Text style={[styles.resourceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                Holy Rosary
              </Text>
              <Text style={[styles.resourceDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Meditate on the mysteries of Christ with the Dominican Rosary
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
          onPress={() => router.push('/(tabs)/prayer/devotions')}
          activeOpacity={0.7}
        >
          <View style={styles.resourceContent}>
            <View style={[styles.resourceIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
              <Ionicons 
                name="heart" 
                size={24} 
                color={Colors[colorScheme ?? 'light'].background}
              />
            </View>
            <View style={styles.resourceText}>
              <Text style={[styles.resourceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                Devotions
              </Text>
              <Text style={[styles.resourceDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Explore traditional Catholic prayers and devotional practices
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
  container: {
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

