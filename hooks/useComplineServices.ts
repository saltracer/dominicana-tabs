import { useMemo } from 'react';
import { ComplineService } from '../services/ComplineService';
import { OfflineManager } from '../services/OfflineManager';

export interface ComplineServices {
  complineService: ComplineService | null;
  offlineManager: OfflineManager | null;
  servicesError: string | null;
}

/**
 * Hook to initialize and manage Compline services
 * Handles service initialization with error handling
 */
export function useComplineServices(): ComplineServices {
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

  const servicesError = useMemo(() => {
    if (!complineService) {
      return 'ComplineService initialization failed';
    }
    return null;
  }, [complineService]);

  return {
    complineService,
    offlineManager,
    servicesError
  };
}
