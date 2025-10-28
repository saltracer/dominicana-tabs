import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePodcastDownloads } from '../../hooks/usePodcastDownloads';
import { DownloadedEpisode } from '../../services/PodcastDownloadService';

export default function DownloadsWebScreen() {
  const { colorScheme } = useTheme();
  const { isMobile, isTablet } = useMediaQuery();
  const { 
    downloadedEpisodes, 
    isLoading, 
    deleteDownloadedEpisode, 
    getTotalStorageUsed,
    isDownloadsEnabled 
  } = usePodcastDownloads();
  
  const [totalStorage, setTotalStorage] = useState(0);

  useEffect(() => {
    const loadStorageInfo = async () => {
      const storage = await getTotalStorageUsed();
      setTotalStorage(storage);
    };
    loadStorageInfo();
  }, [downloadedEpisodes, getTotalStorageUsed]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDeleteEpisode = async (episodeId: string, episodeTitle: string) => {
    Alert.alert(
      'Delete Episode',
      `Are you sure you want to delete "${episodeTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteDownloadedEpisode(episodeId);
            if (success) {
              // Refresh storage info
              const storage = await getTotalStorageUsed();
              setTotalStorage(storage);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAll = () => {
    if (downloadedEpisodes.length === 0) return;
    
    Alert.alert(
      'Delete All Episodes',
      `Are you sure you want to delete all ${downloadedEpisodes.length} downloaded episodes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            for (const episode of downloadedEpisodes) {
              await deleteDownloadedEpisode(episode.episodeId);
            }
            const storage = await getTotalStorageUsed();
            setTotalStorage(storage);
          },
        },
      ]
    );
  };

  if (!isDownloadsEnabled) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.disabledContainer}>
          <Ionicons name="cloud-download-outline" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <Text style={[styles.disabledTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Downloads Disabled
          </Text>
          <Text style={[styles.disabledText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Enable downloads in Preaching Settings to manage offline episodes.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, (isMobile || isTablet) && styles.contentMobile]}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Downloaded Episodes
          </Text>
          
          {/* Storage Info */}
          <View style={[styles.storageInfo, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <View style={styles.storageRow}>
              <Ionicons name="folder-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.storageText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Total Storage Used: {formatFileSize(totalStorage)}
              </Text>
            </View>
            <View style={styles.storageRow}>
              <Ionicons name="list-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.storageText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Episodes Downloaded: {downloadedEpisodes.length}
              </Text>
            </View>
          </View>

          {/* Delete All Button */}
          {downloadedEpisodes.length > 0 && (
            <TouchableOpacity
              style={[styles.deleteAllButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
              onPress={handleDeleteAll}
            >
              <Ionicons name="trash-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.deleteAllText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Delete All Episodes
              </Text>
            </TouchableOpacity>
          )}

          {/* Episodes List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Loading episodes...
              </Text>
            </View>
          ) : downloadedEpisodes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cloud-download-outline" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                No Downloaded Episodes
              </Text>
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Download episodes from podcasts to listen offline.
              </Text>
            </View>
          ) : (
            <View style={styles.episodesList}>
              {downloadedEpisodes.map((episode) => (
                <View
                  key={episode.episodeId}
                  style={[styles.episodeItem, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
                >
                  <View style={styles.episodeInfo}>
                    <Text style={[styles.episodeTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
                      Episode {episode.episodeId}
                    </Text>
                    <Text style={[styles.episodeSize, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {formatFileSize(episode.fileSize)}
                    </Text>
                    <Text style={[styles.episodeDate, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Downloaded {new Date(episode.downloadedAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteEpisode(episode.episodeId, `Episode ${episode.episodeId}`)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  contentMobile: {
    padding: 16,
    maxWidth: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 20,
  },
  storageInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  storageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  storageText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  deleteAllText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 22,
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  disabledTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
  },
  disabledText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 22,
  },
  episodesList: {
    gap: 12,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  episodeSize: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  episodeDate: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  deleteButton: {
    padding: 8,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
});
