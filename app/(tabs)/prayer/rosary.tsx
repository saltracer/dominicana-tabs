/**
 * Rosary Screen - Redesigned with Split-Screen Layout (Design Proposal 3)
 * Individual bead navigation with Bible verses and meditations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import PrayerNavigation from '../../../components/PrayerNavigation';
import BeadCounter from '../../../components/BeadCounter';
import RosaryDecadeSelector from '../../../components/RosaryDecadeSelector';
import RosaryMysteryCarousel from '../../../components/RosaryMysteryCarousel';
import { RosaryBead, RosaryForm, MysterySet, AudioSettings, FinalPrayerConfig } from '../../../types/rosary-types';
import { rosaryService } from '../../../services/RosaryService';
import { bibleService } from '../../../services/BibleService';
import { getTodaysMystery, ROSARY_MYSTERIES } from '../../../constants/rosaryData';
import { UserLiturgyPreferencesService } from '../../../services/UserLiturgyPreferencesService';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfilePanel } from '../../../contexts/ProfilePanelContext';
import { useRosaryPlayer } from '../../../contexts/RosaryPlayerContext';
import RosaryAudioControls from '../../../components/RosaryAudioControls';

export default function RosaryScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const { user } = useAuth();
  const { isPanelOpen } = useProfilePanel();
  
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
      rosaryPlayer.skipToNext();
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
      rosaryPlayer.skipToPrevious();
    } else {
      const prev = rosaryService.getPreviousBead(beads, currentBeadId);
      if (prev) {
        setCompletedBeadIds(completedBeadIds.filter(id => id !== currentBeadId && id !== prev.id));
        setCurrentBeadId(prev.id);
      }
    }
  }, [beads, currentBeadId, completedBeadIds, audioSettings.isEnabled, rosaryPlayer]);

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

  // Audio playback is now handled by the global RosaryPlayerContext
  // TrackPlayer auto-advances through the queue - no per-bead playback logic needed

  // Load user's rosary preferences
  const loadUserPreferences = useCallback(async () => {
    if (user?.id) {
      try {
        const prefs = await UserLiturgyPreferencesService.getUserPreferences(user.id);
        console.log('[Rosary Native] Loading preferences:', prefs?.rosary_final_prayers);
        
        if (prefs?.rosary_voice) {
          setRosaryVoice(prefs.rosary_voice);
        }
        // Load mystery meditations preference (default to true if not set)
        setShowMysteryMeditations(prefs?.show_mystery_meditations ?? true);
        // Load playback speed preference (default to 1.0 if not set)
        setPlaybackSpeed(prefs?.audio_playback_speed ?? 1.0);
        // Load final prayers configuration (default to traditional 3 prayers if not set)
        if (prefs?.rosary_final_prayers) {
          console.log('[Rosary Native] Setting final prayers config:', prefs.rosary_final_prayers);
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
  // This is more efficient than polling and only triggers when needed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        // Small delay to ensure profile changes have been saved
        setTimeout(() => {
          loadUserPreferences();
        }, 1000);
      }
    };

    // Listen for visibility changes (when user returns to tab)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [user?.id, loadUserPreferences]);

  // For native, detect when profile panel closes and refresh preferences
  const [wasPanelOpen, setWasPanelOpen] = useState(false);
  useEffect(() => {
    if (wasPanelOpen && !isPanelOpen && user?.id) {
      // Profile panel was just closed, refresh preferences
      console.log('[Rosary Native] Profile panel closed, refreshing preferences');
      loadUserPreferences();
    }
    setWasPanelOpen(isPanelOpen);
  }, [isPanelOpen, wasPanelOpen, user?.id, loadUserPreferences]);

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
    // Mark all previous beads as completed
    const currentIndex = beads.findIndex(b => b.id === beadId);
    const completedIds = beads.slice(0, currentIndex).map(b => b.id);
    setCompletedBeadIds(completedIds);
    
    // If audio is enabled, also jump to that bead in the audio queue
    if (audioSettings.isEnabled) {
      console.log('[Rosary Native] Jumping audio to bead:', beadId);
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
    console.log('[Rosary] Speed changed to:', speed);
    setPlaybackSpeed(speed);
    
    // Apply to current playback if audio is enabled
    if (audioSettings.isEnabled) {
      await rosaryPlayer.setSpeed(speed);
    }
    
    // Save to user preferences
    if (user?.id) {
      try {
        await UserLiturgyPreferencesService.updateUserPreferences(user.id, { audio_playback_speed: speed });
        console.log('[Rosary] Speed preference saved:', speed);
      } catch (error) {
        console.error('[Rosary] Failed to save speed preference:', error);
      }
    }
  };

  // Helper function to check for failed audio files
  const checkForFailedAudioFiles = async () => {
    const failedFiles: { beadId: string; title: string; audioFile: string }[] = [];
    
    for (const bead of beads) {
      if (bead.audioFile) {
        try {
          // Try to check if the audio file exists/loads
          const response = await fetch(bead.audioFile, { method: 'HEAD' });
          if (!response.ok) {
            failedFiles.push({
              beadId: bead.id,
              title: bead.title,
              audioFile: bead.audioFile
            });
          }
        } catch (error) {
          failedFiles.push({
            beadId: bead.id,
            title: bead.title,
            audioFile: bead.audioFile
          });
        }
      }
    }
    
    return failedFiles;
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
              onPress: () => router.push('/auth')
            }
          ]
        );
        return;
      }
      
      // Enable audio and start global rosary session
      try {
        console.log('[Rosary] Starting global rosary session...');
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
            console.log('[Rosary] Track changed to bead:', beadId);
            setCurrentBeadId(beadId);
            
            // Mark previous beads as complete
            const beadIndex = beads.findIndex(b => b.id === beadId);
            if (beadIndex >= 0) {
              const completed = beads.slice(0, beadIndex).map(b => b.id);
              setCompletedBeadIds(completed);
            }
          },
          () => {
            console.log('[Rosary] Queue complete - Rosary finished!');
            setIsPraying(false);
            setAudioSettings(prev => ({ ...prev, isEnabled: false }));
          }
        );
        
        setIsAudioPaused(false);
        console.log('[Rosary] Global rosary session started');
        
        // Check for failed audio files and log them
        const failedAudioFiles = await checkForFailedAudioFiles();
        if (failedAudioFiles.length > 0) {
          console.warn('[Rosary] Failed audio files:', failedAudioFiles);
          console.warn('[Rosary] Missing audio files:', failedAudioFiles.map(f => f.audioFile).join(', '));
        }
      } catch (error) {
        console.error('[Rosary] Failed to initialize audio:', error);
        Alert.alert('Audio Error', 'Failed to load audio files. Please try again.');
        setAudioSettings(prev => ({ ...prev, isEnabled: false }));
      }
    } else if (isAudioPlaying && !isAudioPaused) {
      // Pause audio
      await rosaryPlayer.pause();
      setIsAudioPaused(true);
    } else if (isAudioPaused || (rosaryPlayer.isSessionActive && !rosaryPlayer.isPlaying)) {
      // Resume audio (either from pause or after podcast took over)
      console.log('[Rosary] Resuming rosary (paused or session active but not playing)');
      await rosaryPlayer.resume();
      setIsAudioPaused(false);
    } else {
      // Disable audio (when not currently playing and no active session)
      console.log('[Rosary] Stopping rosary session (audio toggle off)');
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <PrayerNavigation activeTab="rosary" />
          
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Split-screen prayer interface
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
          <Text style={[styles.toolbarSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {selectedMystery} • {progress}%
          </Text>
        </View>

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

      {/* Split-Screen Layout */}
      <View style={styles.splitContainer}>
        {/* Left Side: Bead Counter */}
        <View style={[styles.beadCounterContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <BeadCounter
            beads={beads}
            currentBeadId={currentBeadId}
            completedBeadIds={completedBeadIds}
            onBeadPress={navigateToBead}
          />
        </View>

        {/* Right Side: Prayer Content */}
        <View style={styles.prayerContentContainer}>
          <ScrollView 
            style={styles.prayerScroll}
            contentContainerStyle={styles.prayerScrollContent}
          >
            {currentBead && (
              <View>
                <Text style={[styles.prayerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {currentBead.title}
                </Text>
                {(currentBead.decadeNumber ?? 0) > 0 && (currentBead.decadeNumber ?? 0) <= 5 && (
                  <View style={[styles.mysteryInfoCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                    <Text style={[styles.mysteryInfoDecade, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      {`Decade ${currentBead.decadeNumber} of 5`}
                    </Text>
                    <Text style={[styles.mysteryInfoName, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {ROSARY_MYSTERIES.find(m => m.name === selectedMystery)?.mysteries[(currentBead.decadeNumber ?? 1) - 1]?.name || ''}
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
      </View>

      {/* Bottom: Decade Selector */}
      <View style={[styles.bottomBar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <RosaryDecadeSelector
          currentDecade={getCurrentDecade()}
          onDecadeSelect={jumpToDecade}
        />
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
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
    fontSize: 14,
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
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
    width: 24,
  },
  mysteryContent: {
    flex: 1,
  },
  mysteryName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  mysteryReference: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  toolbarTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  toolbarSubtitle: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
  },
  progressFill: {
    height: '100%',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  beadCounterContainer: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  prayerContentContainer: {
    flex: 1,
  },
  prayerScroll: {
    flex: 1,
  },
  prayerScrollContent: {
    padding: 20,
  },
  prayerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 16,
    textAlign: 'center',
  },
  mysteryInfoCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  mysteryInfoDecade: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  mysteryInfoName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  bibleVerseCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  bibleVerseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bibleVerseTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  bibleVerseText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Georgia',
  },
  loadingVerseText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginTop: 16,
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

