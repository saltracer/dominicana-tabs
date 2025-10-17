import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeProvider';
import { Colors } from '../../constants/Colors';

export default function PreachingSettingsScreen() {
  const { colorScheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Preaching Settings
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Configure preferences for sermons, reflections, and preaching content
          </Text>

          {/* Coming Soon Card */}
          <View style={[styles.comingSoonCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={[styles.iconContainer, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
              <Ionicons name="megaphone" size={48} color={Colors[colorScheme ?? 'light'].primary} />
            </View>
            <Text style={[styles.comingSoonTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Coming Soon
            </Text>
            <Text style={[styles.comingSoonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Preaching settings will be available in a future update.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginBottom: 24,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 24,
  },
});

