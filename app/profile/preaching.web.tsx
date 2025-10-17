import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeProvider';
import { Colors } from '../../constants/Colors';

export default function PreachingSettingsScreen() {
  const { colorScheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Preaching Settings
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Configure preferences for sermons, reflections, and preaching content
        </Text>
      </View>

      {/* Coming Soon Card */}
      <View style={[styles.comingSoonCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <View style={[styles.iconContainer, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
          <Ionicons name="megaphone" size={48} color={Colors[colorScheme ?? 'light'].primary} />
        </View>
        <Text style={[styles.comingSoonTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Coming Soon
        </Text>
        <Text style={[styles.comingSoonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Preaching settings will be available in a future update. This will include:
        </Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="language-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Content language preferences
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="document-text-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Display preferences for sermons
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="bookmark-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Bookmark and favorite settings
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  comingSoonCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 500,
  },
  featureList: {
    gap: 16,
    alignSelf: 'stretch',
    maxWidth: 500,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    flex: 1,
  },
});

