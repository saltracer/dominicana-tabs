import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { PodcastService } from '../../../../services/PodcastService';
import { PodcastEpisode, Podcast } from '../../../../types';
import { usePodcastPlayer } from '../../../../contexts/PodcastPlayerContext';
import HtmlRenderer from '../../../../components/HtmlRenderer';

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [sliderWidth, setSliderWidth] = useState(300);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [showSpeedModal, setShowSpeedModal] = useState(false);

  const {
    currentEpisode,
    isPlaying,
    isPaused,
    isLoading: playerLoading,
    position,
    duration,
    playEpisode,
    pause,
    resume,
    seek,
    setSpeed,
    progressPercentage,
  } = usePodcastPlayer();

  useEffect(() => {
    if (id) {
      loadEpisode();
    }
  }, [id]);

  // Set header title when episode is loaded
  useEffect(() => {
    if (episode) {
      navigation.setOptions({
        title: episode.title,
        headerBackTitle: '', // Ensure back button has no text
      });
    }
  }, [episode, navigation]);

  const loadEpisode = async () => {
    try {
      setLoading(true);
      const episodeData = await PodcastService.getEpisode(id!);
      setEpisode(episodeData);

      // Load podcast info
      const podcastData = await PodcastService.getPodcast(episodeData.podcastId);
      setPodcast(podcastData);
    } catch (error) {
      console.error('Error loading episode:', error);
      Alert.alert('Error', 'Failed to load episode');
      router.back();
    } finally {
      setLoading(false);
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
      >

        {/* Artwork */}
        <View style={styles.artworkContainer}>
          {episode.artworkUrl || podcast.artworkUrl ? (
            <Image
              source={{ uri: episode.artworkUrl || podcast.artworkUrl }}
              style={styles.artwork}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.artworkPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
              <Ionicons name="radio" size={80} color={Colors[colorScheme ?? 'light'].primary} />
            </View>
          )}
        </View>

        {/* Podcast Info */}
        <TouchableOpacity
          style={styles.podcastInfo}
          onPress={() => router.push(`/(tabs)/preaching/podcast/${podcast.id}`)}
        >
          <Text style={[styles.podcastTitle, { color: Colors[colorScheme ?? 'light'].primary }]}>
            {podcast.title}
          </Text>
          {podcast.author && (
            <Text style={[styles.podcastAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {podcast.author}
            </Text>
          )}
        </TouchableOpacity>

        {/* Episode Title */}
        <Text style={[styles.episodeTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          {episode.title}
        </Text>

        {/* Episode Meta */}
        <View style={styles.metaContainer}>
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
        </View>

        {/* Playback Controls */}
        <View style={styles.controlsContainer}>
          {/* Progress Bar with Controls */}
          <View style={styles.progressContainer}>
            {/* Play Button */}
            <TouchableOpacity
              style={[styles.playButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
              onPress={handlePlay}
              disabled={playerLoading}
            >
              {playerLoading && isCurrentEpisode ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons
                  name={isPlayingCurrent ? 'pause' : 'play'}
                  size={24}
                  color="#fff"
                />
              )}
            </TouchableOpacity>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatTime(isCurrentEpisode ? position : 0)}
              </Text>
              <View
                style={[styles.sliderTrack, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
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
                    styles.sliderFill,
                    {
                      width: `${isCurrentEpisode && duration > 0 ? (position / duration) * 100 : 0}%`,
                      backgroundColor: Colors[colorScheme ?? 'light'].primary,
                    }
                  ]}
                />
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left: `${isCurrentEpisode && duration > 0 ? (position / duration) * 100 : 0}%`,
                      backgroundColor: Colors[colorScheme ?? 'light'].primary,
                    }
                  ]}
                />
                </TouchableOpacity>
              </View>
              <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {formatTime(duration || episode.duration || 0)}
              </Text>
            </View>

            {/* Speed Control */}
            <TouchableOpacity
              onPress={() => setShowSpeedModal(true)}
              style={[styles.speedButton, { 
                backgroundColor: Colors[colorScheme ?? 'light'].surface,
                borderColor: Colors[colorScheme ?? 'light'].border 
              }]}
            >
              <Ionicons name="speedometer" size={20} color={Colors[colorScheme ?? 'light'].text} />
              <Text style={[styles.speedText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {selectedSpeed}x
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
          <View style={styles.descriptionContainer}>
            <HtmlRenderer 
              htmlContent={episode.description}
              style={[styles.description, { color: Colors[colorScheme ?? 'light'].text }]}
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
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
  },
  artworkPlaceholder: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  podcastAuthor: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  episodeTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  controlsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderTrack: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 7,
    height: 6,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    minWidth: 40,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButton: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  speedText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
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
    paddingHorizontal: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
  },
});
