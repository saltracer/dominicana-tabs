import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import LiturgyPreferencesDropdown from '../../components/LiturgyPreferencesDropdown';
import LiturgyPreferencesToggle from '../../components/LiturgyPreferencesToggle';
import { UserLiturgyPreferencesService, UserLiturgyPreferencesData } from '../../services/UserLiturgyPreferencesService';
import { useCacheStats } from '../../hooks/useCache';
import { formatBytes } from '../../services/cache/CacheUtils';
import { RosaryAudioDownloadService } from '../../services/RosaryAudioDownloadService';
import { CACHE_CONFIG } from '../../services/cache/CacheConstants';


export default function AppSettingsScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [liturgyPreferences, setLiturgyPreferences] = useState<UserLiturgyPreferencesData | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  // Audio cache state
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [cachedFiles, setCachedFiles] = useState<Array<{ voice: string; fileName: string }>>([]);

  // Book cache stats
  const {
    stats: bookCacheStats,
    loading: cacheLoading,
    refresh: refreshCacheStats,
    clearCoverArt,
    clearEpubs,
  } = useCacheStats();

  const availableOptions = UserLiturgyPreferencesService.getAvailableOptions();

  const loadLiturgyPreferences = async () => {
    if (!user?.id) return;
    
    setPreferencesLoading(true);
    try {
      const preferences = await UserLiturgyPreferencesService.getUserPreferences(user.id);
      setLiturgyPreferences(preferences);
    } catch (error) {
      console.error('Error loading liturgy preferences:', error);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const updateLiturgyPreference = async (key: keyof UserLiturgyPreferencesData, value: any) => {
    if (!user?.id || !liturgyPreferences) return;

    try {
      const updatedPreferences = { ...liturgyPreferences, [key]: value };
      setLiturgyPreferences(updatedPreferences);
      
      await UserLiturgyPreferencesService.updateUserPreferences(user.id, {
        [key]: value,
      });
    } catch (error) {
      console.error('Error updating liturgy preference:', error);
    }
  };

  useEffect(() => {
    loadLiturgyPreferences();
  }, [user?.id]);

  // Load audio cache info
  useEffect(() => {
    loadCacheInfo();
  }, []);

  const loadCacheInfo = async () => {
    try {
      const size = await RosaryAudioDownloadService.getCacheSize();
      const files = await RosaryAudioDownloadService.getCachedFiles();
      setCacheSize(size);
      setCachedFiles(files);
    } catch (error) {
      console.error('Error loading cache info:', error);
    }
  };

  const handleClearAllCache = async () => {
    Alert.alert(
      'Clear All Audio Cache',
      `This will delete all cached rosary audio files (${(cacheSize / 1024 / 1024).toFixed(2)} MB). They will be downloaded again when needed. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await RosaryAudioDownloadService.clearCache();
              await loadCacheInfo();
              Alert.alert('Success', 'All audio cache cleared successfully.');
            } catch (error) {
              console.error('Error clearing audio cache:', error);
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearVoiceCache = async () => {
    const currentVoice = liturgyPreferences?.rosary_voice || 'alphonsus';
    
    // Count files for this voice
    const voiceFiles = cachedFiles.filter(f => f.voice === currentVoice);
    
    if (voiceFiles.length === 0) {
      Alert.alert('No Cache', `No cached files found for voice "${currentVoice}".`);
      return;
    }

    Alert.alert(
      'Clear Voice Cache',
      `This will delete ${voiceFiles.length} cached file(s) for voice "${currentVoice}". They will be downloaded again when needed. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Voice',
          style: 'destructive',
          onPress: async () => {
            try {
              await RosaryAudioDownloadService.clearVoiceCache(currentVoice);
              await loadCacheInfo();
              Alert.alert('Success', `Cache cleared for voice "${currentVoice}".`);
            } catch (error) {
              console.error('Error clearing voice cache:', error);
              Alert.alert('Error', 'Failed to clear voice cache.');
            }
          },
        },
      ]
    );
  };

  const handleClearCoverArt = async () => {
    const count = bookCacheStats?.covers.count || 0;
    const size = formatBytes(bookCacheStats?.covers.totalSize || 0);
    
    if (count === 0) {
      Alert.alert('No Cache', 'No cached cover art found.');
      return;
    }
    
    Alert.alert(
      'Clear Cover Art Cache',
      `This will delete all cached book cover images (${count} images, ${size}). They will be downloaded again when needed. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCoverArt();
              await refreshCacheStats();
              Alert.alert('Success', 'Cover art cache cleared successfully.');
            } catch (error) {
              console.error('Error clearing cover art cache:', error);
              Alert.alert('Error', 'Failed to clear cache. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleClearDownloads = async () => {
    const count = bookCacheStats?.epubs.count || 0;
    const size = formatBytes(bookCacheStats?.epubs.totalSize || 0);
    
    if (count === 0) {
      Alert.alert('No Downloads', 'No downloaded books found.');
      return;
    }
    
    Alert.alert(
      'Clear Downloaded Books',
      `This will delete all downloaded books (${count} books, ${size}). Your reading progress will be kept. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearEpubs();
              await refreshCacheStats();
              Alert.alert('Success', 'Downloaded books cleared successfully.');
            } catch (error) {
              console.error('Error clearing downloads:', error);
              Alert.alert('Error', 'Failed to clear downloads. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Display Settings
          </Text>
          
          {preferencesLoading ? (
            <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Loading preferences...
              </Text>
            </View>
          ) : liturgyPreferences ? (
            <>
              <LiturgyPreferencesDropdown
                label="Font Size"
                description="Text size for liturgical content"
                value={liturgyPreferences.font_size}
                options={availableOptions.fontSizes}
                onValueChange={(value) => updateLiturgyPreference('font_size', value)}
                icon="text"
              />

              <LiturgyPreferencesToggle
                label="Show Rubrics"
                description="Display liturgical instructions"
                value={liturgyPreferences.show_rubrics}
                onValueChange={(value) => updateLiturgyPreference('show_rubrics', value)}
                icon="list"
              />
            </>
          ) : (
            <View style={[styles.settingCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
                Failed to load preferences
              </Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={loadLiturgyPreferences}
              >
                <Text style={[styles.retryButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Storage Management */}
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Storage & Cache
          </Text>

          {/* Audio Cache */}
          <View style={[styles.cacheCard, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].border }]}>
            <View style={styles.cacheInfo}>
              <Text style={[styles.cacheLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Audio Cache
              </Text>
              <Text style={[styles.cacheDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {cachedFiles.length} file(s) • {(cacheSize / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>
            
            <View style={styles.cacheButtons}>
              <TouchableOpacity
                style={[styles.cacheButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderWidth: 1 }]}
                onPress={handleClearVoiceCache}
              >
                <Ionicons name="person" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
                <Text style={[styles.cacheButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Clear Voice
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.cacheButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderWidth: 1 }]}
                onPress={handleClearAllCache}
              >
                <Ionicons name="trash" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
                <Text style={[styles.cacheButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Book Cover Art Cache */}
          <View style={[styles.cacheCard, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].border }]}>
            <View style={styles.cacheInfo}>
              <Text style={[styles.cacheLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Book Cover Art Cache
              </Text>
              <Text style={[styles.cacheDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {bookCacheStats?.covers.count || 0} image(s) • {formatBytes(bookCacheStats?.covers.totalSize || 0)} / {formatBytes(CACHE_CONFIG.COVER_ART_MAX_SIZE)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.cacheButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderWidth: 1 }]}
              onPress={handleClearCoverArt}
            >
              <Ionicons name="images" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.cacheButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Clear Covers
              </Text>
            </TouchableOpacity>
          </View>

          {/* Downloaded Books */}
          <View style={[styles.cacheCard, { backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].border }]}>
            <View style={styles.cacheInfo}>
              <Text style={[styles.cacheLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Downloaded Books
              </Text>
              <Text style={[styles.cacheDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {bookCacheStats?.epubs.count || 0} book(s) • {formatBytes(bookCacheStats?.epubs.totalSize || 0)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.cacheButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, borderWidth: 1 }]}
              onPress={handleClearDownloads}
            >
              <Ionicons name="book" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.cacheButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Clear Books
              </Text>
            </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 16,
    marginTop: 24,
  },
  settingCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    padding: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  cacheCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cacheInfo: {
    flex: 1,
  },
  cacheLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  cacheDescription: {
    fontSize: 13,
    fontFamily: 'Georgia',
  },
  cacheButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  cacheButtonText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Georgia',
  },
});
