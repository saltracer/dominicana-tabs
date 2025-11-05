import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PodcastEpisode } from '../types';
import { useTheme } from './ThemeProvider';
import { Colors } from '../constants/Colors';
import { usePodcastDownloads } from '../hooks/usePodcastDownloads';
import HtmlRenderer from './HtmlRenderer';
import { getEpisodesMap } from '../lib/podcast/cache';
import { ensureImageCached, removeKey } from '../lib/podcast/storage';
import { getFeed } from '../lib/podcast/cache';
import { fileExists } from '../lib/podcast/storage';
import { PodcastDownloadService } from '../services/PodcastDownloadService';
import PlaylistService from '../services/PlaylistService';
import { PodcastService } from '../services/PodcastService';
import { usePlaylists } from '../hooks/usePlaylists';
import { keys as playlistCacheKeys, getCachedItems, setCachedItems } from '../lib/playlist/cache';

interface EpisodeListItemProps {
  episode: PodcastEpisode;
  onPress: () => void;
  onPlay?: () => void;
  onLongPress?: () => void;
  isPlaying?: boolean;
  isPaused?: boolean;
  progress?: number; // Progress percentage 0-1
  showProgress?: boolean;
  showArtwork?: boolean;
  artworkLocalPath?: string | null;
  showAddToPlaylist?: boolean;
  hideDescription?: boolean; // When true, hide description and show date/duration instead
  rightAccessory?: React.ReactNode; // Optional component to render on the right (e.g., drag handle)
}

