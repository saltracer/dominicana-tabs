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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import PrayerNavigation from '../../../components/PrayerNavigation';
import BeadCounter from '../../../components/BeadCounter';
import RosaryDecadeSelector from '../../../components/RosaryDecadeSelector';
import RosaryMysteryCarousel from '../../../components/RosaryMysteryCarousel';
import { RosaryBead, RosaryForm, MysterySet, AudioSettings } from '../../../types/rosary-types';
import { rosaryService } from '../../../services/RosaryService';
import { bibleService } from '../../../services/BibleService';
import { rosaryAudioService } from '../../../services/RosaryAudioService';
import { getTodaysMystery, ROSARY_MYSTERIES } from '../../../constants/rosaryData';
import { UserLiturgyPreferencesService } from '../../../services/UserLiturgyPreferencesService';
import { useAuth } from '../../../contexts/AuthContext';

export default function RosaryScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const { user } = useAuth();
  
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

  // Generate beads when form or mystery changes
  useEffect(() => {
    // Check if current liturgical season is Lent or Holy Week
    const isLentSeason = liturgicalDay?.season.name === 'Lent' || liturgicalDay?.season.name === 'Holy Week';
    const generatedBeads = rosaryService.generateRosaryBeads(rosaryForm, selectedMystery, isLentSeason);
    setBeads(generatedBeads);
    if (generatedBeads.length > 0 && !currentBeadId) {
      setCurrentBeadId(generatedBeads[0].id);
    }
  }, [rosaryForm, selectedMystery, liturgicalDay]);

  // Load Bible verse for current mystery announcement (only if meditations enabled)
  useEffect(() => {
    const currentBead = beads.find(b => b.id === currentBeadId);
    if (currentBead && currentBead.type === 'mystery-announcement' && currentBead.decadeNumber && showMysteryMeditations) {
      loadBibleVerse(currentBead.decadeNumber);
    } else {
      setBibleVerse('');
    }
  }, [currentBeadId, beads, selectedMystery, showMysteryMeditations]);

  // Play audio when bead changes
  useEffect(() => {
    if (!isPraying || !currentBeadId || beads.length === 0) return;

    const currentBead = beads.find(b => b.id === currentBeadId);
    
    if (currentBead && currentBead.audioFile && audioSettings.isEnabled) {
      // Use short audio file for mystery announcements when meditations are disabled
      let audioFile = currentBead.audioFile;
      if (currentBead.type === 'mystery-announcement' && !showMysteryMeditations) {
        // Replace the audio file with the short version
        audioFile = audioFile.replace('.m4a', '-short.m4a');
      }
      
      console.log('[Rosary Audio] Playing:', audioFile, 'Voice:', rosaryVoice, 'Short:', !showMysteryMeditations && currentBead.type === 'mystery-announcement');
      setIsAudioPlaying(true);
      
      // Special handling for Dominican opening Glory Be + Alleluia
      const isDominicanGloryBe = currentBead.id === 'dominican-opening-glory-be';
      // Check if it's Lent using the liturgical calendar (not system date)
      const isLentSeason = liturgicalDay?.season.name === 'Lent' || liturgicalDay?.season.name === 'Holy Week';
      const shouldPlayAlleluia = isDominicanGloryBe && !isLentSeason;
      
      rosaryAudioService.playPrayer(audioFile, audioSettings, rosaryVoice, () => {
        console.log('[Rosary Audio] Finished playing');
        
        // If this is the Dominican opening Glory Be and not Lent, play Alleluia next
        if (shouldPlayAlleluia) {
          console.log('[Rosary Audio] Playing Alleluia after Glory Be');
          rosaryAudioService.playPrayer('assets/audio/rosary/alleluia.m4a', audioSettings, rosaryVoice, () => {
            console.log('[Rosary Audio] Alleluia finished');
            setIsAudioPlaying(false);
            
            // Auto-advance after both prayers complete
            const hasNextBead = rosaryService.getNextBead(beads, currentBeadId);
            if (hasNextBead) {
              setTimeout(() => {
                nextBead();
              }, audioSettings.pauseDuration * 50);
            }
          });
        } else {
          setIsAudioPlaying(false);
          
          // Auto-advance when audio finishes (if audio is enabled)
          const hasNextBead = rosaryService.getNextBead(beads, currentBeadId);
          if (hasNextBead) {
            setTimeout(() => {
              nextBead();
            }, audioSettings.pauseDuration * 50);
          }
        }
      });
    } else {
      setIsAudioPlaying(false);
    }

    // Cleanup function
    return () => {
      // Don't stop audio on unmount, let it finish playing
    };
  }, [currentBeadId, audioSettings.isEnabled, isPraying, showMysteryMeditations]);

  // Initialize audio when starting rosary
  useEffect(() => {
    if (isPraying) {
      rosaryAudioService.initialize();
    } else {
      // Cleanup audio when exiting
      rosaryAudioService.cleanup();
    }
  }, [isPraying]);

  // Load user's rosary preferences
  const loadUserPreferences = useCallback(async () => {
    if (user?.id) {
      try {
        const prefs = await UserLiturgyPreferencesService.getUserPreferences(user.id);
        if (prefs?.rosary_voice) {
          setRosaryVoice(prefs.rosary_voice);
        }
        // Load mystery meditations preference (default to true if not set)
        setShowMysteryMeditations(prefs?.show_mystery_meditations ?? true);
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

  const navigateToBead = (beadId: string) => {
    setCurrentBeadId(beadId);
    // Mark all previous beads as completed
    const currentIndex = beads.findIndex(b => b.id === beadId);
    const completedIds = beads.slice(0, currentIndex).map(b => b.id);
    setCompletedBeadIds(completedIds);
  };

  const nextBead = () => {
    const nextBead = rosaryService.getNextBead(beads, currentBeadId);
    if (nextBead) {
      setCompletedBeadIds([...completedBeadIds, currentBeadId]);
      setCurrentBeadId(nextBead.id);
    }
  };

  const previousBead = () => {
    const prevBead = rosaryService.getPreviousBead(beads, currentBeadId);
    if (prevBead) {
      setCompletedBeadIds(completedBeadIds.filter(id => id !== currentBeadId && id !== prevBead.id));
      setCurrentBeadId(prevBead.id);
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

  const handleAudioToggle = async () => {
    if (!audioSettings.isEnabled) {
      // Enable audio
      setAudioSettings(prev => ({ ...prev, isEnabled: true }));
      setIsAudioPaused(false);
    } else if (isAudioPlaying && !isAudioPaused) {
      // Pause audio
      await rosaryAudioService.pauseCurrentSound();
      setIsAudioPaused(true);
    } else if (isAudioPaused) {
      // Resume audio
      await rosaryAudioService.resumeCurrentSound();
      setIsAudioPaused(false);
    } else {
      // Disable audio (when not currently playing)
      setAudioSettings(prev => ({ ...prev, isEnabled: false }));
      setIsAudioPaused(false);
    }
  };

  const isLastBead = (): boolean => {
    return currentBeadId === beads[beads.length - 1]?.id;
  };

  const completeRosary = () => {
    setCompletedBeadIds([...completedBeadIds, currentBeadId]);
    setIsPraying(false);
    setCurrentBeadId('');
    setCompletedBeadIds([]);
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

        <TouchableOpacity 
          onPress={handleAudioToggle}
          style={styles.toolbarButton}
        >
          <Ionicons 
            name={
              !audioSettings.isEnabled ? "volume-mute" 
              : isAudioPaused ? "pause" 
              : isAudioPlaying ? "musical-notes" 
              : "volume-high"
            } 
            size={24} 
            color={audioSettings.isEnabled ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary} 
          />
        </TouchableOpacity>
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

