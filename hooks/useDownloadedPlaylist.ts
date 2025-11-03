import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEpisodesMap } from '../lib/podcast/cache';
import { fileExists } from '../lib/podcast/storage';
import { PodcastDownloadService } from '../services/PodcastDownloadService';

type DownloadedItem = {
  id: string; // synthetic id: `${podcastId}:${guid||audioUrl}`
  podcastId: string;
  episodeId?: string; // DB uuid when available
  title: string;
  description?: string;
  audioUrl: string;
  artworkUrl?: string | null;
  localAudioPath: string;
  downloadedAt: number;
  guid?: string;
  duration?: number;
  publishedAt?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  fileSize?: number;
  mimeType?: string;
};

export function useDownloadedPlaylist() {
  const { user } = useAuth();
  // Visible for guests too; no user-gating required
  const [items, setItems] = useState<DownloadedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const loadItems = async (alive: { current: boolean }) => {
    try {
      setLoading(true);
      const downloads = await PodcastDownloadService.getDownloadedEpisodes();
      if (__DEV__) console.log('[useDownloadedPlaylist] found', downloads.length, 'downloads');
      
      const results: DownloadedItem[] = [];
      for (const d of downloads) {
        try {
          const exists = await fileExists(d.filePath);
          if (!exists) {
            if (__DEV__) console.warn('[useDownloadedPlaylist] file missing:', d.filePath);
            continue;
          }
          
          // Start with metadata values (most reliable)
          let title: string | undefined = d.title;
          let description: string | undefined;
          let artworkUrl: string | null | undefined = null;
          let episodeId: string | undefined = d.episodeId;
          let duration: number | undefined;
          let publishedAt: string | undefined;
          let episodeNumber: number | undefined;
          let seasonNumber: number | undefined;
          let fileSize: number | undefined;
          let mimeType: string | undefined;
          const guid = d.guid;
          
          // Try to enhance from cache if podcastId is available
          if (d.podcastId) {
            try {
              const map = await getEpisodesMap(d.podcastId);
              // Match by guid first (most stable), then audioUrl
              const ep = Object.values(map).find(e => 
                (guid && e.guid === guid) || 
                (!guid && e.audioUrl === d.audioUrl) ||
                e.audioUrl === d.audioUrl
              );
              if (ep) {
                title = title || ep.title;
                description = ep.description;
                artworkUrl = ep.artworkUrl || null;
                episodeId = ep.id as any;
                duration = ep.duration;
                publishedAt = ep.publishedAt;
                episodeNumber = ep.episodeNumber;
                seasonNumber = ep.seasonNumber;
                fileSize = ep.fileSize;
                mimeType = ep.mimeType;
                if (__DEV__) console.log('[useDownloadedPlaylist] matched episode from cache:', title);
              } else if (__DEV__) {
                console.warn('[useDownloadedPlaylist] episode not found in cache:', d.podcastId, guid || d.audioUrl);
              }
            } catch (err) {
              if (__DEV__) console.warn('[useDownloadedPlaylist] error loading cache for', d.podcastId, err);
              // Continue with metadata values even if cache fails
            }
          }
          
          results.push({
            id: `${d.podcastId || 'unknown'}:${guid || d.audioUrl}`,
            podcastId: d.podcastId || 'unknown',
            episodeId,
            title: title || 'Episode',
            description,
            audioUrl: d.audioUrl,
            artworkUrl: artworkUrl ?? null,
            localAudioPath: d.filePath,
            downloadedAt: typeof d.downloadedAt === 'string' ? new Date(d.downloadedAt).getTime() : (d.downloadedAt as any) || Date.now(),
            guid,
            duration,
            publishedAt,
            episodeNumber,
            seasonNumber,
            fileSize,
            mimeType,
          });
        } catch (err) {
          if (__DEV__) console.error('[useDownloadedPlaylist] error processing download:', d.episodeId, err);
        }
      }
      results.sort((a, b) => b.downloadedAt - a.downloadedAt);
      if (__DEV__) console.log('[useDownloadedPlaylist] returning', results.length, 'items');
      if (alive.current) setItems(results);
    } catch (err) {
      console.error('[useDownloadedPlaylist] error:', err);
    } finally {
      if (alive.current) setLoading(false);
    }
  };

  useEffect(() => {
    const alive = { current: true };
    loadItems(alive);
    return () => { alive.current = false; };
  }, [user?.id, refreshKey]);

  const refetch = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { items, loading, refetch };
}

export default useDownloadedPlaylist;


