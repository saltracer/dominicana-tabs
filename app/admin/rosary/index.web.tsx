import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminRosaryService, AudioFile } from '../../../services/AdminRosaryService';

export default function RosaryAudioScreenWeb() {
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
      window.alert('Failed to load voice list');
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
      window.alert('Failed to load audio files');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleDeleteFile = (file: AudioFile) => {
    if (!window.confirm(`Delete ${file.name}? This will also update the manifest automatically.`)) {
      return;
    }
    
    (async () => {
      try {
        if (!selectedVoice) return;
        await AdminRosaryService.deleteAudioFile(selectedVoice, file.name);
        window.alert('Audio file deleted and manifest updated');
        loadAudioFiles(selectedVoice);
      } catch (error) {
        window.alert('Failed to delete audio file');
      }
    })();
  };

  const handleDeleteVoice = () => {
    if (!selectedVoice) return;

    if (!window.confirm(`Delete entire voice "${selectedVoice}" and all its audio files? This cannot be undone.`)) {
      return;
    }
    
    (async () => {
      try {
        await AdminRosaryService.deleteVoice(selectedVoice);
        window.alert('Voice deleted and manifest updated');
        loadVoices();
      } catch (error) {
        window.alert('Failed to delete voice');
      }
    })();
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
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading voices...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <View>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Rosary Audio Management
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {audioFiles.length} files in {selectedVoice || 'voice'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={() => router.push('/admin/rosary/upload')}
        >
          <Ionicons name="cloud-upload" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          <Text style={[styles.uploadButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
            Upload Files
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
        <View style={styles.voiceSelector}>
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
        </View>
      )}

      {/* Audio Files Table */}
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
              <View style={[styles.table, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                {/* Table Header */}
                <View style={[styles.tableHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
                  <Text style={[styles.headerCell, styles.nameColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    File Name
                  </Text>
                  <Text style={[styles.headerCell, styles.typeColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Type
                  </Text>
                  <Text style={[styles.headerCell, styles.sizeColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Size
                  </Text>
                  <Text style={[styles.headerCell, styles.actionsColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Actions
                  </Text>
                </View>

                {/* Table Rows */}
                {audioFiles.map((file) => {
                  const typeInfo = getFileTypeInfo(file.name);
                  return (
                    <View
                      key={file.name}
                      style={[styles.tableRow, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}
                    >
                      <View style={[styles.tableCell, styles.nameColumn, styles.nameCell]}>
                        <View style={[styles.fileIcon, { backgroundColor: typeInfo.color + '20' }]}>
                          <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
                        </View>
                        <Text style={[styles.fileName, { color: Colors[colorScheme ?? 'light'].text }]}>
                          {file.name}
                        </Text>
                      </View>
                      <View style={[styles.tableCell, styles.typeColumn]}>
                        <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '20' }]}>
                          <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
                            {typeInfo.label}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.tableCell, styles.sizeColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {formatFileSize(file.size)}
                      </Text>
                      <View style={[styles.tableCell, styles.actionsColumn]}>
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].error + '10' }]}
                          onPress={() => handleDeleteFile(file)}
                        >
                          <Ionicons name="trash" size={16} color={Colors[colorScheme ?? 'light'].error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>

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
            </>
          )}
        </ScrollView>
      )}
    </View>
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 8,
    gap: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  voiceSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  voiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    cursor: 'pointer',
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
  table: {
    margin: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 2,
    backgroundColor: '#F5F5F5',
  },
  headerCell: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  tableCell: {
    justifyContent: 'center',
  },
  nameColumn: {
    flex: 4,
  },
  typeColumn: {
    flex: 2,
  },
  sizeColumn: {
    flex: 1.5,
  },
  actionsColumn: {
    flex: 1,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 24,
    marginVertical: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    cursor: 'pointer',
  },
  dangerButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
});

