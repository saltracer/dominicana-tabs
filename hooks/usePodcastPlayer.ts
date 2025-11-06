import { useState, useEffect, useCallback, useRef } from 'react';
import { PodcastEpisode, PodcastPlaybackProgress } from '../types';
import { PodcastPlaybackService } from '../services/PodcastPlaybackService';
import { UserLiturgyPreferencesService } from '../services/UserLiturgyPreferencesService';
import { useAuth } from '../contexts/AuthContext';
import { Platform } from 'react-native';
import { usePodcastDownloads } from './usePodcastDownloads';

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

interface UsePodcastPlayerReturn {
  // Current episode
  currentEpisode: PodcastEpisode | null;
  
  // Playback state
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  isPaused: boolean;
  
  // Progress
  progress: PodcastPlaybackProgress | null;
  progressPercentage: number;
  
  // Controls
  playEpisode: (episode: PodcastEpisode) => Promise<void>;
  pause: () => void;
  resume: () => void;
  seek: (position: number) => void;
  setSpeed: (speed: number) => void;
  
  // Progress management
  saveProgress: () => Promise<void>;
  markPlayed: () => Promise<void>;
  
  // Simple HTML5 audio for web (basic implementation)
  audio: HTMLAudioElement | null;
}

export function usePodcastPlayer(): UsePodcastPlayerReturn {
  const { user } = useAuth();
  const { getDownloadedEpisodePath } = usePodcastDownloads();
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState<PodcastPlaybackProgress | null>(null);
  const [preferences, setPreferences] = useState<any>(null);
  
  // Web audio
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  // Native TrackPlayer progress (if available)
  const trackPlayerProgress = Platform.OS !== 'web' && useProgress ? useProgress() : { position: 0, duration: 0 };
  
  const isInitializedRef = useRef(false);

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const prefs = await UserLiturgyPreferencesService.getUserPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('[usePodcastPlayer] Error loading preferences:', error);
    }
  }, [user?.id]);

  // Initialize TrackPlayer on native
  const initializeTrackPlayer = useCallback(async () => {
    if (Platform.OS === 'web' || isInitializedRef.current || !TrackPlayer) return;
    
    try {
      console.log('[usePodcastPlayer] Initializing TrackPlayer...');
      
      // Wait for TrackPlayer to be ready
      let attempts = 0;
      while (attempts < 50) {
        try {
          const state = await TrackPlayer.getPlaybackState();
          if (state) break;
        } catch (e) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }
      
      // Configure capabilities with background playback support
      const backgroundPlayback = preferences?.podcast_background_playback ?? true;
      
      await TrackPlayer.updateOptions({
        capabilities: [
          'play', 
          'pause', 
          'seekTo', 
          'skipToNext', 
          'skipToPrevious'
        ],
        compactCapabilities: ['play', 'pause'],
        notificationCapabilities: ['play', 'pause', 'skipToNext'],
        progressUpdateEventInterval: 1,
        // Background playback configuration
        android: {
          appKilledPlaybackBehavior: backgroundPlayback ? 'ContinuePlayback' : 'StopPlaybackAndRemoveNotification',
        },
        // iOS audio session configuration
        iosCategory: backgroundPlayback ? 'playback' : 'soloAmbient',
        iosCategoryOptions: backgroundPlayback ? ['allowBluetooth', 'allowBluetoothA2DP'] : [],
      });
      
      isInitializedRef.current = true;
      console.log('[usePodcastPlayer] TrackPlayer initialized with background playback:', backgroundPlayback);
    } catch (error) {
      console.error('[usePodcastPlayer] TrackPlayer initialization error:', error);
    }
  }, [preferences?.podcast_background_playback]);

  // Initialize on mount
  useEffect(() => {
    initializeTrackPlayer();
  }, [initializeTrackPlayer]);

  // Debug state changes
  useEffect(() => {
    console.log('[usePodcastPlayer] State changed:', {
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
          console.log('[usePodcastPlayer] TrackPlayer playback-state:', data);
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
          console.log('[usePodcastPlayer] TrackPlayer track-changed:', data);
        });

        console.log('[usePodcastPlayer] TrackPlayer event listeners set up');
      } catch (error) {
        console.error('[usePodcastPlayer] Error setting up TrackPlayer events:', error);
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

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (!currentEpisode || !isPlaying || !user) return;

    const interval = setInterval(() => {
      saveProgress();
    }, 10000);

    return () => clearInterval(interval);
  }, [currentEpisode, isPlaying, user, position, duration]);

  const loadProgress = async (episodeId: string) => {
    try {
      const data = await PodcastPlaybackService.getProgress(episodeId);
      if (!data) return;
      
      setProgress(data);
      setPosition(data.position);
      setDuration(data.duration || 0);
      
      // Seek to saved position on native
      if (Platform.OS !== 'web' && TrackPlayer && data.position > 0) {
        try {
          await TrackPlayer.seekTo(data.position);
        } catch (e) {
          console.warn('Failed to seek to saved position:', e);
        }
      }
      
      // Apply saved speed or default speed
      const savedSpeed = data.playbackSpeed || preferences?.podcast_default_speed || 1.0;
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

  const markPlayed = useCallback(async () => {
    if (!currentEpisode || !user) return;
    
    try {
      await PodcastPlaybackService.markPlayed(currentEpisode.id, duration);
      if (progress) {
        setProgress({ ...progress, played: true, position: 0 });
      }
    } catch (err) {
      console.error('Error marking as played:', err);
    }
  }, [currentEpisode, user, progress, duration]);

  const playEpisode = useCallback(async (episode: PodcastEpisode) => {
    console.log('[usePodcastPlayer] playEpisode called with:', episode.title);
    console.log('[usePodcastPlayer] Platform.OS:', Platform.OS);
    setIsLoading(true);
    
    try {
      // Check if episode is downloaded first
      console.log('[usePodcastPlayer] Getting downloaded path for episode:', episode.id);
      const downloadedPath = await getDownloadedEpisodePath(episode.id);
      const audioUrl = downloadedPath || episode.audioUrl;
      console.log('[usePodcastPlayer] Using audio URL:', audioUrl);
      
      if (Platform.OS === 'web') {
        console.log('[usePodcastPlayer] Web platform - setting up HTML5 audio');
        // Web implementation with HTML5 Audio
        if (audio) {
          audio.pause();
          setAudio(null);
        }
        
        console.log('[usePodcastPlayer] Setting current episode:', episode.title);
        setCurrentEpisode(episode);
        console.log('[usePodcastPlayer] Set current episode:', episode.title);
        
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
          markPlayed();
        });
        
        newAudio.addEventListener('play', () => {
          console.log('[usePodcastPlayer] Audio play event');
          setIsPlaying(true);
          setIsPaused(false);
        });
        
        newAudio.addEventListener('pause', () => {
          console.log('[usePodcastPlayer] Audio pause event');
          setIsPlaying(false);
          setIsPaused(true);
        });
        
        try {
          await newAudio.play();
          console.log('[usePodcastPlayer] Audio play successful');
          setIsPlaying(true);
          setIsPaused(false);
        } catch (playError) {
          console.log('[usePodcastPlayer] Autoplay prevented:', playError);
          // Even if autoplay fails, we should show the mini player
          // The user can manually start playback
          setIsPlaying(false);
          setIsPaused(true);
          setIsLoading(false);
        }
        
        setAudio(newAudio);
      } else {
        console.log('[usePodcastPlayer] Native platform - setting up TrackPlayer');
        // Native implementation with TrackPlayer
        if (!TrackPlayer) {
          console.warn('[usePodcastPlayer] TrackPlayer not available on native');
          setIsLoading(false);
          return;
        }

        console.log('[usePodcastPlayer] Stopping current playback');
        // Stop current playback
        try {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
        } catch (e) {
          console.warn('[usePodcastPlayer] Error stopping current playback:', e);
        }

        console.log('[usePodcastPlayer] Adding episode to TrackPlayer queue');
        // Add episode to queue
        await TrackPlayer.add({
          id: episode.id,
          url: audioUrl,
          title: episode.title,
          artist: 'Podcast',
          artwork: episode.artworkUrl,
          duration: episode.duration,
        });

        console.log('[usePodcastPlayer] Loading saved progress');
        // Load saved progress
        const savedProgress = await PodcastPlaybackService.getProgress(episode.id);
        if (savedProgress && savedProgress.position > 0) {
          await TrackPlayer.seekTo(savedProgress.position);
        }

        console.log('[usePodcastPlayer] Starting playback');
        // Start playing
        await TrackPlayer.play();
        
        console.log('[usePodcastPlayer] Setting current episode:', episode.title);
        setCurrentEpisode(episode);
        console.log('[usePodcastPlayer] Set current episode:', episode.title);
        setIsPlaying(true);
        setIsLoading(false);
        console.log('[usePodcastPlayer] Native playback setup complete');
        
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          console.log('[usePodcastPlayer] State after delay:', {
            currentEpisode: currentEpisode?.title,
            isPlaying,
            isPaused
          });
        }, 100);
      }
    } catch (err) {
      console.error('[usePodcastPlayer] Error playing episode:', err);
      console.error('[usePodcastPlayer] Error details:', err);
      setIsLoading(false);
    }
  }, [audio, markPlayed, getDownloadedEpisodePath]);

  const pause = useCallback(async () => {
    if (Platform.OS === 'web') {
      if (audio) {
        audio.pause();
        setIsPlaying(false);
        setIsPaused(true);
      }
    } else {
      if (TrackPlayer) {
        await TrackPlayer.pause();
        setIsPaused(true);
      }
    }
  }, [audio]);

  const resume = useCallback(async () => {
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

  const seek = useCallback(async (pos: number) => {
    if (Platform.OS === 'web') {
      if (audio) {
        audio.currentTime = pos;
        setPosition(pos);
      }
    } else {
      if (TrackPlayer) {
        await TrackPlayer.seekTo(pos);
      }
    }
  }, [audio]);

  const setSpeed = useCallback(async (speed: number) => {
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
        console.error('[usePodcastPlayer] Error saving speed:', error);
      }
    }
  }, [audio, currentEpisode, user]);

  const saveProgress = useCallback(async () => {
    if (!currentEpisode || !user) return;
    
    try {
      await PodcastPlaybackService.saveProgress(
        currentEpisode.id,
        position,
        duration,
        false
      );
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [currentEpisode, user, position, duration]);

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  return {
    currentEpisode,
    isPlaying,
    isLoading,
    position,
    duration,
    isPaused,
    progress,
    progressPercentage,
    playEpisode,
    pause,
    resume,
    seek,
    setSpeed,
    saveProgress,
    markPlayed,
    audio,
  };
}
