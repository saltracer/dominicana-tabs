import { useState, useEffect } from 'react';
import { ChantType } from '@/assets/data/liturgy/compline/chant/gabc-mapping';
import { userChantPreferencesService } from '@/services/user-chant-preferences-service';
import { gabcService } from '@/services/gabc-service';
import { ChantResource } from '@/types/compline-types';
import { useAuth } from '@/contexts/AuthContext';

export interface ChantPreferencesHook {
  selectedChantType: ChantType;
  chantEnabled: boolean;
  setSelectedChantType: (type: ChantType) => Promise<boolean>;
  setChantEnabled: (enabled: boolean) => Promise<boolean>;
  getChantResource: (marianHymnId: string) => Promise<ChantResource | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing user chant preferences and loading chant resources
 */
export const useChantPreferences = (): ChantPreferencesHook => {
  const { user } = useAuth();
  const [selectedChantType, setSelectedChantTypeState] = useState<ChantType>('dominican');
  const [chantEnabled, setChantEnabledState] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's chant preferences on mount
  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
    }
  }, [user?.id]);

  const loadUserPreferences = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const [preference, enabled] = await Promise.all([
        userChantPreferencesService.getUserChantPreference(user.id),
        userChantPreferencesService.getChantNotationEnabled(user.id)
      ]);
      setSelectedChantTypeState(preference);
      setChantEnabledState(enabled);
    } catch (err) {
      console.error('Error loading user chant preferences:', err);
      setError('Failed to load chant preferences');
    } finally {
      setLoading(false);
    }
  };

  const setSelectedChantType = async (type: ChantType): Promise<boolean> => {
    if (!user?.id) {
      setError('You must be logged in to change preferences');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const success = await userChantPreferencesService.updateUserChantPreference(user.id, type);
      
      if (success) {
        setSelectedChantTypeState(type);
        return true;
      } else {
        setError('Failed to update chant preference');
        return false;
      }
    } catch (err) {
      console.error('Error updating chant preference:', err);
      setError('Failed to update chant preference');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setChantEnabled = async (enabled: boolean): Promise<boolean> => {
    if (!user?.id) {
      setError('You must be logged in to change preferences');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const success = await userChantPreferencesService.updateChantNotationEnabled(user.id, enabled);
      
      if (success) {
        setChantEnabledState(enabled);
        return true;
      } else {
        setError('Failed to update chant preference');
        return false;
      }
    } catch (err) {
      console.error('Error updating chant enabled preference:', err);
      setError('Failed to update chant preference');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getChantResource = async (marianHymnId: string): Promise<ChantResource | null> => {
    // Don't load chant resource if chant is disabled
    if (!chantEnabled) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const chantResource = await gabcService.getChantResource(marianHymnId, selectedChantType);
      return chantResource;
    } catch (err) {
      console.error('Error loading chant resource:', err);
      setError('Failed to load chant notation');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedChantType,
    chantEnabled,
    setSelectedChantType,
    setChantEnabled,
    getChantResource,
    loading,
    error
  };
};
