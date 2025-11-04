import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { PodcastEpisode, PodcastPlaybackProgress } from '../types';
import { PodcastPlaybackService } from '../services/PodcastPlaybackService';
import { UserLiturgyPreferencesService } from '../services/UserLiturgyPreferencesService';
import { useAuth } from './AuthContext';
import { Platform } from 'react-native';
import { usePodcastDownloads } from '../hooks/usePodcastDownloads';
import { AudioStateManager } from '../lib/audio-state-manager';
import { ensureImageCached } from '../lib/podcast/storage';

// Conditionally import TrackPlayer only on native
let TrackPlayer: any = null;
let useProgress: any = null;

if (Platform.OS !== 'web') {
  try {
    const RNTrackPlayer = require('react-native-track-player');
    TrackPlayer = RNTrackPlayer.default || RNTrackPlayer;
    useProgress = RNTrackPlayer.useProgress || RNTrackPlayer.default.useProgress;
  } catch (e) {
    console.warn('TrackPlayer not available:', e);
  }
}

interface PodcastPlayerContextType {
  // Current episode
  currentEpisode: PodcastEpisode | null;
  
  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  playbackSpeed: number;
  progress: PodcastPlaybackProgress | null;
  
  // Controls
  playEpisode: (episode: PodcastEpisode) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  
  // Progress
  progressPercentage: number;
}

const PodcastPlayerContext = createContext<PodcastPlayerContextType | undefined>(undefined);

