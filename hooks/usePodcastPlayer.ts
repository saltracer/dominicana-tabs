import { useState, useEffect, useCallback, useRef } from 'react';
import { PodcastEpisode, PodcastPlaybackProgress } from '../types';
import { PodcastPlaybackService } from '../services/PodcastPlaybackService';
import { useAuth } from '../contexts/AuthContext';
import { Platform } from 'react-native';

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
  markCompleted: () => Promise<void>;
  
  // Simple HTML5 audio for web (basic implementation)
  audio: HTMLAudioElement | null;
}

export function usePodcastPlayer(): UsePodcastPlayerReturn {
  const { user } = useAuth();
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState<PodcastPlaybackProgress | null>(null);
  
  // Web audio
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  // Native TrackPlayer progress (if available)
  const trackPlayerProgress = Platform.OS !== 'web' && useProgress ? useProgress() : { position: 0, duration: 0 };
  
  const isInitializedRef = useRef(false);

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
      
      // Configure capabilities
      await TrackPlayer.updateOptions({
        capabilities: ['play', 'pause', 'seekTo', 'skipToNext', 'skipToPrevious'],
        compactCapabilities: ['play', 'pause'],
        notificationCapabilities: ['play', 'pause', 'skipToNext'],
        progressUpdateEventInterval: 1,
      });
      
      isInitializedRef.current = true;
      console.log('[usePodcastPlayer] TrackPlayer initialized');
    } catch (error) {
      console.error('[usePodcastPlayer] TrackPlayer initialization error:', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeTrackPlayer();
  }, [initializeTrackPlayer]);

  // Update position/duration from TrackPlayer on native
  useEffect(() => {
    if (Platform.OS !== 'web' && trackPlayerProgress) {
      setPosition(trackPlayerProgress.position);
      setDuration(trackPlayerProgress.duration);
    }
  }, [trackPlayerProgress]);

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
    setIsLoading(true);
    
    try {
      if (Platform.OS === 'web') {
        // Web implementation with HTML5 Audio
        if (audio) {
          audio.pause();
          setAudio(null);
        }
        
        setCurrentEpisode(episode);
        
        const newAudio = new Audio(episode.audioUrl);
        
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
          setIsPlaying(true);
          setIsPaused(false);
        });
        
        newAudio.addEventListener('pause', () => {
          setIsPlaying(false);
          setIsPaused(true);
        });
        
        try {
          await newAudio.play();
          setIsPlaying(true);
        } catch (playError) {
          console.log('Autoplay prevented:', playError);
          setIsLoading(false);
        }
        
        setAudio(newAudio);
      } else {
        // Native implementation with TrackPlayer
        if (!TrackPlayer) {
          console.warn('TrackPlayer not available on native');
          setIsLoading(false);
          return;
        }

        // Stop current playback
        try {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
        } catch (e) {
          console.warn('Error stopping current playback:', e);
        }

        // Add episode to queue
        await TrackPlayer.add({
          id: episode.id,
          url: episode.audioUrl,
          title: episode.title,
          artist: 'Podcast',
          artwork: episode.artworkUrl,
          duration: episode.duration,
        });

        // Load saved progress
        const savedProgress = await PodcastPlaybackService.getProgress(episode.id);
        if (savedProgress && savedProgress.position > 0) {
          await TrackPlayer.seekTo(savedProgress.position);
        }

        // Start playing
        await TrackPlayer.play();
        
        setCurrentEpisode(episode);
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error playing episode:', err);
      setIsLoading(false);
    }
  }, [audio, markCompleted]);

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
  }, [audio]);

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
    markCompleted,
    audio,
  };
}
