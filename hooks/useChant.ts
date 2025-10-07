import { useState, useEffect, useCallback } from 'react';
import { ChantService } from '../services/ChantService';
import { ChantResource } from '../types/compline-types';

interface UseChantOptions {
  hymnId?: string;
  autoLoad?: boolean;
}

interface UseChantReturn {
  chantResource: ChantResource | null;
  gabcContent: string | null;
  loading: boolean;
  error: string | null;
  loadChant: (hymnId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook to load and manage chant resources (GABC files)
 */
export function useChant(options: UseChantOptions = {}): UseChantReturn {
  const { hymnId, autoLoad = false } = options;
  const [chantResource, setChantResource] = useState<ChantResource | null>(null);
  const [gabcContent, setGabcContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chantService = ChantService.getInstance();

  const loadChant = useCallback(async (targetHymnId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Load both the chant resource and raw GABC content
      const [resource, content] = await Promise.all([
        chantService.getMarianHymnChantResource(targetHymnId),
        chantService.getMarianHymnGabc(targetHymnId)
      ]);

      setChantResource(resource);
      setGabcContent(content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chant';
      setError(errorMessage);
      console.error('Error loading chant:', err);
    } finally {
      setLoading(false);
    }
  }, [chantService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load if hymnId is provided and autoLoad is enabled
  useEffect(() => {
    if (hymnId && autoLoad) {
      loadChant(hymnId);
    }
  }, [hymnId, autoLoad, loadChant]);

  return {
    chantResource,
    gabcContent,
    loading,
    error,
    loadChant,
    clearError
  };
}
