/**
 * useRosaryAudio Hook - Web Version with HTML5 Audio
 * Component-based audio management for rosary prayers using HTML5 Audio API
 * Replaces react-native-track-player to eliminate CoreAudio errors on web
 */

import { useEffect, useRef, useState, useCallback } from 'react';
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

interface QueueTrack {
  url: string;
  beadId: string;
  title: string;
  artist: string;
  album: string;
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
  setCurrentBeadWithoutPlaying: (beadId: string) => void;
  setSpeed: (speed: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  cleanup: () => Promise<void>;
  
  // Queue management
  clearQueue: () => Promise<void>;
  rebuildQueue: () => Promise<void>;
}

/**
 * RosaryAudioQueue - Manages sequential playback of rosary audio tracks
 * Uses HTML5 Audio API for web browser compatibility
 */
class RosaryAudioQueue {
  private tracks: QueueTrack[] = [];
  private currentIndex: number = 0;
  private audioElement: HTMLAudioElement;
  private onTrackChange?: (beadId: string, index: number) => void;
  private onQueueComplete?: () => void;
  private onProgressUpdate?: (position: number, duration: number, buffered: number) => void;
  private onPlayStateChange?: (isPlaying: boolean, isPaused: boolean) => void;
  private onError?: (error: Error) => void;
  
  // Event handler references for cleanup
  private endedHandler?: () => void;
  private timeupdateHandler?: () => void;
  private loadedmetadataHandler?: () => void;
  private playHandler?: () => void;
  private pauseHandler?: () => void;
  private errorHandler?: (e: Event) => void;
  
  constructor() {
    this.audioElement = new Audio();
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Track ended - automatically play next
    this.endedHandler = () => {
      console.log('[RosaryAudioQueue] Track ended, advancing to next');
      this.playNext();
    };
    this.audioElement.addEventListener('ended', this.endedHandler);
    
    // Progress updates
    this.timeupdateHandler = () => {
      const position = this.audioElement.currentTime;
      const duration = this.audioElement.duration || 0;
      const buffered = this.getBufferedAmount();
      
      if (this.onProgressUpdate) {
        this.onProgressUpdate(position, duration, buffered);
      }
    };
    this.audioElement.addEventListener('timeupdate', this.timeupdateHandler);
    
    // Metadata loaded - duration available
    this.loadedmetadataHandler = () => {
      const duration = this.audioElement.duration || 0;
      console.log('[RosaryAudioQueue] Metadata loaded, duration:', duration);
      
      if (this.onProgressUpdate) {
        this.onProgressUpdate(0, duration, 0);
      }
    };
    this.audioElement.addEventListener('loadedmetadata', this.loadedmetadataHandler);
    
    // Play state changes
    this.playHandler = () => {
      console.log('[RosaryAudioQueue] Play event');
      if (this.onPlayStateChange) {
        this.onPlayStateChange(true, false);
      }
    };
    this.audioElement.addEventListener('play', this.playHandler);
    
    this.pauseHandler = () => {
      console.log('[RosaryAudioQueue] Pause event');
      if (this.onPlayStateChange) {
        this.onPlayStateChange(false, true);
      }
    };
    this.audioElement.addEventListener('pause', this.pauseHandler);
    
    // Error handling
    this.errorHandler = (e: Event) => {
      const error = this.audioElement.error;
      console.error('[RosaryAudioQueue] Audio error:', error);
      
      if (this.onError && error) {
        const errorMessage = this.getErrorMessage(error);
        this.onError(new Error(errorMessage));
      }
      
      // Try to skip to next track on error
      console.warn('[RosaryAudioQueue] Skipping failed track and continuing');
      this.playNext();
    };
    this.audioElement.addEventListener('error', this.errorHandler);
  }
  
  private getErrorMessage(error: MediaError): string {
    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return 'Audio playback aborted';
      case MediaError.MEDIA_ERR_NETWORK:
        return 'Network error while loading audio';
      case MediaError.MEDIA_ERR_DECODE:
        return 'Audio decode error';
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return 'Audio format not supported';
      default:
        return 'Unknown audio error';
    }
  }
  
  private getBufferedAmount(): number {
    try {
      const buffered = this.audioElement.buffered;
      if (buffered.length > 0) {
        return buffered.end(buffered.length - 1);
      }
    } catch (e) {
      // Ignore buffered errors
    }
    return 0;
  }
  
