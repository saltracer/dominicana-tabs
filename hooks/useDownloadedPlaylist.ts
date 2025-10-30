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
  audioUrl: string;
  artworkUrl?: string | null;
  localAudioPath: string;
  downloadedAt: number;
};

export function useDownloadedPlaylist() {
  const { user } = useAuth();
  // Visible for guests too; no user-gating required
  const [items, setItems] = useState<DownloadedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;
    (async () => {
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
            let artworkUrl: string | null | undefined = null;
            let episodeId: string | undefined = d.episodeId;
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
                  artworkUrl = ep.artworkUrl || null;
                  episodeId = ep.id as any;
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
              audioUrl: d.audioUrl,
              artworkUrl: artworkUrl ?? null,
              localAudioPath: d.filePath,
              downloadedAt: typeof d.downloadedAt === 'string' ? new Date(d.downloadedAt).getTime() : (d.downloadedAt as any) || Date.now(),
            });
          } catch (err) {
            if (__DEV__) console.error('[useDownloadedPlaylist] error processing download:', d.episodeId, err);
          }
        }
        results.sort((a, b) => b.downloadedAt - a.downloadedAt);
        if (__DEV__) console.log('[useDownloadedPlaylist] returning', results.length, 'items');
        if (alive) setItems(results);
      } catch (err) {
        console.error('[useDownloadedPlaylist] error:', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  return { items, loading };
}

export default useDownloadedPlaylist;


