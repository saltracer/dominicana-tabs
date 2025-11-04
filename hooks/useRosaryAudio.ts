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
import { AudioSettings, RosaryBead } from '../types/rosary-types';
import { AudioStateManager } from '../lib/audio-state-manager';

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
}

export function useRosaryAudio(options: UseRosaryAudioOptions): UseRosaryAudioReturn {
  const { 
    beads, 
    voice, 
    settings, 
    rosaryForm, 
    mysteryName, 
    showMysteryMeditations,
    isLentSeason,
    onTrackChange,
    onQueueComplete
  } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const isInitializedRef = useRef<boolean>(false);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);
  const beadIdMapRef = useRef<Map<number, string>>(new Map());
  const beadToTrackMapRef = useRef<Map<string, number>>(new Map());
  
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
            Capability.SeekTo, // iOS needs this for proper audio session
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
          // Explicitly enable progress updates for iOS
          progressUpdateEventInterval: 1,
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
   * Build complete queue from all rosary beads
   */
  const buildFullQueue = useCallback(async (): Promise<QueueTrack[]> => {
    const tracks: QueueTrack[] = [];
    let trackIndex = 0;
    let downloadCount = 0;
    const totalBeads = beads.length;
    
    console.log('[useRosaryAudio] Building full queue for', totalBeads, 'beads');
    setDownloadProgress({ current: 0, total: totalBeads });
    
    for (const bead of beads) {
      if (!bead.audioFile) continue;
      
      downloadCount++;
      setDownloadProgress({ current: downloadCount, total: totalBeads });
      
      // Get audio file path (handle short meditations)
      let audioFile = bead.audioFile;
      if (bead.type === 'mystery-announcement' && !showMysteryMeditations) {
        audioFile = audioFile.replace('.m4a', '-short.m4a');
      }
      
      // Handle sequential prayers - Faith/Hope/Charity + Hail Mary
      if (bead.id === 'opening-hail-mary-faith') {
        console.log('[useRosaryAudio] Adding Faith/Hope/Charity sequence');
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
            artwork: require('../assets/images/dominicana_logo-icon-white.png'),
            beadId: bead.id,
          });
          beadIdMapRef.current.set(trackIndex, bead.id);
          if (!beadToTrackMapRef.current.has(bead.id)) {
            beadToTrackMapRef.current.set(bead.id, trackIndex);
          }
          trackIndex++;
        }
      }
      
      // Handle sequential prayers - Dominican Glory Be + Alleluia
      if (bead.id === 'dominican-opening-glory-be' && !isLentSeason) {
        console.log('[useRosaryAudio] Adding Glory Be + Alleluia sequence');
        
        // Add Glory Be
        const gloryBeUri = await RosaryAudioDownloadService.getAudioFileUri(voice, audioFile);
        if (gloryBeUri) {
          tracks.push({
            url: gloryBeUri,
            title: 'Glory Be',
            artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
            album: mysteryName,
            artwork: require('../assets/images/dominicana_logo-icon-white.png'),
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
            artwork: require('../assets/images/dominicana_logo-icon-white.png'),
            beadId: bead.id, // Same bead ID as Glory Be
          });
          beadIdMapRef.current.set(trackIndex, bead.id);
          trackIndex++;
        }
        
        continue; // Skip normal processing for this bead
      }
      
      // Check if this is a combined audio (multiple prayers)
      if (audioFile.startsWith('assets/audio/rosary/combined:')) {
        // Extract individual audio files
        const audioFileList = audioFile.replace('assets/audio/rosary/combined:', '').split('|');
        console.log('[useRosaryAudio] Creating combined audio from:', audioFileList);
        
        // Add each individual audio file as a separate track
        // TrackPlayer will play them sequentially
        for (const individualAudio of audioFileList) {
          const uri = await RosaryAudioDownloadService.getAudioFileUri(voice, individualAudio);
          if (uri) {
            tracks.push({
              url: uri,
              title: bead.title, // Keep the combined title
              artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
              album: mysteryName,
              artwork: require('../assets/images/dominicana_logo-icon-white.png'),
              beadId: bead.id, // Same bead ID for all tracks
            });
            beadIdMapRef.current.set(trackIndex, bead.id);
            trackIndex++;
          }
        }
        // Map the bead to the first track of the sequence
        if (!beadToTrackMapRef.current.has(bead.id)) {
          beadToTrackMapRef.current.set(bead.id, trackIndex - audioFileList.length);
        }
        continue;
      }
      
      // Regular prayer - download and add to queue
      const uri = await RosaryAudioDownloadService.getAudioFileUri(voice, audioFile);
      
      if (!uri) {
        console.warn('[useRosaryAudio] Could not load audio for:', bead.title);
        continue;
      }
      
      tracks.push({
        url: uri,
        title: bead.title,
        artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
        album: mysteryName,
        artwork: require('../assets/images/dominicana_logo-icon-white.png'),
        beadId: bead.id,
      });
      
      beadIdMapRef.current.set(trackIndex, bead.id);
      if (!beadToTrackMapRef.current.has(bead.id)) {
        beadToTrackMapRef.current.set(bead.id, trackIndex);
      }
      trackIndex++;
    }
    
    console.log(`[useRosaryAudio] Built queue with ${tracks.length} tracks from ${beads.length} beads`);
    setDownloadProgress({ current: totalBeads, total: totalBeads });
    
    return tracks;
  }, [beads, voice, showMysteryMeditations, isLentSeason, rosaryForm, mysteryName]);

  /**
   * Initialize complete rosary queue
   */
  const initializeQueue = useCallback(async (): Promise<void> => {
    if (!isInitializedRef.current) {
      await ensurePlayerReady();
    }
    
    setIsLoading(true);
    
    try {
      console.log('[useRosaryAudio] Initializing full rosary queue...');
      
      // Reset player
      await TrackPlayer.reset();
      
      // Clear maps
      beadIdMapRef.current.clear();
      beadToTrackMapRef.current.clear();
      
      // Build complete queue
      const tracks = await buildFullQueue();
      
      console.log('[useRosaryAudio] Adding', tracks.length, 'tracks to queue');
      
      // Add all tracks to player
      await TrackPlayer.add(tracks);
      
      // Set initial settings
      await TrackPlayer.setVolume(settings.volume);
      await TrackPlayer.setRate(settings.speed);
      
      setIsLoading(false);
      console.log('[useRosaryAudio] Full rosary queue loaded and ready');
      
    } catch (error) {
      console.error('[useRosaryAudio] Failed to initialize queue:', error);
      setIsLoading(false);
      throw error;
    }
  }, [ensurePlayerReady, buildFullQueue, settings.volume, settings.speed]);

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
   * Listen for track changes and queue completion
   */
  useTrackPlayerEvents([Event.PlaybackQueueEnded, Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackQueueEnded) {
      console.log('[useRosaryAudio] Queue ended - Rosary complete!');
      
      // Reset state
      setManualIsPlaying(false);
      setManualIsPaused(false);
      setCurrentTrackIndex(0);
      
      // Call completion callback
      if (onQueueComplete) {
        onQueueComplete();
      }
    }
    
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== undefined) {
      console.log('[useRosaryAudio] Track changed to index:', event.nextTrack);
      
      setCurrentTrackIndex(event.nextTrack);
      
      // Get bead ID from track index
      const beadId = beadIdMapRef.current.get(event.nextTrack);
      
      if (beadId && onTrackChange) {
        console.log('[useRosaryAudio] Updating UI to bead:', beadId);
        onTrackChange(beadId, event.nextTrack);
      }
    }
  });

  /**
   * Handle remote next/previous events (from lock screen/notification)
   */
  useTrackPlayerEvents([Event.RemoteNext, Event.RemotePrevious], (event) => {
    if (event.type === Event.RemoteNext) {
      console.log('[useRosaryAudio] Remote next triggered');
      TrackPlayer.skipToNext();
    }
    
    if (event.type === Event.RemotePrevious) {
      console.log('[useRosaryAudio] Remote previous triggered');
      TrackPlayer.skipToPrevious();
    }
  });

  /**
   * Play (start queue playback)
   */
  const play = useCallback(async () => {
    await TrackPlayer.play();
    setManualIsPlaying(true);
    setManualIsPaused(false);
    
    // Set rosary as active audio type when playing
    AudioStateManager.setActiveAudioType('rosary');
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
   * Stop and reset
   */
  const stop = useCallback(async () => {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
    beadIdMapRef.current.clear();
    beadToTrackMapRef.current.clear();
    setManualIsPlaying(false);
    setManualIsPaused(false);
    setCurrentTrackIndex(0);
  }, []);

  /**
   * Skip to next track in queue
   */
  const skipToNext = useCallback(async () => {
    await TrackPlayer.skipToNext();
  }, []);

  /**
   * Skip to previous track in queue
   */
  const skipToPrevious = useCallback(async () => {
    await TrackPlayer.skipToPrevious();
  }, []);

  /**
   * Skip to specific track index
   */
  const skipToTrack = useCallback(async (trackIndex: number) => {
    await TrackPlayer.skip(trackIndex);
  }, []);

  /**
   * Skip to specific bead (finds first track for that bead)
   */
  const skipToBead = useCallback(async (beadId: string) => {
    const trackIndex = beadToTrackMapRef.current.get(beadId);
    if (trackIndex !== undefined) {
      console.log('[useRosaryAudio] Skipping to bead:', beadId, 'at track index:', trackIndex);
      await TrackPlayer.skip(trackIndex);
    } else {
      console.warn('[useRosaryAudio] No track found for bead:', beadId);
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

  // Register handlers and cleanup on unmount
  useEffect(() => {
    // Register rosary handlers with AudioStateManager
    AudioStateManager.registerAudioHandlers('rosary', {
      play: play,
      pause: pause,
      stop: stop,
      next: skipToNext,
      previous: skipToPrevious,
    });
    console.log('[useRosaryAudio] Registered rosary handlers with AudioStateManager');
    
    return () => {
      AudioStateManager.unregisterAudioHandlers('rosary');
      console.log('[useRosaryAudio] Unregistered rosary handlers');
      TrackPlayer.reset();
    };
  }, [play, pause, stop, skipToNext, skipToPrevious]);

  return {
    // State
    isPlaying,
    isPaused,
    isLoading,
    currentTrackIndex,
    progress,
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
  };
}
