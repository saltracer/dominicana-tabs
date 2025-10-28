import { useState, useEffect, useCallback } from 'react';
import { PodcastService } from '../services/PodcastService';
import { Podcast, PodcastFilters } from '../types';

export function usePodcasts(filters: PodcastFilters = {}) {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPodcasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const limit = filters.limit || 20;
      const result = await PodcastService.listPodcasts(filters, { page, limit });
      setPodcasts(result.podcasts);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load podcasts'));
      console.error('Error loading podcasts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadPodcasts();
  }, [loadPodcasts]);

  const refetch = useCallback(() => {
    loadPodcasts();
  }, [loadPodcasts]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  return {
    podcasts,
    loading,
    error,
    page,
    totalPages,
    refetch,
    nextPage,
    prevPage,
  };
}
