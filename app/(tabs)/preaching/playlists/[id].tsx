import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import SwipeableItem, { useSwipeableItemParams } from 'react-native-swipeable-item';
import { EpisodeListItem } from '../../../../components/EpisodeListItem';
import { PodcastEpisode } from '../../../../types';
import { getEpisodesMap, getFeed } from '../../../../lib/podcast/cache';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { usePlaylists } from '../../../../hooks/usePlaylists';
import { usePlaylistItems } from '../../../../hooks/usePlaylistItems';
import { useDownloadedPlaylist } from '../../../../hooks/useDownloadedPlaylist';
import { usePodcastDownloads } from '../../../../hooks/usePodcastDownloads';
import { syncDown, syncUp } from '../../../../lib/playlist/cache';
import { useAuth } from '../../../../contexts/AuthContext';
import { PodcastService } from '../../../../services/PodcastService';

export default function PlaylistDetailScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDownloaded = id === 'downloaded';
  const { playlists, loading: playlistsLoading } = usePlaylists();
  const playlist = useMemo(() => (isDownloaded ? { id: 'downloaded', name: 'Downloaded', is_builtin: true } as any : playlists.find(p => p.id === id)), [isDownloaded, id, playlists]);

  const { items: downloadedItems, loading: dlLoading, refetch: refetchDownloaded } = useDownloadedPlaylist();
  const { items, loading, removeItem, moveItem } = usePlaylistItems(isDownloaded ? undefined : (id as string));
  const { isEpisodeDownloaded, downloadEpisode, deleteDownloadedEpisode } = usePodcastDownloads();
  const [resolved, setResolved] = useState<Record<string, PodcastEpisode | null>>({});
  const [artByPodcast, setArtByPodcast] = useState<Record<string, string | null>>({});
  const [downloadedDurations, setDownloadedDurations] = useState<Record<string, number | undefined>>({});
  const [localData, setLocalData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const itemRefs = useRef<Map<string, any>>(new Map());

  // Load artwork and duration for downloaded items
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!isDownloaded) return;
      const artMap: Record<string, string | null> = { ...artByPodcast };
      const durMap: Record<string, number | undefined> = { ...downloadedDurations };
      for (const item of downloadedItems) {
        const pid = (item as any).podcastId;
        const itemId = (item as any).id;
        
        // Load artwork
        if (pid && artMap[pid] === undefined) {
          try {
            const feed = await getFeed(pid);
            artMap[pid] = feed?.summary?.localArtworkPath || null;
            if (__DEV__) console.log('[PlaylistDetail] artwork for downloaded podcast', pid, '=', artMap[pid]);
          } catch {
            artMap[pid] = null;
          }
        }
        
        // Load duration from cache if missing
        if (pid && durMap[itemId] === undefined && !(item as any).duration) {
          try {
            const map = await getEpisodesMap(pid);
            const guid = (item as any).guid;
            const audioUrl = (item as any).audioUrl;
            const ep = Object.values(map).find(e => 
              (guid && e.guid === guid) || 
              (!guid && e.audioUrl === audioUrl) ||
              e.audioUrl === audioUrl
            );
            if (ep && ep.duration) {
              durMap[itemId] = ep.duration;
              if (__DEV__) console.log('[PlaylistDetail] found duration from cache for', itemId, '=', ep.duration);
            }
          } catch (err) {
            if (__DEV__) console.warn('[PlaylistDetail] error loading duration from cache', err);
          }
        }
      }
      if (alive) {
        setArtByPodcast(artMap);
        setDownloadedDurations(durMap);
      }
    })();
    return () => { alive = false; };
  }, [isDownloaded, downloadedItems]);

  const data = isDownloaded ? downloadedItems : items;

  // Sync local data for drag operations - but not during active reordering
  useEffect(() => {
    if (!isReordering) {
      console.log('[PlaylistDetail] Syncing localData from data source, length:', data.length);
      setLocalData(data as any);
    } else {
      console.log('[PlaylistDetail] Skipping data sync - reordering in progress');
    }
  }, [data, isReordering]);

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
            // Fetch full episode data from database
            if (__DEV__) console.log('[PlaylistDetail] Item has episode_id, attempting DB fetch:', (it as any).episode_id);
            try {
              const episode = await PodcastService.getEpisode((it as any).episode_id);
              if (__DEV__) console.log('[PlaylistDetail] ✅ Fetched episode from DB:', episode.title);
              next[it.id] = episode;
              
              // Also fetch artwork for this podcast
              if (episode.podcastId && artMap[episode.podcastId] === undefined) {
                try {
                  const feed = await getFeed(episode.podcastId);
                  artMap[episode.podcastId] = feed?.summary?.localArtworkPath || null;
                } catch (e) {
                  artMap[episode.podcastId] = null;
                }
              }
              continue;
            } catch (err) {
              if (__DEV__) console.warn('[PlaylistDetail] ❌ Episode not found in DB (orphaned episode_id):', (it as any).episode_id);
              if (__DEV__) console.warn('[PlaylistDetail] This item should be removed and re-added to fix. Item ID:', it.id);
              // Fall through to create minimal object
            }
            
            // Fallback minimal episode object if DB fetch fails
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
                const resolvedEp = {
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
                if (__DEV__) console.log('[PlaylistDetail] resolved episode duration:', { 
                  cacheDuration: ep.duration,
                  resolvedDuration: resolvedEp.duration,
                  hasDuration: resolvedEp.duration !== undefined && resolvedEp.duration !== null 
                });
                next[it.id] = resolvedEp;
                continue;
              } else if (ref.title) {
                // Episode not in cache, but we have metadata from external_ref
                if (__DEV__) console.log('[PlaylistDetail] Using external_ref metadata for:', ref.title);
                next[it.id] = {
                  id: ref.guid || ref.audioUrl || it.id,
                  podcastId: ref.podcastId,
                  title: ref.title,
                  description: ref.description || '',
                  audioUrl: ref.audioUrl || '',
                  duration: ref.duration,
                  publishedAt: ref.publishedAt,
                  episodeNumber: undefined,
                  seasonNumber: undefined,
                  guid: ref.guid,
                  artworkUrl: ref.artworkUrl,
                  fileSize: undefined,
                  mimeType: undefined,
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

  const handleDragEnd = async ({ data: newData }: { data: any[] }) => {
    setIsDragging(false);
    if (isDownloaded) return; // read-only
    
    // Check if order actually changed
    const orderChanged = newData.some((item, idx) => {
      const originalIdx = data.findIndex(d => d.id === item.id);
      return originalIdx !== idx;
    });
    
    if (!orderChanged) {
      console.log('[PlaylistDetail] No order change detected');
      return; // No change, just a cancelled drag
    }
    
    // Update local data immediately for responsive UI
    setLocalData(newData);
    console.log('[PlaylistDetail] Updated localData with new order:', newData.map(i => i.id));
    
    // Find what moved and update backend
    const movedItem = newData.find((item, idx) => {
      const originalIdx = data.findIndex(d => d.id === item.id);
      return originalIdx !== idx;
    });
    
    if (movedItem) {
      const newIndex = newData.findIndex(i => i.id === movedItem.id);
      console.log('[PlaylistDetail] Moving item:', movedItem.id, 'to index:', newIndex);
      try {
        // Block data syncs during the move operation
        setIsReordering(true);
        await moveItem(movedItem.id, newIndex);
        console.log('[PlaylistDetail] moveItem completed, waiting for backend sync...');
        // Wait a bit longer for backend to fully propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsReordering(false);
        console.log('[PlaylistDetail] Reordering complete');
      } catch (error) {
        console.error('[PlaylistDetail] Failed to reorder item:', error);
        Alert.alert('Error', 'Failed to reorder item. Please try again.');
        // Revert on error
        setLocalData(data as any);
        setIsReordering(false);
      }
    }
  };

  const handleRemove = (itemId: string) => {
    if (isDownloaded) return; // read-only here (removal handled in downloads UI)
    Alert.alert('Remove from playlist?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void removeItem(itemId) },
    ]);
  };

  const handleDownload = async (episode: PodcastEpisode) => {
    try {
      await downloadEpisode(episode);
      // Close the swipe item after action
      const ref = itemRefs.current.get(episode.id);
      if (ref) ref.close();
    } catch (error) {
      console.error('Error downloading episode:', error);
      Alert.alert('Error', 'Failed to download episode');
    }
  };

  const handleDeleteDownload = async (episode: PodcastEpisode) => {
    try {
      await deleteDownloadedEpisode(episode.id);
      // Close the swipe item after action
      const ref = itemRefs.current.get(episode.id);
      if (ref) ref.close();
    } catch (error) {
      console.error('Error deleting download:', error);
      Alert.alert('Error', 'Failed to delete download');
    }
  };

  const handleSwipeRemove = (itemId: string) => {
    handleRemove(itemId);
    const ref = itemRefs.current.get(itemId);
    if (ref) ref.close();
  };

  const handleRefresh = async () => {
    if (isReordering) return; // Don't refresh during reordering
    
    setRefreshing(true);
    try {
      if (isDownloaded) {
        // For downloaded playlist, refetch the downloaded items
        refetchDownloaded();
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (user?.id && id) {
        // For user playlists, sync with backend
        await syncUp(user.id);
        await syncDown(user.id);
      }
    } catch (error) {
      console.error('[PlaylistDetail] Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Underlay component for right swipe (remove from playlist)
  const UnderlayRight = ({ item }: { item: any }) => (
    <View style={[styles.underlayRight, { backgroundColor: '#d32f2f' }]}>
      <Ionicons name="trash" size={24} color="#fff" />
      <Text style={styles.underlayText}>Remove</Text>
    </View>
  );

  // Underlay component for left swipe (download/delete download)
  const UnderlayLeft = ({ item, episode }: { item: any; episode?: PodcastEpisode }) => {
    const downloaded = episode ? isEpisodeDownloaded(episode.id) : false;
    return (
      <View style={[styles.underlayLeft, { backgroundColor: downloaded ? '#f57c00' : '#388e3c' }]}>
        <Text style={styles.underlayText}>{downloaded ? 'Delete' : 'Download'}</Text>
        <Ionicons name={downloaded ? 'trash' : 'cloud-download'} size={24} color="#fff" />
      </View>
    );
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

      <DraggableFlatList
        data={localData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        onDragEnd={handleDragEnd}
        onDragBegin={() => {
          setIsDragging(true);
          // Close all open swipeable items when drag begins
          itemRefs.current.forEach((ref) => {
            if (ref) ref.close();
          });
        }}
        activationDistance={isDownloaded ? 999999 : 20}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors[colorScheme ?? 'light'].primary}
            colors={[Colors[colorScheme ?? 'light'].primary]}
          />
        }
        renderItem={({ item, drag, isActive }: RenderItemParams<any>) => {
          if (isDownloaded) {
            const itemId = (item as any).id;
            const cachedDuration = downloadedDurations[itemId];
            const ep: PodcastEpisode = {
              id: (item as any).episodeId || itemId,
              podcastId: (item as any).podcastId,
              title: (item as any).title,
              description: (item as any).description || '',
              audioUrl: (item as any).audioUrl,
              duration: (item as any).duration || cachedDuration,
              publishedAt: (item as any).publishedAt,
              episodeNumber: (item as any).episodeNumber,
              seasonNumber: (item as any).seasonNumber,
              guid: (item as any).guid,
              artworkUrl: (item as any).artworkUrl || undefined,
              fileSize: (item as any).fileSize,
              mimeType: (item as any).mimeType,
              createdAt: new Date().toISOString(),
            } as any;
            if (__DEV__) console.log('[PlaylistDetail] downloaded item duration:', { 
              itemDuration: (item as any).duration,
              cachedDuration,
              finalDuration: ep.duration,
              hasDuration: ep.duration !== undefined && ep.duration !== null 
            });
            return (
              <ScaleDecorator>
                <SwipeableItem
                  key={ep.id}
                  item={item}
                  ref={(ref) => {
                    if (ref) itemRefs.current.set(ep.id, ref);
                  }}
                  onChange={({ openDirection, snapPoint }) => {
                    if (openDirection !== 'none') {
                      // Close other open items
                      itemRefs.current.forEach((ref, key) => {
                        if (key !== ep.id && ref) ref.close();
                      });
                      
                      // Trigger action when fully swiped
                      if (snapPoint === 150) {
                        setTimeout(() => {
                          if (openDirection === 'left') {
                            const downloaded = isEpisodeDownloaded(ep.id);
                            if (downloaded) {
                              handleDeleteDownload(ep);
                            } else {
                              handleDownload(ep);
                            }
                          } else if (openDirection === 'right' && !isDownloaded) {
                            handleSwipeRemove((item as any).id);
                          }
                        }, 100);
                      }
                    }
                  }}
                  overSwipe={20}
                  renderUnderlayLeft={() => <UnderlayLeft item={item} episode={ep} />}
                  renderUnderlayRight={() => <UnderlayRight item={item} />}
                  snapPointsLeft={[150]}
                  snapPointsRight={[150]}
                  swipeEnabled={!isDragging}
                  activationThreshold={20}
                >
                  <View style={[styles.draggableItemContainer, isActive && styles.draggableItemActive]}>
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
                      onLongPress={!isDownloaded ? drag : undefined}
                      rightAccessory={
                        !isDownloaded ? (
                          <View style={styles.dragHandle}>
                            <Ionicons name="reorder-three" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
                          </View>
                        ) : null
                      }
                    />
                  </View>
                </SwipeableItem>
              </ScaleDecorator>
            );
          }
          const ep = resolved[(item as any).id];
          if (ep) {
            if (__DEV__) console.log('[PlaylistDetail] rendering playlist item episode:', { 
              id: ep.id,
              title: ep.title?.substring(0, 30),
              duration: ep.duration,
              hasDuration: ep.duration !== undefined && ep.duration !== null && ep.duration > 0,
              publishedAt: ep.publishedAt
            });
            return (
              <ScaleDecorator>
                <SwipeableItem
                  key={ep.id}
                  item={item}
                  ref={(ref) => {
                    if (ref) itemRefs.current.set(ep.id, ref);
                  }}
                  onChange={({ openDirection, snapPoint }) => {
                    if (openDirection !== 'none') {
                      // Close other open items
                      itemRefs.current.forEach((ref, key) => {
                        if (key !== ep.id && ref) ref.close();
                      });
                      
                      // Trigger action when fully swiped
                      if (snapPoint === 150) {
                        setTimeout(() => {
                          if (openDirection === 'left') {
                            const downloaded = isEpisodeDownloaded(ep.id);
                            if (downloaded) {
                              handleDeleteDownload(ep);
                            } else {
                              handleDownload(ep);
                            }
                          } else if (openDirection === 'right' && !isDownloaded) {
                            handleSwipeRemove((item as any).id);
                          }
                        }, 100);
                      }
                    }
                  }}
                  overSwipe={20}
                  renderUnderlayLeft={() => <UnderlayLeft item={item} episode={ep} />}
                  renderUnderlayRight={() => <UnderlayRight item={item} />}
                  snapPointsLeft={[150]}
                  snapPointsRight={[150]}
                  swipeEnabled={!isDragging}
                  activationThreshold={20}
                >
                  <View style={[styles.draggableItemContainer, isActive && styles.draggableItemActive]}>
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
                      onLongPress={!isDownloaded ? drag : undefined}
                      rightAccessory={
                        !isDownloaded ? (
                          <View style={styles.dragHandle}>
                            <Ionicons name="reorder-three" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
                          </View>
                        ) : null
                      }
                    />
                  </View>
                </SwipeableItem>
              </ScaleDecorator>
            );
          }
          // Fallback minimal row - use external_ref metadata if available
          const fallbackId = (item as any).id || (item as any).episodeId || (item as any).audioUrl;
          const extRef = (item as any).external_ref;
          const fallbackTitle = extRef?.title || (item as any).title || 'Episode';
          const fallbackMeta = extRef?.audioUrl || (item as any).audioUrl || '';
          
          if (__DEV__) console.log('[PlaylistDetail] Fallback row:', {
            itemId: fallbackId,
            hasExternalRef: !!extRef,
            externalRefTitle: extRef?.title,
            itemTitle: (item as any).title,
            displayTitle: fallbackTitle,
          });
          
          return (
            <ScaleDecorator>
              <SwipeableItem
                key={fallbackId}
                item={item}
                ref={(ref) => {
                  if (ref) itemRefs.current.set(fallbackId, ref);
                }}
                onChange={({ openDirection, snapPoint }) => {
                  if (openDirection !== 'none') {
                    // Close other open items
                    itemRefs.current.forEach((ref, key) => {
                      if (key !== fallbackId && ref) ref.close();
                    });
                    
                    // Trigger action when fully swiped
                    if (snapPoint === 150 && openDirection === 'right' && !isDownloaded) {
                      setTimeout(() => {
                        handleSwipeRemove((item as any).id);
                      }, 100);
                    }
                  }
                }}
                overSwipe={20}
                renderUnderlayRight={() => <UnderlayRight item={item} />}
                snapPointsRight={[150]}
                swipeEnabled={!isDragging && !isDownloaded}
                activationThreshold={20}
              >
                <TouchableOpacity 
                  style={[styles.draggableItemContainer, isActive && styles.draggableItemActive]}
                  onPress={() => router.push({ pathname: '/preaching/episode/[id]', params: { id: (item as any).episodeId || extRef?.guid || (item as any).guid || extRef?.audioUrl || (item as any).audioUrl, podcastId: extRef?.podcastId || (item as any).podcastId, guid: extRef?.guid || (item as any).guid, audioUrl: extRef?.audioUrl || (item as any).audioUrl } })}
                  onLongPress={!isDownloaded ? drag : undefined}
                  activeOpacity={0.7}
                >
                  <View style={[styles.itemRow, { backgroundColor: Colors[colorScheme ?? 'light'].card, flex: 1 }]}> 
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>{fallbackTitle}</Text>
                      <Text style={[styles.itemMeta, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={1}>{fallbackMeta}</Text>
                    </View>
                    <View style={styles.itemActions}>
                      {!isDownloaded && (
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleRemove((item as any).id); }} style={styles.iconBtn}>
                          <Ionicons name="remove-circle" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
                        </TouchableOpacity>
                      )}
                    </View>
                    {!isDownloaded && (
                      <View style={styles.dragHandle}>
                        <Ionicons name="reorder-three" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </SwipeableItem>
            </ScaleDecorator>
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
  draggableItemContainer: {
    marginBottom: 10,
  },
  draggableItemActive: {
    opacity: 0.7,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dragHandle: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
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
  underlayRight: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 20,
  },
  underlayLeft: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 20,
  },
  underlayText: {
    color: '#fff',
    fontFamily: 'Georgia',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});
