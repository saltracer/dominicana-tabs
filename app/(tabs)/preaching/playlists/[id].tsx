import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import SwipeableItem, { useSwipeableItemParams } from 'react-native-swipeable-item';
import { ReduceMotion } from 'react-native-reanimated';
import { EpisodeListItem } from '../../../../components/EpisodeListItem';
import { PodcastEpisode } from '../../../../types';
import { getEpisodesMap, getFeed } from '../../../../lib/podcast/cache';
import { ensureImageCached, fileExists, setJson, keys } from '../../../../lib/podcast/storage';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { usePlaylists } from '../../../../hooks/usePlaylists';
import { usePlaylistItems } from '../../../../hooks/usePlaylistItems';
import { useDownloadedPlaylist } from '../../../../hooks/useDownloadedPlaylist';
import { usePodcastDownloads } from '../../../../hooks/usePodcastDownloads';
import { syncDown, syncUp, getCachedItems } from '../../../../lib/playlist/cache';
import { useAuth } from '../../../../contexts/AuthContext';
import { PodcastService } from '../../../../services/PodcastService';
import { usePodcastPlayer } from '../../../../contexts/PodcastPlayerContext';
import { PodcastDownloadQueueService } from '../../../../services/PodcastDownloadQueueService';
import { SharedPlaylistHooksProvider } from '../../../../contexts/SharedPlaylistHooksContext';
import { resolvePlaylistItems, resolveFeedArtwork } from '../../../../lib/playlist/resolution';
import { DownloadStatusCache } from '../../../../services/DownloadStatusCache';
import { EpisodeMetadataCache } from '../../../../services/EpisodeMetadataCache';