export function PodcastPlayerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { getDownloadedEpisodePath } = usePodcastDownloads();
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [progress, setProgress] = useState<PodcastPlaybackProgress | null>(null);
  const [preferences, setPreferences] = useState<any>(null);
  
  // Web audio
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  // Native TrackPlayer progress (if available)
  const trackPlayerProgress = Platform.OS !== 'web' && useProgress ? useProgress() : { position: 0, duration: 0 };
  
  const isInitializedRef = useRef(false);
  const pauseRef = useRef<(() => Promise<void>) | null>(null);
  const resumeRef = useRef<(() => Promise<void>) | null>(null);
  
  // Cleanup: Unregister handlers when component unmounts
  useEffect(() => {
    return () => {
      if (Platform.OS !== 'web') {
        AudioStateManager.unregisterAudioHandlers('podcast');
        console.log('[PodcastPlayerContext] Unregistered podcast handlers on unmount');
      }
    };
  }, []);

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    try {
      const prefs = await UserLiturgyPreferencesService.getUserPreferences(user.id);
      setPreferences(prefs);
      // Set default speed from preferences
      if (prefs?.podcast_default_speed) {
        setPlaybackSpeed(prefs.podcast_default_speed);
      }
    } catch (error) {
      console.error('[PodcastPlayerContext] Error loading preferences:', error);
    }
  }, [user?.id]);

  // Initialize TrackPlayer on native
  const initializeTrackPlayer = useCallback(async () => {
    if (Platform.OS === 'web' || isInitializedRef.current || !TrackPlayer) return;
    try {
      // Wait for TrackPlayer to be ready
      let attempts = 0;
      while (!(await TrackPlayer.getState()) && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // Configure capabilities with background playback support
      const backgroundPlayback = preferences?.podcast_background_playback ?? true;
      await TrackPlayer.updateOptions({
        capabilities: [
          'play', 'pause', 'seekTo', 'skipToNext', 'skipToPrevious'
        ],
        compactCapabilities: ['play', 'pause'],
        notificationCapabilities: ['play', 'pause', 'skipToNext'],
        progressUpdateEventInterval: 1,
        android: {
          appKilledPlaybackBehavior: backgroundPlayback ? 'ContinuePlayback' : 'StopPlaybackAndRemoveNotification',
        },
        iosCategory: backgroundPlayback ? 'playback' : 'soloAmbient',
        iosCategoryOptions: backgroundPlayback ? ['allowBluetooth', 'allowBluetoothA2DP'] : [],
      });
      isInitializedRef.current = true;
      console.log('[PodcastPlayerContext] TrackPlayer initialized with background playback:', backgroundPlayback);
    } catch (error) {
      console.error('[PodcastPlayerContext] TrackPlayer initialization error:', error);
    }
  }, [preferences?.podcast_background_playback]);

  // Initialize on mount
  useEffect(() => {
    initializeTrackPlayer();
  }, [initializeTrackPlayer]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Debug state changes
  useEffect(() => {
    console.log('[PodcastPlayerContext] State changed:', {
      currentEpisode: currentEpisode?.title,
      isPlaying,
      isPaused,
      isLoading
    });
  }, [currentEpisode, isPlaying, isPaused, isLoading]);

  // Update position/duration from TrackPlayer on native
  useEffect(() => {
    if (Platform.OS !== 'web' && trackPlayerProgress) {
      setPosition(trackPlayerProgress.position);
      setDuration(trackPlayerProgress.duration);
    }
  }, [trackPlayerProgress]);

  // TrackPlayer event listeners
  useEffect(() => {
    if (Platform.OS === 'web' || !TrackPlayer) return;

    const setupTrackPlayerEvents = async () => {
      try {
        // Listen for play state changes
        TrackPlayer.addEventListener('playback-state', (data: any) => {
          // console.log('[PodcastPlayerContext] TrackPlayer playback-state:', data);
          if (data.state === 'playing') {
            setIsPlaying(true);
            setIsPaused(false);
          } else if (data.state === 'paused') {
            setIsPlaying(false);
            setIsPaused(true);
          } else if (data.state === 'stopped') {
            setIsPlaying(false);
            setIsPaused(false);
          }
        });

        // Listen for track changes
        TrackPlayer.addEventListener('playback-track-changed', (data: any) => {
          // console.log('[PodcastPlayerContext] TrackPlayer track-changed:', data);
        });

        // console.log('[PodcastPlayerContext] TrackPlayer event listeners set up');
      } catch (error) {
        console.error('[PodcastPlayerContext] Error setting up TrackPlayer events:', error);
      }
    };

    setupTrackPlayerEvents();
  }, []);

  // Load progress when episode changes
  useEffect(() => {
    if (currentEpisode && user) {
      loadProgress(currentEpisode.id);
    }
  }, [currentEpisode, user]);

  const loadProgress = async (episodeId: string) => {
    try {
      const data = await PodcastPlaybackService.getProgress(episodeId);
      if (!data) return;
      setProgress(data);
      setPosition(data.position);
      setDuration(data.duration || 0);
      
      // Seek to saved position if we have audio/TrackPlayer
      if (Platform.OS === 'web' && audio) {
        audio.currentTime = data.position;
      } else if (Platform.OS !== 'web' && TrackPlayer) {
        try {
          await TrackPlayer.seekTo(data.position);
        } catch (e) {
          console.warn('Failed to seek to saved position:', e);
        }
      }
      
      // Apply saved speed or default speed
      const savedSpeed = data.playbackSpeed || preferences?.podcast_default_speed || 1.0;
      setPlaybackSpeed(savedSpeed);
      
      if (Platform.OS === 'web' && audio) {
        audio.playbackRate = savedSpeed;
      } else if (Platform.OS !== 'web' && TrackPlayer) {
        try {
          await TrackPlayer.setRate(savedSpeed);
        } catch (e) {
          console.warn('Failed to set saved speed:', e);
        }
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const markCompleted = useCallback(async () => {
    if (!currentEpisode || !user) return;
    
    try {
      await PodcastPlaybackService.markCompleted(currentEpisode.id);
      if (progress) {
        setProgress({ ...progress, completed: true });
      }
    } catch (err) {
      console.error('Error marking as completed:', err);
    }
  }, [currentEpisode, user, progress]);

  const playEpisode = useCallback(async (episode: PodcastEpisode) => {
    console.log('[PodcastPlayerContext] playEpisode called with:', episode.title);
    console.log('[PodcastPlayerContext] Platform.OS:', Platform.OS);
    setIsLoading(true);
    
    try {
      // Check if episode is downloaded first
      console.log('[PodcastPlayerContext] Getting downloaded path for episode:', episode.id);
      const downloadedPath = await getDownloadedEpisodePath(episode.id);
      const audioUrl = downloadedPath || episode.audioUrl;
      console.log('[PodcastPlayerContext] Using audio URL:', audioUrl);
      
      if (Platform.OS === 'web') {
        console.log('[PodcastPlayerContext] Web platform - setting up HTML5 audio');
        // Web implementation with HTML5 Audio
        if (audio) {
          audio.pause();
          setAudio(null);
        }
        
        console.log('[PodcastPlayerContext] Setting current episode:', episode.title);
        setCurrentEpisode(episode);
        console.log('[PodcastPlayerContext] Set current episode:', episode.title);
        
        const newAudio = new Audio(audioUrl);
        
        newAudio.addEventListener('loadedmetadata', () => {
          setDuration(newAudio.duration);
          setIsLoading(false);
        });
        
        newAudio.addEventListener('timeupdate', () => {
          setPosition(newAudio.currentTime);
        });
        
        newAudio.addEventListener('ended', () => {
          setIsPlaying(false);
          markCompleted();
        });
        
        newAudio.addEventListener('play', () => {
          console.log('[PodcastPlayerContext] Audio play event');
          setIsPlaying(true);
          setIsPaused(false);
        });
        
        newAudio.addEventListener('pause', () => {
          console.log('[PodcastPlayerContext] Audio pause event');
          setIsPlaying(false);
          setIsPaused(true);
        });
        
        try {
          await newAudio.play();
          console.log('[PodcastPlayerContext] Audio play successful');
          setIsPlaying(true);
          setIsPaused(false);
        } catch (playError) {
          console.log('[PodcastPlayerContext] Autoplay prevented:', playError);
          // Even if autoplay fails, we should show the mini player
          // The user can manually start playback
          setIsPlaying(false);
          setIsPaused(true);
          setIsLoading(false);
        }
        
        setAudio(newAudio);
      } else {
        console.log('[PodcastPlayerContext] Native platform - setting up TrackPlayer');
        // Native implementation with TrackPlayer
        if (!TrackPlayer) {
          console.warn('[PodcastPlayerContext] TrackPlayer not available on native');
          setIsLoading(false);
          return;
        }

        console.log('[PodcastPlayerContext] Stopping current playback');
        // Stop current playback
        try {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
        } catch (e) {
          console.warn('[PodcastPlayerContext] Error stopping current playback:', e);
        }

        // DIAGNOSTIC: Log episode artwork info
        console.log('[PodcastPlayerContext] Episode artwork diagnostic:', {
          hasArtworkUrl: !!episode.artworkUrl,
          artworkUrl: episode.artworkUrl,
          artworkUrlType: typeof episode.artworkUrl,
          episodeKeys: Object.keys(episode),
        });

        // Cache artwork for iOS controls before adding track
        let artworkPath = episode.artworkUrl;
        if (episode.artworkUrl) {
          try {
            console.log('[PodcastPlayerContext] Caching artwork for iOS controls:', episode.artworkUrl);
            const { path } = await ensureImageCached(episode.artworkUrl);
            // Use file:// URL for iOS
            artworkPath = path.startsWith('file://') ? path : `file://${path}`;
            console.log('[PodcastPlayerContext] Artwork cached at:', artworkPath);
          } catch (e) {
            console.warn('[PodcastPlayerContext] Failed to cache artwork, using remote URL:', e);
            artworkPath = episode.artworkUrl;
          }
        } else {
          console.warn('[PodcastPlayerContext] No artwork URL provided for episode');
        }

        console.log('[PodcastPlayerContext] Adding episode to TrackPlayer queue with artwork:', artworkPath);
        // Add episode to queue with cached artwork
        await TrackPlayer.add({
          id: episode.id,
          url: audioUrl,
          title: episode.title,
          artist: 'Podcast',
          artwork: artworkPath,
          duration: episode.duration,
        });
        
        console.log('[PodcastPlayerContext] Track added to TrackPlayer successfully');

        console.log('[PodcastPlayerContext] Loading saved progress');
        // Load saved progress
        const savedProgress = await PodcastPlaybackService.getProgress(episode.id);
        if (savedProgress && savedProgress.position > 0) {
          await TrackPlayer.seekTo(savedProgress.position);
        }

        console.log('[PodcastPlayerContext] Starting playback');
        // Start playing
        await TrackPlayer.play();
        
        console.log('[PodcastPlayerContext] Setting current episode:', episode.title);
        setCurrentEpisode(episode);
        console.log('[PodcastPlayerContext] Set current episode:', episode.title);
        setIsPlaying(true);
        setIsLoading(false);
        console.log('[PodcastPlayerContext] Native playback setup complete');
        
        // Register podcast handlers with AudioStateManager for remote controls
        AudioStateManager.registerAudioHandlers('podcast', {
          play: async () => {
            if (resumeRef.current) await resumeRef.current();
          },
          pause: async () => {
            if (pauseRef.current) await pauseRef.current();
          },
          stop: async () => {
            if (TrackPlayer) {
              await TrackPlayer.stop();
              setIsPlaying(false);
              setIsPaused(false);
            }
          },
        });
        AudioStateManager.setActiveAudioType('podcast');
        console.log('[PodcastPlayerContext] Registered podcast handlers with AudioStateManager');
        
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          console.log('[PodcastPlayerContext] State after delay:', {
            currentEpisode: currentEpisode?.title,
            isPlaying,
            isPaused
          });
        }, 100);
      }
    } catch (err) {
      console.error('[PodcastPlayerContext] Error playing episode:', err);
      console.error('[PodcastPlayerContext] Error details:', err);
      setIsLoading(false);
    }
  }, [audio, markCompleted, getDownloadedEpisodePath]);

  const pause = useCallback(async () => {
    console.log('[PodcastPlayerContext] pause called');
    if (Platform.OS === 'web') {
      if (audio) {
        audio.pause();
        setIsPlaying(false);
        setIsPaused(true);
      }
    } else {
      if (TrackPlayer) {
        await TrackPlayer.pause();
        setIsPlaying(false);
        setIsPaused(true);
      }
    }
  }, [audio]);
  
  // Update ref when pause changes
  useEffect(() => {
    pauseRef.current = pause;
  }, [pause]);

  const resume = useCallback(async () => {
    console.log('[PodcastPlayerContext] resume called');
    if (Platform.OS === 'web') {
      if (audio) {
        await audio.play();
        setIsPlaying(true);
        setIsPaused(false);
      }
    } else {
      if (TrackPlayer) {
        await TrackPlayer.play();
        setIsPlaying(true);
        setIsPaused(false);
      }
    }
  }, [audio]);
  
  // Update ref when resume changes
  useEffect(() => {
    resumeRef.current = resume;
  }, [resume]);

  const seek = useCallback(async (position: number) => {
    if (Platform.OS === 'web') {
      if (audio) {
        audio.currentTime = position;
        setPosition(position);
      }
    } else {
      if (TrackPlayer) {
        await TrackPlayer.seekTo(position);
        setPosition(position);
      }
    }
  }, [audio]);

  const setSpeed = useCallback(async (speed: number) => {
    setPlaybackSpeed(speed);
    
    if (Platform.OS === 'web') {
      if (audio) {
        audio.playbackRate = speed;
      }
    } else {
      if (TrackPlayer) {
        await TrackPlayer.setRate(speed);
      }
    }
    
    // Save speed to database if we have a current episode and user
    if (currentEpisode && user) {
      try {
        await PodcastPlaybackService.saveSpeed(currentEpisode.id, speed);
      } catch (error) {
        console.error('[PodcastPlayerContext] Error saving speed:', error);
      }
    }
  }, [audio, currentEpisode, user]);

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  const value: PodcastPlayerContextType = {
    currentEpisode,
    isPlaying,
    isPaused,
    isLoading,
    position,
    duration,
    playbackSpeed,
    progress,
    playEpisode,
    pause,
    resume,
    seek,
    setSpeed,
    progressPercentage,
  };

  return (
    <PodcastPlayerContext.Provider value={value}>
      {children}
    </PodcastPlayerContext.Provider>
  );
}

export function usePodcastPlayer(): PodcastPlayerContextType {
  const context = useContext(PodcastPlayerContext);
  if (context === undefined) {
    throw new Error('usePodcastPlayer must be used within a PodcastPlayerProvider');
  }
  return context;
}
