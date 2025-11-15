import { useState, useEffect } from 'react';
import { EpisodeMetadataCache } from '../services/EpisodeMetadataCache';
import { PodcastPlaybackService } from '../services/PodcastPlaybackService';

export interface PlayedStatus {
  played: boolean;
  position: number;
}

/**
 * Hook for fetching episode played status
 * Uses cache first, falls back to service
 * Subscribes to cache updates
 */
export function useEpisodePlayedStatus(episodeId: string | null): PlayedStatus | null {
  const [playedStatus, setPlayedStatus] = useState<PlayedStatus | null>(null);

  useEffect(() => {
    if (!episodeId) {
      setPlayedStatus(null);
      return;
    }

    let cancelled = false;

    const fetchPlayedStatus = async () => {
      // Try cache first
      const cached = EpisodeMetadataCache.get(episodeId);
      if (cached) {
        if (!cancelled) {
          setPlayedStatus({
            played: cached.played,
            position: cached.playbackPosition,
          });
        }
        return;
      }

      // Fallback to service
      try {
        const progressData = await PodcastPlaybackService.getProgress(episodeId);
        if (!cancelled) {
          setPlayedStatus({
            played: progressData?.played || false,
            position: progressData?.position || 0,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setPlayedStatus({ played: false, position: 0 });
        }
      }
    };

    fetchPlayedStatus();

    // Subscribe to cache updates
    const unsubscribe = EpisodeMetadataCache.subscribe((id, metadata) => {
      if (id === episodeId && metadata && !cancelled) {
        setPlayedStatus({
          played: metadata.played,
          position: metadata.playbackPosition,
        });
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [episodeId]);

  return playedStatus;
}

