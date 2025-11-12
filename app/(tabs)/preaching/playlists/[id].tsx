import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
import { syncDown, syncUp, getCachedItems, getCachedPlaylistData } from '../../../../lib/playlist/cache';
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

  const { items: downloadedItems, loading: dlLoading, refetch: refetchDownloaded, updateOrder: updateDownloadedOrder } = useDownloadedPlaylist();
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
  const lastDragIndexRef = useRef<number>(-1);
  const swipeDirectionRef = useRef<Map<string, string>>(new Map()); // Track which items are currently swiped open
  
  // Create stable onPress handlers for each episode to prevent remounting of underlays
  const underlayLeftHandlers = useRef<Map<string, () => void>>(new Map());
  const getUnderlayLeftHandler = (ep: PodcastEpisode) => {
    if (!underlayLeftHandlers.current.has(ep.id)) {
      underlayLeftHandlers.current.set(ep.id, () => {
        console.log('[PlaylistDetail] 👆 UnderlayLeft handler FIRED for:', ep.title.substring(0, 40));
        const downloaded = isEpisodeDownloaded(ep.id);
        if (downloaded) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          handleDeleteDownload(ep);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          handleDownload(ep);
        }
        const ref = itemRefs.current.get(ep.id);
        if (ref) ref.close();
      });
    }
    return underlayLeftHandlers.current.get(ep.id)!;
  };
  
  // Create render functions for SwipeableItem underlays
  // Cache by episode ID + download state to prevent unnecessary remounting
  const underlayLeftRenderers = useRef<Map<string, () => React.ReactElement>>(new Map());
  const getUnderlayLeftRenderer = React.useCallback((item: any, ep: PodcastEpisode) => {
    const currentIsDownloaded = isEpisodeDownloaded(ep.id);
    const downloadStatus = (item as any)?.downloadStatus;
    // Cache key includes both episode ID and current state
    const cacheKey = `${ep.id}-${currentIsDownloaded}-${downloadStatus}`;
    
    if (!underlayLeftRenderers.current.has(cacheKey)) {
      underlayLeftRenderers.current.set(cacheKey, () => (
        <UnderlayLeft 
          item={item} 
          episode={ep}
          onPress={getUnderlayLeftHandler(ep)}
          isDownloaded={currentIsDownloaded}
        />
      ));
    }
    return underlayLeftRenderers.current.get(cacheKey)!;
  }, [isEpisodeDownloaded]);

  const getUnderlayRightRenderer = React.useCallback((item: any, ep: PodcastEpisode) => {
    return () => (
      <UnderlayRight 
        item={item}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          handleSwipeRemove((item as any).id);
          const ref = itemRefs.current.get(ep.id);
          if (ref) ref.close();
        }}
      />
    );
  }, [handleSwipeRemove]);

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
      
      if (!isDownloaded && id && user?.id) {
        (async () => {
          const cacheStart = Date.now();
          // OPTIMIZATION: Batch read playlist data in single AsyncStorage call
          const { items: cached } = await getCachedPlaylistData(user.id, id as string);
          if (__DEV__) console.log('[PlaylistDetail] 📦 Loaded', cached.length, 'items from batched cache in', Date.now() - cacheStart, 'ms');
          // Also load from hookItems on first mount
          const itemsToUse = cached.length > 0 ? cached : hookItems;
          setItems(itemsToUse);
          if (__DEV__) console.log('[PlaylistDetail] ⏱️ Total focus handler time:', Date.now() - focusTime, 'ms');
        })();
      } else if (!isDownloaded && id) {
        // No user, fallback to regular cache read
        (async () => {
          const cacheStart = Date.now();
          const cached = await getCachedItems(id as string);
          if (__DEV__) console.log('[PlaylistDetail] 📦 Loaded', cached.length, 'items from cache in', Date.now() - cacheStart, 'ms');
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

  // Sync local items state with hookItems when they change (e.g., after removeItem)
  useEffect(() => {
    if (!isDownloaded) {
      // For regular playlists, keep local state in sync with hook updates
      setItems(hookItems);
    }
  }, [hookItems, isDownloaded]);

  // Load artwork and duration for downloaded items
  useEffect(() => {
    let alive = true;
    
    (async () => {
      if (!isDownloaded) {
        // For non-downloaded playlists, wait for the regular resolution to complete
        return;
      }
      
      // If empty downloaded playlist and not loading, just return
      if (downloadedItems.length === 0 && !dlLoading) {
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
    lastDragIndexRef.current = -1; // Reset drag tracking
    
    // Check if order actually changed
    const orderChanged = newData.some((item, idx) => {
      const originalIdx = data.findIndex(d => d.id === item.id);
      return originalIdx !== idx;
    });
    
    if (!orderChanged) {
      console.log('[PlaylistDetail] No order change detected');
      return; // No change, just a cancelled drag
    }
    
    // Handle downloaded playlist reordering
    if (isDownloaded) {
      // Update local data immediately for responsive UI
      setLocalData(newData);
      
      // Save custom order
      if (updateDownloadedOrder) {
        try {
          await updateDownloadedOrder(newData);
          // Haptic feedback on successful reorder
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (__DEV__) console.log('[PlaylistDetail] ✅ Downloaded playlist order saved');
        } catch (error) {
          console.error('[PlaylistDetail] Failed to save downloaded order:', error);
          // Haptic feedback on error
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Error', 'Failed to reorder. Please try again.');
          setLocalData(data as any); // Revert on error
        }
      }
      return;
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
        // Haptic feedback on successful reorder
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (__DEV__) console.log('[PlaylistDetail] ✅ Move queued, no repaint needed');
      } catch (error) {
        console.error('[PlaylistDetail] Failed to reorder item:', error);
        // Haptic feedback on error
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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

  // Create stable download handler using useCallback to prevent re-creation
  const handleDownload = React.useCallback((episode: PodcastEpisode) => {
    console.log('[PlaylistDetail] 🔽 handleDownload CALLED for:', episode.title.substring(0, 40));
    // Close the swipe item immediately (don't wait for download to queue)
    const ref = itemRefs.current.get(episode.id);
    if (ref) ref.close();
    
    // Fire and forget - don't await
    downloadEpisode(episode).then(() => {
      console.log('[PlaylistDetail] ✅ Episode queued successfully');
    }).catch(error => {
      console.error('Error downloading episode:', error);
      Alert.alert('Error', 'Failed to download episode');
    });
  }, [downloadEpisode]);

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
  const UnderlayRight = ({ item, onPress }: { item: any; onPress: () => void }) => {
    const theme = colorScheme ?? 'light';
    const isDark = theme === 'dark';
    
    return (
      <View style={styles.underlayRight}>
        <TouchableOpacity 
          style={[
            styles.underlayCard,
            { backgroundColor: isDark ? '#c62828' : '#e53935' }
          ]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.underlayContent}>
            <Ionicons name="trash" size={32} color="#fff" />
            <Text style={styles.underlayText}>Remove</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Underlay component for left swipe (download/delete download/retry)
  // Memoized with custom comparison to detect download state changes
  const UnderlayLeft = React.memo(({ 
    item, 
    episode, 
    onPress, 
    isDownloaded 
  }: { 
    item: any; 
    episode?: PodcastEpisode; 
    onPress: () => void;
    isDownloaded: boolean;
  }) => {
    const theme = colorScheme ?? 'light';
    const isDark = theme === 'dark';
    const downloadStatus = (item as any)?.downloadStatus;
    const isFailed = downloadStatus === 'failed';
    const isPaused = downloadStatus === 'paused';
    const isQueued = downloadStatus === 'pending' || downloadStatus === 'downloading';
    const isCompleted = downloadStatus === 'completed' || (!downloadStatus && isDownloaded);
    
    let actionText = 'Download';
    let iconName: any = 'cloud-download';
    let bgColor = isDark ? '#2e7d32' : '#43a047';
    
    if (isFailed) {
      actionText = 'Retry';
      iconName = 'refresh';
      bgColor = isDark ? '#f57c00' : '#fb8c00';
    } else if (isPaused) {
      actionText = 'Resume';
      iconName = 'play';
      bgColor = isDark ? '#1976d2' : '#2196f3';
    } else if (isQueued) {
      actionText = 'Cancel';
      iconName = 'close';
      bgColor = isDark ? '#e65100' : '#f57c00';
    } else if (isCompleted) {
      actionText = 'Delete';
      iconName = 'trash';
      bgColor = isDark ? '#e65100' : '#f57c00';
    }
    
    return (
      <View style={styles.underlayLeft} pointerEvents="box-none">
        <TouchableOpacity 
          style={[styles.underlayCard, { backgroundColor: bgColor }]}
          onPress={() => {
            console.log('[PlaylistDetail] 🖱️  TouchableOpacity in UnderlayLeft pressed, action:', actionText, 'episode:', episode?.title.substring(0, 40));
            console.log('[PlaylistDetail] 🖱️  About to call onPress handler');
            onPress();
            console.log('[PlaylistDetail] 🖱️  onPress handler completed');
          }}
          onPressIn={() => console.log('[PlaylistDetail] 👇 TouchableOpacity onPressIn (touch started)')}
          onPressOut={() => console.log('[PlaylistDetail] 👆 TouchableOpacity onPressOut (touch ended)')}
          activeOpacity={0.8}
          pointerEvents="auto"
        >
          <View style={styles.underlayContent} pointerEvents="none">
            <Ionicons name={iconName} size={32} color="#fff" />
            <Text style={styles.underlayText}>{actionText}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison: only re-render if download state or status changes
    return (
      prevProps.isDownloaded === nextProps.isDownloaded &&
      (prevProps.item as any)?.downloadStatus === (nextProps.item as any)?.downloadStatus &&
      prevProps.episode?.id === nextProps.episode?.id
    );
  });

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
        onDragBegin={(index) => {
          setIsDragging(true);
          // Haptic feedback when drag begins
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          // Track initial position for crossing detection
          lastDragIndexRef.current = index;
          // Close all open swipeable items when drag begins
          itemRefs.current.forEach((ref) => {
            if (ref) ref.close();
          });
        }}
        onPlaceholderIndexChange={(index) => {
          // Haptic feedback when item crosses over another item
          if (lastDragIndexRef.current !== -1 && index !== lastDragIndexRef.current) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            lastDragIndexRef.current = index;
          }
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
                    console.log('[PlaylistDetail] 🔄 [DOWNLOADED] SwipeableItem onChange for:', ep.title.substring(0, 40), 'direction:', openDirection);
                    const prevDirection = swipeDirectionRef.current.get(ep.id);
                    
                    if (openDirection !== 'none') {
                      // Prevent opening in opposite direction immediately after closing
                      if (prevDirection && prevDirection !== openDirection) {
                        // Was open in different direction, close this item instead
                        const ref = itemRefs.current.get(ep.id);
                        if (ref) {
                          setTimeout(() => ref.close(), 0);
                        }
                        return;
                      }
                      
                      // Haptic feedback when swipe opens
                      if (!prevDirection) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      
                      // DON'T auto-close other items - it causes touch blocking during re-renders
                      // Let users manually swipe items closed or tap outside
                      
                      // Haptic feedback when reaching snap point
                      if (snapPoint === 150 && !prevDirection) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      
                      // Track that this item is open
                      swipeDirectionRef.current.set(ep.id, openDirection);
                    } else {
                      // Clear tracking when swipe closes
                      swipeDirectionRef.current.delete(ep.id);
                    }
                  }}
                  overSwipe={20}
                  renderUnderlayLeft={getUnderlayLeftRenderer(item, ep)}
                  renderUnderlayRight={getUnderlayRightRenderer(item, ep)}
                  snapPointsLeft={[150]}
                  snapPointsRight={[150]}
                  swipeEnabled={!isDragging}
                  activationThreshold={10}
                  swipeDamping={0.7}
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
                      onLongPress={drag}
                      rightAccessory={
                        <View style={styles.dragHandle}>
                          <Ionicons name="reorder-three" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
                        </View>
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
                    console.log('[PlaylistDetail] 🔄 SwipeableItem onChange for:', ep.title.substring(0, 40), 'direction:', openDirection, 'snap:', snapPoint);
                    const prevDirection = swipeDirectionRef.current.get(ep.id);
                    
                    if (openDirection !== 'none') {
                      // Prevent opening in opposite direction immediately after closing
                      if (prevDirection && prevDirection !== openDirection) {
                        // Was open in different direction, close this item instead
                        const ref = itemRefs.current.get(ep.id);
                        if (ref) {
                          setTimeout(() => ref.close(), 0);
                        }
                        return;
                      }

                      // Haptic feedback when swipe opens
                      if (!prevDirection) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }

                      // DON'T auto-close other items - it causes touch blocking during re-renders
                      // Let users manually swipe items closed or tap outside

                      // Haptic feedback when reaching snap point
                      if (snapPoint === 150 && !prevDirection) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }
                      
                      // Track that this item is open
                      swipeDirectionRef.current.set(ep.id, openDirection);
                    } else {
                      // Clear tracking when swipe closes
                      swipeDirectionRef.current.delete(ep.id);
                    }
                  }}
                  overSwipe={20}
                  renderUnderlayLeft={getUnderlayLeftRenderer(item, ep)}
                  renderUnderlayRight={getUnderlayRightRenderer(item, ep)}
                  snapPointsLeft={[150]}
                  snapPointsRight={[150]}
                  swipeEnabled={!isDragging}
                  activationThreshold={10}
                  swipeDamping={0.7}
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
                      onLongPress={drag}
                      rightAccessory={
                        <View style={styles.dragHandle}>
                          <Ionicons name="reorder-three" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
                        </View>
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
                  const prevDirection = swipeDirectionRef.current.get(fallbackId);
                  
                  if (openDirection !== 'none') {
                    // Prevent opening in opposite direction immediately after closing
                    if (prevDirection && prevDirection !== openDirection) {
                      // Was open in different direction, close this item instead
                      const ref = itemRefs.current.get(fallbackId);
                      if (ref) {
                        setTimeout(() => ref.close(), 0);
                      }
                      return;
                    }
                    
                    // Haptic feedback when swipe opens
                    if (!prevDirection) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    
                    // Close other open items
                    itemRefs.current.forEach((ref, key) => {
                      if (key !== fallbackId && ref) ref.close();
                    });
                    
                    // Haptic feedback when reaching snap point
                    if (snapPoint === 150 && !prevDirection) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    
                    // Track that this item is open
                    swipeDirectionRef.current.set(fallbackId, openDirection);
                  } else {
                    // Clear tracking when swipe closes
                    swipeDirectionRef.current.delete(fallbackId);
                  }
                }}
                overSwipe={20}
                renderUnderlayRight={() => <UnderlayRight 
                  item={item}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    handleSwipeRemove((item as any).id);
                    const ref = itemRefs.current.get((item as any).id);
                    if (ref) ref.close();
                  }}
                />}
                snapPointsRight={[150]}
                swipeEnabled={!isDragging && !isDownloaded}
                activationThreshold={10}
                swipeDamping={0.7}
              >
                <TouchableOpacity 
                  style={[styles.draggableItemContainer, isActive && styles.draggableItemActive]}
                  onPress={() => router.push({ pathname: '/preaching/episode/[id]', params: { id: (item as any).episodeId || extRef?.guid || (item as any).guid || extRef?.audioUrl || (item as any).audioUrl, podcastId: extRef?.podcastId || (item as any).podcastId, guid: extRef?.guid || (item as any).guid, audioUrl: extRef?.audioUrl || (item as any).audioUrl } })}
                  onLongPress={drag}
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
    opacity: 0.95,
    transform: [{ scale: 1.02 }],
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
    paddingLeft: 16,
    paddingVertical: 8,
  },
  underlayLeft: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 16,
    paddingVertical: 8,
  },
  underlayCard: {
    borderRadius: 12,
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  underlayContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  underlayText: {
    color: '#fff',
    fontFamily: 'Georgia',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