  /**
   * Set callbacks
   */
  setCallbacks(
    onTrackChange?: (beadId: string, index: number) => void,
    onQueueComplete?: () => void,
    onProgressUpdate?: (position: number, duration: number, buffered: number) => void,
    onPlayStateChange?: (isPlaying: boolean, isPaused: boolean) => void,
    onError?: (error: Error) => void
  ): void {
    this.onTrackChange = onTrackChange;
    this.onQueueComplete = onQueueComplete;
    this.onProgressUpdate = onProgressUpdate;
    this.onPlayStateChange = onPlayStateChange;
    this.onError = onError;
  }
  
  /**
   * Load tracks into queue
   */
  loadTracks(tracks: QueueTrack[]): void {
    console.log('[RosaryAudioQueue] Loading', tracks.length, 'tracks');
    this.tracks = tracks;
    this.currentIndex = 0;
  }
  
  /**
   * Get current track
   */
  getCurrentTrack(): QueueTrack | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.tracks.length) {
      return this.tracks[this.currentIndex];
    }
    return null;
  }
  
  /**
   * Load and play a specific track by index
   */
  private async loadAndPlay(index: number): Promise<void> {
    if (index < 0 || index >= this.tracks.length) {
      console.warn('[RosaryAudioQueue] Invalid track index:', index);
      return;
    }
    
    this.currentIndex = index;
    const track = this.tracks[index];
    
    console.log('[RosaryAudioQueue] Loading track', index, ':', track.title);
    
    // Load new audio source
    this.audioElement.src = track.url;
    
    // Trigger track change callback
    if (this.onTrackChange) {
      this.onTrackChange(track.beadId, index);
    }
    
    try {
      // Start playing
      await this.audioElement.play();
      console.log('[RosaryAudioQueue] Playing track:', track.title);
    } catch (error) {
      console.error('[RosaryAudioQueue] Failed to play track:', error);
      if (this.onError) {
        this.onError(error as Error);
      }
    }
  }
  
  /**
   * Play from current position or start queue
   */
  async play(): Promise<void> {
    if (this.tracks.length === 0) {
      console.warn('[RosaryAudioQueue] No tracks in queue');
      return;
    }
    
    // If no source loaded or at invalid index, load first track
    if (!this.audioElement.src || this.currentIndex < 0 || this.currentIndex >= this.tracks.length) {
      await this.loadAndPlay(0);
      return;
    }
    
    // Resume playback
    try {
      await this.audioElement.play();
      console.log('[RosaryAudioQueue] Resumed playback');
    } catch (error) {
      console.error('[RosaryAudioQueue] Failed to resume:', error);
      if (this.onError) {
        this.onError(error as Error);
      }
    }
  }
  
  /**
   * Pause playback
   */
  pause(): void {
    this.audioElement.pause();
    console.log('[RosaryAudioQueue] Paused');
  }
  
  /**
   * Stop playback and reset
   */
  stop(): void {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    console.log('[RosaryAudioQueue] Stopped');
    
    if (this.onPlayStateChange) {
      this.onPlayStateChange(false, false);
    }
  }
  
  /**
   * Play next track in queue
   */
  async playNext(): Promise<void> {
    const nextIndex = this.currentIndex + 1;
    
    if (nextIndex < this.tracks.length) {
      console.log('[RosaryAudioQueue] Playing next track');
      await this.loadAndPlay(nextIndex);
    } else {
      console.log('[RosaryAudioQueue] Queue complete');
      this.stop();
      
      if (this.onQueueComplete) {
        this.onQueueComplete();
      }
    }
  }
  
  /**
   * Play previous track in queue
   */
  async playPrevious(): Promise<void> {
    const prevIndex = this.currentIndex - 1;
    
    if (prevIndex >= 0) {
      console.log('[RosaryAudioQueue] Playing previous track');
      await this.loadAndPlay(prevIndex);
    } else {
      console.log('[RosaryAudioQueue] Already at first track');
      // Restart current track
      this.audioElement.currentTime = 0;
    }
  }
  
  /**
   * Skip to specific track index
   */
  async skipToTrack(index: number): Promise<void> {
    if (index >= 0 && index < this.tracks.length) {
      console.log('[RosaryAudioQueue] Skipping to track', index);
      await this.loadAndPlay(index);
    } else {
      console.warn('[RosaryAudioQueue] Invalid track index:', index);
    }
  }
  
  /**
   * Skip to specific bead by ID
   */
  async skipToBead(beadId: string): Promise<void> {
    // Find first track with matching beadId
    const trackIndex = this.tracks.findIndex(track => track.beadId === beadId);
    
    if (trackIndex >= 0) {
      console.log('[RosaryAudioQueue] Skipping to bead:', beadId, 'at index:', trackIndex);
      await this.loadAndPlay(trackIndex);
    } else {
      console.warn('[RosaryAudioQueue] Bead not found:', beadId);
    }
  }
  
  /**
   * Set current position to a specific bead without playing
   */
  setCurrentBeadWithoutPlaying(beadId: string): void {
    // Find first track with matching beadId
    const trackIndex = this.tracks.findIndex(track => track.beadId === beadId);
    
    if (trackIndex >= 0) {
      console.log('[RosaryAudioQueue] Setting current bead to:', beadId, 'at index:', trackIndex);
      this.currentIndex = trackIndex;
      const track = this.tracks[trackIndex];
      
      // Load audio source but don't play
      this.audioElement.src = track.url;
      
      // Trigger track change callback
      if (this.onTrackChange) {
        this.onTrackChange(track.beadId, trackIndex);
      }
    } else {
      console.warn('[RosaryAudioQueue] Bead not found:', beadId);
    }
  }
  
  /**
   * Set playback speed
   */
  setSpeed(speed: number): void {
    this.audioElement.playbackRate = speed;
    console.log('[RosaryAudioQueue] Speed set to:', speed);
  }
  
  /**
   * Set volume
   */
  setVolume(volume: number): void {
    this.audioElement.volume = Math.max(0, Math.min(1, volume));
    console.log('[RosaryAudioQueue] Volume set to:', volume);
  }
  
  /**
   * Get current track index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }
  
  /**
   * Clear queue
   */
  clear(): void {
    this.stop();
    this.tracks = [];
    this.currentIndex = 0;
    this.audioElement.src = '';
    console.log('[RosaryAudioQueue] Queue cleared');
  }
  
  /**
   * Cleanup - remove event listeners
   */
  cleanup(): void {
    if (this.endedHandler) {
      this.audioElement.removeEventListener('ended', this.endedHandler);
    }
    if (this.timeupdateHandler) {
      this.audioElement.removeEventListener('timeupdate', this.timeupdateHandler);
    }
    if (this.loadedmetadataHandler) {
      this.audioElement.removeEventListener('loadedmetadata', this.loadedmetadataHandler);
    }
    if (this.playHandler) {
      this.audioElement.removeEventListener('play', this.playHandler);
    }
    if (this.pauseHandler) {
      this.audioElement.removeEventListener('pause', this.pauseHandler);
    }
    if (this.errorHandler) {
      this.audioElement.removeEventListener('error', this.errorHandler);
    }
    
    this.clear();
    console.log('[RosaryAudioQueue] Cleaned up');
  }
}

