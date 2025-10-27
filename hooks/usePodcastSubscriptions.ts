import { useState, useEffect, useCallback } from 'react';
import { PodcastSubscriptionService } from '../services/PodcastSubscriptionService';
import { Podcast } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function usePodcastSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await PodcastSubscriptionService.getUserSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load subscriptions'));
      console.error('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const subscribe = useCallback(async (podcastId: string) => {
    try {
      await PodcastSubscriptionService.subscribe(podcastId);
      await loadSubscriptions();
      return true;
    } catch (err) {
      console.error('Error subscribing:', err);
      return false;
    }
  }, [loadSubscriptions]);

  const unsubscribe = useCallback(async (podcastId: string) => {
    try {
      await PodcastSubscriptionService.unsubscribe(podcastId);
      await loadSubscriptions();
      return true;
    } catch (err) {
      console.error('Error unsubscribing:', err);
      return false;
    }
  }, [loadSubscriptions]);

  const isSubscribed = useCallback(async (podcastId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      return await PodcastSubscriptionService.isSubscribed(podcastId);
    } catch (err) {
      console.error('Error checking subscription:', err);
      return false;
    }
  }, [user]);

  const refetch = useCallback(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    subscribe,
    unsubscribe,
    isSubscribed,
    refetch,
  };
}
