import { useState, useEffect } from 'react';
import { PodcastEpisode, Podcast } from '../types/podcast-types';
import { PodcastService } from '../services/PodcastService';

/**
 * Hook for fetching podcast data with error handling
 * Handles both podcastId and episodeId lookups
 * Sets fallback podcast if not found
 */
export function usePodcastData(episode: PodcastEpisode | null) {
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!episode) {
      setPodcast(null);
      setLoading(false);
      setError(null);
      return;
    }

    const loadPodcastData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch podcast by episode.podcastId first (works for RSS-cached episodes)
        if (episode.podcastId) {
          try {
            const podcastData = await PodcastService.getPodcast(episode.podcastId);
            setPodcast(podcastData);
            setLoading(false);
            return;
          } catch (e) {
            if (__DEV__) console.log('[usePodcastData] Could not fetch podcast by podcastId, trying by episodeId');
          }
        }
        
        // Fallback: try to get podcast via episode ID (for DB episodes)
        try {
          const podcastData = await PodcastService.getPodcastByEpisodeId(episode.id);
          setPodcast(podcastData);
        } catch (error) {
          // Expected for RSS-cached episodes not in database - use fallback
          if (__DEV__) console.log('[usePodcastData] Episode not in DB, using fallback podcast info');
          // Set a fallback podcast object
          setPodcast({
            id: 'unknown',
            title: 'Unknown Podcast',
            description: '',
            author: '',
            rssUrl: '',
            artworkUrl: undefined,
            websiteUrl: undefined,
            language: 'en',
            categories: [],
            isCurated: false,
            isActive: true,
            createdBy: undefined,
            lastFetchedAt: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        // Silently handle podcast not found errors (e.g., podcast was deleted)
        const errorMessage = err?.message || '';
        if (errorMessage.includes('multiple (or no) rows returned') || 
            errorMessage.includes('Failed to fetch podcast')) {
          // Podcast doesn't exist - handle silently, no error logging
          setPodcast(null);
        } else {
          // Other errors - log as warning but don't show to user
          console.warn('[usePodcastData] Error fetching podcast:', err);
          setPodcast(null);
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPodcastData();
  }, [episode?.id, episode?.podcastId]);

  return { podcast, loading, error };
}

