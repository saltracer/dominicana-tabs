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
  
  const [isLoading, setIsLoading] = useState(false);
  const onCompleteCallbackRef = useRef<(() => void) | null>(null);
  const sequenceIndexRef = useRef<number>(0);
  const sequenceFilesRef = useRef<Array<{file: string, title: string}>>([]);
  const isPlayingRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);
  
  // Manual state management (instead of RNTP hooks to avoid initialization issues)
  const [manualIsPlaying, setManualIsPlaying] = useState(false);
  const [manualIsPaused, setManualIsPaused] = useState(false);
  const [manualProgress, setManualProgress] = useState({ position: 0, duration: 0, buffered: 0 });
  
  const isPlaying = manualIsPlaying;
  const isPaused = manualIsPaused;
  const progress = manualProgress;

  /**
   * Wait for TrackPlayer to be ready and configure capabilities
   */
  const ensurePlayerReady = useCallback(async (): Promise<void> => {
    if (isInitializedRef.current) {
      return;
    }
    
    // Return existing promise if already waiting
    if (initializationPromiseRef.current) {
      return initializationPromiseRef.current;
    }
    
    const readyPromise = (async () => {
      try {
        console.log('[useRosaryAudio] Waiting for TrackPlayer to be ready...');
        
        // Poll until TrackPlayer is ready (max 5 seconds)
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
          try {
            const state = await TrackPlayer.getPlaybackState();
            if (state) {
              console.log('[useRosaryAudio] TrackPlayer is ready!');
              break;
            }
          } catch (e) {
            // Not ready yet, wait and retry
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }
        
        if (attempts >= maxAttempts) {
          throw new Error('TrackPlayer did not initialize in time');
        }
        
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
        
        isInitializedRef.current = true;
        console.log('[useRosaryAudio] Capabilities configured successfully');
      } catch (error) {
        console.error('[useRosaryAudio] Failed to ensure player ready:', error);
        throw error;
      } finally {
        initializationPromiseRef.current = null;
      }
    })();
    
    initializationPromiseRef.current = readyPromise;
    return readyPromise;
  }, []);

  // Wait for player on mount
  useEffect(() => {
    ensurePlayerReady();
  }, [ensurePlayerReady]);

  /**
   * Listen for playback state changes to update manual state
   */
  useTrackPlayerEvents([Event.PlaybackState], (event) => {
    if (event.type === Event.PlaybackState) {
      setManualIsPlaying(event.state === State.Playing);
      setManualIsPaused(event.state === State.Paused);
    }
  });

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
      
      // Reset playing flag and state
      isPlayingRef.current = false;
      setManualIsPlaying(false);
      
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
      // Ensure player is ready
      if (!isInitializedRef.current) {
        await ensurePlayerReady();
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
      setManualIsPlaying(true);
      setManualIsPaused(false);
      
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
      // Ensure player is ready
      if (!isInitializedRef.current) {
        await ensurePlayerReady();
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
      setManualIsPlaying(true);
      setManualIsPaused(false);
      
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
    setManualIsPlaying(true);
    setManualIsPaused(false);
  }, []);

  /**
   * Pause
   */
  const pause = useCallback(async () => {
    await TrackPlayer.pause();
    setManualIsPlaying(false);
    setManualIsPaused(true);
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
    setManualIsPlaying(false);
    setManualIsPaused(false);
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

