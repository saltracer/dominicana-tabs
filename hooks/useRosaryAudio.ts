/**
 * useRosaryAudio Hook
 * Component-based audio management for rosary prayers using react-native-track-player
 * Provides system integration, background playback, and media controls
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import TrackPlayer, {
  Capability,
  State,
  Event,
  useProgress,
  usePlaybackState,
  useActiveTrack,
  useTrackPlayerEvents,
  Track,
} from 'react-native-track-player';
import { RosaryAudioDownloadService } from '../services/RosaryAudioDownloadService';
import { AudioSettings } from '../types/rosary-types';

interface UseRosaryAudioOptions {
  voice: string;
  settings: AudioSettings;
  rosaryForm?: 'dominican' | 'standard';
  mysteryName?: string;
  onSkipNext?: () => void;
  onSkipPrevious?: () => void;
}

interface UseRosaryAudioReturn {
  // State
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  progress: { position: number; duration: number; buffered: number };
  
  // Controls
  playPrayer: (audioFile: string, prayerTitle: string, onComplete?: () => void) => Promise<void>;
  playSequence: (audioFiles: Array<{file: string, title: string}>, onComplete?: () => void) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  skip: () => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  cleanup: () => Promise<void>;
}

export function useRosaryAudio(options: UseRosaryAudioOptions): UseRosaryAudioReturn {
  const { voice, settings, rosaryForm = 'dominican', mysteryName = '', onSkipNext, onSkipPrevious } = options;
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const onCompleteCallbackRef = useRef<(() => void) | null>(null);
  const sequenceIndexRef = useRef<number>(0);
  const sequenceFilesRef = useRef<Array<{file: string, title: string}>>([]);
  const isPlayingRef = useRef<boolean>(false);
  
  // Use RNTP hooks for real-time state
  const progress = useProgress();
  const playbackState = usePlaybackState();
  const activeTrack = useActiveTrack();
  
  const isPlaying = playbackState.state === State.Playing;
  const isPaused = playbackState.state === State.Paused;

  /**
   * Initialize TrackPlayer
   */
  const initializePlayer = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      // Check if already set up to avoid duplicate setup
      try {
        const state = await TrackPlayer.getPlaybackState();
        if (state) {
          console.log('[useRosaryAudio] TrackPlayer already initialized');
          setIsInitialized(true);
          return;
        }
      } catch (e) {
        // Not initialized, continue with setup
      }
      
      await TrackPlayer.setupPlayer({
        autoUpdateMetadata: true,
        autoHandleInterruptions: true,
      });
      
      // Configure capabilities for lock screen/notification controls
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
        notificationCapabilities: [Capability.Play, Capability.Pause],
      });
      
      setIsInitialized(true);
      console.log('[useRosaryAudio] TrackPlayer initialized');
    } catch (error) {
      console.error('[useRosaryAudio] Failed to initialize TrackPlayer:', error);
    }
  }, [isInitialized]);

  // Initialize on mount
  useEffect(() => {
    initializePlayer();
  }, []);

  /**
   * Listen for track changes and queue end to handle sequential playback
   */
  useTrackPlayerEvents([Event.PlaybackQueueEnded, Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackQueueEnded) {
      console.log('[useRosaryAudio] Queue ended');
      
      // Check if we're playing a sequence
      if (sequenceFilesRef.current.length > 0) {
        sequenceIndexRef.current++;
        
        // If there are more files in the sequence, play the next one
        if (sequenceIndexRef.current < sequenceFilesRef.current.length) {
          const nextFile = sequenceFilesRef.current[sequenceIndexRef.current];
          console.log('[useRosaryAudio] Playing next in sequence:', nextFile.title);
          
          try {
            const uri = await RosaryAudioDownloadService.getAudioFileUri(voice, nextFile.file);
            if (uri) {
              await TrackPlayer.reset();
              await TrackPlayer.add({
                url: uri,
                title: nextFile.title,
                artist: `${rosaryForm} Rosary`,
                album: mysteryName,
              });
              await TrackPlayer.play();
            }
          } catch (error) {
            console.error('[useRosaryAudio] Error playing next in sequence:', error);
            // Continue to completion callback
            sequenceIndexRef.current = sequenceFilesRef.current.length;
          }
          return;
        }
        
        // Sequence complete
        sequenceFilesRef.current = [];
        sequenceIndexRef.current = 0;
      }
      
      // Reset playing flag
      isPlayingRef.current = false;
      
      // Call completion callback
      if (onCompleteCallbackRef.current) {
        const callback = onCompleteCallbackRef.current;
        onCompleteCallbackRef.current = null;
        callback();
      }
    }
    
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== undefined) {
      console.log('[useRosaryAudio] Track changed to:', event.nextTrack);
    }
  });

  /**
   * Handle remote next/previous events
   */
  useTrackPlayerEvents([Event.RemoteNext, Event.RemotePrevious], (event) => {
    if (event.type === Event.RemoteNext) {
      console.log('[useRosaryAudio] Remote next triggered');
      // Stop current playback and advance to next prayer
      isPlayingRef.current = false;
      TrackPlayer.reset();
      onSkipNext?.();
    }
    
    if (event.type === Event.RemotePrevious) {
      console.log('[useRosaryAudio] Remote previous triggered');
      // Stop current playback and go to previous prayer
      isPlayingRef.current = false;
      TrackPlayer.reset();
      onSkipPrevious?.();
    }
  });

  /**
   * Play a single prayer audio file
   */
  const playPrayer = useCallback(async (
    audioFile: string,
    prayerTitle: string,
    onComplete?: () => void
  ): Promise<void> => {
    if (!settings.isEnabled || settings.mode === 'silent') {
      onComplete?.();
      return;
    }
    
    // Prevent multiple simultaneous playback calls
    if (isPlayingRef.current) {
      console.log('[useRosaryAudio] Already playing, skipping duplicate call');
      return;
    }
    
    isPlayingRef.current = true;
    
    try {
      // Wait for initialization
      if (!isInitialized) {
        await initializePlayer();
      }
      
      setIsLoading(true);
      
      // Get audio file URI (download if needed, use cache if available)
      const uri = await RosaryAudioDownloadService.getAudioFileUri(voice, audioFile);
      
      if (!uri) {
        console.warn('[useRosaryAudio] Audio file not available:', audioFile);
        onComplete?.();
        setIsLoading(false);
        return;
      }
      
      console.log('[useRosaryAudio] Playing prayer:', prayerTitle, 'from:', uri);
      
      // Reset player and add new track
      await TrackPlayer.reset();
      
      const track: Track = {
        url: uri,
        title: prayerTitle,
        artist: `${rosaryForm} Rosary`,
        album: mysteryName,
      };
      
      await TrackPlayer.add(track);
      
      // Set playback settings
      await TrackPlayer.setVolume(settings.volume);
      await TrackPlayer.setRate(settings.speed);
      
      // Update Now Playing metadata
      await TrackPlayer.updateNowPlayingMetadata({
        title: prayerTitle,
        artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
        album: mysteryName || 'Rosary Prayer',
      });
      
      // Store completion callback
      onCompleteCallbackRef.current = onComplete || null;
      sequenceFilesRef.current = [];
      sequenceIndexRef.current = 0;
      
      // Start playback
      await TrackPlayer.play();
      
      setIsLoading(false);
      
      // Reset flag after a short delay to allow playback to start
      setTimeout(() => {
        isPlayingRef.current = false;
      }, 500);
    } catch (error) {
      console.error('[useRosaryAudio] Error playing prayer:', error);
      setIsLoading(false);
      isPlayingRef.current = false;
      onComplete?.();
    }
  }, [voice, settings, rosaryForm, mysteryName]);

  /**
   * Play a sequence of prayers (for multi-prayer beads like Mystery + Our Father)
   */
  const playSequence = useCallback(async (
    audioFiles: Array<{file: string, title: string}>,
    onComplete?: () => void
  ): Promise<void> => {
    if (!settings.isEnabled || settings.mode === 'silent' || audioFiles.length === 0) {
      onComplete?.();
      return;
    }
    
    // Prevent multiple simultaneous playback calls
    if (isPlayingRef.current) {
      console.log('[useRosaryAudio] Already playing sequence, skipping duplicate call');
      return;
    }
    
    isPlayingRef.current = true;
    
    try {
      // Wait for initialization
      if (!isInitialized) {
        await initializePlayer();
      }
      
      setIsLoading(true);
      
      // Store sequence info for queue ended handler
      sequenceFilesRef.current = audioFiles;
      sequenceIndexRef.current = 0;
      onCompleteCallbackRef.current = onComplete || null;
      
      // Play first file in sequence
      const firstFile = audioFiles[0];
      const uri = await RosaryAudioDownloadService.getAudioFileUri(voice, firstFile.file);
      
      if (!uri) {
        console.warn('[useRosaryAudio] First audio file not available:', firstFile.file);
        onComplete?.();
        setIsLoading(false);
        return;
      }
      
      console.log('[useRosaryAudio] Starting sequence:', audioFiles.map(f => f.title).join(' → '));
      
      // Reset player and add first track
      await TrackPlayer.reset();
      
      const track: Track = {
        url: uri,
        title: firstFile.title,
        artist: `${rosaryForm} Rosary`,
        album: mysteryName,
      };
      
      await TrackPlayer.add(track);
      
      // Set playback settings
      await TrackPlayer.setVolume(settings.volume);
      await TrackPlayer.setRate(settings.speed);
      
      // Update Now Playing metadata with first prayer
      await TrackPlayer.updateNowPlayingMetadata({
        title: firstFile.title,
        artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
        album: mysteryName || 'Rosary Prayer',
      });
      
      // Start playback
      await TrackPlayer.play();
      
      setIsLoading(false);
      
      // Reset flag after a short delay
      setTimeout(() => {
        isPlayingRef.current = false;
      }, 500);
    } catch (error) {
      console.error('[useRosaryAudio] Error playing sequence:', error);
      setIsLoading(false);
      isPlayingRef.current = false;
      onComplete?.();
    }
  }, [voice, settings, rosaryForm, mysteryName]);

  /**
   * Play
   */
  const play = useCallback(async () => {
    await TrackPlayer.play();
  }, []);

  /**
   * Pause
   */
  const pause = useCallback(async () => {
    await TrackPlayer.pause();
  }, []);

  /**
   * Stop
   */
  const stop = useCallback(async () => {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
    onCompleteCallbackRef.current = null;
    sequenceFilesRef.current = [];
    sequenceIndexRef.current = 0;
    isPlayingRef.current = false;
  }, []);

  /**
   * Skip to next (advances queue or completes current prayer)
   */
  const skip = useCallback(async () => {
    // If in a sequence, try to skip to next in sequence
    if (sequenceFilesRef.current.length > 0 && sequenceIndexRef.current < sequenceFilesRef.current.length - 1) {
      await TrackPlayer.skipToNext();
    } else {
      // Otherwise, stop and trigger completion
      await TrackPlayer.reset();
      isPlayingRef.current = false;
      if (onCompleteCallbackRef.current) {
        const callback = onCompleteCallbackRef.current;
        onCompleteCallbackRef.current = null;
        sequenceFilesRef.current = [];
        sequenceIndexRef.current = 0;
        callback();
      }
    }
  }, []);

  /**
   * Set playback speed
   */
  const setSpeed = useCallback(async (speed: number) => {
    await TrackPlayer.setRate(speed);
  }, []);

  /**
   * Set volume
   */
  const setVolume = useCallback(async (volume: number) => {
    await TrackPlayer.setVolume(volume);
  }, []);

  /**
   * Cleanup
   */
  const cleanup = useCallback(async () => {
    await stop();
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      TrackPlayer.reset();
    };
  }, []);

  return {
    // State
    isPlaying,
    isPaused,
    isLoading,
    progress,
    
    // Controls
    playPrayer,
    playSequence,
    play,
    pause,
    stop,
    skip,
    setSpeed,
    setVolume,
    cleanup,
  };
}

