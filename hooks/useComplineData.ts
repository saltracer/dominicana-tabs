import { useState, useCallback } from 'react';
import { ComplineService } from '../services/ComplineService';
import { LanguageCode } from '../types/compline-types';
import { ComplineData } from '../types/compline-types';
import { resolveComplineComponents, ResolvedComplineData } from '../utils/complineResolver';

export interface UseComplineDataOptions {
  language?: LanguageCode;
}

export interface UseComplineDataReturn {
  complineData: ResolvedComplineData | null;
  loading: boolean;
  error: string | null;
  loadComplineData: (date: Date) => Promise<void>;
}

/**
 * Hook to fetch and manage Compline data
 * Handles data loading, resolution, and error states
 */
export function useComplineData(
  complineService: ComplineService | null,
  options: UseComplineDataOptions = {}
): UseComplineDataReturn {
  const { language = 'en' } = options;
  
  const [complineData, setComplineData] = useState<ResolvedComplineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComplineData = useCallback(async (date: Date) => {
    if (!complineService) {
      setError('Service initialization failed');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const rawData = await complineService.getComplineForDate(date, language);
      const resolvedData = await resolveComplineComponents(rawData, date);
      setComplineData(resolvedData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load Compline data';
      setError(errorMessage);
      console.error('Error loading Compline data:', err);
    } finally {
      setLoading(false);
    }
  }, [complineService, language]);

  return {
    complineData,
    loading,
    error,
    loadComplineData
  };
}
