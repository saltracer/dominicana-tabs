import { useState, useEffect, useCallback } from 'react';
import { PodcastPreferences } from '../types/podcast-types';
import { PodcastPreferencesService } from '../services/PodcastPreferencesService';
import { useAuth } from '../contexts/AuthContext';

export function usePodcastPreferences(podcastId: string) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<PodcastPreferences | null>(null);
  const [effectiveSpeed, setEffectiveSpeed] = useState<number>(1.0);
  const [effectiveMaxEpisodes, setEffectiveMaxEpisodes] = useState<number>(10);
  const [effectiveAutoDownload, setEffectiveAutoDownload] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    if (!podcastId || !user) return;

    try {
      setLoading(true);
      setError(null);

      // Load podcast-specific preferences
      const podcastPrefs = await PodcastPreferencesService.getPodcastPreferences(podcastId);
      setPreferences(podcastPrefs);

      // Load effective values
      const [speed, maxEpisodes, autoDownload] = await Promise.all([
        PodcastPreferencesService.getEffectiveSpeed(podcastId, user.id),
        PodcastPreferencesService.getEffectiveMaxEpisodes(podcastId, user.id),
        PodcastPreferencesService.getEffectiveAutoDownload(podcastId, user.id),
      ]);

      setEffectiveSpeed(speed);
      setEffectiveMaxEpisodes(maxEpisodes);
      setEffectiveAutoDownload(autoDownload);
    } catch (err) {
      console.error('Error loading podcast preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load podcast preferences');
    } finally {
      setLoading(false);
    }
  }, [podcastId, user]);

  const updatePreference = useCallback(async (key: keyof PodcastPreferences, value: any) => {
    try {
      setError(null);
      
      const updates = { [key]: value };
      await PodcastPreferencesService.updatePodcastPreferences(podcastId, updates);
      
      // Update local state
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      
      // Reload effective values
      await loadPreferences();
    } catch (err) {
      console.error('Error updating preference:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preference');
      throw err;
    }
  }, [podcastId, loadPreferences]);

  const resetToGlobal = useCallback(async (key: keyof PodcastPreferences) => {
    try {
      setError(null);
      
      // Set the preference to null to use global default
      const updates = { [key]: null };
      await PodcastPreferencesService.updatePodcastPreferences(podcastId, updates);
      
      // Update local state
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      
      // Reload effective values
      await loadPreferences();
    } catch (err) {
      console.error('Error resetting preference to global:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset preference to global');
      throw err;
    }
  }, [podcastId, loadPreferences]);

  const deletePreferences = useCallback(async () => {
    try {
      setError(null);
      await PodcastPreferencesService.deletePodcastPreferences(podcastId);
      setPreferences(null);
      
      // Reload effective values (will now use global defaults)
      await loadPreferences();
    } catch (err) {
      console.error('Error deleting preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete preferences');
      throw err;
    }
  }, [podcastId, loadPreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    effectiveSpeed,
    effectiveMaxEpisodes,
    effectiveAutoDownload,
    loading,
    error,
    updatePreference,
    resetToGlobal,
    deletePreferences,
    refetch: loadPreferences,
  };
}
