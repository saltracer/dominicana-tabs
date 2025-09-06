import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { 
  ComplineData, 
  LanguageCode, 
  ComplinePreferences 
} from '../types/compline-types';
import { ComplineService } from '../services/ComplineService';
import { OfflineManager } from '../services/OfflineManager';

interface UseComplineOptions {
  language?: LanguageCode;
  preferences?: Partial<ComplinePreferences>;
  autoPreload?: boolean;
}

interface UseComplineReturn {
  complineData: ComplineData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  preloadData: (days?: number) => Promise<void>;
  cacheInfo: {
    size: number;
    maxSize: number;
    audioFiles: number;
    complineEntries: number;
  } | null;
}

export function useCompline(
  date: Date,
  options: UseComplineOptions = {}
): UseComplineReturn {
  const {
    language = 'en',
    preferences = {},
    autoPreload = false
  } = options;

  const [complineData, setComplineData] = useState<ComplineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<UseComplineReturn['cacheInfo']>(null);

  // Use useMemo to prevent service re-initialization on every render
  const complineService = useMemo(() => {
    try {
      return ComplineService.getInstance();
    } catch (error) {
      console.warn('Failed to initialize ComplineService:', error);
      return null;
    }
  }, []);

  const offlineManager = useMemo(() => {
    try {
      return OfflineManager.getInstance();
    } catch (error) {
      console.warn('Failed to initialize OfflineManager:', error);
      return null;
    }
  }, []);

  const loadComplineData = useCallback(async () => {
    if (!complineService) {
      setError('Service initialization failed');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use current date if no date provided
      const targetDate = date || new Date();
      const data = await complineService.getComplineForDate(targetDate, language);
      setComplineData(data);
      
      // Load cache info (non-blocking, only on mobile)
      if (offlineManager && Platform.OS !== 'web') {
        offlineManager.getCacheInfo().then(info => {
          setCacheInfo(info);
        }).catch(err => {
          console.warn('Failed to load cache info:', err);
        });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Compline data');
      console.error('Error loading Compline data:', err);
    } finally {
      setLoading(false);
    }
  }, [date, language, complineService, offlineManager]);

  const refresh = useCallback(async () => {
    await loadComplineData();
  }, [loadComplineData]);

  const preloadData = useCallback(async (days: number = 30) => {
    if (!offlineManager || Platform.OS === 'web') {
      return; // Skip preloading on web
    }

    try {
      setError(null);
      await offlineManager.preloadComplineData(language, days);
      
      // Refresh cache info
      const info = await offlineManager.getCacheInfo();
      setCacheInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preload data');
      console.error('Error preloading data:', err);
    }
  }, [language, offlineManager]);

  useEffect(() => {
    loadComplineData();
  }, [loadComplineData]);

  useEffect(() => {
    if (autoPreload && !loading && !error) {
      preloadData();
    }
  }, [autoPreload, loading, error, preloadData]);

  return {
    complineData,
    loading,
    error,
    refresh,
    preloadData,
    cacheInfo
  };
}

// Hook for managing Compline preferences
export function useComplinePreferences() {
  const [preferences, setPreferences] = useState<ComplinePreferences>({
    primaryLanguage: 'en',
    displayMode: 'primary-only',
    audioEnabled: true,
    audioQuality: 'medium',
    chantEnabled: false,
    chantNotation: 'gabc',
    fontSize: 'medium',
    showRubrics: true,
    autoPlay: false
  });

  const updatePreferences = useCallback((updates: Partial<ComplinePreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences({
      primaryLanguage: 'en',
      displayMode: 'primary-only',
      audioEnabled: true,
      audioQuality: 'medium',
      chantEnabled: false,
      chantNotation: 'gabc',
      fontSize: 'medium',
      showRubrics: true,
      autoPlay: false
    });
  }, []);

  return {
    preferences,
    updatePreferences,
    resetPreferences
  };
}

// Hook for audio management
export function useComplineAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const playAudio = useCallback(async (audioUrl: string) => {
    try {
      setAudioError(null);
      setIsPlaying(true);
      setCurrentAudio(audioUrl);
      
      // Audio playback logic would go here
      // This is a placeholder for the actual audio implementation
      console.log('Playing audio:', audioUrl);
      
    } catch (error) {
      setAudioError(error instanceof Error ? error.message : 'Failed to play audio');
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  }, []);

  const stopAudio = useCallback(() => {
    setIsPlaying(false);
    setCurrentAudio(null);
    setAudioError(null);
  }, []);

  return {
    isPlaying,
    currentAudio,
    audioError,
    playAudio,
    stopAudio
  };
}
