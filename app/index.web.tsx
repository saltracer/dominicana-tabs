import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';
import Footer from '@/components/Footer.web';

export default function Index() {
  const { colorScheme } = useTheme();

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
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={[styles.heroTitle, { color: Colors[colorScheme ?? 'light'].primary }]}>
          Dominicana
        </Text>
        <Text style={[styles.heroDescription, { color: Colors[colorScheme ?? 'light'].text }]}>
          A digital companion for the Order of Preachers supporting prayer, study, community, and preaching.
        </Text>
        
        <View style={styles.heroButtons}>
          <Link href="/(tabs)/prayer" style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Text style={[styles.primaryButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Pray the Liturgy of Hours
            </Text>
          </Link>
          
          <TouchableOpacity style={[styles.secondaryButton, { borderColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              View Today's Celebration
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Four Pillars Section */}
      <View style={styles.pillarsSection}>
        <Text style={[styles.pillarsTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          The Four Pillars
        </Text>
        <View style={[styles.pillarsAccent, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} />
        
        <View style={styles.pillarsGrid}>
          {fourPillars.map((pillar, index) => (
            <TouchableOpacity key={index} style={[styles.pillarCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Ionicons 
                name={pillar.icon as any} 
                size={32} 
                color={Colors[colorScheme ?? 'light'].primary} 
                style={styles.pillarIcon}
              />
              <Text style={[styles.pillarTitle, { color: Colors[colorScheme ?? 'light'].primary }]}>
                {pillar.title}
              </Text>
              <Text style={[styles.pillarDescription, { color: Colors[colorScheme ?? 'light'].text }]}>
                {pillar.description}
              </Text>
              <Link href={pillar.link as any} style={styles.pillarLink}>
                <Text style={[styles.pillarLinkText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  {pillar.linkText}
                </Text>
              </Link>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 24,
  },
  heroDescription: {
    fontSize: 20,
    marginBottom: 48,
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginRight: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pillarsSection: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  pillarsTitle: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 16,
  },
  pillarsAccent: {
    width: 60,
    height: 3,
    marginBottom: 48,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillarCard: {
    minWidth: 280,
    padding: 32,
    alignItems: 'center',
    margin: 12,
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
  },
  pillarIcon: {
    marginBottom: 16,
  },
  pillarTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  pillarDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  pillarLink: {
    paddingVertical: 8,
  },
  pillarLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