export const EpisodeListItem = React.memo(function EpisodeListItem({
  episode,
  onPress,
  onPlay,
  onLongPress,
  isPlaying = false,
  isPaused = false,
  progress = 0,
  showProgress = true,
  showArtwork = false,
  artworkLocalPath = null,
  showAddToPlaylist = true,
  hideDescription = false,
  rightAccessory = null,
}: EpisodeListItemProps) {
  const { colorScheme } = useTheme();
  const plainTitle = React.useMemo(() => {
    try {
      const withoutTags = episode.title.replace(/<[^>]*>/g, '');
      return withoutTags;
    } catch {
      return episode.title;
    }
  }, [episode.title]);
  const [cacheDownloaded, setCacheDownloaded] = useState<boolean>(false);

  // Memoize theme-dependent styles
  const themeStyles = useMemo(() => {
    const theme = colorScheme ?? 'light';
    return {
      card: { backgroundColor: Colors[theme].card },
      text: Colors[theme].text,
      textSecondary: Colors[theme].textSecondary,
      primary: Colors[theme].primary,
      border: Colors[theme].border,
    };
  }, [colorScheme]);
  const { 
    isDownloadsEnabled, 
    isEpisodeDownloaded, 
    getDownloadState, 
    downloadEpisode, 
    deleteDownloadedEpisode 
  } = usePodcastDownloads();

  const [artPath, setArtPath] = useState<string | null>(artworkLocalPath || null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!showArtwork) {
        setArtPath(null);
        return;
      }
      // Prefer parent-provided local path, but verify it exists
      if (artworkLocalPath) {
        try {
          const exists = await fileExists(artworkLocalPath);
          if (exists) {
            if (__DEV__) console.log('[EpisodeListItem] artwork using localPath:', artworkLocalPath);
            if (!cancelled) setArtPath(artworkLocalPath);
            return;
          }
          if (__DEV__) console.warn('[EpisodeListItem] localPath does not exist:', artworkLocalPath);
        } catch {
          if (__DEV__) console.warn('[EpisodeListItem] failed to check localPath:', artworkLocalPath);
        }
      }
      // Try episode artwork first
      if (episode.artworkUrl) {
        try {
          const { path } = await ensureImageCached(episode.artworkUrl);
          if (!cancelled) setArtPath(path);
          return;
        } catch {
          // Fall through to feed artwork
        }
      }
      // Fallback to podcast artwork from feed cache
      try {
        const feed = await getFeed(episode.podcastId);
        const localArt = feed?.summary?.localArtworkPath;
        if (localArt) {
          // Verify the cached path exists before using it
          const exists = await fileExists(localArt);
          if (exists) {
            if (__DEV__) console.log('[EpisodeListItem] artwork using feed localArt:', localArt);
            if (!cancelled) setArtPath(localArt);
            return;
          }
          if (__DEV__) console.warn('[EpisodeListItem] feed localArt does not exist, re-caching:', localArt);
        }
        // Re-cache from URL if local path is missing or invalid
        const artUrl = feed?.summary?.artworkUrl;
        if (artUrl) {
          if (__DEV__) console.log('[EpisodeListItem] caching artwork from feed URL:', artUrl);
          const { path } = await ensureImageCached(artUrl);
          if (!cancelled) setArtPath(path);
          return;
        }
        if (!cancelled) setArtPath(null);
      } catch (e) {
        if (__DEV__) console.warn('[EpisodeListItem] failed to load feed artwork:', e);
        if (!cancelled) setArtPath(null);
      }
    })();
    return () => { cancelled = true; };
  }, [showArtwork, episode.artworkUrl, episode.podcastId, artworkLocalPath]);

  // Download state and handlers (with queue support)
  const isDownloadedMeta = isEpisodeDownloaded(episode.id);
  const isDownloaded = cacheDownloaded || isDownloadedMeta;
  const downloadState = getDownloadState(episode.id);
  
  // Check if download is in queue or downloading
  const isInQueue = downloadState.status === 'pending';
  const isDownloading = downloadState.status === 'downloading';
  const isPausedDownload = downloadState.status === 'paused';
  const hasDownloadError = downloadState.status === 'error' || downloadState.status === 'failed';
  
  // Get status icon for download state
  const getDownloadStatusIcon = () => {
    if (isDownloading) return { name: 'download' as const, color: '#2196f3' };
    if (isInQueue) return { name: 'time' as const, color: '#ff9800' };
    if (isPausedDownload) return { name: 'pause-circle' as const, color: '#ff9800' };
    if (hasDownloadError) return { name: 'alert-circle' as const, color: '#f44336' };
    if (isDownloaded) return { name: 'checkmark-circle' as const, color: '#4caf50' };
    return null;
  };
  
  const statusIcon = getDownloadStatusIcon();

  // Fast cache-based detection so the button reflects state before metadata loads
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        // First, check download metadata directly for this episode id
        const directPath = await PodcastDownloadService.getDownloadedEpisodePath(episode.id);
        if (directPath) {
          if (!cancelled) setCacheDownloaded(true);
          return;
        }

        const map = await getEpisodesMap(episode.podcastId);
        // match by guid or audioUrl
        const entry = Object.values(map).find(e => (e.guid && e.guid === episode.guid) || e.audioUrl === episode.audioUrl);
        if (entry && entry.localAudioPath) {
          const exists = await fileExists(entry.localAudioPath);
          if (!cancelled) setCacheDownloaded(!!exists);
          return;
        }
      } catch {}
      if (!cancelled) setCacheDownloaded(false);
    };
    check();
    return () => { cancelled = true; };
  }, [episode.id, episode.podcastId, episode.guid, episode.audioUrl]);

  const handleDownload = async () => {
    if (isDownloaded) {
      await deleteDownloadedEpisode(episode.id);
    } else {
      await downloadEpisode(episode);
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds % 60}`;
    }
    return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string, useAbsolute = false): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    if (useAbsolute) {
      // Use actual date format for playlist screens
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    // Relative dates for other screens
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const handlePlay = useCallback((e: any) => {
    e?.stopPropagation?.();
    if (onPlay) {
      onPlay();
    }
  }, [onPlay]);

  const handleDownloadPress = useCallback((e: any) => {
    e?.stopPropagation?.();
    handleDownload(e);
  }, [handleDownload]);

  const hasProgress = showProgress && progress > 0 && progress < 1;

  const { playlists } = usePlaylists();
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleAddToPlaylist = useCallback((e: any) => {
    e?.stopPropagation?.();
    const userPlaylists = (playlists || []).filter((p: any) => !p.is_builtin);
    if (userPlaylists.length === 0) {
      Alert.alert('No playlists', 'Create a playlist first in the Playlists tab.');
      return;
    }
    setPickerVisible(true);
  }, [playlists]);

  const addToTarget = useCallback(async (playlistId: string, playlistName: string) => {
    try {
      if (__DEV__) console.log('[EpisodeListItem] 🎯 Adding episode to playlist:', playlistName);
      const addStart = Date.now();
      
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(episode.id);
      
      // Try to find episode in database (check by ID first, then by guid)
      let dbEpisode: any = null;
      
      // First try: Check if episode.id is actually a database ID
      if (isUuid) {
        try {
          dbEpisode = await PodcastService.getEpisode(episode.id, true);
          if (__DEV__) console.log('[EpisodeListItem] ✅ Episode exists in DB by ID, using episode_id');
        } catch (e) {
          // Not found by ID, try by guid
        }
      }
      
      // Second try: Check by guid (for RSS-cached episodes from curated podcasts)
      if (!dbEpisode && episode.guid && episode.podcastId) {
        dbEpisode = await PodcastService.getEpisodeByGuid(episode.podcastId, episode.guid, true);
        if (dbEpisode && __DEV__) {
          console.log('[EpisodeListItem] ✅ Episode exists in DB by guid, using episode_id:', dbEpisode.id);
        }
      }
      
      // Third try: Check by audioUrl (final fallback)
      if (!dbEpisode && episode.audioUrl && episode.podcastId) {
        dbEpisode = await PodcastService.getEpisodeByAudioUrl(episode.podcastId, episode.audioUrl, true);
        if (dbEpisode && __DEV__) {
          console.log('[EpisodeListItem] ✅ Episode exists in DB by audioUrl, using episode_id:', dbEpisode.id);
        }
      }
      
      // Optimistically update cache BEFORE database call - episode appears instantly in playlist!
      const cachedItems = await getCachedItems(playlistId);
      const optimisticItem = {
        id: `temp-${Date.now()}`,
        playlist_id: playlistId,
        episode_id: dbEpisode ? dbEpisode.id : null,
        external_ref: dbEpisode ? null : { 
          podcastId: episode.podcastId, 
          guid: episode.guid, 
          audioUrl: episode.audioUrl,
          title: episode.title,
          description: episode.description,
          duration: episode.duration,
          publishedAt: episode.publishedAt,
          artworkUrl: episode.artworkUrl,
        } as any,
        position: cachedItems.length,
        added_at: new Date().toISOString(),
      };
      const updatedCache = [...cachedItems, optimisticItem];
      await setCachedItems(playlistId, updatedCache);
      if (__DEV__) console.log('[EpisodeListItem] ✅ Optimistic cache update complete in', Date.now() - addStart, 'ms');
      
      // Show success message immediately
      setPickerVisible(false);
      Alert.alert('Added', `Added to ${playlistName}`);
      
      // Database insert happens in background (non-blocking for user)
      (async () => {
        const dbStart = Date.now();
        try {
          if (dbEpisode) {
            await PlaylistService.addItem(playlistId, { episode_id: dbEpisode.id });
          } else {
            await PlaylistService.addItem(playlistId, { 
              external_ref: { 
                podcastId: episode.podcastId, 
                guid: episode.guid, 
                audioUrl: episode.audioUrl,
                title: episode.title,
                description: episode.description,
                duration: episode.duration,
                publishedAt: episode.publishedAt,
                artworkUrl: episode.artworkUrl,
              } as any 
            });
          }
          
          // Refresh cache with real data from DB (replaces temp ID with real ID)
          const freshItems = await PlaylistService.getItems(playlistId);
          await setCachedItems(playlistId, freshItems);
          if (__DEV__) console.log('[EpisodeListItem] 🔄 Background DB sync complete in', Date.now() - dbStart, 'ms');
        } catch (e) {
          if (__DEV__) console.error('[EpisodeListItem] ❌ Background sync failed:', e);
          // Revert optimistic update on error
          await setCachedItems(playlistId, cachedItems);
        }
      })();
    } catch (e) {
      setPickerVisible(false);
      Alert.alert('Error', 'Failed to add to playlist');
    }
  }, [episode]);

  return (
    <TouchableOpacity
      style={[styles.container, themeStyles.card]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.content}>
        <View style={styles.body}>
        <View style={styles.header}>
          {showArtwork && (
            <View style={styles.artworkContainer}>
              {artPath ? (
                <>
                  {/* {__DEV__ && console.log('[EpisodeListItem] rendering image with path:', artPath)} */}
                  <Image 
                    source={{ uri: artPath }} 
                    style={styles.artwork} 
                    resizeMode="cover"
                    onError={(e) => {
                      if (__DEV__) console.warn('[EpisodeListItem] image load error:', e.nativeEvent.error, 'for path:', artPath);
                    }}
                    onLoad={() => {
                      if (__DEV__) console.log('[EpisodeListItem] image loaded successfully:', artPath);
                    }}
                  />
                </>
              ) : (
                <>
                  {__DEV__ && console.log('[EpisodeListItem] no artPath, showing placeholder')}
                  <View style={[styles.artwork, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]} />
                </>
              )}
              {/* Download status badge */}
              {statusIcon && (
                <View style={[styles.statusBadge, { backgroundColor: statusIcon.color }]}>
                  <Ionicons name={statusIcon.name} size={12} color="#fff" />
                </View>
              )}
            </View>
          )}
          <View style={styles.titleContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text numberOfLines={2} style={[styles.title, { color: themeStyles.text, flex: 1 }]}>
                {plainTitle}
              </Text>
              {/* Download status badge (when no artwork) */}
              {!showArtwork && statusIcon && (
                <View style={[styles.statusBadgeInline, { backgroundColor: statusIcon.color }]}>
                  <Ionicons name={statusIcon.name} size={14} color="#fff" />
                </View>
              )}
            </View>
            {(isPlaying || isPaused) && (
              <View style={[styles.playingIndicator, { backgroundColor: themeStyles.primary }]}>
                <Ionicons name="radio" size={12} color="#fff" />
              </View>
            )}
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.playButton,
                {
                  backgroundColor: isPlaying || isPaused
                    ? themeStyles.primary
                    : Colors[colorScheme ?? 'light'].surface,
                }
              ]}
              onPress={handlePlay}
            >
              <Ionicons
                name={isPaused ? 'play' : isPlaying ? 'pause' : 'play'}
                size={24}
                color={isPlaying || isPaused ? '#fff' : themeStyles.primary}
              />
            </TouchableOpacity>
            
            {/* Download Button with queue support */}
            {isDownloadsEnabled && (
              <TouchableOpacity
                style={[
                  styles.downloadButton,
                  {
                    backgroundColor: isDownloaded || isDownloading || isInQueue
                      ? themeStyles.primary
                      : isPausedDownload
                      ? '#ff9800'
                      : hasDownloadError
                      ? '#f44336'
                      : Colors[colorScheme ?? 'light'].surface,
                  }
                ]}
                onPress={handleDownloadPress}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <View style={{ position: 'relative' }}>
                    <ActivityIndicator size="small" color="#fff" />
                    {downloadState.progress !== undefined && (
                      <Text style={{ fontSize: 8, color: '#fff', marginTop: 2 }}>
                        {downloadState.progress.toFixed(0)}%
                      </Text>
                    )}
                  </View>
                ) : isInQueue ? (
                  <Ionicons
                    name="time"
                    size={20}
                    color="#fff"
                  />
                ) : isPausedDownload ? (
                  <Ionicons
                    name="pause-circle"
                    size={20}
                    color="#fff"
                  />
                ) : hasDownloadError ? (
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color="#fff"
                  />
                ) : (
                  <Ionicons
                    name={isDownloaded ? 'checkmark-circle' : 'cloud-download-outline'}
                    size={20}
                    color={isDownloaded ? '#fff' : themeStyles.textSecondary}
                  />
                )}
              </TouchableOpacity>
            )}

            {showAddToPlaylist && (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={handleAddToPlaylist}
              >
                <Ionicons name="add-circle-outline" size={20} color={themeStyles.textSecondary} />
              </TouchableOpacity>
            )}
            
            {rightAccessory}
          </View>
        </View>

        {/* Playlist picker modal */}
        <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <View style={{ width: '100%', maxWidth: 420, borderRadius: 12, padding: 16, backgroundColor: Colors[colorScheme ?? 'light'].card }}>
              <Text style={{ fontFamily: 'Georgia', fontWeight: '700', fontSize: 16, color: themeStyles.text, marginBottom: 8 }}>Add to playlist</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {(playlists || []).filter((p: any) => !p.is_builtin).map((p: any) => (
                  <TouchableOpacity key={p.id} onPress={() => addToTarget(p.id, p.name)} style={{ paddingVertical: 10 }}>
                    <Text style={{ color: themeStyles.text, fontFamily: 'Georgia' }}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={() => setPickerVisible(false)} style={{ paddingVertical: 10, paddingHorizontal: 12 }}>
                  <Text style={{ color: themeStyles.textSecondary, fontFamily: 'Georgia' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {!hideDescription && episode.description && (
          <HtmlRenderer 
            htmlContent={episode.description} 
            maxLines={2}
            style={[styles.description, { color: themeStyles.textSecondary }]}
            minimal
          />
        )}

        <View style={styles.meta}>
          {episode.publishedAt && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={themeStyles.textSecondary} />
              <Text style={[styles.metaText, { color: themeStyles.textSecondary }]}>
                {formatDate(episode.publishedAt, hideDescription)}
              </Text>
            </View>
          )}
          {(() => {
            const dur = episode.duration;
            // if (__DEV__ && hideDescription) {
            //   console.log('[EpisodeListItem] duration check:', { 
            //     duration: dur, 
            //     type: typeof dur, 
            //     isNumber: typeof dur === 'number',
            //     isTruthy: !!dur 
            //   });
            // }
            return (dur !== undefined && dur !== null && dur > 0);
          })() && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={themeStyles.textSecondary} />
              <Text style={[styles.metaText, { color: themeStyles.textSecondary }]}>
                {formatDuration(episode.duration)}
              </Text>
            </View>
          )}
        </View>

        {hasProgress && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: themeStyles.primary,
                  }
                ]}
              />
            </View>
          </View>
        )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    padding: 16,
    marginVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    gap: 12,
  },
  artworkContainer: {
    marginRight: 10,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusBadgeInline: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
    lineHeight: 22,
    marginBottom: 4,
  },
  playingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 13,
    fontFamily: 'Georgia',
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  progressContainer: {
    paddingTop: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
