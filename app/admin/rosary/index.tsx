import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminRosaryService, AudioFile } from '../../../services/AdminRosaryService';

export default function RosaryAudioScreen() {
  const { colorScheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [voices, setVoices] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    loadVoices();
  }, []);

  useEffect(() => {
    if (selectedVoice) {
      loadAudioFiles(selectedVoice);
    }
  }, [selectedVoice]);

  const loadVoices = async () => {
    try {
      setLoading(true);
      const voiceList = await AdminRosaryService.listVoices();
      setVoices(voiceList);
      if (voiceList.length > 0) {
        setSelectedVoice(voiceList[0]);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      Alert.alert('Error', 'Failed to load voice list');
    } finally {
      setLoading(false);
    }
  };

  const loadAudioFiles = async (voice: string) => {
    try {
      setLoadingFiles(true);
      const files = await AdminRosaryService.getVoiceFiles(voice);
      setAudioFiles(files);
    } catch (error) {
      console.error('Error loading audio files:', error);
      Alert.alert('Error', 'Failed to load audio files');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDeleteFile = (file: AudioFile) => {
    Alert.alert(
      'Delete Audio File',
      `Delete ${file.name}? This will also update the manifest automatically.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!selectedVoice) return;
              await AdminRosaryService.deleteAudioFile(selectedVoice, file.name);
              Alert.alert('Success', 'Audio file deleted and manifest updated');
              loadAudioFiles(selectedVoice);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete audio file');
            }
          },
        },
      ]
    );
  };

  const handleDeleteVoice = () => {
    if (!selectedVoice) return;

    Alert.alert(
      'Delete Voice',
      `Delete entire voice "${selectedVoice}" and all its audio files? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminRosaryService.deleteVoice(selectedVoice);
              Alert.alert('Success', 'Voice deleted and manifest updated');
              loadVoices();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete voice');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileTypeInfo = (fileName: string): { icon: string; color: string; label: string } => {
    if (fileName.includes('joyful')) return { icon: 'happy', color: '#FFD700', label: 'Joyful' };
    if (fileName.includes('sorrowful')) return { icon: 'sad', color: '#9C27B0', label: 'Sorrowful' };
    if (fileName.includes('glorious')) return { icon: 'sunny', color: '#DAA520', label: 'Glorious' };
    if (fileName.includes('luminous')) return { icon: 'flashlight', color: '#2196F3', label: 'Luminous' };
    if (fileName.includes('dominican')) return { icon: 'star', color: '#8C1515', label: 'Dominican' };
    return { icon: 'musical-note', color: '#666666', label: 'Prayer' };
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading voices...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Rosary Audio Management
        </Text>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={() => router.push('/admin/rosary/upload')}
        >
          <Ionicons name="cloud-upload" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          <Text style={[styles.uploadButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
            Upload
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: Colors[colorScheme ?? 'light'].accent + '10' }]}>
        <Ionicons name="information-circle" size={20} color={Colors[colorScheme ?? 'light'].accent} />
        <Text style={[styles.infoBannerText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Manifest automatically updates when files are added or deleted!
        </Text>
      </View>

      {/* Voice Selector */}
      {voices.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voiceScroll}>
          {voices.map((voice) => (
            <TouchableOpacity
              key={voice}
              style={[
                styles.voiceChip,
                {
                  backgroundColor:
                    selectedVoice === voice
                      ? Colors[colorScheme ?? 'light'].primary
                      : Colors[colorScheme ?? 'light'].card,
                },
              ]}
              onPress={() => setSelectedVoice(voice)}
            >
              <Ionicons
                name="mic"
                size={18}
                color={
                  selectedVoice === voice
                    ? Colors[colorScheme ?? 'light'].dominicanWhite
                    : Colors[colorScheme ?? 'light'].text
                }
              />
              <Text
                style={[
                  styles.voiceChipText,
                  {
                    color:
                      selectedVoice === voice
                        ? Colors[colorScheme ?? 'light'].dominicanWhite
                        : Colors[colorScheme ?? 'light'].text,
                  },
                ]}
              >
                {voice.charAt(0).toUpperCase() + voice.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Audio Files List */}
      {loadingFiles ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {audioFiles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={48} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No audio files for this voice
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={() => router.push('/admin/rosary/upload')}
              >
                <Text style={[styles.emptyButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Upload Files
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.fileStats}>
                <Text style={[styles.fileStatsText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {audioFiles.length} files • Total: {formatFileSize(audioFiles.reduce((sum, f) => sum + f.size, 0))}
                </Text>
              </View>

              {audioFiles.map((file) => {
                const typeInfo = getFileTypeInfo(file.name);
                return (
                  <View
                    key={file.name}
                    style={[styles.fileCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                  >
                    <View style={[styles.fileIcon, { backgroundColor: typeInfo.color + '20' }]}>
                      <Ionicons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {file.name}
                      </Text>
                      <View style={styles.fileMetadata}>
                        <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '20' }]}>
                          <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
                            {typeInfo.label}
                          </Text>
                        </View>
                        <Text style={[styles.fileSize, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                          {formatFileSize(file.size)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteFile(file)}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors[colorScheme ?? 'light'].error} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </>
          )}

          {/* Delete Voice Button */}
          {selectedVoice && audioFiles.length > 0 && (
            <TouchableOpacity
              style={[styles.dangerButton, { borderColor: Colors[colorScheme ?? 'light'].error }]}
              onPress={handleDeleteVoice}
            >
              <Ionicons name="trash" size={20} color={Colors[colorScheme ?? 'light'].error} />
              <Text style={[styles.dangerButtonText, { color: Colors[colorScheme ?? 'light'].error }]}>
                Delete Entire Voice
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  voiceScroll: {
    flexGrow: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  voiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  voiceChipText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  fileStats: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fileStatsText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 6,
  },
  fileMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  deleteButton: {
    padding: 8,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
});
