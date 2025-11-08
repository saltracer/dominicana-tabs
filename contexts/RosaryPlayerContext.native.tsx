/**
 * RosaryPlayerContext - Native Implementation
 * Global state management for rosary audio playback
 * Provides persistent rosary audio state across navigation
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { RosaryBead, RosaryForm, MysterySet, AudioSettings } from '../types/rosary-types';
import { useRosaryAudio } from '../hooks/useRosaryAudio';
import { AudioStateManager } from '../lib/audio-state-manager';

interface RosaryPlayerContextType {
  // Current session
  currentMystery: MysterySet | null;
  currentBeadId: string | null;
  currentBeadTitle: string | null;
  currentBeadNumber: number | null; // For displaying "3/10"
  totalBeadsInDecade: number | null; // For displaying "3/10"
  rosaryForm: RosaryForm | null;
  voice: string | null;
  beads: RosaryBead[];
  
  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  progress: { position: number; duration: number; buffered: number };
  downloadProgress: { current: number; total: number };
  currentSpeed: number;
  
  // Session management
  startRosary: (
    mystery: MysterySet,
    form: RosaryForm,
    beads: RosaryBead[],
    voice: string,
    settings: AudioSettings,
    showMysteryMeditations: boolean,
    isLentSeason: boolean,
    onTrackChange?: (beadId: string, trackIndex: number) => void,
    onQueueComplete?: () => void
  ) => Promise<void>;
  stopRosary: () => Promise<void>;
  
  // Playback controls
  play: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  skipToBead: (beadId: string) => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  
  // Session active flag
  isSessionActive: boolean;
}

const RosaryPlayerContext = createContext<RosaryPlayerContextType | undefined>(undefined);

export function RosaryPlayerProvider({ children }: { children: React.ReactNode }) {
  // Session state
  const [currentMystery, setCurrentMystery] = useState<MysterySet | null>(null);
  const [currentBeadId, setCurrentBeadId] = useState<string | null>(null);
  const [currentBeadTitle, setCurrentBeadTitle] = useState<string | null>(null);
  const [currentBeadNumber, setCurrentBeadNumber] = useState<number | null>(null);
  const [totalBeadsInDecade, setTotalBeadsInDecade] = useState<number | null>(null);
  const [rosaryForm, setRosaryForm] = useState<RosaryForm | null>(null);
  const [voice, setVoice] = useState<string | null>(null);
  const [beads, setBeads] = useState<RosaryBead[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Audio settings for the current session
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
  const [showMysteryMeditations, setShowMysteryMeditations] = useState(true);
  const [isLentSeason, setIsLentSeason] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1.0);
  
  // Callbacks
  const onTrackChangeRef = useRef<((beadId: string, trackIndex: number) => void) | null>(null);
  const onQueueCompleteRef = useRef<(() => void) | null>(null);
  
  // Preserve last known bead when rosary was active (for resuming after podcast takeover)
  const lastKnownBeadIdRef = useRef<string | null>(null);
  
  // Flag to prevent saving bead during rebuild operations
  const isRebuildingQueueRef = useRef<boolean>(false);
  
  // Track change handler
  const handleTrackChange = useCallback((beadId: string, trackIndex: number) => {
    console.log('[RosaryPlayerContext] Track changed to bead:', beadId);
    setCurrentBeadId(beadId);
    
    // IMPORTANT: Only update last known bead if rosary is the active audio type
    // AND we're not currently rebuilding the queue (which fires spurious events)
    // AND TrackPlayer is not being reset by another audio type
    const activeType = AudioStateManager.getActiveAudioType();
    const isRebuilding = isRebuildingQueueRef.current;
    const isResetting = AudioStateManager.getIsResettingTrackPlayer();
    
    if (activeType === 'rosary' && !isRebuilding && !isResetting) {
      lastKnownBeadIdRef.current = beadId;
      console.log('[RosaryPlayerContext] Saved last known bead:', beadId);
    } else {
      console.log('[RosaryPlayerContext] NOT saving bead (active:', activeType, ', rebuilding:', isRebuilding, ', resetting:', isResetting, ')');
    }
    
    // Find the bead and update title and number
    const bead = beads.find(b => b.id === beadId);
    if (bead) {
      setCurrentBeadTitle(bead.title);
      
      // Calculate bead number for display (e.g., "3/10" for third Hail Mary)
      if (bead.type === 'hail-mary' && bead.beadNumber && bead.decadeNumber) {
        setCurrentBeadNumber(bead.beadNumber);
        setTotalBeadsInDecade(10);
      } else {
        setCurrentBeadNumber(null);
        setTotalBeadsInDecade(null);
      }
    }
    
    // Call original callback if provided
    if (onTrackChangeRef.current) {
      onTrackChangeRef.current(beadId, trackIndex);
    }
  }, [beads]);
  
  // Queue complete handler
  const handleQueueComplete = useCallback(() => {
    console.log('[RosaryPlayerContext] Rosary queue completed');
    // Keep session active but mark as completed
    
    // Call original callback if provided
    if (onQueueCompleteRef.current) {
      onQueueCompleteRef.current();
    }
  }, []);
  
  // Initialize rosary audio hook
  const rosaryAudio = useRosaryAudio({
    beads,
    voice: voice || 'alphonsus',
    settings: audioSettings,
    rosaryForm: rosaryForm || 'dominican',
    mysteryName: currentMystery || 'Joyful Mysteries',
    showMysteryMeditations,
    isLentSeason,
    onTrackChange: handleTrackChange,
    onQueueComplete: handleQueueComplete,
  });
  
  // Register handlers with AudioStateManager
  useEffect(() => {
    AudioStateManager.registerAudioHandlers('rosary', {
      play: rosaryAudio.play,
      pause: rosaryAudio.pause,
      stop: rosaryAudio.stop,
      next: rosaryAudio.skipToNext,
      previous: rosaryAudio.skipToPrevious,
    });
    console.log('[RosaryPlayerContext] Registered rosary handlers with AudioStateManager');
    
    return () => {
      AudioStateManager.unregisterAudioHandlers('rosary');
      console.log('[RosaryPlayerContext] Unregistered rosary handlers');
    };
  }, [rosaryAudio.play, rosaryAudio.pause, rosaryAudio.stop, rosaryAudio.skipToNext, rosaryAudio.skipToPrevious]);
  
  // Track when we're the active audio type for UI state updates
  const [isActiveAudioType, setIsActiveAudioType] = useState(true);
  
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const activeType = AudioStateManager.getActiveAudioType();
      const isActive = activeType === 'rosary';
      setIsActiveAudioType(isActive);
      
      // Log when podcast takes over (for debugging)
      if (activeType === 'podcast' && rosaryAudio.isPlaying && isSessionActive) {
        // Logged once when transition happens (state will update via setIsActiveAudioType)
        if (isActive) {
          console.log('[RosaryPlayerContext] Podcast took over TrackPlayer, marking rosary as paused');
        }
      }
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, [rosaryAudio.isPlaying, isSessionActive]);
  
  // Flag to trigger initialization after state updates
  const [shouldInitialize, setShouldInitialize] = useState(false);
  
  // Initialize queue when beads are ready
  useEffect(() => {
    if (shouldInitialize && beads.length > 0) {
      const initializeAndPlay = async () => {
        console.log('[RosaryPlayerContext] Initializing queue with', beads.length, 'beads');
        await rosaryAudio.initializeQueue();
        await rosaryAudio.play();
        
        // Set rosary as active audio type
        AudioStateManager.setActiveAudioType('rosary');
        
        setShouldInitialize(false);
      };
      
      initializeAndPlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldInitialize, beads.length]);
  
  // Start a new rosary session
  const startRosary = useCallback(async (
    mystery: MysterySet,
    form: RosaryForm,
    beadsList: RosaryBead[],
    voiceSelection: string,
    settings: AudioSettings,
    showMeditations: boolean,
    isLent: boolean,
    onTrackChange?: (beadId: string, trackIndex: number) => void,
    onQueueComplete?: () => void
  ) => {
    console.log('[RosaryPlayerContext] Starting rosary session:', mystery, form, 'with', beadsList.length, 'beads');
    
    // Store callbacks
    onTrackChangeRef.current = onTrackChange || null;
    onQueueCompleteRef.current = onQueueComplete || null;
    
    // Update session state
    setCurrentMystery(mystery);
    setRosaryForm(form);
    setBeads(beadsList);
    setVoice(voiceSelection);
    setAudioSettings(settings);
    setShowMysteryMeditations(showMeditations);
    setIsLentSeason(isLent);
    setCurrentSpeed(settings.speed);
    setIsSessionActive(true);
    
    // Initialize the first bead
    if (beadsList.length > 0) {
      const firstBead = beadsList[0];
      setCurrentBeadId(firstBead.id);
      setCurrentBeadTitle(firstBead.title);
      setCurrentBeadNumber(null);
      setTotalBeadsInDecade(null);
    }
    
    // Trigger initialization after state updates
    setShouldInitialize(true);
  }, []);
  
  // Stop rosary session
  const stopRosary = useCallback(async () => {
    console.log('[RosaryPlayerContext] Stopping rosary session');
    await rosaryAudio.stop();
    
    // Clear session state
    setShouldInitialize(false);
    setIsSessionActive(false);
    setCurrentMystery(null);
    setCurrentBeadId(null);
    setCurrentBeadTitle(null);
    setCurrentBeadNumber(null);
    setTotalBeadsInDecade(null);
    setRosaryForm(null);
    setVoice(null);
    setBeads([]);
    onTrackChangeRef.current = null;
    onQueueCompleteRef.current = null;
    
    // Clear active audio type if it's rosary
    if (AudioStateManager.getActiveAudioType() === 'rosary') {
      AudioStateManager.setActiveAudioType(null);
    }
  }, [rosaryAudio]);
  
  // Play control
  const play = useCallback(async () => {
    await rosaryAudio.play();
    AudioStateManager.setActiveAudioType('rosary');
  }, [rosaryAudio]);
  
  // Pause control
  const pause = useCallback(async () => {
    await rosaryAudio.pause();
  }, [rosaryAudio]);
  
  // Resume control
  const resume = useCallback(async () => {
    console.log('[RosaryPlayerContext] resume called, currentBeadId:', currentBeadId);
    // Check if we need to reclaim TrackPlayer from podcast
    const activeType = AudioStateManager.getActiveAudioType();
    console.log('[RosaryPlayerContext] Current active audio type:', activeType);
    
    if (activeType === 'podcast') {
      console.log('[RosaryPlayerContext] Reclaiming TrackPlayer from podcast, rebuilding queue');
      // Use last known bead (more reliable than currentBeadId which may reset)
      const resumeBeadId = lastKnownBeadIdRef.current || currentBeadId;
      console.log('[RosaryPlayerContext] Last known bead:', lastKnownBeadIdRef.current);
      console.log('[RosaryPlayerContext] Current bead:', currentBeadId);
      console.log('[RosaryPlayerContext] Will resume at bead:', resumeBeadId);
      
      // IMPORTANT: Claim audio type BEFORE rebuilding queue
      // This prevents podcast from reacting to TrackPlayer events during rebuild
      AudioStateManager.setActiveAudioType('rosary');
      console.log('[RosaryPlayerContext] Claimed audio type before rebuild');
      
      // Set flag to prevent saving spurious track change events during rebuild
      isRebuildingQueueRef.current = true;
      console.log('[RosaryPlayerContext] Set rebuilding flag to true');
      
      // Rebuild the entire rosary queue
      await rosaryAudio.initializeQueue();
      console.log('[RosaryPlayerContext] Queue rebuilt');
      
      // Jump back to where user was BEFORE playing
      if (resumeBeadId) {
        console.log('[RosaryPlayerContext] Jumping to bead:', resumeBeadId);
        await rosaryAudio.skipToBead(resumeBeadId);
        console.log('[RosaryPlayerContext] Jumped to bead:', resumeBeadId);
      }
      
      // Clear rebuild flag - now we can save position again
      isRebuildingQueueRef.current = false;
      console.log('[RosaryPlayerContext] Cleared rebuilding flag');
      
      // Now start playing from that position
      await rosaryAudio.play();
      console.log('[RosaryPlayerContext] Playing from resumed bead');
    } else {
      console.log('[RosaryPlayerContext] No need to reclaim, just playing');
      await rosaryAudio.play();
      // Set active audio type when not reclaiming (just resuming)
      AudioStateManager.setActiveAudioType('rosary');
    }
  }, [rosaryAudio, currentBeadId]);
  
  // Skip to next bead
  const skipToNext = useCallback(async () => {
    await rosaryAudio.skipToNext();
  }, [rosaryAudio]);
  
  // Skip to previous bead
  const skipToPrevious = useCallback(async () => {
    await rosaryAudio.skipToPrevious();
  }, [rosaryAudio]);
  
  // Skip to specific bead
  const skipToBead = useCallback(async (beadId: string) => {
    await rosaryAudio.skipToBead(beadId);
  }, [rosaryAudio]);
  
  // Set playback speed
  const setSpeedControl = useCallback(async (speed: number) => {
    setCurrentSpeed(speed);
    await rosaryAudio.setSpeed(speed);
  }, [rosaryAudio]);
  
  // Compute effective playing state - only truly playing if rosary is the active audio type
  const effectiveIsPlaying = rosaryAudio.isPlaying && isActiveAudioType;
  const effectiveIsPaused = !effectiveIsPlaying && isSessionActive;
  
  const value: RosaryPlayerContextType = {
    // Current session
    currentMystery,
    currentBeadId,
    currentBeadTitle,
    currentBeadNumber,
    totalBeadsInDecade,
    rosaryForm,
    voice,
    beads,
    
    // Playback state
    isPlaying: effectiveIsPlaying,
    isPaused: effectiveIsPaused,
    isLoading: rosaryAudio.isLoading,
    progress: rosaryAudio.progress,
    downloadProgress: rosaryAudio.downloadProgress,
    currentSpeed,
    
    // Session management
    startRosary,
    stopRosary,
    
    // Playback controls
    play,
    pause,
    resume,
    skipToNext,
    skipToPrevious,
    skipToBead,
    setSpeed: setSpeedControl,
    
    // Session active flag
    isSessionActive,
  };
  
  return (
    <RosaryPlayerContext.Provider value={value}>
      {children}
    </RosaryPlayerContext.Provider>
  );
}

export function useRosaryPlayer(): RosaryPlayerContextType {
  const context = useContext(RosaryPlayerContext);
  if (context === undefined) {
    throw new Error('useRosaryPlayer must be used within a RosaryPlayerProvider');
  }
  return context;
}

