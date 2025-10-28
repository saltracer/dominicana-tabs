/**
 * Hook for managing podcast downloads
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { PodcastEpisode } from '../types/podcast-types';
import { PodcastDownloadService, DownloadProgress, DownloadedEpisode } from '../services/PodcastDownloadService';
import { UserLiturgyPreferencesService } from '../services/UserLiturgyPreferencesService';
import { useAuth } from '../contexts/AuthContext';

export interface DownloadState {
  episodeId: string;
  status: 'idle' | 'downloading' | 'downloaded' | 'error';
  progress?: number;
  error?: string;
}

export function usePodcastDownloads() {
  const { user } = useAuth();
  const [downloadStates, setDownloadStates] = useState<Map<string, DownloadState>>(new Map());
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<DownloadedEpisode[]>([]);
  const [preferences, setPreferences] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const prefs = await UserLiturgyPreferencesService.getUserPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('[usePodcastDownloads] Error loading preferences:', error);
    }
  }, [user?.id]);

  // Load downloaded episodes
  const loadDownloadedEpisodes = useCallback(async () => {
    try {
      const downloads = await PodcastDownloadService.getDownloadedEpisodes();
      setDownloadedEpisodes(downloads);
    } catch (error) {
      console.error('[usePodcastDownloads] Error loading downloaded episodes:', error);
    }
  }, []);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await Promise.all([
        loadPreferences(),
        loadDownloadedEpisodes(),
      ]);
      setIsLoading(false);
    };
    
    initialize();
  }, [loadPreferences, loadDownloadedEpisodes]);

  // Check if downloads are enabled
  const isDownloadsEnabled = preferences?.podcast_downloads_enabled ?? true;

  // Check if episode is downloaded
  const isEpisodeDownloaded = useCallback((episodeId: string): boolean => {
    return downloadedEpisodes.some(ep => ep.episodeId === episodeId);
  }, [downloadedEpisodes]);

  // Get download state for episode
  const getDownloadState = useCallback((episodeId: string): DownloadState => {
    return downloadStates.get(episodeId) || { episodeId, status: 'idle' };
  }, [downloadStates]);

  // Check WiFi connection
  const checkWiFiConnection = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return true; // Web doesn't have WiFi restriction
    }

    const wifiOnly = preferences?.podcast_wifi_only ?? true;
    if (!wifiOnly) {
      return true; // WiFi-only is disabled
    }

    const netInfo = await NetInfo.fetch();
    return netInfo.type === 'wifi';
  }, [preferences?.podcast_wifi_only]);

  // Download episode
  const downloadEpisode = useCallback(async (episode: PodcastEpisode): Promise<boolean> => {
    if (!isDownloadsEnabled) {
      console.warn('[usePodcastDownloads] Downloads are disabled');
      return false;
    }

    if (Platform.OS === 'web') {
      console.warn('[usePodcastDownloads] Downloads not supported on web');
      return false;
    }

    // Check WiFi connection
    const hasWiFi = await checkWiFiConnection();
    if (!hasWiFi) {
      setDownloadStates(prev => new Map(prev).set(episode.id, {
        episodeId: episode.id,
        status: 'error',
        error: 'WiFi connection required for downloads',
      }));
      return false;
    }

    try {
      // Set downloading state
      setDownloadStates(prev => new Map(prev).set(episode.id, {
        episodeId: episode.id,
        status: 'downloading',
        progress: 0,
      }));

      // Download the episode
      await PodcastDownloadService.downloadEpisode(episode, (progress: DownloadProgress) => {
        setDownloadStates(prev => new Map(prev).set(episode.id, {
          episodeId: episode.id,
          status: 'downloading',
          progress: progress.progress,
        }));
      });

      // Check max downloads limit
      const maxDownloads = preferences?.podcast_max_downloads ?? 10;
      await PodcastDownloadService.cleanupOldDownloads(maxDownloads);

      // Reload downloaded episodes
      await loadDownloadedEpisodes();

      // Set downloaded state
      setDownloadStates(prev => new Map(prev).set(episode.id, {
        episodeId: episode.id,
        status: 'downloaded',
      }));

      return true;
    } catch (error) {
      console.error('[usePodcastDownloads] Download failed:', error);
      setDownloadStates(prev => new Map(prev).set(episode.id, {
        episodeId: episode.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Download failed',
      }));
      return false;
    }
  }, [isDownloadsEnabled, checkWiFiConnection, preferences?.podcast_max_downloads, loadDownloadedEpisodes]);

  // Delete downloaded episode
  const deleteDownloadedEpisode = useCallback(async (episodeId: string): Promise<boolean> => {
    try {
      await PodcastDownloadService.deleteDownloadedEpisode(episodeId);
      await loadDownloadedEpisodes();
      
      // Clear download state
      setDownloadStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(episodeId);
        return newMap;
      });

      return true;
    } catch (error) {
      console.error('[usePodcastDownloads] Delete failed:', error);
      return false;
    }
  }, [loadDownloadedEpisodes]);

  // Get downloaded episode path
  const getDownloadedEpisodePath = useCallback(async (episodeId: string): Promise<string | null> => {
    try {
      return await PodcastDownloadService.getDownloadedEpisodePath(episodeId);
    } catch (error) {
      console.error('[usePodcastDownloads] Error getting episode path:', error);
      return null;
    }
  }, []);

  // Get total storage used
  const getTotalStorageUsed = useCallback(async (): Promise<number> => {
    try {
      return await PodcastDownloadService.getTotalStorageUsed();
    } catch (error) {
      console.error('[usePodcastDownloads] Error getting storage used:', error);
      return 0;
    }
  }, []);

  // Refresh preferences
  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  return {
    // State
    downloadStates,
    downloadedEpisodes,
    preferences,
    isLoading,
    
    // Computed
    isDownloadsEnabled,
    
    // Actions
    downloadEpisode,
    deleteDownloadedEpisode,
    getDownloadedEpisodePath,
    getTotalStorageUsed,
    refreshPreferences,
    
    // Helpers
    isEpisodeDownloaded,
    getDownloadState,
    checkWiFiConnection,
  };
}
