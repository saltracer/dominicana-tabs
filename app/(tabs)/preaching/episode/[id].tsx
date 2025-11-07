import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  FlatList,
  RefreshControl,
  InteractionManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import PlaylistService from '../../../../services/PlaylistService';
import { usePlaylists } from '../../../../hooks/usePlaylists';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { PodcastService } from '../../../../services/PodcastService';
import { PodcastEpisode, Podcast } from '../../../../types';
import { usePodcastPlayer } from '../../../../contexts/PodcastPlayerContext';
import HtmlRenderer from '../../../../components/HtmlRenderer';
import { refreshFeed, getFeed } from '../../../../lib/podcast/cache';
import { ensureImageCached, imagePathForUrl } from '../../../../lib/podcast/storage';
import { EpisodeMetadataCache } from '../../../../services/EpisodeMetadataCache';
import { PodcastPlaybackService } from '../../../../services/PodcastPlaybackService';

const SPEED_OPTIONS = [
  { value: 0.75, label: '0.75x - Slow' },
  { value: 1.0, label: '1.0x - Normal' },
  { value: 1.25, label: '1.25x - Slightly faster' },
  { value: 1.5, label: '1.5x - Fast' },
  { value: 2.0, label: '2.0x - Faster' },
  { value: 2.5, label: '2.5x - Very fast' },
  { value: 3.0, label: '3.0x - Fastest' },
];

