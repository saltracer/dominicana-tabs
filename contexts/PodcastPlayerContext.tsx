import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { PodcastEpisode, PodcastPlaybackProgress } from '../types';
import { PodcastPlaybackService } from '../services/PodcastPlaybackService';
import { UserLiturgyPreferencesService } from '../services/UserLiturgyPreferencesService';
import { useAuth } from './AuthContext';
import { Platform, AppState } from 'react-native';
import { usePodcastDownloads } from '../hooks/usePodcastDownloads';
import { AudioStateManager } from '../lib/audio-state-manager';
import { ensureImageCached } from '../lib/podcast/storage';
import { EpisodeMetadataCache } from '../services/EpisodeMetadataCache';
import * as FileSystem from 'expo-file-system/legacy';

// Default artwork for podcast playback (iOS lock screen)
const DEFAULT_ARTWORK = require('../assets/images/dominicana_logo-icon-white.png');

// Playback context types
export type PlaybackContextType = 'podcast' | 'playlist' | 'queue' | 'downloaded' | 'single';

export interface PlaybackContext {
  type: PlaybackContextType;
  episodes: PodcastEpisode[];
  currentIndex: number;
  sourceId?: string; // podcast ID, playlist ID, etc.
}

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
  
  // Playback context (for auto-play)
  playbackContext: PlaybackContext | null;
  
  // Controls
  playEpisode: (episode: PodcastEpisode, context?: Partial<PlaybackContext>) => Promise<void>;
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
  const [playbackContext, setPlaybackContext] = useState<PlaybackContext | null>(null);
  
  // Web audio
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  // Native TrackPlayer progress (if available)
  const trackPlayerProgress = Platform.OS !== 'web' && useProgress ? useProgress() : { position: 0, duration: 0 };
  
  const isInitializedRef = useRef(false);
  const pauseRef = useRef<(() => Promise<void>) | null>(null);
  const resumeRef = useRef<(() => Promise<void>) | null>(null);
  const playNextEpisodeRef = useRef<(() => Promise<void>) | null>(null);
  const markCompletedRef = useRef<(() => Promise<void>) | null>(null);
  
  // Refs for progress saving (avoid recreating intervals on every position update)
  const positionRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const progressRef = useRef<PodcastPlaybackProgress | null>(null);
  
  // Track if we should check for completion (only after actually playing, not just loading)
  const hasStartedPlaybackRef = useRef<boolean>(false);
  
  // Guard against concurrent episode loading
  const isLoadingEpisodeRef = useRef<boolean>(false);
  
  // Debounce playNextEpisode to prevent race conditions from duplicate events
  const playNextDebounceRef = useRef<number | null>(null);
  
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
      // Update refs too for intervals
      positionRef.current = trackPlayerProgress.position;
      durationRef.current = trackPlayerProgress.duration;
    }
  }, [trackPlayerProgress]);
  
  // Keep refs in sync with state
  useEffect(() => {
    positionRef.current = position;
    durationRef.current = duration;
    progressRef.current = progress;
  }, [position, duration, progress]);

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

        // Listen for playback queue ended (episode finished)
        TrackPlayer.addEventListener('playback-queue-ended', async (data: any) => {
          console.log('[PodcastPlayerContext] TrackPlayer playback-queue-ended:', data);
          setIsPlaying(false);
          if (markCompletedRef.current) await markCompletedRef.current();
          // Auto-play next episode if available
          if (playNextEpisodeRef.current) await playNextEpisodeRef.current();
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
      
      // If episode has been played, always start from beginning (position 0)
      const startPosition = data.played ? 0 : data.position;
      
      if (data.played) {
        console.log('[PodcastPlayerContext] 🔄 Episode already played, starting from beginning and unmarking as played');
        // Unmark as played since user is replaying it
        await PodcastPlaybackService.saveProgress(episodeId, 0, data.duration, false);
        // Update local state
        setProgress({ ...data, played: false, position: 0 });
        // Update cache
        EpisodeMetadataCache.update(episodeId, {
          played: false,
          playbackPosition: 0,
          playbackProgress: 0,
        });
      } else {
        if (data.position > 0) {
          console.log('[PodcastPlayerContext] ⏩ Resuming from saved position:', data.position.toFixed(1));
        }
        setProgress(data);
      }
      
      setPosition(startPosition);
      setDuration(data.duration || 0);
      
      // Seek to start position if we have audio/TrackPlayer
      if (Platform.OS === 'web' && audio) {
        audio.currentTime = startPosition;
      } else if (Platform.OS !== 'web' && TrackPlayer) {
        try {
          await TrackPlayer.seekTo(startPosition);
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

  const updateTrackMetadata = useCallback(async () => {
    if (!currentEpisode || !TrackPlayer || Platform.OS === 'web') return;
    
    let artworkPath: string | number = DEFAULT_ARTWORK;
    if (currentEpisode.artworkUrl) {
      try {
        const { path } = await ensureImageCached(currentEpisode.artworkUrl);
        // Validate file
        const fileInfo = await FileSystem.getInfoAsync(path);
        if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
          artworkPath = path.startsWith('file://') ? path : `file://${path}`;
        }
      } catch (e) {
        console.warn('[PodcastPlayerContext] Failed to cache artwork for metadata update:', e);
        artworkPath = DEFAULT_ARTWORK;
      }
    }
    
    try {
      await TrackPlayer.updateNowPlayingMetadata({
        title: currentEpisode.title,
        artist: 'Podcast',
        artwork: artworkPath,
      });
      if (__DEV__) console.log('[PodcastPlayerContext] ✅ Updated track metadata with artwork');
    } catch (e) {
      console.warn('[PodcastPlayerContext] Failed to update metadata:', e);
    }
  }, [currentEpisode]);

  const markPlayed = useCallback(async () => {
    if (!currentEpisode || !user) return;
    
    try {
      await PodcastPlaybackService.markPlayed(currentEpisode.id, duration);
      if (progress) {
        setProgress({ ...progress, played: true, position: 0 });
      }
      // Invalidate cache so UI updates
      EpisodeMetadataCache.update(currentEpisode.id, {
        played: true,
        playbackPosition: 0,
        playbackProgress: 0,
      });
    } catch (err) {
      console.error('Error marking as played:', err);
    }
  }, [currentEpisode, user, progress, duration]);

  const playNextEpisode = useCallback(async () => {
    console.log('[PodcastPlayerContext] playNextEpisode called');
    
    // Debounce: If called multiple times rapidly, only process the first call
    if (playNextDebounceRef.current) {
      console.log('[PodcastPlayerContext] ⚠️ Debouncing duplicate playNextEpisode call');
      return;
    }
    
    // Guard against concurrent calls
    if (isLoadingEpisodeRef.current) {
      console.log('[PodcastPlayerContext] ⚠️ Already loading episode, ignoring playNextEpisode');
      return;
    }
    
    console.log('[PodcastPlayerContext] Current playbackContext:', playbackContext);
    
    if (!playbackContext) {
      console.log('[PodcastPlayerContext] No playback context, cannot auto-play next');
      return;
    }
    
    // Check auto-play preference
    const autoPlayEnabled = preferences?.podcast_auto_play_next ?? true;
    if (!autoPlayEnabled) {
      console.log('[PodcastPlayerContext] Auto-play disabled by user preference');
      setPlaybackContext(null);
      return;
    }
    
    // Set debounce timeout (500ms)
    playNextDebounceRef.current = setTimeout(() => {
      playNextDebounceRef.current = null;
    }, 500);
    
    const { episodes, currentIndex, type, sourceId } = playbackContext;
    const nextIndex = currentIndex + 1;
    
    console.log('[PodcastPlayerContext] Checking for next episode:', {
      currentIndex,
      nextIndex,
      totalEpisodes: episodes.length,
      hasNext: nextIndex < episodes.length,
    });
    
    if (nextIndex < episodes.length) {
      const nextEpisode = episodes[nextIndex];
      console.log('[PodcastPlayerContext] 🎵 Auto-playing next episode:', nextEpisode.title, `(${nextIndex + 1}/${episodes.length})`);
      
      // Play next episode with same context
      await playEpisode(nextEpisode, {
        type,
        episodes,
        sourceId,
      });
      // Refresh metadata after auto-playing next episode
      await updateTrackMetadata();
    } else {
      console.log('[PodcastPlayerContext] Reached end of list, no more episodes to play');
      setPlaybackContext(null);
      setCurrentEpisode(null);
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [playbackContext, preferences?.podcast_auto_play_next, updateTrackMetadata]);
  
  // Update ref when playNextEpisode changes
  useEffect(() => {
    playNextEpisodeRef.current = playNextEpisode;
  }, [playNextEpisode]);
  
  // Update ref when markPlayed changes
  useEffect(() => {
    markCompletedRef.current = markPlayed;
  }, [markPlayed]);

  // Reset hasStartedPlayback flag when episode changes
  useEffect(() => {
    hasStartedPlaybackRef.current = false;
  }, [currentEpisode?.id]);
  
  // Set hasStartedPlayback flag when actually playing
  useEffect(() => {
    if (isPlaying && currentEpisode) {
      hasStartedPlaybackRef.current = true;
    }
  }, [isPlaying, currentEpisode]);

  // Auto-mark as played when within 25 seconds of end (only if we've actually played)
  useEffect(() => {
    if (!currentEpisode || !user || !duration || duration === 0) return;
    
    // Only check for completion if we've actually started playback this session
    if (!hasStartedPlaybackRef.current) return;
    
    const timeRemaining = duration - position;
    
    // If within 25 seconds of end and not already marked as played
    if (timeRemaining <= 25 && timeRemaining > 0 && !progress?.played) {
      console.log('[PodcastPlayerContext] Auto-marking episode as played (within 25s of end)');
      markPlayed();
    }
  }, [position, duration, currentEpisode, user, progress?.played, markPlayed]);

  // Refresh metadata when app returns from background
  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && currentEpisode && TrackPlayer) {
        if (__DEV__) console.log('[PodcastPlayerContext] 📱 App became active, refreshing metadata');
        await updateTrackMetadata();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [currentEpisode, updateTrackMetadata]);

  // Save progress to cache every second while playing
  useEffect(() => {
    if (!currentEpisode || !user || !isPlaying) {
      return;
    }

    if (__DEV__) console.log('[PodcastPlayerContext] Starting cache save interval (every 1s)');
    
    const cacheInterval = setInterval(() => {
      const currentPosition = positionRef.current;
      const currentDuration = durationRef.current;
      
      if (currentDuration === 0) return; // Skip if duration not loaded yet
      
      // Update cache immediately (no database call)
      EpisodeMetadataCache.update(currentEpisode.id, {
        playbackPosition: currentPosition,
        playbackProgress: currentPosition / currentDuration,
      });
      if (__DEV__) console.log('[PodcastPlayerContext] Cache updated:', { 
        position: currentPosition.toFixed(1), 
        duration: currentDuration.toFixed(1), 
        progress: (currentPosition / currentDuration * 100).toFixed(1) + '%' 
      });
    }, 1000);

    return () => {
      if (__DEV__) console.log('[PodcastPlayerContext] Clearing cache save interval');
      clearInterval(cacheInterval);
    };
  }, [currentEpisode, user, isPlaying]);

  // Sync progress to database every 15 seconds while playing
  useEffect(() => {
    if (!currentEpisode || !user || !isPlaying) {
      return;
    }

    if (__DEV__) console.log('[PodcastPlayerContext] Starting DB sync interval (every 15s)');

    const dbSyncInterval = setInterval(async () => {
      const currentPosition = positionRef.current;
      const currentDuration = durationRef.current;
      const currentProgress = progressRef.current;
      
      if (currentDuration === 0) return; // Skip if duration not loaded yet
      
      try {
        await PodcastPlaybackService.saveProgress(
          currentEpisode.id,
          currentPosition,
          currentDuration,
          currentProgress?.played || false
        );
        if (__DEV__) console.log('[PodcastPlayerContext] ✅ Auto-synced progress to database:', { 
          position: currentPosition.toFixed(1), 
          duration: currentDuration.toFixed(1), 
          played: currentProgress?.played 
        });
      } catch (err) {
        console.error('[PodcastPlayerContext] Error auto-syncing progress:', err);
      }
    }, 15000); // Every 15 seconds

    return () => {
      if (__DEV__) console.log('[PodcastPlayerContext] Clearing DB sync interval');
      clearInterval(dbSyncInterval);
    };
  }, [currentEpisode, user, isPlaying]);

  const playEpisode = useCallback(async (episode: PodcastEpisode, context?: Partial<PlaybackContext>) => {
    console.log('[PodcastPlayerContext] 🎬 playEpisode called with:', episode.title);
    console.log('[PodcastPlayerContext] Platform.OS:', Platform.OS);
    console.log('[PodcastPlayerContext] Context:', context);
    
    // Guard against concurrent episode loading
    if (isLoadingEpisodeRef.current) {
      console.log('[PodcastPlayerContext] ⚠️ Already loading an episode, ignoring playEpisode call for:', episode.title);
      return;
    }
    
    isLoadingEpisodeRef.current = true;
    console.log('[PodcastPlayerContext] 🔒 Locked episode loading');
    
    // Save progress for current episode before switching
    if (currentEpisode && currentEpisode.id !== episode.id && user && duration > 0) {
      try {
        await PodcastPlaybackService.saveProgress(
          currentEpisode.id,
          position,
          duration,
          progress?.played || false
        );
        // Update cache immediately
        EpisodeMetadataCache.update(currentEpisode.id, {
          playbackPosition: position,
          playbackProgress: position / duration,
        });
        if (__DEV__) console.log('[PodcastPlayerContext] 💾 Saved progress before switching episodes');
      } catch (err) {
        console.error('[PodcastPlayerContext] Error saving progress before switching:', err);
      }
    }
    
    setIsLoading(true);
    
    // Update playback context if provided
    if (context) {
      const episodes = context.episodes || [episode];
      const currentIndex = episodes.findIndex(ep => ep.id === episode.id);
      
      const newContext: PlaybackContext = {
        type: context.type || 'single',
        episodes,
        currentIndex: currentIndex >= 0 ? currentIndex : 0,
        sourceId: context.sourceId,
      };
      
      console.log('[PodcastPlayerContext] Setting NEW playback context:', {
        type: newContext.type,
        episodeCount: newContext.episodes.length,
        currentIndex: newContext.currentIndex,
        currentEpisode: newContext.episodes[newContext.currentIndex]?.title,
        sourceId: newContext.sourceId,
      });
      setPlaybackContext(newContext);
    } else if (!playbackContext) {
      // No context provided and none exists - single episode mode
      console.log('[PodcastPlayerContext] Setting SINGLE episode context');
      setPlaybackContext({
        type: 'single',
        episodes: [episode],
        currentIndex: 0,
      });
    } else {
      console.log('[PodcastPlayerContext] Preserving existing playback context');
    }
    
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
        
        newAudio.addEventListener('ended', async () => {
          console.log('[PodcastPlayerContext] Episode ended');
          setIsPlaying(false);
          if (markCompletedRef.current) await markCompletedRef.current();
          // Auto-play next episode if available
          if (playNextEpisodeRef.current) await playNextEpisodeRef.current();
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
          // Reset removed - TrackPlayer.add() will handle track replacement
        } catch (e) {
          console.warn('[PodcastPlayerContext] Error stopping current playback:', e);
        }

        // Cache artwork for iOS controls before adding track
        let artworkPath: string | number = DEFAULT_ARTWORK;
        if (episode.artworkUrl) {
          try {
            console.log('[PodcastPlayerContext] Caching artwork for iOS controls:', episode.artworkUrl);
            const { path } = await ensureImageCached(episode.artworkUrl);
            
            // Validate file exists and has content
            const fileInfo = await FileSystem.getInfoAsync(path);
            if (!fileInfo.exists || !fileInfo.size || fileInfo.size === 0) {
              console.warn('[PodcastPlayerContext] Cached artwork file invalid:', path, fileInfo);
              artworkPath = DEFAULT_ARTWORK;
            } else {
              // Use file:// URL for iOS
              artworkPath = path.startsWith('file://') ? path : `file://${path}`;
              console.log('[PodcastPlayerContext] Artwork cached at:', artworkPath);
              
              if (__DEV__) {
                console.log('[PodcastPlayerContext] 🎨 Artwork Debug:', {
                  episodeTitle: episode.title,
                  hasArtworkUrl: !!episode.artworkUrl,
                  artworkUrl: episode.artworkUrl?.substring(0, 100) + '...',
                  cachedPath: path,
                  fileExists: fileInfo.exists,
                  fileSize: fileInfo.size,
                  finalArtworkPath: typeof artworkPath === 'number' ? 'DEFAULT_ARTWORK (require)' : artworkPath,
                  isRequire: typeof artworkPath === 'number',
                  isFileUrl: typeof artworkPath === 'string' && artworkPath.startsWith('file://'),
                });
              }
            }
          } catch (e) {
            console.warn('[PodcastPlayerContext] Failed to cache artwork, using default logo:', e);
            artworkPath = DEFAULT_ARTWORK;
          }
        } else {
          if (__DEV__) console.log('[PodcastPlayerContext] 🎨 No artwork URL, using DEFAULT_ARTWORK');
          artworkPath = DEFAULT_ARTWORK;
        }

        // Add episode to queue with cached artwork (or default logo)
        await TrackPlayer.add({
          id: episode.id,
          url: audioUrl,
          title: episode.title,
          artist: 'Podcast',
          artwork: artworkPath,
          duration: episode.duration,
        });

        console.log('[PodcastPlayerContext] Loading saved progress');
        // Load saved progress
        const savedProgress = await PodcastPlaybackService.getProgress(episode.id);
        if (savedProgress) {
          // If episode has been played, always start from beginning
          const startPosition = savedProgress.played ? 0 : savedProgress.position;
          
          if (savedProgress.played) {
            console.log('[PodcastPlayerContext] 🔄 Episode already played, starting from beginning and unmarking as played');
            // Unmark as played since user is replaying it
            await PodcastPlaybackService.saveProgress(episode.id, 0, savedProgress.duration, false);
            // Update cache
            EpisodeMetadataCache.update(episode.id, {
              played: false,
              playbackPosition: 0,
              playbackProgress: 0,
            });
          } else if (savedProgress.position > 0) {
            console.log('[PodcastPlayerContext] ⏩ Resuming from saved position:', savedProgress.position.toFixed(1));
          }
          
          if (startPosition > 0) {
            await TrackPlayer.seekTo(startPosition);
          }
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
    } finally {
      // Always unlock episode loading
      isLoadingEpisodeRef.current = false;
      console.log('[PodcastPlayerContext] 🔓 Unlocked episode loading');
    }
  }, [audio, markPlayed, getDownloadedEpisodePath, currentEpisode, user, duration, position, progress?.played, playbackContext]);

  const pause = useCallback(async () => {
    console.log('[PodcastPlayerContext] pause called');
    
    // Save progress when pausing
    if (currentEpisode && user && duration > 0) {
      try {
        await PodcastPlaybackService.saveProgress(
          currentEpisode.id,
          position,
          duration,
          progress?.played || false
        );
        // Update cache immediately
        EpisodeMetadataCache.update(currentEpisode.id, {
          playbackPosition: position,
          playbackProgress: position / duration,
        });
        if (__DEV__) console.log('[PodcastPlayerContext] Saved progress on pause');
      } catch (err) {
        console.error('[PodcastPlayerContext] Error saving progress on pause:', err);
      }
    }
    
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
  }, [audio, currentEpisode, user, position, duration, progress?.played]);
  
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
        // Refresh metadata after resume
        await updateTrackMetadata();
      }
    }
  }, [audio, updateTrackMetadata]);
  
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
    playbackContext,
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
