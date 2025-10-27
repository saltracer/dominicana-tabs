import { useState, useEffect, useCallback } from 'react';
import { PodcastEpisode, PodcastPlaybackProgress } from '../types';
import { PodcastPlaybackService } from '../services/PodcastPlaybackService';
import { useAuth } from '../contexts/AuthContext';

interface UsePodcastPlayerReturn {
  // Current episode
  currentEpisode: PodcastEpisode | null;
  
  // Playback state
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  
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
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState<PodcastPlaybackProgress | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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
    }, 10000); // Save every 10 seconds

    return () => clearInterval(interval);
  }, [currentEpisode, isPlaying, user, position, duration]);

  const loadProgress = async (episodeId: string) => {
    try {
      const data = await PodcastPlaybackService.getProgress(episodeId);
      setProgress(data);
      setPosition(data.position);
      setDuration(data.duration || 0);
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const playEpisode = useCallback(async (episode: PodcastEpisode) => {
    // For now, just set the current episode
    // Full playback implementation will use TrackPlayer
    setCurrentEpisode(episode);
    
    // Basic web audio implementation
    if (typeof window !== 'undefined') {
      try {
        const newAudio = new Audio(episode.audioUrl);
        newAudio.addEventListener('loadedmetadata', () => {
          setDuration(newAudio.duration);
        });
        newAudio.addEventListener('timeupdate', () => {
          setPosition(newAudio.currentTime);
        });
        newAudio.addEventListener('ended', () => {
          setIsPlaying(false);
          markCompleted();
        });
        
        setAudio(newAudio);
      } catch (err) {
        console.error('Error creating audio player:', err);
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [audio]);

  const resume = useCallback(() => {
    if (audio) {
      audio.play();
      setIsPlaying(true);
    }
  }, [audio]);

  const seek = useCallback((pos: number) => {
    if (audio) {
      audio.currentTime = pos;
      setPosition(pos);
    }
  }, [audio]);

  const setSpeed = useCallback((speed: number) => {
    if (audio) {
      audio.playbackRate = speed;
    }
  }, [audio]);

  const saveProgress = useCallback(async () => {
    if (!currentEpisode || !user) return;
    
    try {
      await PodcastPlaybackService.saveProgress(currentEpisode.id, {
        position,
        duration,
        completed: false,
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [currentEpisode, user, position, duration]);

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

  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;

  return {
    currentEpisode,
    isPlaying,
    isLoading,
    position,
    duration,
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
