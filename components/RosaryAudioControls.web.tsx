/**
 * RosaryAudioControls - Web Implementation
 * Enhanced audio controls for rosary prayer with download progress, playback controls, and speed adjustment
 */

import React from 'react';
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
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1.0x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 1.75, label: '1.75x' },
  { value: 2.0, label: '2.0x' },
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
  const colors = Colors[colorScheme ?? 'light'];

  // Show download progress if loading and files are being downloaded
  const showDownloadProgress = isLoading && downloadProgress.total > 0 && downloadProgress.current < downloadProgress.total;

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSpeedChange(parseFloat(e.target.value));
  };

  if (showDownloadProgress) {
    // Download Progress Display
    const progressPercent = (downloadProgress.current / downloadProgress.total) * 100;

    return (
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <div style={{
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 4,
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: colors.primary,
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{
            fontSize: 11,
            color: colors.textSecondary,
            textAlign: 'center',
          }}>
            Loading {downloadProgress.current}/{downloadProgress.total} files...
          </div>
        </div>
        {isLoading && (
          <div style={{
            width: 16,
            height: 16,
            border: `2px solid ${colors.primary}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginLeft: 8,
          }} />
        )}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isEnabled) {
    // Show single enable button when audio is disabled
    return (
      <button
        onClick={onToggleAudio}
        disabled={!isAuthenticated}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 8,
          cursor: isAuthenticated ? 'pointer' : 'not-allowed',
          opacity: isAuthenticated ? 1 : 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="volume-mute" size={24} color={colors.textSecondary} />
      </button>
    );
  }

  // Playback Controls
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 8,
      minWidth: 200,
    }}>
      {/* Skip Previous */}
      <button
        onClick={onSkipPrevious}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 8,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <Ionicons name="play-skip-back" size={22} color={colors.text} />
      </button>

      {/* Play/Pause */}
      <button
        onClick={onToggleAudio}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.primary,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, opacity 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.opacity = '1';
        }}
      >
        <Ionicons 
          name={isPaused ? "play" : isPlaying ? "pause" : "play"} 
          size={24} 
          color="#FFFFFF" 
        />
      </button>

      {/* Skip Next */}
      <button
        onClick={onSkipNext}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 8,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <Ionicons name="play-skip-forward" size={22} color={colors.text} />
      </button>

      {/* Speed Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Ionicons name="speedometer" size={18} color={colors.text} />
        <select
          value={currentSpeed}
          onChange={handleSpeedChange}
          style={{
            backgroundColor: colors.surface,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {SPEED_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