export default function PlaylistDetailScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { playEpisode, currentEpisode, isPlaying, isPaused, pause, resume } = usePodcastPlayer();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDownloaded = id === 'downloaded';
  const { playlists, loading: playlistsLoading } = usePlaylists();
  const playlist = useMemo(() => (isDownloaded ? { id: 'downloaded', name: 'Downloaded', is_builtin: true } as any : playlists.find(p => p.id === id)), [isDownloaded, id, playlists]);

  const { items: downloadedItems, loading: dlLoading, refetch: refetchDownloaded } = useDownloadedPlaylist();
  const { items: hookItems, loading, removeItem, moveItem } = usePlaylistItems(isDownloaded ? undefined : (id as string));
  
  // Call hooks once here and pass down to all EpisodeListItems for performance
  const { isEpisodeDownloaded, downloadEpisode, deleteDownloadedEpisode, retryDownload, pauseDownload, resumeDownload, removeFromQueue, getDownloadState, isDownloadsEnabled } = usePodcastDownloads();
  
  // Memoize shared hooks object to prevent unnecessary re-renders
  const sharedDownloadHooks = useMemo(() => ({
    isDownloadsEnabled,
    isEpisodeDownloaded,
    getDownloadState,
    downloadEpisode,
    deleteDownloadedEpisode,
  }), [isDownloadsEnabled, isEpisodeDownloaded, getDownloadState, downloadEpisode, deleteDownloadedEpisode]);
  
  const sharedPlaylistsHooks = useMemo(() => ({
    playlists,
  }), [playlists]);
  const [items, setItems] = useState(hookItems);
  const [resolved, setResolved] = useState<Map<string, PodcastEpisode | null>>(new Map());
  const [artworkPaths, setArtworkPaths] = useState<Map<string, string | null>>(new Map());
  const [artByPodcast, setArtByPodcast] = useState<Record<string, string | null>>({});
  const [downloadedDurations, setDownloadedDurations] = useState<Record<string, number | undefined>>({});
  const [localData, setLocalData] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [hasEverResolved, setHasEverResolved] = useState(false);
  const itemRefs = useRef<Map<string, any>>(new Map());

  // NOTE: Removed duplicate setItems effect that was causing triple resolution
  // Items are now ONLY updated via useFocusEffect cache reload
  // This eliminates the triple resolution issue

  // Refresh items from cache when screen comes into focus (picks up optimistic updates from other screens)
  // Use ref to prevent React.useCallback from recreating the callback (which triggers useFocusEffect multiple times)
  const focusHandlerRef = useRef<(() => void) | null>(null);
  
  if (!focusHandlerRef.current) {
    focusHandlerRef.current = () => {
      const focusTime = Date.now();
      if (__DEV__) console.log('[PlaylistDetail] 👁️  Screen focused, reloading from cache');
      
      if (!isDownloaded && id) {
        (async () => {
          const cacheStart = Date.now();
          const cached = await getCachedItems(id as string);
          if (__DEV__) console.log('[PlaylistDetail] 📦 Loaded', cached.length, 'items from cache in', Date.now() - cacheStart, 'ms');
          // Also load from hookItems on first mount
          const itemsToUse = cached.length > 0 ? cached : hookItems;
          setItems(itemsToUse);
          if (__DEV__) console.log('[PlaylistDetail] ⏱️ Total focus handler time:', Date.now() - focusTime, 'ms');
        })();
      } else {
        // For downloaded playlist or first load, use hookItems
        setItems(hookItems);
        if (__DEV__) console.log('[PlaylistDetail] ⏱️ Total focus handler time:', Date.now() - focusTime, 'ms');
      }
    };
  }
  
  useFocusEffect(
    React.useCallback(() => {
      focusHandlerRef.current?.();
      return () => {
        // Cleanup if needed
      };
    }, []) // Empty deps - only runs once per mount/unmount
  );

  // Load artwork and duration for downloaded items
  useEffect(() => {
    let alive = true;
    
    // Reset resolution state when downloaded items change
    if (isDownloaded) {
      setInitialResolutionComplete(false);
    }
    
    (async () => {
      if (!isDownloaded) {
        // For non-downloaded playlists, wait for the regular resolution to complete
        return;
      }
      
      // If empty downloaded playlist and not loading, mark as complete immediately
      if (downloadedItems.length === 0 && !dlLoading) {
        setInitialResolutionComplete(true);
        return;
      }
      
      const artMap: Record<string, string | null> = { ...artByPodcast };
      const durMap: Record<string, number | undefined> = { ...downloadedDurations };
      for (const item of downloadedItems) {
        const pid = (item as any).podcastId;
        const itemId = (item as any).id;
        
        // Load artwork
        if (pid && artMap[pid] === undefined) {
          try {
            const feed = await getFeed(pid);
            let artPath = feed?.summary?.localArtworkPath || null;
            let needsUpdate = false;
            
            // Verify the cached path exists, if not re-download
            if (artPath) {
              const exists = await fileExists(artPath);
              if (!exists && feed?.summary?.artworkUrl) {
                if (__DEV__) console.log('[PlaylistDetail] 📥 Re-downloading artwork for downloaded item:', feed.summary.artworkUrl);
                const { path } = await ensureImageCached(feed.summary.artworkUrl);
                artPath = path;
                needsUpdate = true;
              } else if (!exists) {
                artPath = null;
              }
            } else if (feed?.summary?.artworkUrl) {
              // No cached path, download it
              if (__DEV__) console.log('[PlaylistDetail] 📥 Downloading artwork for downloaded item:', feed.summary.artworkUrl);
              const { path } = await ensureImageCached(feed.summary.artworkUrl);
              artPath = path;
              needsUpdate = true;
            }
            
            // Update feed cache with new artwork path
            if (needsUpdate && feed && artPath) {
              feed.summary.localArtworkPath = artPath;
              await setJson(keys.feed(pid), feed);
              if (__DEV__) console.log('[PlaylistDetail] 💾 Updated feed cache with artwork path');
            }
            
            artMap[pid] = artPath;
            if (__DEV__) console.log('[PlaylistDetail] artwork for downloaded podcast', pid, '=', artPath);
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
        if (__DEV__) console.log('[PlaylistDetail] Downloaded items resolution complete for', downloadedItems.length, 'items');
        setArtByPodcast(artMap);
        setDownloadedDurations(durMap);
        // Mark initial resolution as complete for downloaded playlists
        setInitialResolutionComplete(true);
        setHasEverResolved(true);
      }
    })();
    return () => { alive = false; };
  }, [isDownloaded, downloadedItems]);

  const data = isDownloaded ? downloadedItems : items;

  // Sync local data for drag operations - sync immediately to enable fast rendering
  useEffect(() => {
    const syncStart = Date.now();
    // Always sync immediately for instant rendering (resolution happens in background)
    setLocalData(data as any);
    if (__DEV__) console.log('[PlaylistDetail] ✅ Synced localData from data source in', Date.now() - syncStart, 'ms, length:', data.length);
  }, [data]);

  // NEW: Use centralized resolution module for playlist items
  useEffect(() => {
    if (isDownloaded || items.length === 0) {
      return; // Downloaded items handled separately
    }

    let cancelled = false;
    
    const runResolution = async () => {
      if (__DEV__) console.log('[PlaylistDetail] 🔄 Starting resolution for', items.length, 'items');
      setIsResolving(true);
      
      try {
        const result = await resolvePlaylistItems(items, {
          useCache: true,
          prefetchArtwork: true,
          batchSize: 50,
        });

        if (cancelled) return;

        // Update state with results
        setResolved(result.resolved);
        setArtworkPaths(result.artworkPaths);
        setHasEverResolved(true);

        // Also resolve feed artwork for podcasts
        const podcastIds = Array.from(
          new Set(
            Array.from(result.resolved.values())
              .filter((ep): ep is PodcastEpisode => ep !== null)
              .map(ep => ep.podcastId)
          )
        );

        if (podcastIds.length > 0) {
          const feedArt = await resolveFeedArtwork(podcastIds);
          if (!cancelled) {
            const artMap: Record<string, string | null> = {};
            feedArt.forEach((path, podcastId) => {
              artMap[podcastId] = path;
            });
            setArtByPodcast(artMap);
          }
        }

        if (__DEV__) {
          console.log('[PlaylistDetail] ✅ Resolution complete:', result.stats);
        }
      } catch (error) {
        if (__DEV__) {
          console.error('[PlaylistDetail] ❌ Resolution error:', error);
        }
      } finally {
        if (!cancelled) {
          setIsResolving(false);
        }
      }
    };

    // Debounce to prevent rapid re-resolutions
    const debounceTimer = setTimeout(runResolution, 150);

    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
    };
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
      if (__DEV__) console.log('[PlaylistDetail] 🔄 Moving item:', movedItem.id, 'to index:', newIndex);
      try {
        // Don't block - moveItem now does non-blocking background sync
        await moveItem(movedItem.id, newIndex);
        if (__DEV__) console.log('[PlaylistDetail] ✅ Move queued, no repaint needed');
      } catch (error) {
        console.error('[PlaylistDetail] Failed to reorder item:', error);
        Alert.alert('Error', 'Failed to reorder item. Please try again.');
        // Revert on error
        setLocalData(data as any);
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

  const handleDeleteDownload = async (episode: PodcastEpisode, item?: any) => {
    try {
      // Check if this is a queue item
      const downloadStatus = (item as any)?.downloadStatus;
      
      if (downloadStatus && downloadStatus !== 'completed') {
        // This is a queue item - remove from queue
        const queueItemId = (item as any).id?.replace('queue-', '');
        if (queueItemId) {
          await removeFromQueue(queueItemId);
          refetchDownloaded();
        }
      } else {
        // This is a completed download - delete the file
        await deleteDownloadedEpisode(episode.id);
        refetchDownloaded();
      }
      
      // Close the swipe item after action
      const ref = itemRefs.current.get(episode.id);
      if (ref) ref.close();
    } catch (error) {
      console.error('Error deleting download:', error);
      Alert.alert('Error', 'Failed to delete download');
    }
  };

  const handleRetryDownload = async (item: any) => {
    try {
      const queueItemId = (item as any).id?.replace('queue-', '');
      if (queueItemId) {
        await retryDownload(queueItemId);
        refetchDownloaded();
      }
      // Close the swipe item after action
      const ref = itemRefs.current.get((item as any).episodeId);
      if (ref) ref.close();
    } catch (error) {
      console.error('Error retrying download:', error);
      Alert.alert('Error', 'Failed to retry download');
    }
  };

  const handleSwipeRemove = (itemId: string) => {
    handleRemove(itemId);
    const ref = itemRefs.current.get(itemId);
    if (ref) ref.close();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (isDownloaded) {
        // For downloaded playlist, refetch the downloaded items
        refetchDownloaded();
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (user?.id && id) {
        // For user playlists, sync with backend
        await syncUp(user.id);
        // Force a full sync on manual refresh
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

  // Underlay component for left swipe (download/delete download/retry)
  const UnderlayLeft = ({ item, episode }: { item: any; episode?: PodcastEpisode }) => {
    const downloadStatus = (item as any)?.downloadStatus;
    const isFailed = downloadStatus === 'failed';
    const isPaused = downloadStatus === 'paused';
    const isQueued = downloadStatus === 'pending' || downloadStatus === 'downloading';
    const isCompleted = downloadStatus === 'completed' || (!downloadStatus && episode && isEpisodeDownloaded(episode.id));
    
    let actionText = 'Download';
    let iconName: any = 'cloud-download';
    let bgColor = '#388e3c';
    
    if (isFailed) {
      actionText = 'Retry';
      iconName = 'refresh';
      bgColor = '#ff9800';
    } else if (isPaused) {
      actionText = 'Resume';
      iconName = 'play';
      bgColor = '#2196f3';
    } else if (isQueued) {
      actionText = 'Cancel';
      iconName = 'close';
      bgColor = '#f57c00';
    } else if (isCompleted) {
      actionText = 'Delete';
      iconName = 'trash';
      bgColor = '#f57c00';
    }
    
    return (
      <View style={[styles.underlayLeft, { backgroundColor: bgColor }]}>
        <Text style={styles.underlayText}>{actionText}</Text>
        <Ionicons name={iconName} size={24} color="#fff" />
      </View>
    );
  };

  // Show loading spinner until resolution completes to avoid jitter
  // For downloaded playlists, show spinner while loading downloads
  // For regular playlists, wait until we have at least some resolved items to prevent fallback row flash
  const showLoadingSpinner = isDownloaded 
    ? (!hasEverResolved && dlLoading)
    : (items.length > 0 && resolved.size === 0);

  return (
    <SharedPlaylistHooksProvider
      downloadHooks={sharedDownloadHooks}
      playlistsHooks={sharedPlaylistsHooks}
    >
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Stack.Screen 
          options={{ 
            title: playlist?.name || '',
          }} 
        />
        {showLoadingSpinner ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading playlist...
          </Text>
        </View>
      ) : (
        <DraggableFlatList
        data={localData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        onDragEnd={handleDragEnd}
        onDragBegin={() => {
          setIsDragging(true);
          // Close all open swipeable items when drag begins
          itemRefs.current.forEach((ref) => {
            if (ref) ref.close();
          });
        }}
        activationDistance={20}
        animationConfig={{
          reduceMotion: ReduceMotion.Never,
        }}
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
              <ScaleDecorator key={`downloaded-item-${(item as any).id}`}>
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
                  <View 
                    style={[styles.draggableItemContainer, isActive && styles.draggableItemActive]}
                    pointerEvents="box-none"
                  >
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
                      sharedDownloadHooks={sharedDownloadHooks}
                      sharedPlaylistsHooks={sharedPlaylistsHooks}
                      onPress={() => router.push({ pathname: '/preaching/episode/[id]', params: { id: ep.id, podcastId: ep.podcastId, guid: ep.guid, audioUrl: ep.audioUrl } })}
                      onPlay={() => {
                        // Only allow play if download is completed
                        const downloadStatus = (item as any)?.downloadStatus;
                        if (downloadStatus && downloadStatus !== 'completed') {
                          Alert.alert('Download Not Ready', 'This episode is still downloading. Please wait for it to complete.');
                          return;
                        }
                        
                        if (currentEpisode?.id === ep.id && isPlaying) {
                          pause();
                        } else if (currentEpisode?.id === ep.id && isPaused) {
                          resume();
                        } else {
                          // Build episode list from downloaded items (completed only)
                          const allEpisodes = localData
                            .filter((item: any) => !item.downloadStatus || item.downloadStatus === 'completed')
                            .map(item => {
                              const itemId = (item as any).id;
                              const cachedDur = downloadedDurations[itemId];
                              return {
                                id: (item as any).episodeId || itemId,
                                podcastId: (item as any).podcastId,
                                title: (item as any).title,
                                description: (item as any).description || '',
                                audioUrl: (item as any).audioUrl,
                                duration: (item as any).duration || cachedDur,
                                publishedAt: (item as any).publishedAt,
                                episodeNumber: (item as any).episodeNumber,
                                seasonNumber: (item as any).seasonNumber,
                                guid: (item as any).guid,
                                artworkUrl: (item as any).artworkUrl || undefined,
                                fileSize: (item as any).fileSize,
                                mimeType: (item as any).mimeType,
                                createdAt: new Date().toISOString(),
                              } as any;
                            });
                          playEpisode(ep, {
                            type: 'downloaded',
                            episodes: allEpisodes,
                            sourceId: 'downloaded',
                          });
                        }
                      }}
                      isPlaying={currentEpisode?.id === ep.id && isPlaying}
                      isPaused={currentEpisode?.id === ep.id && isPaused}
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
          const ep = resolved.get((item as any).id);
          if (ep) {
            // if (__DEV__) console.log('[PlaylistDetail] rendering playlist item episode:', { 
            //   id: ep.id,
            //   title: ep.title?.substring(0, 30),
            //   duration: ep.duration,
            //   hasDuration: ep.duration !== undefined && ep.duration !== null && ep.duration > 0,
            //   publishedAt: ep.publishedAt
            // });
            return (
              <ScaleDecorator key={`playlist-item-${(item as any).id}`}>
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
                  <View 
                    style={[styles.draggableItemContainer, isActive && styles.draggableItemActive]}
                    pointerEvents="box-none"
                  >
                    <EpisodeListItem
                      episode={ep}
                      showArtwork
                      artworkLocalPath={(() => {
                        // Use artwork from resolution first, fallback to feed artwork
                        const itemArtPath = artworkPaths.get((item as any).id);
                        const feedArtPath = artByPodcast[ep.podcastId];
                        return itemArtPath || feedArtPath || null;
                      })()}
                      showAddToPlaylist={false}
                      hideDescription
                      sharedDownloadHooks={sharedDownloadHooks}
                      sharedPlaylistsHooks={sharedPlaylistsHooks}
                      onPress={() => router.push({ pathname: '/preaching/episode/[id]', params: { id: ep.id, podcastId: ep.podcastId, guid: ep.guid, audioUrl: ep.audioUrl } })}
                      onPlay={() => {
                        if (currentEpisode?.id === ep.id && isPlaying) {
                          pause();
                        } else if (currentEpisode?.id === ep.id && isPaused) {
                          resume();
                        } else {
                          // Build episode list from resolved items
                          const allEpisodes = localData
                            .map(item => resolved.get((item as any).id))
                            .filter((ep): ep is PodcastEpisode => ep !== null && ep !== undefined);
                          playEpisode(ep, {
                            type: 'playlist',
                            episodes: allEpisodes,
                            sourceId: id,
                          });
                        }
                      }}
                      isPlaying={currentEpisode?.id === ep.id && isPlaying}
                      isPaused={currentEpisode?.id === ep.id && isPaused}
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
          
          // Fallback rows should not render - resolution should always provide episode data
          // Log warning in dev mode
          if (__DEV__) console.warn('[PlaylistDetail] ⚠️ Fallback row rendering (resolution may have failed):', {
            itemId: fallbackId,
            hasExternalRef: !!extRef,
            externalRefTitle: extRef?.title,
            itemTitle: (item as any).title,
            displayTitle: fallbackTitle,
          });
          
          return (
            <ScaleDecorator key={`fallback-${item.id || fallbackId}`}>
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
      )}
      </View>
    </SharedPlaylistHooksProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  draggableItemContainer: {
    marginBottom: 0,
  },
  draggableItemActive: {
    opacity: 0.9,
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
