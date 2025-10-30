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
        const results: DownloadedItem[] = [];
        for (const d of downloads) {
          try {
            const exists = await fileExists(d.filePath);
            if (!exists) continue;
            let title: string | undefined;
            let artworkUrl: string | null | undefined = null;
            let episodeId: string | undefined;
            if (d.podcastId) {
              try {
                const map = await getEpisodesMap(d.podcastId);
                const ep = Object.values(map).find(e => e.audioUrl === d.audioUrl || (!!e.guid && e.guid === (d as any).guid));
                if (ep) {
                  title = ep.title;
                  artworkUrl = ep.artworkUrl || null;
                  episodeId = ep.id as any;
                }
              } catch {}
            }
            results.push({
              id: `${d.podcastId || 'unknown'}:${(d as any).guid || d.audioUrl}`,
              podcastId: d.podcastId || 'unknown',
              episodeId,
              title: title || (d as any).title || 'Episode',
              audioUrl: d.audioUrl,
              artworkUrl: artworkUrl ?? null,
              localAudioPath: d.filePath,
              downloadedAt: typeof d.downloadedAt === 'string' ? new Date(d.downloadedAt).getTime() : (d.downloadedAt as any) || Date.now(),
            });
          } catch {}
        }
        results.sort((a, b) => b.downloadedAt - a.downloadedAt);
        if (alive) setItems(results);
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  return { items, loading };
}

export default useDownloadedPlaylist;


