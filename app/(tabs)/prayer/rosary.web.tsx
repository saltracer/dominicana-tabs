/**
 * Rosary Screen - Web Version with Desktop Optimizations
 * 3-column layout for desktop, 2-column for tablet, single column for mobile
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import BeadCounter from '../../../components/BeadCounter';
import RosaryDecadeSelector from '../../../components/RosaryDecadeSelector';
import RosaryMysteryCarousel from '../../../components/RosaryMysteryCarousel';
import { RosaryBead, RosaryForm, MysterySet, AudioSettings, FinalPrayerConfig } from '../../../types/rosary-types';
import Footer from '../../../components/Footer.web';
import { rosaryService } from '../../../services/RosaryService';
import { bibleService } from '../../../services/BibleService';
import { getTodaysMystery, ROSARY_MYSTERIES } from '../../../constants/rosaryData';
import { UserLiturgyPreferencesService } from '../../../services/UserLiturgyPreferencesService';
import { useAuth } from '../../../contexts/AuthContext';
import { useRosaryPlayer } from '../../../contexts/RosaryPlayerContext';
import RosaryAudioControls from '../../../components/RosaryAudioControls.web';

export default function RosaryWebScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  
  // Responsive breakpoints (matching saints and calendar pages)
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWide = width >= 1440;
  
  // State management
  const [selectedMystery, setSelectedMystery] = useState<MysterySet>(getTodaysMystery());
  const [rosaryForm, setRosaryForm] = useState<RosaryForm>('dominican');
  const [isPraying, setIsPraying] = useState(false);
  const [beads, setBeads] = useState<RosaryBead[]>([]);
  const [currentBeadId, setCurrentBeadId] = useState<string>('');
  const [completedBeadIds, setCompletedBeadIds] = useState<string[]>([]);
  const [bibleVerse, setBibleVerse] = useState<string>('');
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [rosaryVoice, setRosaryVoice] = useState<string>('alphonsus');
  const [showMysteryMeditations, setShowMysteryMeditations] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [finalPrayersConfig, setFinalPrayersConfig] = useState<FinalPrayerConfig[]>([
    { id: 'hail_holy_queen', order: 1 },
    { id: 'versicle_response', order: 2 },
    { id: 'rosary_prayer', order: 3 }
  ]);
  
  // Audio state
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    isEnabled: false,
    mode: 'guided',
    autoAdvance: false,
    speed: 1.0,
    volume: 0.8,
    backgroundMusicVolume: 0.3,
    pauseDuration: 5,
    playBellSounds: true,
  });

  // Use global rosary player context
  const rosaryPlayer = useRosaryPlayer();
  const isLentSeason = liturgicalDay?.season.name === 'Lent' || liturgicalDay?.season.name === 'Holy Week';
  
  // Sync local audio playing state with global context
  useEffect(() => {
    if (rosaryPlayer.isSessionActive) {
      setIsAudioPlaying(rosaryPlayer.isPlaying);
      setIsAudioPaused(rosaryPlayer.isPaused);
      
      // Sync current bead from context
      if (rosaryPlayer.currentBeadId && rosaryPlayer.currentBeadId !== currentBeadId) {
        setCurrentBeadId(rosaryPlayer.currentBeadId);
        
        // Mark previous beads as complete
        const beadIndex = beads.findIndex(b => b.id === rosaryPlayer.currentBeadId);
        if (beadIndex >= 0) {
          const completed = beads.slice(0, beadIndex).map(b => b.id);
          setCompletedBeadIds(completed);
        }
      }
    }
  }, [rosaryPlayer.isPlaying, rosaryPlayer.isPaused, rosaryPlayer.currentBeadId, rosaryPlayer.isSessionActive]);

  // Navigation callbacks - with audio, skip tracks in queue; without audio, manual navigation
  const nextBead = useCallback(() => {
    if (audioSettings.isEnabled) {
      // Skip audio to next track
      rosaryPlayer.skipToNext();
      
      // Also manually advance the visual bead immediately
      const next = rosaryService.getNextBead(beads, currentBeadId);
      if (next) {
        console.log('[Rosary Web] Manually advancing bead from', currentBeadId, 'to', next.id);
        setCompletedBeadIds([...completedBeadIds, currentBeadId]);
        setCurrentBeadId(next.id);
      }
    } else {
      const next = rosaryService.getNextBead(beads, currentBeadId);
      if (next) {
        setCompletedBeadIds([...completedBeadIds, currentBeadId]);
        setCurrentBeadId(next.id);
      }
    }
  }, [beads, currentBeadId, completedBeadIds, audioSettings.isEnabled, rosaryPlayer]);

  const previousBead = useCallback(() => {
    if (audioSettings.isEnabled) {
      // Skip audio to previous track
      rosaryPlayer.skipToPrevious();
      
      // Also manually go back to the previous visual bead immediately
      const prev = rosaryService.getPreviousBead(beads, currentBeadId);
      if (prev) {
        console.log('[Rosary Web] Manually going back to bead', prev.id);
        setCompletedBeadIds(completedBeadIds.filter(id => id !== currentBeadId && id !== prev.id));
        setCurrentBeadId(prev.id);
      }
    } else {
      const prev = rosaryService.getPreviousBead(beads, currentBeadId);
      if (prev) {
        setCompletedBeadIds(completedBeadIds.filter(id => id !== currentBeadId && id !== prev.id));
        setCurrentBeadId(prev.id);
      }
    }
  }, [beads, currentBeadId, completedBeadIds, audioSettings.isEnabled, rosaryPlayer]);

  // Keyboard navigation
  useEffect(() => {
    if (!isPraying) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          nextBead();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          previousBead();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          event.preventDefault();
          jumpToDecade(parseInt(event.key));
          break;
        case 'Escape':
          event.preventDefault();
          exitRosary();
          break;
        case ' ':
          event.preventDefault();
          setAudioSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPraying, currentBeadId, beads]);

  // Generate beads when form or mystery changes
  useEffect(() => {
    // Check if current liturgical season is Lent or Holy Week
    const isLentSeason = liturgicalDay?.season.name === 'Lent' || liturgicalDay?.season.name === 'Holy Week';
    const generatedBeads = rosaryService.generateRosaryBeads(rosaryForm, selectedMystery, isLentSeason, finalPrayersConfig);
    setBeads(generatedBeads);
    if (generatedBeads.length > 0 && !currentBeadId) {
      setCurrentBeadId(generatedBeads[0].id);
    }
  }, [rosaryForm, selectedMystery, liturgicalDay, finalPrayersConfig]);

  // Load Bible verse for current mystery announcement (only if meditations enabled)
  useEffect(() => {
    const currentBead = beads.find(b => b.id === currentBeadId);
    if (currentBead && currentBead.type === 'mystery-announcement' && currentBead.decadeNumber && showMysteryMeditations) {
      loadBibleVerse(currentBead.decadeNumber);
    } else {
      setBibleVerse('');
    }
  }, [currentBeadId, beads, selectedMystery, showMysteryMeditations]);

  // Audio playback is now handled by the full queue approach in useRosaryAudio
  // TrackPlayer auto-advances through the queue - no per-bead playback logic needed

  // Sync hook state with component state
  useEffect(() => {
    setIsAudioPlaying(rosaryPlayer.isPlaying);
    setIsAudioPaused(rosaryPlayer.isPaused);
  }, [rosaryPlayer.isPlaying, rosaryPlayer.isPaused]);

  // Cleanup audio when exiting rosary
  useEffect(() => {
    if (!isPraying) {
      rosaryPlayer.cleanup();
    }
  }, [isPraying, rosaryPlayer]);

  // Rebuild queue when key settings change (if audio is enabled)
  useEffect(() => {
    const rebuildQueueIfNeeded = async () => {
      // Only rebuild if audio is currently enabled and playing
      if (!audioSettings.isEnabled || !isPraying) {
        return;
      }

      console.log('[Rosary Web] Key settings changed, rebuilding audio queue...');
      
      try {
        // Get current track position if possible
        const currentTrackIndex = rosaryPlayer.currentTrackIndex;
        
        // Rebuild the queue with new settings
        await rosaryPlayer.initializeQueue();
        
        // Re-apply playback speed after queue rebuild
        await rosaryPlayer.setSpeed(playbackSpeed);
        
        // Try to resume at a similar position (or restart if not possible)
        if (currentTrackIndex > 0 && currentTrackIndex < beads.length) {
          console.log('[Rosary Web] Attempting to resume at track', currentTrackIndex);
          await rosaryPlayer.skipToTrack(currentTrackIndex);
        }
        
        // Resume playback
        await rosaryPlayer.play();
        
        console.log('[Rosary Web] Queue rebuilt successfully');
      } catch (error) {
        console.error('[Rosary Web] Failed to rebuild queue:', error);
      }
    };

    rebuildQueueIfNeeded();
  }, [
    // Rebuild when these settings change:
    showMysteryMeditations, // Long vs short meditations
    rosaryForm, // Dominican vs Standard
    selectedMystery, // Joyful, Sorrowful, etc.
    rosaryVoice, // Voice selection
    isLentSeason, // Affects Alleluia
    // Note: finalPrayersConfig is excluded - it only changes when user modifies preferences, which triggers profile refresh
    // Note: Don't include audioSettings.isEnabled or isPraying to avoid infinite loop
    // Note: playbackSpeed is not included here - it's applied separately in the effect below
  ]);

  // Apply playback speed when it changes (if audio is enabled and playing)
  useEffect(() => {
    const applySpeed = async () => {
      if (audioSettings.isEnabled && rosaryPlayer) {
        await rosaryPlayer.setSpeed(playbackSpeed);
      }
    };
    applySpeed();
  }, [playbackSpeed, audioSettings.isEnabled, rosaryPlayer]);

  // Load user's rosary preferences
  const loadUserPreferences = useCallback(async () => {
    if (user?.id) {
      try {
        const prefs = await UserLiturgyPreferencesService.getUserPreferences(user.id);
        console.log('[Rosary Web] Loading preferences:', prefs?.rosary_final_prayers);
        
        if (prefs?.rosary_voice) {
          setRosaryVoice(prefs.rosary_voice);
        }
        // Load mystery meditations preference (default to true if not set)
        setShowMysteryMeditations(prefs?.show_mystery_meditations ?? true);
        // Load playback speed preference (default to 1.0 if not set)
        setPlaybackSpeed(prefs?.audio_playback_speed ?? 1.0);
        // Load final prayers configuration (default to traditional 3 prayers if not set)
        if (prefs?.rosary_final_prayers) {
          console.log('[Rosary Web] Setting final prayers config:', prefs.rosary_final_prayers);
          setFinalPrayersConfig(prefs.rosary_final_prayers);
        }
      } catch (error) {
        console.error('Error loading rosary preferences:', error);
      }
    }
  }, [user?.id]);

  // Load preferences when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserPreferences();
    }, [loadUserPreferences])
  );

  // Refresh preferences when user returns from profile settings
  // Use multiple detection methods for better reliability on web
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        // Small delay to ensure profile changes have been saved
        setTimeout(() => {
          loadUserPreferences();
        }, 1000);
      }
    };

    const handleFocus = () => {
      if (user?.id) {
        // Small delay to ensure profile changes have been saved
        setTimeout(() => {
          loadUserPreferences();
        }, 1000);
      }
    };

    // Listen for multiple events to catch user returning from profile
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id, loadUserPreferences]);

  // Listen for custom preference change events
  useEffect(() => {
    const handlePreferenceChange = (event: CustomEvent) => {
      if (event.detail?.type === 'rosary_final_prayers' && user?.id) {
        console.log('[Rosary Web] Preference change detected, reloading...');
        loadUserPreferences();
      }
    };

    // Listen for custom events from profile settings
    window.addEventListener('rosaryPreferencesChanged', handlePreferenceChange as EventListener);
    
    return () => {
      window.removeEventListener('rosaryPreferencesChanged', handlePreferenceChange as EventListener);
    };
  }, [user?.id, loadUserPreferences]);

  const loadBibleVerse = async (decadeNumber: number) => {
    setLoadingVerse(true);
    try {
      const mysteryData = ROSARY_MYSTERIES.find(m => m.name === selectedMystery);
      if (mysteryData && mysteryData.mysteries[decadeNumber - 1]) {
        const mystery = mysteryData.mysteries[decadeNumber - 1];
        const passage = await bibleService.getPassageByReference(mystery.bibleReference);
        if (passage && passage.verses.length > 0) {
          const verseText = passage.verses
            .map(v => `${v.number}. ${v.text}`)
            .join('\n');
          setBibleVerse(verseText);
        }
      }
    } catch (error) {
      console.error('Error loading Bible verse:', error);
      setBibleVerse('');
    } finally {
      setLoadingVerse(false);
    }
  };

  const getBriefMysteryText = (bead: RosaryBead): string => {
    if (!bead.decadeNumber) return bead.title;
    
    const mysteryData = ROSARY_MYSTERIES.find(m => m.name === selectedMystery);
    if (mysteryData && mysteryData.mysteries[bead.decadeNumber - 1]) {
      const mystery = mysteryData.mysteries[bead.decadeNumber - 1];
      return `${mystery.name}\n\n${mystery.shortMeditation}`;
    }
    
    return bead.title;
  };

  const startRosary = () => {
    setIsPraying(true);
    setCurrentBeadId(beads[0].id);
    setCompletedBeadIds([]);
    setAudioSettings(prev => ({ ...prev, isEnabled: false }));
    setIsAudioPaused(false);
  };

  const exitRosary = () => {
    setIsPraying(false);
    setCurrentBeadId('');
    setCompletedBeadIds([]);
    setAudioSettings(prev => ({ ...prev, isEnabled: false }));
    setIsAudioPaused(false);
  };

  const navigateToBead = async (beadId: string) => {
    setCurrentBeadId(beadId);
    const currentIndex = beads.findIndex(b => b.id === beadId);
    const completedIds = beads.slice(0, currentIndex).map(b => b.id);
    setCompletedBeadIds(completedIds);
    
    // If audio is enabled, also jump to that bead in the audio queue
    if (audioSettings.isEnabled) {
      console.log('[Rosary Web] Jumping audio to bead:', beadId);
      await rosaryPlayer.skipToBead(beadId);
    }
  };


  const jumpToDecade = (decadeNumber: number) => {
    const firstBead = rosaryService.getFirstBeadOfDecade(beads, decadeNumber);
    if (firstBead) {
      navigateToBead(firstBead.id);
    }
  };

  const getCurrentBead = (): RosaryBead | undefined => {
    return beads.find(b => b.id === currentBeadId);
  };

  const getCurrentDecade = (): number => {
    const currentBead = getCurrentBead();
    return currentBead?.decadeNumber || 0;
  };

  const getProgress = (): number => {
    return rosaryService.getProgress(beads, currentBeadId);
  };

  const handleSpeedChange = async (speed: number) => {
    console.log('[Rosary Web] Speed changed to:', speed);
    setPlaybackSpeed(speed);
    
    // Apply to current playback if audio is enabled
    if (audioSettings.isEnabled) {
      await rosaryPlayer.setSpeed(speed);
    }
    
    // Save to user preferences
    if (user?.id) {
      try {
        await UserLiturgyPreferencesService.updateUserPreferences(user.id, { audio_playback_speed: speed });
        console.log('[Rosary Web] Speed preference saved:', speed);
      } catch (error) {
        console.error('[Rosary Web] Failed to save speed preference:', error);
      }
    }
  };

  // Helper function to check for failed audio files
  const checkForFailedAudioFiles = async (): Promise<{ beadId: string; title: string; audioFile: string }[]> => {
    // On web, we don't check for failed audio files because:
    // 1. We use signed Supabase URLs which are generated on-demand
    // 2. The bead.audioFile contains internal paths, not the actual signed URLs
    // 3. The audio service already handles failed URLs during queue building
    console.log('[Rosary Web] Skipping audio file check (web uses signed URLs)');
    return [];
  };

  const handleAudioToggle = async () => {
    // Check if user is authenticated before enabling audio
    if (!audioSettings.isEnabled) {
      if (!user) {
        Alert.alert(
          'Sign In Required',
          'You need to sign in to use audio features. Audio files are stored in your account.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign In', 
              onPress: () => {
                // On web, navigate to auth page
                if (typeof window !== 'undefined') {
                  window.location.href = '/auth';
                }
              }
            }
          ]
        );
        return;
      }
      
      // Enable audio and start global rosary session
      try {
        console.log('[Rosary Web] Starting global rosary session...');
        setAudioSettings(prev => ({ ...prev, isEnabled: true, speed: playbackSpeed }));
        
        // Start rosary session in global context
        await rosaryPlayer.startRosary(
          selectedMystery,
          rosaryForm,
          beads,
          rosaryVoice,
          { ...audioSettings, isEnabled: true, speed: playbackSpeed },
          showMysteryMeditations,
          isLentSeason || false,
          (beadId, trackIndex) => {
            console.log('[Rosary Web] Track changed to bead:', beadId);
            setCurrentBeadId(beadId);
            
            // Mark previous beads as complete
            const beadIndex = beads.findIndex(b => b.id === beadId);
            if (beadIndex >= 0) {
              const completed = beads.slice(0, beadIndex).map(b => b.id);
              setCompletedBeadIds(completed);
            }
          },
          () => {
            console.log('[Rosary Web] Queue complete - Rosary finished!');
            setIsPraying(false);
            setAudioSettings(prev => ({ ...prev, isEnabled: false }));
          }
        );
        
        setIsAudioPaused(false);
        console.log('[Rosary Web] Global rosary session started');
        
        // Check for failed audio files and log them
        const failedAudioFiles = await checkForFailedAudioFiles();
        if (failedAudioFiles.length > 0) {
          console.warn('[Rosary Web] Failed audio files:', failedAudioFiles);
          console.warn('[Rosary Web] Missing audio files:', failedAudioFiles.map(f => f.audioFile).join(', '));
        }
      } catch (error) {
        console.error('[Rosary Web] Failed to initialize audio:', error);
        alert('Audio Error: Failed to load audio files. Please try again.');
        setAudioSettings(prev => ({ ...prev, isEnabled: false }));
      }
    } else if (isAudioPlaying && !isAudioPaused) {
      // Pause audio
      await rosaryPlayer.pause();
      setIsAudioPaused(true);
    } else if (isAudioPaused || (rosaryPlayer.isSessionActive && !rosaryPlayer.isPlaying)) {
      // Resume audio (either from pause or after podcast took over)
      console.log('[Rosary Web] Resuming rosary (paused or session active but not playing)');
      await rosaryPlayer.resume();
      setIsAudioPaused(false);
    } else {
      // Disable audio (when not currently playing and no active session)
      console.log('[Rosary Web] Stopping rosary session (audio toggle off)');
      await rosaryPlayer.stopRosary();
      setAudioSettings(prev => ({ ...prev, isEnabled: false }));
      setIsAudioPaused(false);
    }
  };

  const isLastBead = (): boolean => {
    return currentBeadId === beads[beads.length - 1]?.id;
  };

  const completeRosary = async () => {
    setCompletedBeadIds([...completedBeadIds, currentBeadId]);
    setIsPraying(false);
    setCurrentBeadId('');
    setCompletedBeadIds([]);
    
    // Stop global rosary session if active
    if (audioSettings.isEnabled) {
      await rosaryPlayer.stopRosary();
    }
    
    setAudioSettings(prev => ({ ...prev, isEnabled: false }));
    setIsAudioPaused(false);
  };

  const currentBead = getCurrentBead();
  const progress = getProgress();

  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isPraying) {
    // Welcome screen
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
        <ScrollView style={styles.scrollView} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              The Holy Rosary
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {rosaryForm === 'dominican' ? 'Dominican Form' : 'Standard Form'}
            </Text>
          </View>

          {/* Form Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Dominican
            </Text>
            <Switch
              value={rosaryForm === 'standard'}
              onValueChange={(value) => setRosaryForm(value ? 'standard' : 'dominican')}
              trackColor={{
                false: Colors[colorScheme ?? 'light'].dominicanGold,
                true: Colors[colorScheme ?? 'light'].dominicanGold,
              }}
              thumbColor={Colors[colorScheme ?? 'light'].dominicanRed}
            />
            <Text style={[styles.toggleLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Standard
            </Text>
          </View>

          {/* Mystery Carousel */}
          <RosaryMysteryCarousel
            selectedMystery={selectedMystery}
            onMysteryChange={setSelectedMystery}
            showDayIndicator={true}
          />

          {/* Start Button */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={startRosary}
          >
            <Ionicons name="rose" size={24} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            <Text style={[styles.startButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Begin Rosary
            </Text>
          </TouchableOpacity>

          {/* Mystery Details */}
          <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Today's Mysteries
            </Text>
            {ROSARY_MYSTERIES.find(m => m.name === selectedMystery)?.mysteries.map((mystery, index) => (
              <View key={index} style={styles.mysteryItem}>
                <Text style={[styles.mysteryNumber, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  {index + 1}
                </Text>
                <View style={styles.mysteryContent}>
                  <Text style={[styles.mysteryName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {mystery.name}
                  </Text>
                  <Text style={[styles.mysteryReference, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {mystery.bibleReference}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          </View>

          <Footer />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 3-column desktop layout for prayer interface
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      {/* Top Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TouchableOpacity onPress={exitRosary} style={styles.toolbarButton}>
          <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        
        <View style={styles.toolbarCenter}>
          <Text style={[styles.toolbarTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {rosaryForm === 'dominican' ? 'Dominican' : 'Standard'} Rosary
          </Text>
          {!isMobile && (
            <Text style={[styles.toolbarSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {selectedMystery} • {progress}% • Use ← → arrow keys
            </Text>
          )}
        </View>

        <View style={styles.toolbarRight}>
          <RosaryAudioControls
            isEnabled={audioSettings.isEnabled}
            isPlaying={isAudioPlaying}
            isPaused={isAudioPaused}
            isLoading={rosaryPlayer.isLoading}
            downloadProgress={rosaryPlayer.downloadProgress}
            currentSpeed={playbackSpeed}
            onToggleAudio={handleAudioToggle}
            onSkipPrevious={previousBead}
            onSkipNext={nextBead}
            onSpeedChange={handleSpeedChange}
            isAuthenticated={!!user}
          />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              backgroundColor: Colors[colorScheme ?? 'light'].primary,
              width: `${progress}%`
            }
          ]} 
        />
      </View>

      {/* Desktop/Tablet/Mobile Layout */}
      <View style={styles.desktopContainer}>
        {/* Left Sidebar: Decade Navigation & Progress (hidden on mobile) */}
        {isDesktop && (
          <View style={[styles.leftSidebar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Decades
              </Text>
              <View style={styles.decadeGrid}>
                {[1, 2, 3, 4, 5].map(decade => (
                  <TouchableOpacity
                    key={decade}
                    style={[
                      styles.decadeGridButton,
                      {
                        backgroundColor: getCurrentDecade() === decade
                          ? Colors[colorScheme ?? 'light'].primary
                          : Colors[colorScheme ?? 'light'].card,
                      },
                    ]}
                    onPress={() => jumpToDecade(decade)}
                  >
                    <Text
                      style={[
                        styles.decadeGridText,
                        {
                          color: getCurrentDecade() === decade
                            ? Colors[colorScheme ?? 'light'].dominicanWhite
                            : Colors[colorScheme ?? 'light'].text,
                        },
                      ]}
                    >
                      {decade}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Progress
              </Text>
              <View style={styles.progressCircle}>
                <Text style={[styles.progressPercentage, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  {progress}%
                </Text>
              </View>
            </View>

            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Shortcuts
              </Text>
              <Text style={[styles.shortcutText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                ← → Navigate{'\n'}
                1-5 Jump Decade{'\n'}
                Space Audio{'\n'}
                Esc Exit
              </Text>
            </View>
          </View>
        )}

        {/* Center: Prayer Content */}
        <View style={styles.centerContent}>
          <ScrollView 
            style={styles.prayerScroll}
            contentContainerStyle={
              isMobile 
                ? styles.prayerScrollContentMobile 
                : isTablet 
                ? styles.prayerScrollContentTablet 
                : styles.prayerScrollContent
            }
          >
            {currentBead && (
              <View>
                <Text style={[
                  isMobile ? styles.prayerTitleMobile : isTablet ? styles.prayerTitleTablet : styles.prayerTitle, 
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  {currentBead.title}
                </Text>
                {(currentBead.decadeNumber ?? 0) > 0 && (currentBead.decadeNumber ?? 0) <= 5 && (
                  <View style={[styles.mysteryInfoCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                    <Text style={[styles.mysteryInfoDecade, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      {`Decade ${currentBead.decadeNumber ?? 0} of 5`}
                    </Text>
                    <Text style={[styles.mysteryInfoName, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {ROSARY_MYSTERIES.find(m => m.name === selectedMystery)?.mysteries[((currentBead.decadeNumber ?? 1) - 1)]?.name || ''}
                    </Text>
                  </View>
                )}
                <Text style={[styles.prayerText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {currentBead.type === 'mystery-announcement' && !showMysteryMeditations
                    ? getBriefMysteryText(currentBead)
                    : currentBead.text}
                </Text>
                {currentBead.type === 'mystery-announcement' && showMysteryMeditations && bibleVerse !== '' && (
                  <View style={[styles.bibleVerseCard, { backgroundColor: Colors[colorScheme ?? 'light'].offWhiteCard }]}>
                    <View style={styles.bibleVerseHeader}>
                      <Ionicons name="book-outline" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                      <Text style={[styles.bibleVerseTitle, { color: Colors[colorScheme ?? 'light'].primary }]}>
                        Scripture
                      </Text>
                    </View>
                    <Text style={[styles.bibleVerseText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {bibleVerse}
                    </Text>
                  </View>
                )}
                {showMysteryMeditations && loadingVerse === true && (
                  <Text style={[styles.loadingVerseText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Loading scripture...
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          {/* Navigation Controls */}
          <View style={[styles.controls, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { 
                  backgroundColor: currentBeadId === beads[0]?.id 
                    ? Colors[colorScheme ?? 'light'].border 
                    : Colors[colorScheme ?? 'light'].secondary 
                },
              ]}
              onPress={previousBead}
              disabled={currentBeadId === beads[0]?.id}
            >
              <Ionicons name="chevron-back" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
              <Text style={[styles.controlButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                Previous
              </Text>
            </TouchableOpacity>

            {isLastBead() ? (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  { backgroundColor: Colors[colorScheme ?? 'light'].dominicanGold },
                ]}
                onPress={completeRosary}
              >
                <Ionicons name="checkmark-circle" size={20} color={Colors[colorScheme ?? 'light'].dominicanBlack} />
                <Text style={[styles.controlButtonText, { color: Colors[colorScheme ?? 'light'].dominicanBlack }]}>
                  Complete Rosary
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                ]}
                onPress={nextBead}
                disabled={!rosaryService.getNextBead(beads, currentBeadId)}
              >
                <Text style={[styles.controlButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Next
                </Text>
                <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Right Sidebar: Full Bead Visualization (tablet and desktop only) */}
        {(isTablet || isDesktop) && (
          <View style={[styles.rightSidebar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.sidebarTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Rosary Beads
            </Text>
            <BeadCounter
              beads={beads}
              currentBeadId={currentBeadId}
              completedBeadIds={completedBeadIds}
              onBeadPress={navigateToBead}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginHorizontal: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
    padding: 20,
    borderRadius: 12,
    gap: 8,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 24,
    borderRadius: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  mysteryItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  mysteryNumber: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    width: 28,
  },
  mysteryContent: {
    flex: 1,
  },
  mysteryName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  mysteryReference: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 60,
  },
  toolbarButton: {
    padding: 8,
  },
  toolbarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  toolbarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  toolbarTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  toolbarSubtitle: {
    fontSize: 13,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  progressBar: {
    height: 4,
  },
  progressFill: {
    height: '100%',
  },
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSidebar: {
    width: 200,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  rightSidebar: {
    width: 300,
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  sidebarSection: {
    marginBottom: 24,
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  decadeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  decadeGridButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  decadeGridText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  progressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  shortcutText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    lineHeight: 18,
  },
  centerContent: {
    flex: 1,
  },
  prayerScroll: {
    flex: 1,
  },
  prayerScrollContent: {
    padding: 32,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  prayerScrollContentMobile: {
    padding: 16,
    maxWidth: '100%',
    alignSelf: 'center',
    width: '100%',
  },
  prayerScrollContentTablet: {
    padding: 24,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  prayerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 20,
    textAlign: 'center',
  },
  prayerTitleMobile: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 20,
    textAlign: 'center',
  },
  prayerTitleTablet: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 20,
    textAlign: 'center',
  },
  mysteryInfoCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  mysteryInfoDecade: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 6,
  },
  mysteryInfoName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  prayerText: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'Georgia',
    marginBottom: 20,
  },
  bibleVerseCard: {
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  bibleVerseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bibleVerseTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  bibleVerseText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
  },
  loadingVerseText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginTop: 20,
  },
  controls: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});

