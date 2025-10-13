/**
 * RosaryAudioControls - Native Implementation
 * Enhanced audio controls for rosary prayer with download progress, playback controls, and speed adjustment
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface RosaryAudioControlsProps {
  isEnabled: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  downloadProgress: { current: number; total: number };
  currentSpeed: number;
  onToggleAudio: () => void;
  onSkipPrevious: () => void;
  onSkipNext: () => void;
  onSpeedChange: (speed: number) => void;
  isAuthenticated: boolean;
}

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x - Slower' },
  { value: 0.75, label: '0.75x - Slow' },
  { value: 1.0, label: '1.0x - Normal' },
  { value: 1.25, label: '1.25x - Slightly faster' },
  { value: 1.5, label: '1.5x - Fast' },
  { value: 1.75, label: '1.75x - Faster' },
  { value: 2.0, label: '2.0x - Very fast' },
];

export default function RosaryAudioControls({
  isEnabled,
  isPlaying,
  isPaused,
  isLoading,
  downloadProgress,
  currentSpeed,
  onToggleAudio,
  onSkipPrevious,
  onSkipNext,
  onSpeedChange,
  isAuthenticated,
}: RosaryAudioControlsProps) {
  const { colorScheme } = useTheme();
  const [showSpeedModal, setShowSpeedModal] = useState(false);

  const colors = Colors[colorScheme ?? 'light'];

  // Show download progress if loading and files are being downloaded
  const showDownloadProgress = isLoading && downloadProgress.total > 0 && downloadProgress.current < downloadProgress.total;

  const handleSpeedSelect = (speed: number) => {
    onSpeedChange(speed);
    setShowSpeedModal(false);
  };

  if (showDownloadProgress) {
    // Download Progress Display
    const progressPercent = (downloadProgress.current / downloadProgress.total) * 100;

    return (
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { backgroundColor: colors.primary, width: `${progressPercent}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Loading {downloadProgress.current}/{downloadProgress.total} files...
          </Text>
        </View>
        {isLoading && <ActivityIndicator size="small" color={colors.primary} style={styles.loadingSpinner} />}
      </View>
    );
  }

  if (!isEnabled) {
    // Show single enable button when audio is disabled
    return (
      <TouchableOpacity 
        onPress={onToggleAudio}
        style={[styles.singleButton, { opacity: isAuthenticated ? 1 : 0.5 }]}
        disabled={!isAuthenticated}
      >
        <Ionicons name="volume-mute" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  }

  // Playback Controls
  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        {/* Skip Previous */}
        <TouchableOpacity 
          onPress={onSkipPrevious}
          style={styles.controlButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-skip-back" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Play/Pause */}
        <TouchableOpacity 
          onPress={onToggleAudio}
          style={[styles.playButton, { backgroundColor: colors.primary }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={isPaused ? "play" : isPlaying ? "pause" : "play"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        {/* Skip Next */}
        <TouchableOpacity 
          onPress={onSkipNext}
          style={styles.controlButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-skip-forward" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Speed Control */}
        <TouchableOpacity 
          onPress={() => setShowSpeedModal(true)}
          style={styles.speedButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="speedometer" size={18} color={colors.text} />
          <Text style={[styles.speedText, { color: colors.text }]}>
            {currentSpeed.toFixed(1)}x
          </Text>
        </TouchableOpacity>
      </View>

      {/* Speed Selection Modal */}
      <Modal
        visible={showSpeedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSpeedModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSpeedModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Playback Speed</Text>
              <TouchableOpacity onPress={() => setShowSpeedModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={SPEED_OPTIONS}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.speedOption,
                    item.value === currentSpeed && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => handleSpeedSelect(item.value)}
                >
                  <Text style={[
                    styles.speedOptionText, 
                    { color: item.value === currentSpeed ? colors.primary : colors.text }
                  ]}>
                    {item.label}
                  </Text>
                  {item.value === currentSpeed && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  singleButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    textAlign: 'center',
  },
  loadingSpinner: {
    marginLeft: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  speedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  speedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  speedOptionText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
});

