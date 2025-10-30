import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import LiturgyPreferencesDropdown from '../../components/LiturgyPreferencesDropdown';
import LiturgyPreferencesToggle from '../../components/LiturgyPreferencesToggle';
import { UserLiturgyPreferencesService, UserLiturgyPreferencesData } from '../../services/UserLiturgyPreferencesService';
import { getUsage, deleteAll, getFeedUsage, deleteFeedData } from '../../lib/podcast/cache';
import { usePodcastSubscriptions } from '../../hooks/usePodcastSubscriptions';

export default function PreachingSettingsScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [liturgyPreferences, setLiturgyPreferences] = useState<UserLiturgyPreferencesData | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [usage, setUsage] = useState<{ audioBytes: number; imageBytes: number } | null>(null);
  const { subscriptions } = usePodcastSubscriptions();
  const [perFeedUsage, setPerFeedUsage] = useState<Record<string, { audioBytes: number; imageBytes: number }>>({});

  const availableOptions = UserLiturgyPreferencesService.getAvailableOptions();

  const loadLiturgyPreferences = async () => {
    if (!user?.id) return;
    
    setPreferencesLoading(true);
    try {
      const { cached, fresh } = await UserLiturgyPreferencesService.getUserPreferencesWithCache(user.id);
      if (cached) setLiturgyPreferences(cached);
      const freshPreferences = await fresh;
      if (freshPreferences) setLiturgyPreferences(freshPreferences);
    } catch (error) {
      console.error('Error loading liturgy preferences:', error);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const loadPodcastUsage = async () => {
    try {
      const u = await getUsage();
      setUsage(u);
    } catch (e) {
      console.warn('Failed to load podcast usage:', e);
    }
  };

  const loadPerFeedUsage = async () => {
    try {
      const entries: Record<string, { audioBytes: number; imageBytes: number }> = {};
      await Promise.all(
        subscriptions.map(async (p) => {
          const u = await getFeedUsage(p.id);
          entries[p.id] = u;
        })
      );
      setPerFeedUsage(entries);
    } catch (e) {
      console.warn('Failed to load per-feed usage:', e);
    }
  };

  const updateLiturgyPreference = async (key: keyof UserLiturgyPreferencesData, value: any) => {
    if (!user?.id || !liturgyPreferences) return;
    
    try {
      const updatedPreferences = { ...liturgyPreferences, [key]: value };
      setLiturgyPreferences(updatedPreferences);
      
      await UserLiturgyPreferencesService.updateUserPreferences(user.id, updatedPreferences);
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  useEffect(() => {
    loadLiturgyPreferences();
    loadPodcastUsage();
  }, [user?.id]);

  useEffect(() => {
    if (subscriptions.length) {
      loadPerFeedUsage();
    }
  }, [subscriptions]);

  if (preferencesLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading preferences...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!liturgyPreferences) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Unable to load preferences
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Preaching Settings
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Configure preferences for podcasts, sermons, and preaching content
          </Text>

          {/* Download Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Downloads
            </Text>

            <LiturgyPreferencesToggle
              label="Enable Downloads"
              description="Allow downloading podcast episodes for offline listening"
              value={liturgyPreferences.podcast_downloads_enabled ?? true}
              onValueChange={(value) => updateLiturgyPreference('podcast_downloads_enabled', value)}
              icon="download"
            />

            {liturgyPreferences.podcast_downloads_enabled && (
              <>
                <LiturgyPreferencesDropdown
                  label="Max Downloads"
                  description="Maximum number of episodes to keep downloaded"
                  value={liturgyPreferences.podcast_max_downloads ?? 10}
                  options={availableOptions.podcastMaxDownloads}
                  onValueChange={(value) => updateLiturgyPreference('podcast_max_downloads', value)}
                  icon="list"
                />

                <LiturgyPreferencesDropdown
                  label="Download Quality"
                  description="Audio quality for downloaded episodes"
                  value={liturgyPreferences.podcast_download_quality ?? 'high'}
                  options={availableOptions.podcastDownloadQualities}
                  onValueChange={(value) => updateLiturgyPreference('podcast_download_quality', value)}
                  icon="musical-notes"
                />

                <LiturgyPreferencesToggle
                  label="WiFi Only"
                  description="Only download episodes when connected to WiFi"
                  value={liturgyPreferences.podcast_wifi_only ?? true}
                  onValueChange={(value) => updateLiturgyPreference('podcast_wifi_only', value)}
                  icon="wifi"
                />

                <LiturgyPreferencesToggle
                  label="Auto-Download"
                  description="Automatically download new episodes from subscribed podcasts"
                  value={liturgyPreferences.podcast_auto_download ?? false}
                  onValueChange={(value) => updateLiturgyPreference('podcast_auto_download', value)}
                  icon="cloud-download"
                />
              </>
            )}
          </View>

          {/* Playback Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Playback
            </Text>

            <LiturgyPreferencesToggle
              label="Background Playback"
              description="Continue playing when app is in background"
              value={liturgyPreferences.podcast_background_playback ?? true}
              onValueChange={(value) => updateLiturgyPreference('podcast_background_playback', value)}
              icon="play-circle"
            />

            <LiturgyPreferencesToggle
              label="Auto-Play Next"
              description="Automatically play next episode when current one ends"
              value={liturgyPreferences.podcast_auto_play_next ?? false}
              onValueChange={(value) => updateLiturgyPreference('podcast_auto_play_next', value)}
              icon="play-skip-forward"
            />

            <LiturgyPreferencesDropdown
              label="Default Speed"
              description="Default playback speed for new episodes"
              value={liturgyPreferences.podcast_default_speed ?? 1.0}
              options={availableOptions.podcastSpeeds}
              onValueChange={(value) => updateLiturgyPreference('podcast_default_speed', value)}
              icon="speedometer"
            />
          </View>

        {/* Podcast Storage Usage Section */}
        <View style={styles.section}>
          <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Podcast Storage</Text>
          <View style={{ gap: 8 }}>
            <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}>
              Audio: {formatBytes(usage?.audioBytes || 0)}
            </Text>
            <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}>
              Images: {formatBytes(usage?.imageBytes || 0)}
            </Text>
          </View>
          <View style={{ height: 12 }} />
          <TouchableOpacity
            onPress={async () => {
              await deleteAll();
              await loadPodcastUsage();
              await loadPerFeedUsage();
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 12,
            }}
          >
            <Ionicons name="trash" size={18} color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].primary, fontFamily: 'Georgia', fontWeight: '600' }}>
              Delete all podcast data
            </Text>
          </TouchableOpacity>
        </View>

        {/* Per-Podcast Storage Section */}
        {subscriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.subsectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Per-Podcast Storage</Text>
            {subscriptions.map((p) => {
              const u = perFeedUsage[p.id] || { audioBytes: 0, imageBytes: 0 };
              return (
                <View key={p.id} style={{ paddingVertical: 8 }}>
                  <Text style={{ color: Colors[colorScheme ?? 'light'].text, fontFamily: 'Georgia', fontWeight: '600' }}>{p.title}</Text>
                  <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}>Audio: {formatBytes(u.audioBytes)} • Images: {formatBytes(u.imageBytes)}</Text>
                  <View style={{ flexDirection: 'row', gap: 16, paddingTop: 6 }}>
                    <TouchableOpacity
                      onPress={async () => {
                        await deleteFeedData(p.id, 'audio');
                        await loadPodcastUsage();
                        await loadPerFeedUsage();
                      }}
                    >
                      <Text style={{ color: Colors[colorScheme ?? 'light'].primary, fontFamily: 'Georgia' }}>Delete audio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        await deleteFeedData(p.id, 'images');
                        await loadPodcastUsage();
                        await loadPerFeedUsage();
                      }}
                    >
                      <Text style={{ color: Colors[colorScheme ?? 'light'].primary, fontFamily: 'Georgia' }}>Delete images</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
  section: {
    marginBottom: 32,
  },
  subsectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${sizes[i]}`;
}

