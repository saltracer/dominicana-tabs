import { useState, useEffect, useCallback } from 'react';
import { PodcastEpisode, Playlist } from '../types/podcast-types';
import { PodcastQueueService } from '../services/PodcastQueueService';

export function useQueue() {
  const [queue, setQueue] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PodcastQueueService.getQueue();
      setQueue(data);
    } catch (err) {
      console.error('Error loading queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToQueue = useCallback(async (episode: PodcastEpisode, position?: number) => {
    try {
      await PodcastQueueService.addToQueue(episode.id, position);
      await loadQueue();
    } catch (err) {
      console.error('Error adding episode to queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to add episode to queue');
      throw err;
    }
  }, [loadQueue]);

  const removeFromQueue = useCallback(async (episodeId: string) => {
    try {
      await PodcastQueueService.removeFromQueue(episodeId);
      setQueue(prev => prev.filter(episode => episode.id !== episodeId));
    } catch (err) {
      console.error('Error removing episode from queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove episode from queue');
      throw err;
    }
  }, []);

  const reorderQueue = useCallback(async (episodeIds: string[]) => {
    try {
      await PodcastQueueService.reorderQueue(episodeIds);
      await loadQueue();
    } catch (err) {
      console.error('Error reordering queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder queue');
      throw err;
    }
  }, [loadQueue]);

  const clearQueue = useCallback(async () => {
    try {
      await PodcastQueueService.clearQueue();
      setQueue([]);
    } catch (err) {
      console.error('Error clearing queue:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear queue');
      throw err;
    }
  }, []);

  const playNext = useCallback(async (episode: PodcastEpisode) => {
    try {
      await PodcastQueueService.playNext(episode.id);
      await loadQueue();
    } catch (err) {
      console.error('Error adding episode as next:', err);
      setError(err instanceof Error ? err.message : 'Failed to add episode as next');
      throw err;
    }
  }, [loadQueue]);

  const playLast = useCallback(async (episode: PodcastEpisode) => {
    try {
      await PodcastQueueService.playLast(episode.id);
      await loadQueue();
    } catch (err) {
      console.error('Error adding episode as last:', err);
      setError(err instanceof Error ? err.message : 'Failed to add episode as last');
      throw err;
    }
  }, [loadQueue]);

  const saveAsPlaylist = useCallback(async (name: string): Promise<Playlist> => {
    try {
      const playlist = await PodcastQueueService.saveQueueAsPlaylist(name);
      return playlist;
    } catch (err) {
      console.error('Error saving queue as playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to save queue as playlist');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return {
    queue,
    loading,
    error,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    clearQueue,
    playNext,
    playLast,
    saveAsPlaylist,
    refetch: loadQueue,
  };
}
