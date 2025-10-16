import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminRosaryService, AudioMetadata } from '../../../services/AdminRosaryService';
import { useAuth } from '../../../contexts/AuthContext';

const FILE_TYPES = [
  { value: 'prayer', label: 'Core Prayer' },
  { value: 'mystery', label: 'Mystery Meditation' },
];

const MYSTERY_TYPES = [
  { value: 'joyful', label: 'Joyful Mysteries' },
  { value: 'sorrowful', label: 'Sorrowful Mysteries' },
  { value: 'glorious', label: 'Glorious Mysteries' },
  { value: 'luminous', label: 'Luminous Mysteries' },
];

export default function UploadAudioScreenWeb() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [newVoiceName, setNewVoiceName] = useState('');
  const [fileType, setFileType] = useState<'prayer' | 'mystery'>('prayer');
  const [mysteryType, setMysteryType] = useState<'joyful' | 'sorrowful' | 'glorious' | 'luminous'>('joyful');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const voiceList = await AdminRosaryService.listVoices();
      setVoices(voiceList);
      if (voiceList.length > 0) {
        setSelectedVoice(voiceList[0]);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  const handlePickFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/mp4,audio/mpeg,audio/x-m4a,.m4a,.mp3,.mp4';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
      }
    };
    input.click();
  };

  const handleCreateVoice = async () => {
    if (!newVoiceName.trim()) {
      Alert.alert('Error', 'Please enter a voice name');
      return;
    }

    try {
      setLoading(true);
      await AdminRosaryService.createVoice(newVoiceName.toLowerCase());
      Alert.alert('Success', 'Voice created successfully');
      setNewVoiceName('');
      loadVoices();
    } catch (error) {
      console.error('Error creating voice:', error);
      Alert.alert('Error', 'Failed to create voice');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select an audio file');
      return;
    }

    const voiceToUse = selectedVoice || newVoiceName.toLowerCase();
    if (!voiceToUse.trim()) {
      Alert.alert('Error', 'Please select or create a voice');
      return;
    }

    try {
      setUploading(true);

      const metadata: Omit<AudioMetadata, 'voice_name' | 'file_name'> = {
        file_type: fileType,
        mystery_type: fileType === 'mystery' ? mysteryType : undefined,
        file_size: selectedFile.size,
        uploaded_by: user?.id,
      };

      await AdminRosaryService.uploadAudioFile(
        voiceToUse,
        selectedFile.name,
        selectedFile,
        metadata
      );

      Alert.alert(
        'Success',
        'Audio file uploaded and manifest updated automatically!',
        [
          {
            text: 'Upload Another',
            onPress: () => setSelectedFile(null),
          },
          {
            text: 'View Files',
            onPress: () => router.push('/admin/rosary'),
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Failed to upload audio file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Back Button */}
      <View style={[styles.topBar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/admin/rosary')}
        >
          <Ionicons name="arrow-back" size={20} color={Colors[colorScheme ?? 'light'].text} />
          <Text style={[styles.backButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Back to Audio Files
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Info Banner */}
          <View style={[styles.infoBanner, { backgroundColor: Colors[colorScheme ?? 'light'].accent + '10' }]}>
            <Ionicons name="information-circle" size={24} color={Colors[colorScheme ?? 'light'].accent} />
            <Text style={[styles.infoBannerText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Upload audio files to the rosary-audio bucket. The manifest will automatically update!
            </Text>
          </View>

          {/* Voice Selection */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Select Voice
            </Text>
            <View style={styles.voiceRow}>
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
                      borderColor: Colors[colorScheme ?? 'light'].border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedVoice(voice);
                    setNewVoiceName('');
                  }}
                >
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
          </View>

          {/* Or Create New Voice */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Or Create New Voice
            </Text>
            <View style={styles.newVoiceRow}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].card,
                  color: Colors[colorScheme ?? 'light'].text,
                  flex: 1,
                }]}
                value={newVoiceName}
                onChangeText={(text) => {
                  setNewVoiceName(text);
                  setSelectedVoice('');
                }}
                placeholder="Enter new voice name"
                placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              />
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={handleCreateVoice}
                disabled={loading || !newVoiceName.trim()}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                ) : (
                  <Text style={[styles.createButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                    Create
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Two Column Layout */}
          <View style={styles.columns}>
            {/* Left Column */}
            <View style={styles.column}>
              {/* File Type */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                  File Type
                </Text>
                <View style={styles.typeOptions}>
                  {FILE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor:
                            fileType === type.value
                              ? Colors[colorScheme ?? 'light'].primary
                              : Colors[colorScheme ?? 'light'].card,
                          borderColor: Colors[colorScheme ?? 'light'].border,
                        },
                      ]}
                      onPress={() => setFileType(type.value as 'prayer' | 'mystery')}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          {
                            color:
                              fileType === type.value
                                ? Colors[colorScheme ?? 'light'].dominicanWhite
                                : Colors[colorScheme ?? 'light'].text,
                          },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Mystery Type (if file type is mystery) */}
              {fileType === 'mystery' && (
                <View style={styles.field}>
                  <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Mystery Type
                  </Text>
                  <View style={styles.typeOptions}>
                    {MYSTERY_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.typeOption,
                          {
                            backgroundColor:
                              mysteryType === type.value
                                ? Colors[colorScheme ?? 'light'].accent
                                : Colors[colorScheme ?? 'light'].card,
                            borderColor: Colors[colorScheme ?? 'light'].border,
                          },
                        ]}
                        onPress={() => setMysteryType(type.value as any)}
                      >
                        <Text
                          style={[
                            styles.typeOptionText,
                            {
                              color:
                                mysteryType === type.value
                                  ? Colors[colorScheme ?? 'light'].dominicanWhite
                                  : Colors[colorScheme ?? 'light'].text,
                            },
                          ]}
                        >
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Right Column */}
            <View style={styles.column}>
              {/* File Selection */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Audio File
                </Text>
                {selectedFile ? (
                  <View style={[styles.filePreview, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                    <Ionicons name="musical-note" size={32} color={Colors[colorScheme ?? 'light'].primary} />
                    <View style={styles.filePreviewInfo}>
                      <Text style={[styles.filePreviewName, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {selectedFile.name}
                      </Text>
                      <Text style={[styles.filePreviewSize, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedFile(null)}>
                      <Ionicons name="close-circle" size={24} color={Colors[colorScheme ?? 'light'].error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.uploadZone, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                    onPress={handlePickFile}
                  >
                    <Ionicons name="cloud-upload" size={48} color={Colors[colorScheme ?? 'light'].primary} />
                    <Text style={[styles.uploadZoneText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Click to select audio file
                    </Text>
                    <Text style={[styles.uploadZoneHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Supported: .m4a, .mp3, .mp4
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Upload Instructions */}
              <View style={[styles.instructionsCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Text style={[styles.instructionsTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Naming Convention
                </Text>
                <Text style={[styles.instructionsText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  • Core prayers: our-father.m4a, hail-mary-01.m4a{'\n'}
                  • Dominican: dominican-opening-1.m4a{'\n'}
                  • Mysteries: joyful-decade-1.m4a{'\n'}
                  • Files upload to: {selectedVoice || newVoiceName || '(voice)'}/filename.m4a
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={handleUpload}
          disabled={uploading || !selectedFile}
        >
          {uploading ? (
            <ActivityIndicator color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
              <Text style={[styles.uploadButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                Upload File
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  form: {
    padding: 24,
  },
  infoBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 32,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  voiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voiceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    cursor: 'pointer',
  },
  voiceChipText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  newVoiceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    outlineStyle: 'none',
  },
  createButton: {
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 100,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  columns: {
    flexDirection: 'row',
    gap: 24,
  },
  column: {
    flex: 1,
  },
  typeOptions: {
    gap: 8,
  },
  typeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    cursor: 'pointer',
  },
  typeOptionText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  uploadZone: {
    padding: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    cursor: 'pointer',
  },
  uploadZoneText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginTop: 16,
  },
  uploadZoneHint: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  filePreviewInfo: {
    flex: 1,
  },
  filePreviewName: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 4,
  },
  filePreviewSize: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  instructionsCard: {
    padding: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'flex-end',
  },
  uploadButton: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-end',
    minWidth: 160,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});

