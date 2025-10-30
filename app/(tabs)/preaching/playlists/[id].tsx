import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EpisodeListItem } from '../../../../components/EpisodeListItem';
import { PodcastEpisode } from '../../../../types';
import { getEpisodesMap, getFeed } from '../../../../lib/podcast/cache';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { usePlaylists } from '../../../../hooks/usePlaylists';
import { usePlaylistItems } from '../../../../hooks/usePlaylistItems';
import { useDownloadedPlaylist } from '../../../../hooks/useDownloadedPlaylist';

export default function PlaylistDetailScreen() {
  const { colorScheme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDownloaded = id === 'downloaded';
  const { playlists, loading: playlistsLoading } = usePlaylists();
  const playlist = useMemo(() => (isDownloaded ? { id: 'downloaded', name: 'Downloaded', is_builtin: true } as any : playlists.find(p => p.id === id)), [isDownloaded, id, playlists]);

  const { items: downloadedItems, loading: dlLoading } = useDownloadedPlaylist();
  const { items, loading, removeItem, moveItem } = usePlaylistItems(isDownloaded ? undefined : (id as string));
  const [resolved, setResolved] = useState<Record<string, PodcastEpisode | null>>({});
  const [artByPodcast, setArtByPodcast] = useState<Record<string, string | null>>({});

  // Load artwork for downloaded items
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isDownloaded) return;
      const artMap: Record<string, string | null> = { ...artByPodcast };
      for (const item of downloadedItems) {
        const pid = (item as any).podcastId;
        if (pid && artMap[pid] === undefined) {
          try {
            const feed = await getFeed(pid);
            artMap[pid] = feed?.summary?.localArtworkPath || null;
            if (__DEV__) console.log('[PlaylistDetail] artwork for downloaded podcast', pid, '=', artMap[pid]);
          } catch {
            artMap[pid] = null;
          }
        }
      }
      if (alive) setArtByPodcast(artMap);
    })();
    return () => { alive = false; };
  }, [isDownloaded, downloadedItems]);

  const data = isDownloaded ? downloadedItems : items;

  // Resolve playlist items to episodes when possible for richer rendering
  useEffect(() => {
    let alive = true;
    (async () => {
      if (isDownloaded) return;
      const next: Record<string, PodcastEpisode | null> = {};
      const artMap: Record<string, string | null> = { ...artByPodcast };
      for (const it of items) {
        try {
          if ((it as any).episode_id) {
            // Minimal episode object; defer full fetch for now
            next[it.id] = {
              id: (it as any).episode_id,
              podcastId: (it as any).external_ref?.podcastId || 'unknown',
              title: 'Episode',
              description: '',
              audioUrl: (it as any).external_ref?.audioUrl || '',
              duration: undefined,
              publishedAt: undefined,
              episodeNumber: undefined,
              seasonNumber: undefined,
              guid: (it as any).external_ref?.guid,
              artworkUrl: undefined,
              fileSize: undefined,
              mimeType: undefined,
              createdAt: new Date().toISOString(),
            } as any;
            continue;
          }
          const ref = (it as any).external_ref;
          if (ref?.podcastId) {
            if (artMap[ref.podcastId] === undefined) {
              try {
                const feed = await getFeed(ref.podcastId);
                artMap[ref.podcastId] = feed?.summary?.localArtworkPath || null;
                if (__DEV__) console.log('[PlaylistDetail] artwork for podcast', ref.podcastId, '=', artMap[ref.podcastId]);
              } catch (e) { 
                artMap[ref.podcastId] = null;
                if (__DEV__) console.warn('[PlaylistDetail] failed to get artwork for', ref.podcastId, e);
              }
            }
            try {
              const map = await getEpisodesMap(ref.podcastId);
              const ep = Object.values(map).find(e => (ref.guid && e.guid === ref.guid) || (ref.audioUrl && e.audioUrl === ref.audioUrl));
              if (ep) {
                next[it.id] = {
                  id: ep.id as any,
                  podcastId: ref.podcastId,
                  title: ep.title,
                  description: ep.description,
                  audioUrl: ep.audioUrl,
                  duration: ep.duration,
                  publishedAt: ep.publishedAt,
                  episodeNumber: ep.episodeNumber,
                  seasonNumber: ep.seasonNumber,
                  guid: ep.guid,
                  artworkUrl: ep.artworkUrl,
                  fileSize: ep.fileSize,
                  mimeType: ep.mimeType,
                  createdAt: new Date().toISOString(),
                } as any;
                continue;
              }
            } catch {}
          }
          next[it.id] = null;
        } catch {
          next[it.id] = null;
        }
      }
      if (alive) {
        setResolved(next);
        setArtByPodcast(artMap);
      }
    })();
    return () => { alive = false; };
  }, [items, isDownloaded]);

  // Do not auto-navigate away; show empty state even if newly created and not yet synced

  const handleMove = (itemId: string, dir: -1 | 1) => {
    if (isDownloaded) return; // read-only
    const index = data.findIndex(i => i.id === itemId);
    if (index === -1) return;
    const toIndex = index + dir;
    if (toIndex < 0 || toIndex >= data.length) return;
    void moveItem(itemId, toIndex);
  };

  const handleRemove = (itemId: string) => {
    if (isDownloaded) return; // read-only here (removal handled in downloads UI)
    Alert.alert('Remove from playlist?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void removeItem(itemId) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <View style={styles.navBtn} />
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={1}>
          {playlist?.name || 'Playlist'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={data as any}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={({ item }) => {
          if (isDownloaded) {
            const ep: PodcastEpisode = {
              id: (item as any).episodeId || (item as any).id,
              podcastId: (item as any).podcastId,
              title: (item as any).title,
              description: (item as any).description || '',
              audioUrl: (item as any).audioUrl,
              duration: (item as any).duration,
              publishedAt: (item as any).publishedAt,
              episodeNumber: (item as any).episodeNumber,
              seasonNumber: (item as any).seasonNumber,
              guid: (item as any).guid,
              artworkUrl: (item as any).artworkUrl || undefined,
              fileSize: (item as any).fileSize,
              mimeType: (item as any).mimeType,
              createdAt: new Date().toISOString(),
            } as any;
            return (
              <EpisodeListItem
                episode={ep}
                showArtwork
                artworkLocalPath={(() => {
                  const path = artByPodcast[(item as any).podcastId] || null;
                  if (__DEV__) console.log('[PlaylistDetail] passing artwork to downloaded item:', (item as any).podcastId, 'path=', path);
                  return path;
                })()}
                showAddToPlaylist={false}
                hideDescription
                onPress={() => router.push({ pathname: '/preaching/episode/[id]', params: { id: ep.id, podcastId: ep.podcastId, guid: ep.guid, audioUrl: ep.audioUrl } })}
              />
            );
          }
          const ep = resolved[(item as any).id];
          if (ep) {
            return (
              <EpisodeListItem
                episode={ep}
                showArtwork
                artworkLocalPath={(() => {
                  const path = artByPodcast[ep.podcastId] || null;
                  if (__DEV__) console.log('[PlaylistDetail] passing artwork to playlist item:', ep.podcastId, 'path=', path);
                  return path;
                })()}
                showAddToPlaylist={false}
                hideDescription
                onPress={() => router.push({ pathname: '/preaching/episode/[id]', params: { id: ep.id, podcastId: ep.podcastId, guid: ep.guid, audioUrl: ep.audioUrl } })}
              />
            );
          }
          // Fallback minimal row
          return (
            <View style={[styles.itemRow, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}> 
              <View style={styles.itemInfo}>
                <Text style={[styles.itemTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>{(item as any).title || 'Episode'}</Text>
                <Text style={[styles.itemMeta, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={1}>{(item as any).audioUrl || ''}</Text>
              </View>
              <View style={styles.itemActions}>
                {!isDownloaded && (
                  <>
                    <TouchableOpacity onPress={() => handleMove((item as any).id, -1)} style={styles.iconBtn}>
                      <Ionicons name="arrow-up" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleMove((item as any).id, 1)} style={styles.iconBtn}>
                      <Ionicons name="arrow-down" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemove((item as any).id)} style={styles.iconBtn}>
                      <Ionicons name="remove-circle" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity onPress={() => router.push({ pathname: '/preaching/episode/[id]', params: { id: (item as any).episodeId || (item as any).guid || (item as any).audioUrl, podcastId: (item as any).podcastId, guid: (item as any).guid, audioUrl: (item as any).audioUrl } })} style={styles.iconBtn}>
                  <Ionicons name="chevron-forward" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  navBtn: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Georgia',
    fontWeight: '700',
    fontSize: 18,
  },
  headerRight: {
    width: 30,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontFamily: 'Georgia',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  itemMeta: {
    fontFamily: 'Georgia',
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
  },
});
