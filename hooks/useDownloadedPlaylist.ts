import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { getEpisodesMap } from '../lib/podcast/cache';
import { fileExists } from '../lib/podcast/storage';
import { PodcastDownloadService } from '../services/PodcastDownloadService';
import { PodcastDownloadQueueService, QueueItemStatus } from '../services/PodcastDownloadQueueService';
import { DownloadStatusCache } from '../services/DownloadStatusCache';
import { DownloadedPlaylistOrdering } from '../services/DownloadedPlaylistOrdering';

type DownloadedItem = {
  id: string; // synthetic id: `${podcastId}:${guid||audioUrl}`
  podcastId: string;
  episodeId?: string; // DB uuid when available
  title: string;
  description?: string;
  audioUrl: string;
  artworkUrl?: string | null;
  localAudioPath?: string;
  downloadedAt: number;
  guid?: string;
  duration?: number;
  publishedAt?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  fileSize?: number;
  mimeType?: string;
  // Queue status fields
  downloadStatus?: QueueItemStatus;
  downloadProgress?: number;
  downloadError?: string;
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
      
      // OPTIMIZATION: Only call getDownloadedEpisodes if cache not initialized
      // Otherwise we're just duplicating work that cache init already did
      const downloads = DownloadStatusCache.isInitialized()
        ? await PodcastDownloadService.getMetadata() // Direct metadata access (faster than getDownloadedEpisodes)
        : await PodcastDownloadService.getDownloadedEpisodes();
      
      if (__DEV__) console.log('[useDownloadedPlaylist] found', downloads.length, 'completed downloads', DownloadStatusCache.isInitialized() ? '(via cache)' : '(direct)');
      
      // Get queue items (pending, downloading, failed, paused)
      let queueItems: any[] = [];
      if (Platform.OS !== 'web') {
        try {
          const queueState = await PodcastDownloadQueueService.getQueueState();
          queueItems = queueState.items.filter(
            item => item.status !== 'completed' // Don't duplicate completed items
          );
        } catch (err) {
          if (__DEV__) console.warn('[useDownloadedPlaylist] error loading queue:', err);
        }
      }
      
      const results: DownloadedItem[] = [];
      
      // Process completed downloads
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
            downloadStatus: 'completed',
          });
        } catch (err) {
          if (__DEV__) console.error('[useDownloadedPlaylist] error processing download:', d.episodeId, err);
        }
      }
      
      // Process queue items (pending, downloading, failed, paused)
      for (const qItem of queueItems) {
        try {
          const ep = qItem.episode;
          results.push({
            id: `queue-${qItem.id}`,
            podcastId: ep.podcastId,
            episodeId: ep.id,
            title: ep.title,
            description: ep.description,
            audioUrl: ep.audioUrl,
            artworkUrl: ep.artworkUrl || null,
            localAudioPath: undefined, // Not yet downloaded
            downloadedAt: new Date(qItem.addedAt).getTime(),
            guid: ep.guid,
            duration: ep.duration,
            publishedAt: ep.publishedAt,
            episodeNumber: ep.episodeNumber,
            seasonNumber: ep.seasonNumber,
            fileSize: ep.fileSize,
            mimeType: ep.mimeType,
            downloadStatus: qItem.status,
            downloadProgress: qItem.progress,
            downloadError: qItem.error,
          });
        } catch (err) {
          if (__DEV__) console.error('[useDownloadedPlaylist] error processing queue item:', qItem.id, err);
        }
      }
      
      // DEDUPLICATE: Remove duplicate episodes (can happen if episode is in both downloads and queue)
      const seen = new Set<string>();
      const deduplicated = results.filter(item => {
        // Use episodeId for deduplication (more stable than synthetic id)
        const key = item.episodeId || item.id;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
      
      // Sort: downloading/pending first, then completed by download date
      deduplicated.sort((a, b) => {
        const statusOrder = { downloading: 0, pending: 1, paused: 2, failed: 3, completed: 4 };
        const aOrder = statusOrder[a.downloadStatus || 'completed'] ?? 4;
        const bOrder = statusOrder[b.downloadStatus || 'completed'] ?? 4;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return b.downloadedAt - a.downloadedAt;
      });
      
      // Apply custom ordering
      const customOrder = await DownloadedPlaylistOrdering.getOrder();
      const ordered = DownloadedPlaylistOrdering.applyOrder(deduplicated, customOrder);
      
      if (alive.current) setItems(ordered);
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

  // Subscribe to queue state changes to auto-refresh
  useEffect(() => {
    if (Platform.OS === 'web') return;
    
    const unsubscribe = PodcastDownloadQueueService.subscribe((state) => {
      refetch();
    });

    return unsubscribe;
  }, []);

  const refetch = () => {
    setRefreshKey(prev => prev + 1);
  };

  const updateOrder = async (newOrder: typeof items) => {
    // Extract episodeIds in new order
    const episodeIds = newOrder.map(item => item.episodeId || item.id).filter(Boolean);
    await DownloadedPlaylistOrdering.saveOrder(episodeIds);
    
    // Update local state immediately for responsive UI
    setItems(newOrder);
  };

  return { items, loading, refetch, updateOrder };
}

export default useDownloadedPlaylist;