export default function EpisodeDetailScreen() {
  const { colorScheme } = useTheme();
  const { id, podcastId: qPodcastId, guid: qGuid, audioUrl: qAudioUrl, podcastTitle: qPodcastTitle, podcastAuthor: qPodcastAuthor, podcastArt: qPodcastArt } = useLocalSearchParams<{ id: string; podcastId?: string; guid?: string; audioUrl?: string; podcastTitle?: string; podcastAuthor?: string; podcastArt?: string }>();
  const navigation = useNavigation();
  const { playlists } = usePlaylists();
  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [sliderWidth, setSliderWidth] = useState(300);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [artworkPath, setArtworkPath] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [playedStatus, setPlayedStatus] = useState<{ played: boolean; position: number } | null>(null);
  const mountStartRef = useRef<number>(Date.now());
  const didLogLayoutRef = useRef<boolean>(false);
  // Simple in-memory memo for podcast headers by podcastId
  const podcastHeaderMemoRef = useRef<Map<string, Podcast>>(new Map());

  // Memoize style objects for HtmlRenderer to prevent re-renders
  const titleStyle = useMemo(() => [
    styles.episodeTitle,
    { color: Colors[colorScheme ?? 'light'].text }
  ], [colorScheme]);

  const descriptionStyle = useMemo(() => [
    styles.description, 
    { color: Colors[colorScheme ?? 'light'].text }
  ], [colorScheme]);

  const podcastBadgeStyle = useMemo(() => [
    styles.podcastBadge,
    { 
      backgroundColor: Colors[colorScheme ?? 'light'].surface,
      borderColor: Colors[colorScheme ?? 'light'].border 
    }
  ], [colorScheme]);

  const {
    currentEpisode,
    isPlaying,
    isPaused,
    isLoading: playerLoading,
    position,
    duration,
    playbackSpeed,
    playEpisode,
    pause,
    resume,
    seek,
    setSpeed,
    progressPercentage,
  } = usePodcastPlayer();

  // Sync local speed state with player speed
  useEffect(() => {
    if (currentEpisode?.id === episode?.id && playbackSpeed) {
      setSelectedSpeed(playbackSpeed);
    }
  }, [playbackSpeed, currentEpisode?.id, episode?.id]);

  useEffect(() => {
    if (id) {
      console.log('[EpisodeDetail] mount id=', id, { qPodcastId, qGuid, qAudioUrl });
      loadEpisode();
    }
  }, [id]);

  // Fetch played status from cache or service
  useEffect(() => {
    if (!episode) return;
    
    let cancelled = false;
    
    const fetchPlayedStatus = async () => {
      // Try cache first
      const cached = EpisodeMetadataCache.get(episode.id);
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
        const progressData = await PodcastPlaybackService.getProgress(episode.id);
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
    const unsubscribe = EpisodeMetadataCache.subscribe((episodeId, metadata) => {
      if (episodeId === episode.id && metadata && !cancelled) {
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
  }, [episode?.id]);

  useEffect(() => {
    const startedAt = mountStartRef.current;
    const task = InteractionManager.runAfterInteractions(() => {
      console.log('[EpisodeDetail] afterInteractions elapsed=', Date.now() - startedAt, 'ms');
    });
    return () => {
      if ((task as any)?.cancel) (task as any).cancel();
    };
  }, []);

  // Set header title when episode is loaded
  useEffect(() => {
    if (episode) {
      navigation.setOptions({
        title: episode.title,
        headerBackTitle: '',
        headerRight: () => (
          <TouchableOpacity
            onPress={async () => {
              try {
                const userPlaylists = (playlists || []).filter((p: any) => !p.is_builtin);
                if (userPlaylists.length === 0 || !episode) {
                  Alert.alert('No playlists', 'Create a playlist first in the Playlists tab.');
                  return;
                }
                const target = userPlaylists[0];
                const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(episode.id);
                if (isUuid) {
                  await PlaylistService.addItem(target.id, { episode_id: episode.id });
                } else {
                  await PlaylistService.addItem(target.id, { external_ref: { podcastId: episode.podcastId, guid: episode.guid, audioUrl: episode.audioUrl } as any });
                }
                Alert.alert('Added', `Added to ${target.name}`);
              } catch (e) {
                Alert.alert('Error', 'Failed to add to playlist');
              }
            }}
            style={{ paddingHorizontal: 12 }}
          >
            <Ionicons name="add-circle-outline" size={22} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
        ),
      });
    }
  }, [episode, navigation, playlists, colorScheme]);

  const loadEpisode = async () => {
    try {
      setLoading(true);
      const start = Date.now();
      console.log('[EpisodeDetail] loadEpisode:start');
      const isUuid = /^[0-9a-fA-F-]{36}$/.test(id!);
      const hasCacheContext = !!qPodcastId && (!!qGuid || !!qAudioUrl);
      
      // If we have a UUID in the route, try database first to preserve UUID
      if (isUuid && !hasCacheContext) {
        const t0 = Date.now();
        try {
          const episodeData = await PodcastService.getEpisode(id!);
          console.log('[EpisodeDetail] getEpisode (DB) elapsed=', Date.now() - t0, 'ms');
          setEpisode(episodeData);
          const feed = await getFeed(episodeData.podcastId);
          if (feed) {
            const p: Podcast = {
              id: episodeData.podcastId,
              title: feed.summary.title,
              description: feed.summary.description || '',
              author: feed.summary.author || '',
              rssUrl: feed.uri,
              artworkUrl: feed.summary.artworkUrl,
              websiteUrl: feed.summary.websiteUrl,
              language: feed.summary.language || 'en',
              categories: feed.summary.categories || [],
              isCurated: false,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastFetchedAt: new Date(feed.fetchedAt).toISOString(),
            } as any;
            podcastHeaderMemoRef.current.set(episodeData.podcastId, p);
            setPodcast(p);
          } else {
            const t1 = Date.now();
            const podcastData = await PodcastService.getPodcast(episodeData.podcastId);
            console.log('[EpisodeDetail] getPodcast elapsed=', Date.now() - t1, 'ms');
            podcastHeaderMemoRef.current.set(episodeData.podcastId, podcastData);
            setPodcast(podcastData);
          }
        } catch (e) {
          console.warn('[EpisodeDetail] DB fetch failed', e);
        }
      } else if (hasCacheContext) {
        // Try database first if we have a UUID
        if (isUuid) {
          try {
            const episodeData = await PodcastService.getEpisode(id!);
            setEpisode(episodeData);
            const podcastData = await PodcastService.getPodcast(episodeData.podcastId);
            setPodcast(podcastData);
            const t0 = Date.now();
            const { refreshFeed } = await import('../../../../lib/podcast/cache');
            await refreshFeed(episodeData.podcastId, podcastData.rssUrl);
            console.log('[EpisodeDetail] refreshFeed elapsed=', Date.now() - t0, 'ms');
          } catch (dbErr) {
            console.warn('[EpisodeDetail] DB fetch failed, falling back to cache');
            // Fall through to cache logic below
          }
        }
        
        // Fallback to cache if database didn't work or no UUID
        if (!episode) {
          const { getEpisodesMap } = await import('../../../../lib/podcast/cache');
          const tMap = Date.now();
          const map = await getEpisodesMap(qPodcastId!);
          console.log('[EpisodeDetail] getEpisodesMap (cache-first) elapsed=', Date.now() - tMap, 'ms', 'count=', Object.keys(map).length);
          const ep = Object.values(map).find(e => (qGuid && e.guid === qGuid) || (qAudioUrl && e.audioUrl === qAudioUrl) || e.guid === id || e.audioUrl === id);
          if (ep) {
            // Use the UUID from route params if available, otherwise use GUID
            const cacheEpisode: PodcastEpisode = {
              id: isUuid ? id! : ep.id,
              podcastId: qPodcastId!,
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
            setEpisode(cacheEpisode);
          const feed = await getFeed(qPodcastId!);
          if (feed) {
            const p: Podcast = {
              id: qPodcastId!,
              title: qPodcastTitle || feed.summary.title,
              description: feed.summary.description || '',
              author: qPodcastAuthor || feed.summary.author || '',
              rssUrl: feed.uri,
              artworkUrl: qPodcastArt || feed.summary.artworkUrl,
              websiteUrl: feed.summary.websiteUrl,
              language: feed.summary.language || 'en',
              categories: feed.summary.categories || [],
              isCurated: false,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastFetchedAt: new Date(feed.fetchedAt).toISOString(),
            } as any;
            podcastHeaderMemoRef.current.set(qPodcastId!, p);
            setPodcast(p);
          }
          // If cache didn't find it and we have a UUID, try DB as fallback
          if (!episode && isUuid) {
            const t0 = Date.now();
            try {
              const episodeData = await PodcastService.getEpisode(id!);
              console.log('[EpisodeDetail] getEpisode (DB after cache miss) elapsed=', Date.now() - t0, 'ms');
              setEpisode(episodeData);
              const feed = await getFeed(episodeData.podcastId);
              if (feed) {
                const p: Podcast = {
                  id: episodeData.podcastId,
                  title: feed.summary.title,
                  description: feed.summary.description || '',
                  author: feed.summary.author || '',
                  rssUrl: feed.uri,
                  artworkUrl: feed.summary.artworkUrl,
                  websiteUrl: feed.summary.websiteUrl,
                  language: feed.summary.language || 'en',
                  categories: feed.summary.categories || [],
                  isCurated: false,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  lastFetchedAt: new Date(feed.fetchedAt).toISOString(),
                } as any;
                podcastHeaderMemoRef.current.set(episodeData.podcastId, p);
                setPodcast(p);
              } else {
                const t1 = Date.now();
                const podcastData = await PodcastService.getPodcast(episodeData.podcastId);
                console.log('[EpisodeDetail] getPodcast elapsed=', Date.now() - t1, 'ms');
                podcastHeaderMemoRef.current.set(episodeData.podcastId, podcastData);
                setPodcast(podcastData);
              }
            } catch (e) {
              console.warn('[EpisodeDetail] DB fetch after cache miss failed', e);
            }
          }
        }
      } else {
        // Fallback to cache resolution when id is not a UUID
        if (!qPodcastId) throw new Error('Missing podcastId for cache episode');
        const { getEpisodesMap } = await import('../../../../lib/podcast/cache');
        const tMap = Date.now();
        const map = await getEpisodesMap(qPodcastId);
        console.log('[EpisodeDetail] getEpisodesMap (cache) elapsed=', Date.now() - tMap, 'ms', 'count=', Object.keys(map).length);
        const ep = Object.values(map).find(e => (qGuid && e.guid === qGuid) || (qAudioUrl && e.audioUrl === qAudioUrl) || e.guid === id || e.audioUrl === id);
        if (!ep) throw new Error('Episode not found in cache');
        const cacheEpisode: PodcastEpisode = {
          id: ep.id,
            podcastId: qPodcastId,
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
          setEpisode(cacheEpisode);
          const feed = await getFeed(qPodcastId);
          if (feed) {
            const p: Podcast = {
              id: qPodcastId,
              title: feed.summary.title,
              description: feed.summary.description || '',
              author: feed.summary.author || '',
              rssUrl: feed.uri,
              artworkUrl: feed.summary.artworkUrl,
              websiteUrl: feed.summary.websiteUrl,
              language: feed.summary.language || 'en',
              categories: feed.summary.categories || [],
              isCurated: false,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastFetchedAt: new Date(feed.fetchedAt).toISOString(),
            } as any;
            setPodcast(p);
          }
        }
      }

      // Refresh RSS feed if stale (1h policy)
      const parentRss = (podcast?.rssUrl) || (qPodcastId ? (await PodcastService.getPodcast(qPodcastId)).rssUrl : undefined);
      if (parentRss) {
        try {
          const tR = Date.now();
          await refreshFeed((podcast?.id) || qPodcastId!, parentRss);
          console.log('[EpisodeDetail] refreshFeed elapsed=', Date.now() - tR, 'ms');
        } catch (e) {
          console.warn('[EpisodeDetail] Feed refresh skipped:', e);
        }
      }

      // Ensure artwork is cached locally
      const artUrl = (episode ? episode.artworkUrl : undefined) || podcast?.artworkUrl;
      if (artUrl) {
        try {
          const tA = Date.now();
          const { path } = await ensureImageCached(artUrl);
          console.log('[EpisodeDetail] ensureImageCached elapsed=', Date.now() - tA, 'ms');
          setArtworkPath(path);
        } catch (e) {
          console.warn('[EpisodeDetail] Image cache skipped:', e);
          setArtworkPath(null);
        }
      } else {
        setArtworkPath(null);
      }
      console.log('[EpisodeDetail] loadEpisode:done elapsed=', Date.now() - start, 'ms');
    } catch (error) {
      console.error('Error loading episode:', error);
      Alert.alert('Error', 'Failed to load episode');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!episode || !podcast) return;
    setRefreshing(true);
    try {
      await refreshFeed(podcast.id, podcast.rssUrl, { force: true });
      // Reload episode and podcast info after refresh
      await loadEpisode();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePlay = async () => {
    console.log('[EpisodeDetail] handlePlay called with episode:', episode?.title);
    if (!episode) return;
    
    if (currentEpisode?.id === episode.id) {
      if (isPlaying) {
        console.log('[EpisodeDetail] Pausing current episode');
        pause();
      } else if (isPaused) {
        console.log('[EpisodeDetail] Resuming paused episode');
        resume();
      } else {
        console.log('[EpisodeDetail] Playing current episode');
        await playEpisode(episode);
      }
    } else {
      console.log('[EpisodeDetail] Playing new episode:', episode.title);
      await playEpisode(episode);
    }
  };

  const handleSeek = (value: number) => {
    seek(value);
  };

  const handleSpeedChange = (speed: number) => {
    setSelectedSpeed(speed);
    setSpeed(speed);
    setShowSpeedModal(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading episode...
          </Text>
        </View>
      </View>
    );
  }

  if (!episode || !podcast) return null;

  const isCurrentEpisode = currentEpisode?.id === episode.id;
  const isPlayingCurrent = isCurrentEpisode && isPlaying;

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View style={[styles.headerSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          {/* Artwork */}
          <View style={styles.artworkContainer}>
            {artworkPath || episode.artworkUrl || podcast.artworkUrl ? (
              <Image
                source={{ uri: artworkPath || episode.artworkUrl || podcast.artworkUrl }}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.artworkPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="radio" size={80} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
            )}
          </View>

          {/* Podcast Badge */}
          <TouchableOpacity
            style={podcastBadgeStyle}
            onPress={() => router.push(`/(tabs)/preaching/podcast/${podcast.id}`)}
          >
            <Text style={[styles.podcastBadgeText, { color: Colors[colorScheme ?? 'light'].text }]}>
              {podcast.title}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
          </TouchableOpacity>

          {/* Episode Title */}
          <HtmlRenderer 
            htmlContent={episode.title}
            maxLines={3}
            style={titleStyle}
          />

          {/* Episode Meta */}
          <View style={styles.metaContainer}>
            {playedStatus?.played && (
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                <Text style={[styles.metaText, { color: '#4caf50' }]}>
                  Played
                </Text>
              </View>
            )}
            {episode.publishedAt && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
                <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {new Date(episode.publishedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
            {episode.duration && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
                <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {Math.floor(episode.duration / 60)} minutes
                </Text>
              </View>
            )}
            {playedStatus && !playedStatus.played && playedStatus.position > 0 && episode.duration && episode.duration > 0 && (
              <View style={styles.metaItem}>
                <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {(() => {
                    const remaining = Math.max(0, episode.duration - playedStatus.position);
                    const hours = Math.floor(remaining / 3600);
                    const minutes = Math.floor((remaining % 3600) / 60);
                    const secs = Math.floor(remaining % 60);
                    if (hours > 0) {
                      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} remaining`;
                    }
                    return `${minutes}:${secs.toString().padStart(2, '0')} remaining`;
                  })()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Playback Controls */}
        <View style={[styles.playbackSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          {/* Main Play Button */}
          <View style={styles.playButtonContainer}>
            <TouchableOpacity
              style={[styles.mainPlayButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
              onPress={handlePlay}
              disabled={playerLoading}
            >
              {playerLoading && isCurrentEpisode ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Ionicons
                  name={isPlayingCurrent ? 'pause' : 'play'}
                  size={32}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            {/* Time Display */}
            <View style={styles.timeRow}>
              <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatTime(isCurrentEpisode ? position : 0)}
              </Text>
              <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatTime(duration || episode.duration || 0)}
              </Text>
            </View>

            {/* Progress Bar */}
            <View
              style={[styles.progressBar, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}
              onLayout={(e) => {
                setSliderWidth(e.nativeEvent.layout.width);
              }}
            >
              <TouchableOpacity
                style={{ flex: 1 }}
                onPressIn={(e) => {
                  if (!isCurrentEpisode || !duration) return;
                  const touchX = e.nativeEvent.locationX;
                  const percentage = touchX / sliderWidth;
                  const seekPosition = percentage * duration;
                  handleSeek(Math.max(0, Math.min(seekPosition, duration)));
                }}
                disabled={!isCurrentEpisode}
                activeOpacity={1}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${isCurrentEpisode && duration > 0 ? (position / duration) * 100 : 0}%`,
                      backgroundColor: Colors[colorScheme ?? 'light'].primary,
                    }
                  ]}
                />
                <View
                  style={[
                    styles.progressThumb,
                    {
                      left: `${isCurrentEpisode && duration > 0 ? (position / duration) * 100 : 0}%`,
                      backgroundColor: Colors[colorScheme ?? 'light'].primary,
                    }
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Secondary Controls */}
          <View style={[styles.secondaryControls, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
            <TouchableOpacity
              onPress={() => setShowSpeedModal(true)}
              style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
            >
              <Ionicons name="speedometer" size={20} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.controlButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {selectedSpeed}x
              </Text>
            </TouchableOpacity>
            
            {/* Placeholder for future controls */}
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].background, opacity: 0.5 }]} disabled>
              <Ionicons name="add-circle-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.controlButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Queue
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].background, opacity: 0.5 }]} disabled>
              <Ionicons name="ellipsis-horizontal" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.controlButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                More
              </Text>
            </TouchableOpacity>
          </View>

          {/* Speed Selection Modal */}
          <Modal
            visible={showSpeedModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSpeedModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowSpeedModal(false)}
            >
              <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                <View style={[styles.modalHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
                  <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Playback Speed</Text>
                  <TouchableOpacity onPress={() => setShowSpeedModal(false)}>
                    <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={SPEED_OPTIONS}
                  keyExtractor={(item) => item.value.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.speedOption,
                        item.value === selectedSpeed && { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }
                      ]}
                      onPress={() => handleSpeedChange(item.value)}
                    >
                      <Text style={[
                        styles.speedOptionText, 
                        { color: item.value === selectedSpeed ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].text }
                      ]}>
                        {item.label}
                      </Text>
                      {item.value === selectedSpeed && (
                        <Ionicons name="checkmark" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Description */}
        {episode.description && (
          <View style={[styles.descriptionContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.descriptionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              About this episode
            </Text>
            <HtmlRenderer 
              htmlContent={episode.description}
              style={descriptionStyle}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  artworkPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  podcastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
    alignSelf: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  podcastBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  episodeTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  playbackSection: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  playButtonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  progressSection: {
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: -6,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timeText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    marginTop: 8,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
    borderRadius: 12,
    minWidth: 80,
  },
  controlButtonText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  speedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  speedOptionText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  descriptionContainer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderRadius: 20,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    fontFamily: 'Georgia',
    lineHeight: 24,
  },
});

