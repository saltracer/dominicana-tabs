import { useEffect } from 'react';
import { LanguageCode, ComplinePreferences } from '../types/compline-types';
import { useComplineServices } from './useComplineServices';
import { useComplineCache } from './useComplineCache';
import { useComplineData } from './useComplineData';
import { useComplineDate } from './useComplineDate';
import { ResolvedComplineData } from '../utils/complineResolver';

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

export function useCompline(
  date: Date,
  options: UseComplineOptions = {}
): UseComplineReturn {
  const {
    language = 'en',
    preferences = {},
    autoPreload = false
  } = options;

  // Use the smaller, focused hooks
  const { complineService, offlineManager, servicesError } = useComplineServices();
  const { targetDate } = useComplineDate(date);
  const { complineData, loading, error, loadComplineData } = useComplineData(complineService, { language });
  const { cacheInfo, refreshCacheInfo, clearCache } = useComplineCache(offlineManager);

  // Combine errors from services and data loading
  const combinedError = servicesError || error;

  const refresh = async () => {
    await loadComplineData(targetDate);
    await refreshCacheInfo();
  };

  const preloadData = async (days: number = 7) => {
    if (!complineService) {
      console.warn('Cannot preload: ComplineService not available');
      return;
    }

    try {
      await complineService.preloadComplineData(language, days);
      await refreshCacheInfo();
    } catch (error) {
      console.warn('Failed to preload Compline data:', error);
    }
  };

  // Load data on mount and when target date changes
  useEffect(() => {
    loadComplineData(targetDate);
  }, [loadComplineData, targetDate]);

  // Auto-preload if enabled
  useEffect(() => {
    if (autoPreload && complineService) {
      preloadData();
    }
  }, [autoPreload, complineService, preloadData]);

  return {
    complineData,
    loading,
    error: combinedError,
    refresh,
    preloadData,
    cacheInfo
  };
}