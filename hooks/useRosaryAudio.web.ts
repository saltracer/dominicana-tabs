/**
 * useRosaryAudio Hook - Web Version
 * Component-based audio management for rosary prayers using react-native-track-player
 * Provides system integration, background playback, and media controls
 * Web-compatible version that uses direct URLs instead of file system caching
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
import { RosaryAudioDownloadService } from '../services/RosaryAudioDownloadService.web';
import { AudioSettings, RosaryBead } from '../types/rosary-types';

interface UseRosaryAudioOptions {
  beads: RosaryBead[];
  voice: string;
  settings: AudioSettings;
  rosaryForm: 'dominican' | 'standard';
  mysteryName: string;
  showMysteryMeditations: boolean;
  isLentSeason: boolean;
  onTrackChange?: (beadId: string, trackIndex: number) => void;
  onQueueComplete?: () => void;
}

interface QueueTrack extends Track {
  beadId: string;
}

interface UseRosaryAudioReturn {
  // State
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTrackIndex: number;
  progress: { position: number; duration: number; buffered: number };
  downloadProgress: { current: number; total: number };
  
  // Controls
  initializeQueue: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  skipToTrack: (trackIndex: number) => Promise<void>;
  skipToBead: (beadId: string) => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  cleanup: () => Promise<void>;
  
  // Queue management
  clearQueue: () => Promise<void>;
  rebuildQueue: () => Promise<void>;
}

export function useRosaryAudio({
  beads,
  voice,
  settings,
  rosaryForm,
  mysteryName,
  showMysteryMeditations,
  isLentSeason,
  onTrackChange,
  onQueueComplete,
}: UseRosaryAudioOptions): UseRosaryAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  
  const isInitializedRef = useRef(false);
  const beadIdMapRef = useRef<Map<number, string>>(new Map());
  const beadToTrackMapRef = useRef<Map<string, number>>(new Map());
  
  // Track player hooks
  const progress = useProgress();
  const playbackState = usePlaybackState();
  const activeTrack = useActiveTrack();

  // Monitor activeTrack changes and trigger UI updates
  useEffect(() => {
    if (activeTrack?.index !== undefined && onTrackChange) {
      const beadId = beadIdMapRef.current.get(activeTrack.index);
      if (beadId) {
        console.log('[useRosaryAudio Web] ActiveTrack changed to index:', activeTrack.index, 'bead:', beadId);
        onTrackChange(beadId, activeTrack.index);
      }
    }
  }, [activeTrack?.index, onTrackChange]);

  // Update state from track player
  useEffect(() => {
    if (playbackState.state === State.Playing) {
      setIsPlaying(true);
      setIsPaused(false);
    } else if (playbackState.state === State.Paused) {
      setIsPlaying(false);
      setIsPaused(true);
    } else {
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [playbackState.state]);

  // Track player events - combine both for better handling
  useTrackPlayerEvents([Event.PlaybackTrackChanged, Event.PlaybackQueueEnded], (event) => {
    console.log('[useRosaryAudio Web] TrackPlayer event received:', event.type);
    
    if (event.type === Event.PlaybackQueueEnded) {
      console.log('[useRosaryAudio Web] Queue ended - Rosary complete!');
      if (onQueueComplete) {
        onQueueComplete();
      }
      return;
    }
    
    if (event.type === Event.PlaybackTrackChanged) {
      // Use both event.track and event.nextTrack for compatibility
      const trackIndex = (event as any).nextTrack !== undefined ? (event as any).nextTrack : (event as any).track;
      
      console.log('[useRosaryAudio Web] Track changed event details:', {
        trackIndex,
        hasNextTrack: (event as any).nextTrack !== undefined,
        hasTrack: (event as any).track !== undefined,
        eventData: event
      });
      
      if (trackIndex !== null && trackIndex !== undefined) {
        console.log('[useRosaryAudio Web] Track changed to index:', trackIndex);
        const beadId = beadIdMapRef.current.get(trackIndex);
        console.log('[useRosaryAudio Web] BeadId for track', trackIndex, ':', beadId);
        
        if (beadId && onTrackChange) {
          console.log('[useRosaryAudio Web] Calling onTrackChange with beadId:', beadId);
          onTrackChange(beadId, trackIndex);
        } else {
          console.warn('[useRosaryAudio Web] No beadId or onTrackChange callback for track', trackIndex);
        }
      }
    }
  });

  /**
   * Ensure TrackPlayer is ready
   */
  const ensurePlayerReady = useCallback(async (): Promise<void> => {
    if (isInitializedRef.current) {
      return;
    }

    try {
      // Try to setup player, but catch the "already initialized" error gracefully
      try {
        await TrackPlayer.setupPlayer({
          waitForBuffer: true,
          autoHandleInterruptions: true,
        });
        console.log('[useRosaryAudio Web] TrackPlayer setup completed');
      } catch (setupError: any) {
        if (setupError.code === 'player_already_initialized') {
          console.log('[useRosaryAudio Web] TrackPlayer already initialized, continuing...');
        } else {
          throw setupError;
        }
      }

      // Always try to update options (this should work even if already initialized)
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        progressUpdateEventInterval: 1, // Enable progress updates for track change detection
      });

      isInitializedRef.current = true;
      console.log('[useRosaryAudio Web] TrackPlayer ready');
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to initialize TrackPlayer:', error);
      throw error;
    }
  }, []);

  /**
   * Build the complete audio queue for web
   */
  const buildFullQueue = useCallback(async (): Promise<QueueTrack[]> => {
    console.log('[useRosaryAudio Web] Building audio queue...');
    
    const tracks: QueueTrack[] = [];
    let trackIndex = 0;
    
    // Clear previous mappings
    beadIdMapRef.current.clear();
    beadToTrackMapRef.current.clear();
    
    const totalBeads = beads.length;
    setDownloadProgress({ current: 0, total: totalBeads });

    for (const bead of beads) {
      const audioFile = bead.audioFile;
      if (!audioFile) {
        console.warn(`[useRosaryAudio Web] No audio file for bead: ${bead.title}`);
        continue;
      }

      // Handle special cases for web
      if (bead.id === 'faith-hope-charity') {
        console.log('[useRosaryAudio Web] Adding Faith/Hope/Charity sequence');
        const fhcUri = await RosaryAudioDownloadService.getAudioFileUri(
          voice,
          'assets/audio/rosary/faith-hope-charity.m4a'
        );
        
        if (fhcUri) {
          tracks.push({
            url: fhcUri,
            title: 'Faith, Hope, and Charity',
            artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
            album: mysteryName,
            beadId: bead.id,
          });
          beadIdMapRef.current.set(trackIndex, bead.id);
          if (!beadToTrackMapRef.current.has(bead.id)) {
            beadToTrackMapRef.current.set(bead.id, trackIndex);
          }
          trackIndex++;
        }
        continue;
      }
      
      // Handle sequential prayers - Dominican Glory Be + Alleluia
      if (bead.id === 'dominican-opening-glory-be' && !isLentSeason) {
        console.log('[useRosaryAudio Web] Adding Glory Be + Alleluia sequence');
        
        // Add Glory Be
        const gloryBeUri = await RosaryAudioDownloadService.getAudioFileUri(voice, audioFile);
        if (gloryBeUri) {
          tracks.push({
            url: gloryBeUri,
            title: 'Glory Be',
            artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
            album: mysteryName,
            beadId: bead.id,
          });
          beadIdMapRef.current.set(trackIndex, bead.id);
          if (!beadToTrackMapRef.current.has(bead.id)) {
            beadToTrackMapRef.current.set(bead.id, trackIndex);
          }
          trackIndex++;
        }
        
        // Add Alleluia
        const alleluiaUri = await RosaryAudioDownloadService.getAudioFileUri(
          voice,
          'assets/audio/rosary/alleluia.m4a'
        );
        if (alleluiaUri) {
          tracks.push({
            url: alleluiaUri,
            title: 'Alleluia',
            artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
            album: mysteryName,
            beadId: bead.id, // Same bead ID as Glory Be
          });
          beadIdMapRef.current.set(trackIndex, bead.id);
          trackIndex++;
        }
        
        continue; // Skip normal processing for this bead
      }
      
      // Regular prayer - get direct URL for web
      const uri = await RosaryAudioDownloadService.getAudioFileUri(voice, audioFile);
      
      if (!uri) {
        console.warn('[useRosaryAudio Web] Could not load audio for:', bead.title);
        continue;
      }
      
      tracks.push({
        url: uri,
        title: bead.title,
        artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
        album: mysteryName,
        beadId: bead.id,
      });
      
      beadIdMapRef.current.set(trackIndex, bead.id);
      if (!beadToTrackMapRef.current.has(bead.id)) {
        beadToTrackMapRef.current.set(bead.id, trackIndex);
      }
      trackIndex++;
    }
    
    console.log(`[useRosaryAudio Web] Built queue with ${tracks.length} tracks from ${beads.length} beads`);
    setDownloadProgress({ current: totalBeads, total: totalBeads });
    
    return tracks;
  }, [beads, voice, showMysteryMeditations, isLentSeason, rosaryForm, mysteryName]);

  /**
   * Initialize complete rosary queue
   */
  const initializeQueue = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('[useRosaryAudio Web] Initializing audio queue...');
      
      // Ensure TrackPlayer is ready (handles multiple calls gracefully)
      await ensurePlayerReady();
      
      // Clear existing queue
      await TrackPlayer.reset();
      
      // Build new queue
      const tracks = await buildFullQueue();
      
      if (tracks.length === 0) {
        throw new Error('No audio tracks available');
      }
      
      // Add tracks to player
      await TrackPlayer.add(tracks);
      
      // Set initial settings
      await TrackPlayer.setVolume(settings.volume);
      await TrackPlayer.setRate(settings.speed);
      
      console.log('[useRosaryAudio Web] Audio queue initialized successfully');
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to initialize queue:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [ensurePlayerReady, buildFullQueue, settings.volume, settings.speed]);

  /**
   * Play audio
   */
  const play = useCallback(async (): Promise<void> => {
    try {
      await TrackPlayer.play();
      console.log('[useRosaryAudio Web] Playback started');
      
      // Trigger initial track change to update UI with first track
      setTimeout(async () => {
        try {
          const currentTrack = await TrackPlayer.getActiveTrack();
          console.log('[useRosaryAudio Web] Current active track:', currentTrack?.index);
          
          if (currentTrack?.index !== undefined) {
            const beadId = beadIdMapRef.current.get(currentTrack.index);
            if (beadId && onTrackChange) {
              console.log('[useRosaryAudio Web] Triggering initial track change for bead:', beadId);
              onTrackChange(beadId, currentTrack.index);
            }
          }
        } catch (err) {
          console.warn('[useRosaryAudio Web] Failed to get initial track:', err);
        }
      }, 100); // Small delay to let TrackPlayer initialize
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to start playback:', error);
      throw error;
    }
  }, [onTrackChange]);

  /**
   * Pause audio
   */
  const pause = useCallback(async (): Promise<void> => {
    try {
      await TrackPlayer.pause();
      console.log('[useRosaryAudio Web] Playback paused');
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to pause playback:', error);
      throw error;
    }
  }, []);

  /**
   * Stop audio
   */
  const stop = useCallback(async (): Promise<void> => {
    try {
      await TrackPlayer.stop();
      console.log('[useRosaryAudio Web] Playback stopped');
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to stop playback:', error);
      throw error;
    }
  }, []);

  /**
   * Skip to next track
   */
  const skipToNext = useCallback(async (): Promise<void> => {
    try {
      await TrackPlayer.skipToNext();
      console.log('[useRosaryAudio Web] Skipped to next track');
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to skip to next:', error);
      throw error;
    }
  }, []);

  /**
   * Skip to previous track
   */
  const skipToPrevious = useCallback(async (): Promise<void> => {
    try {
      await TrackPlayer.skipToPrevious();
      console.log('[useRosaryAudio Web] Skipped to previous track');
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to skip to previous:', error);
      throw error;
    }
  }, []);

  /**
   * Skip to specific track index
   */
  const skipToTrack = useCallback(async (trackIndex: number): Promise<void> => {
    try {
      await TrackPlayer.skip(trackIndex);
      console.log(`[useRosaryAudio Web] Skipped to track ${trackIndex}`);
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to skip to track:', error);
      throw error;
    }
  }, []);

  /**
   * Skip to specific bead
   */
  const skipToBead = useCallback(async (beadId: string): Promise<void> => {
    try {
      const trackIndex = beadToTrackMapRef.current.get(beadId);
      if (trackIndex !== undefined) {
        await TrackPlayer.skip(trackIndex);
        console.log(`[useRosaryAudio Web] Skipped to bead ${beadId} (track ${trackIndex})`);
      } else {
        console.warn(`[useRosaryAudio Web] No track found for bead: ${beadId}`);
      }
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to skip to bead:', error);
      throw error;
    }
  }, []);

  /**
   * Set playback speed
   */
  const setSpeed = useCallback(async (speed: number): Promise<void> => {
    try {
      await TrackPlayer.setRate(speed);
      console.log(`[useRosaryAudio Web] Speed set to ${speed}`);
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to set speed:', error);
      throw error;
    }
  }, []);

  /**
   * Set volume
   */
  const setVolume = useCallback(async (volume: number): Promise<void> => {
    try {
      await TrackPlayer.setVolume(volume);
      console.log(`[useRosaryAudio Web] Volume set to ${volume}`);
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to set volume:', error);
      throw error;
    }
  }, []);

  /**
   * Clear queue
   */
  const clearQueue = useCallback(async (): Promise<void> => {
    try {
      await TrackPlayer.reset();
      beadIdMapRef.current.clear();
      beadToTrackMapRef.current.clear();
      console.log('[useRosaryAudio Web] Queue cleared');
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to clear queue:', error);
      throw error;
    }
  }, []);

  /**
   * Rebuild queue
   */
  const rebuildQueue = useCallback(async (): Promise<void> => {
    try {
      console.log('[useRosaryAudio Web] Rebuilding queue...');
      await initializeQueue();
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to rebuild queue:', error);
      throw error;
    }
  }, [initializeQueue]);

  /**
   * Cleanup audio
   */
  const cleanup = useCallback(async (): Promise<void> => {
    try {
      await stop();
      console.log('[useRosaryAudio Web] Audio cleaned up');
    } catch (error) {
      console.error('[useRosaryAudio Web] Failed to cleanup audio:', error);
      throw error;
    }
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      TrackPlayer.reset().catch(console.error);
    };
  }, []);

  return {
    // State
    isPlaying,
    isPaused,
    isLoading,
    currentTrackIndex: activeTrack?.index ?? 0,
    progress: {
      position: progress.position,
      duration: progress.duration,
      buffered: progress.buffered,
    },
    downloadProgress,
    
    // Controls
    initializeQueue,
    play,
    pause,
    stop,
    skipToNext,
    skipToPrevious,
    skipToTrack,
    skipToBead,
    setSpeed,
    setVolume,
    cleanup,
    
    // Queue management
    clearQueue,
    rebuildQueue,
  };
}