/**
 * useRosaryAudio Hook - HTML5 Audio implementation
 */
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
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState({ position: 0, duration: 0, buffered: 0 });
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  
  const queueRef = useRef<RosaryAudioQueue | null>(null);
  const beadToTrackMapRef = useRef<Map<string, number>>(new Map());
  
  // Initialize queue on mount
  useEffect(() => {
    queueRef.current = new RosaryAudioQueue();
    
    // Set up callbacks
    queueRef.current.setCallbacks(
      // onTrackChange
      (beadId, index) => {
        console.log('[useRosaryAudio HTML5] Track changed:', beadId, 'index:', index);
        setCurrentTrackIndex(index);
        if (onTrackChange) {
          onTrackChange(beadId, index);
        }
      },
      // onQueueComplete
      () => {
        console.log('[useRosaryAudio HTML5] Queue complete');
        setIsPlaying(false);
        setIsPaused(false);
        if (onQueueComplete) {
          onQueueComplete();
        }
      },
      // onProgressUpdate
      (position, duration, buffered) => {
        setProgress({ position, duration, buffered });
      },
      // onPlayStateChange
      (playing, paused) => {
        setIsPlaying(playing);
        setIsPaused(paused);
      },
      // onError
      (error) => {
        console.error('[useRosaryAudio HTML5] Error:', error);
        setIsLoading(false);
      }
    );
    
    return () => {
      if (queueRef.current) {
        queueRef.current.cleanup();
      }
    };
  }, [onTrackChange, onQueueComplete]);
  
  /**
   * Build the complete audio queue
   * Adapted from TrackPlayer version with same logic for special cases
   */
  const buildFullQueue = useCallback(async (): Promise<QueueTrack[]> => {
    console.log('[useRosaryAudio HTML5] Building audio queue...');
    
    const tracks: QueueTrack[] = [];
    let trackIndex = 0;
    
    // Clear previous mappings
    beadToTrackMapRef.current.clear();
    
    const totalBeads = beads.length;
    setDownloadProgress({ current: 0, total: totalBeads });

    let downloadCount = 0;

    for (const bead of beads) {
      const audioFile = bead.audioFile;
      if (!audioFile) {
        console.warn(`[useRosaryAudio HTML5] No audio file for bead: ${bead.title}`);
        continue;
      }
      
      downloadCount++;
      setDownloadProgress({ current: downloadCount, total: totalBeads });

      // Handle special case: faith-hope-charity
      if (bead.id === 'faith-hope-charity') {
        console.log('[useRosaryAudio HTML5] Adding Faith/Hope/Charity sequence');
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
          if (!beadToTrackMapRef.current.has(bead.id)) {
            beadToTrackMapRef.current.set(bead.id, trackIndex);
          }
          trackIndex++;
        }
        continue;
      }
      
      // Handle sequential prayers - Dominican Glory Be + Alleluia
      if (bead.id === 'dominican-opening-glory-be' && !isLentSeason) {
        console.log('[useRosaryAudio HTML5] Adding Glory Be + Alleluia sequence');
        
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
          trackIndex++;
        }
        
        continue; // Skip normal processing for this bead
      }
      
      // Check if this is a combined audio (multiple prayers)
      if (audioFile.startsWith('assets/audio/rosary/combined:')) {
        // Extract individual audio files
        const audioFileList = audioFile.replace('assets/audio/rosary/combined:', '').split('|');
        console.log('[useRosaryAudio HTML5] Creating combined audio from:', audioFileList);
        
        // Add each individual audio file as a separate track
        // Queue will play them sequentially
        for (const individualAudio of audioFileList) {
          const uri = await RosaryAudioDownloadService.getAudioFileUri(voice, individualAudio);
          if (uri) {
            tracks.push({
              url: uri,
              title: bead.title, // Keep the combined title
              artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
              album: mysteryName,
              beadId: bead.id, // Same bead ID for all tracks
            });
            trackIndex++;
          }
        }
        // Map the bead to the first track of the sequence
        if (!beadToTrackMapRef.current.has(bead.id)) {
          beadToTrackMapRef.current.set(bead.id, trackIndex - audioFileList.length);
        }
        continue;
      }
      
      // Regular prayer - get direct URL for web
      const uri = await RosaryAudioDownloadService.getAudioFileUri(voice, audioFile);
      
      if (!uri) {
        console.warn('[useRosaryAudio HTML5] Could not load audio for:', bead.title);
        continue;
      }
      
      tracks.push({
        url: uri,
        title: bead.title,
        artist: `${rosaryForm.charAt(0).toUpperCase() + rosaryForm.slice(1)} Rosary`,
        album: mysteryName,
        beadId: bead.id,
      });
      
      if (!beadToTrackMapRef.current.has(bead.id)) {
        beadToTrackMapRef.current.set(bead.id, trackIndex);
      }
      trackIndex++;
    }
    
    console.log(`[useRosaryAudio HTML5] Built queue with ${tracks.length} tracks from ${beads.length} beads`);
    setDownloadProgress({ current: totalBeads, total: totalBeads });
    
    return tracks;
  }, [beads, voice, showMysteryMeditations, isLentSeason, rosaryForm, mysteryName]);

  /**
   * Initialize complete rosary queue
   */
  const initializeQueue = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('[useRosaryAudio HTML5] Initializing audio queue...');
      
      // Build queue
      const tracks = await buildFullQueue();
      
      if (tracks.length === 0) {
        throw new Error('No audio tracks available');
      }
      
      // Load tracks into queue
      if (queueRef.current) {
        queueRef.current.loadTracks(tracks);
        
        // Set initial settings
        queueRef.current.setVolume(settings.volume);
        queueRef.current.setSpeed(settings.speed);
      }
      
      console.log('[useRosaryAudio HTML5] Audio queue initialized successfully');
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to initialize queue:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [buildFullQueue, settings.volume, settings.speed]);

  /**
   * Play audio
   */
  const play = useCallback(async (): Promise<void> => {
    try {
      if (queueRef.current) {
        await queueRef.current.play();
        console.log('[useRosaryAudio HTML5] Playback started');
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to start playback:', error);
      throw error;
    }
  }, []);

  /**
   * Pause audio
   */
  const pause = useCallback(async (): Promise<void> => {
    try {
      if (queueRef.current) {
        queueRef.current.pause();
        console.log('[useRosaryAudio HTML5] Playback paused');
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to pause playback:', error);
      throw error;
    }
  }, []);

  /**
   * Stop audio
   */
  const stop = useCallback(async (): Promise<void> => {
    try {
      if (queueRef.current) {
        queueRef.current.stop();
        console.log('[useRosaryAudio HTML5] Playback stopped');
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to stop playback:', error);
      throw error;
    }
  }, []);

  /**
   * Skip to next track
   */
  const skipToNext = useCallback(async (): Promise<void> => {
    try {
      if (queueRef.current) {
        await queueRef.current.playNext();
        console.log('[useRosaryAudio HTML5] Skipped to next track');
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to skip to next:', error);
      throw error;
    }
  }, []);

  /**
   * Skip to previous track
   */
  const skipToPrevious = useCallback(async (): Promise<void> => {
    try {
      if (queueRef.current) {
        await queueRef.current.playPrevious();
        console.log('[useRosaryAudio HTML5] Skipped to previous track');
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to skip to previous:', error);
      throw error;
    }
  }, []);

  /**
   * Skip to specific track index
   */
  const skipToTrack = useCallback(async (trackIndex: number): Promise<void> => {
    try {
      if (queueRef.current) {
        await queueRef.current.skipToTrack(trackIndex);
        console.log(`[useRosaryAudio HTML5] Skipped to track ${trackIndex}`);
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to skip to track:', error);
      throw error;
    }
  }, []);

  /**
   * Skip to specific bead
   */
  const skipToBead = useCallback(async (beadId: string): Promise<void> => {
    try {
      if (queueRef.current) {
        await queueRef.current.skipToBead(beadId);
        console.log('[useRosaryAudio HTML5] Skipped to bead:', beadId);
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to skip to bead:', error);
      throw error;
    }
  }, []);

  /**
   * Set current bead position without playing
   */
  const setCurrentBeadWithoutPlaying = useCallback((beadId: string): void => {
    try {
      if (queueRef.current) {
        queueRef.current.setCurrentBeadWithoutPlaying(beadId);
        console.log('[useRosaryAudio HTML5] Set current bead to:', beadId);
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to set current bead:', error);
      throw error;
    }
  }, []);

  /**
   * Set playback speed
   */
  const setSpeed = useCallback(async (speed: number): Promise<void> => {
    try {
      if (queueRef.current) {
        queueRef.current.setSpeed(speed);
        console.log(`[useRosaryAudio HTML5] Speed set to ${speed}`);
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to set speed:', error);
      throw error;
    }
  }, []);

  /**
   * Set volume
   */
  const setVolume = useCallback(async (volume: number): Promise<void> => {
    try {
      if (queueRef.current) {
        queueRef.current.setVolume(volume);
        console.log(`[useRosaryAudio HTML5] Volume set to ${volume}`);
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to set volume:', error);
      throw error;
    }
  }, []);

  /**
   * Clear queue
   */
  const clearQueue = useCallback(async (): Promise<void> => {
    try {
      if (queueRef.current) {
        queueRef.current.clear();
        beadToTrackMapRef.current.clear();
        console.log('[useRosaryAudio HTML5] Queue cleared');
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to clear queue:', error);
      throw error;
    }
  }, []);

  /**
   * Rebuild queue
   */
  const rebuildQueue = useCallback(async (): Promise<void> => {
    try {
      console.log('[useRosaryAudio HTML5] Rebuilding queue...');
      await initializeQueue();
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to rebuild queue:', error);
      throw error;
    }
  }, [initializeQueue]);

  /**
   * Cleanup audio
   */
  const cleanup = useCallback(async (): Promise<void> => {
    try {
      if (queueRef.current) {
        queueRef.current.cleanup();
        console.log('[useRosaryAudio HTML5] Audio cleaned up');
      }
    } catch (error) {
      console.error('[useRosaryAudio HTML5] Failed to cleanup audio:', error);
      throw error;
    }
  }, []);

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
    setCurrentBeadWithoutPlaying,
    setSpeed,
    setVolume,
    cleanup,
    
    // Queue management
    clearQueue,
    rebuildQueue,
  };
}

