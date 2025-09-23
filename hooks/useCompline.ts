import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { 
  ComplineData, 
  LanguageCode, 
  ComplinePreferences,
  getComponentForDay,
  isDayOfWeekVariations,
  getDayOfWeekFromDate,
  HymnComponent,
  PsalmodyComponent,
  ReadingComponent,
  ResponsoryComponent,
  CanticleComponent,
  PrayerComponent,
  OpeningComponent,
  ExaminationComponent,
  BlessingComponent
} from '../types/compline-types';
import { ComplineService } from '../services/ComplineService';
import { OfflineManager } from '../services/OfflineManager';

// Type for resolved components (no DayOfWeekVariations)
interface ResolvedComplineComponents {
  examinationOfConscience: ExaminationComponent;
  opening: OpeningComponent;
  hymn: HymnComponent;
  psalmody: PsalmodyComponent;
  reading: ReadingComponent;
  responsory: ResponsoryComponent;
  canticle: CanticleComponent;
  concludingPrayer: PrayerComponent;
  finalBlessing: BlessingComponent;
}

// Type for resolved ComplineData
interface ResolvedComplineData extends Omit<ComplineData, 'components'> {
  components: ResolvedComplineComponents;
}

interface UseComplineOptions {
  language?: LanguageCode;
  preferences?: Partial<ComplinePreferences>;
  autoPreload?: boolean;
}

interface UseComplineReturn {
  complineData: ResolvedComplineData | null;
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

// Helper function to resolve DayOfWeekVariations to actual components
function resolveComplineComponents(data: ComplineData, targetDate: Date): ResolvedComplineData {
  const dayOfWeek = getDayOfWeekFromDate(targetDate);
  
  return {
    ...data,
    components: {
      opening: isDayOfWeekVariations(data.components.opening) 
        ? getComponentForDay(data.components.opening, dayOfWeek)
        : data.components.opening,
      examinationOfConscience: isDayOfWeekVariations(data.components.examinationOfConscience)
        ? getComponentForDay(data.components.examinationOfConscience, dayOfWeek)
        : data.components.examinationOfConscience,
      hymn: isDayOfWeekVariations(data.components.hymn)
        ? getComponentForDay(data.components.hymn, dayOfWeek)
        : data.components.hymn,
      psalmody: isDayOfWeekVariations(data.components.psalmody)
        ? getComponentForDay(data.components.psalmody, dayOfWeek)
        : data.components.psalmody,
      reading: isDayOfWeekVariations(data.components.reading)
        ? getComponentForDay(data.components.reading, dayOfWeek)
        : data.components.reading,
      responsory: isDayOfWeekVariations(data.components.responsory)
        ? getComponentForDay(data.components.responsory, dayOfWeek)
        : data.components.responsory,
      canticle: isDayOfWeekVariations(data.components.canticle)
        ? getComponentForDay(data.components.canticle, dayOfWeek)
        : data.components.canticle,
      concludingPrayer: isDayOfWeekVariations(data.components.concludingPrayer)
        ? getComponentForDay(data.components.concludingPrayer, dayOfWeek)
        : data.components.concludingPrayer,
      finalBlessing: isDayOfWeekVariations(data.components.finalBlessing)
        ? getComponentForDay(data.components.finalBlessing, dayOfWeek)
        : data.components.finalBlessing,
    }
  };
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

  const [complineData, setComplineData] = useState<ResolvedComplineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheInfo, setCacheInfo] = useState<UseComplineReturn['cacheInfo']>(null);

  // Memoize current date to prevent infinite loops
  const currentDate = useMemo(() => new Date(), []);

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
      
      // Use provided date or memoized current date
      const targetDate = date || currentDate;
      const rawData = await complineService.getComplineForDate(targetDate, language);
      // Resolve all DayOfWeekVariations to actual components
      const resolvedData = resolveComplineComponents(rawData, targetDate);
      setComplineData(resolvedData);
      
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
  }, [date, language, complineService, offlineManager, currentDate]);

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
