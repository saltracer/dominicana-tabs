import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { PodcastPreferences } from '../types';

interface PodcastPreferencesModalProps {
  visible: boolean;
  onClose: () => void;
  podcastId: string;
  effectiveSpeed: number;
  effectiveMaxEpisodes: number;
  effectiveAutoDownload: boolean;
  updatePreferences: (updates: Partial<PodcastPreferences>) => void;
  resetToGlobal: () => void;
}

export default function PodcastPreferencesModal({
  visible,
  onClose,
  effectiveSpeed,
  effectiveMaxEpisodes,
  effectiveAutoDownload,
  updatePreferences,
  resetToGlobal,
}: PodcastPreferencesModalProps) {
  const { colorScheme } = useTheme();

  // Memoize theme-dependent styles
  const themeStyles = useMemo(() => {
    const theme = colorScheme ?? 'light';
    return {
      modal: { backgroundColor: Colors[theme].background },
      surface: { backgroundColor: Colors[theme].surface },
      text: Colors[theme].text,
      textSecondary: Colors[theme].textSecondary,
      primary: Colors[theme].primary,
      border: Colors[theme].border,
      background: Colors[theme].background,
    };
  }, [colorScheme]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, themeStyles.modal]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: themeStyles.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={themeStyles.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeStyles.text }]}>
            Podcast Settings
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Playback Speed */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
              Playback Speed
            </Text>
            <View style={styles.speedButtons}>
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedButton,
                    {
                      backgroundColor: effectiveSpeed === speed
                        ? themeStyles.primary
                        : themeStyles.background,
                      borderColor: themeStyles.border,
                    }
                  ]}
                  onPress={() => updatePreferences({ playbackSpeed: speed })}
                >
                  <Text style={[
                    styles.speedButtonText,
                    {
                      color: effectiveSpeed === speed
                        ? '#fff'
                        : themeStyles.text
                    }
                  ]}>
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Max Episodes to Keep */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
              Max Episodes to Keep
            </Text>
            <View style={styles.episodeButtons}>
              {[10, 25, 50, 100].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.episodeButton,
                    {
                      backgroundColor: effectiveMaxEpisodes === count
                        ? themeStyles.primary
                        : themeStyles.background,
                      borderColor: themeStyles.border,
                    }
                  ]}
                  onPress={() => updatePreferences({ maxEpisodesToKeep: count })}
                >
                  <Text style={[
                    styles.episodeButtonText,
                    {
                      color: effectiveMaxEpisodes === count
                        ? '#fff'
                        : themeStyles.text
                    }
                  ]}>
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Auto Download */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>
              Auto Download
            </Text>
            <TouchableOpacity
              style={[
                styles.autoDownloadButton,
                {
                  backgroundColor: effectiveAutoDownload
                    ? themeStyles.primary
                    : themeStyles.background,
                  borderColor: themeStyles.border,
                }
              ]}
              onPress={() => updatePreferences({ autoDownload: !effectiveAutoDownload })}
            >
              <Ionicons
                name={effectiveAutoDownload ? "checkmark" : "close"}
                size={20}
                color={effectiveAutoDownload ? '#fff' : themeStyles.text}
              />
              <Text style={[
                styles.autoDownloadText,
                {
                  color: effectiveAutoDownload
                    ? '#fff'
                    : themeStyles.text
                }
              ]}>
                {effectiveAutoDownload ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reset to Global */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: themeStyles.border }]}
              onPress={resetToGlobal}
            >
              <Ionicons name="refresh" size={20} color={themeStyles.textSecondary} />
              <Text style={[styles.resetText, { color: themeStyles.textSecondary }]}>
                Reset to Global Settings
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  speedButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  speedButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  episodeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  episodeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  episodeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  autoDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    alignSelf: 'flex-start',
  },
  autoDownloadText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    alignSelf: 'flex-start',
  },
  resetText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});
