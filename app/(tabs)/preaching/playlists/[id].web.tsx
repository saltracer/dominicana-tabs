export { default } from './[id]';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { usePlaylists } from '../../../../hooks/usePlaylists';
import { usePodcastPlayer } from '../../../../contexts/PodcastPlayerContext';
import { PlaylistWithEpisodes, PodcastEpisode } from '../../../../types';
import { EpisodeListItem } from '../../../../components/EpisodeListItem';
import HtmlRenderer from '../../../../components/HtmlRenderer';
import Footer from '../../../../components/Footer.web';

export default function PlaylistDetailWebScreen() {
  const { colorScheme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { playlists, updatePlaylist, deletePlaylist, getPlaylistEpisodes, addEpisodeToPlaylist, removeEpisodeFromPlaylist, reorderPlaylistItems } = usePlaylists();
  const { playEpisode } = usePodcastPlayer();
  
  const [playlist, setPlaylist] = useState<PlaylistWithEpisodes | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (id) {
      loadPlaylist();
    }
  }, [id]);

  const loadPlaylist = async () => {
    try {
      setLoading(true);
      const playlistData = playlists.find(p => p.id === id);
      if (playlistData) {
        setPlaylist(playlistData as PlaylistWithEpisodes);
        const episodesData = await getPlaylistEpisodes(id);
        setEpisodes(episodesData);
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      Alert.alert('Error', 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlaylist();
    setRefreshing(false);
  };

  const handlePlayEpisode = async (episode: PodcastEpisode) => {
    try {
      await playEpisode(episode);
    } catch (error) {
      console.error('Error playing episode:', error);
      Alert.alert('Error', 'Failed to play episode');
    }
  };

  const handleRemoveEpisode = async (episode: PodcastEpisode) => {
    if (!playlist) return;

    Alert.alert(
      'Remove Episode',
      `Remove "${episode.title}" from playlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeEpisodeFromPlaylist(playlist.id, episode.id);
              await loadPlaylist();
            } catch (error) {
              console.error('Error removing episode:', error);
              Alert.alert('Error', 'Failed to remove episode');
            }
          },
        },
      ]
    );
  };

  const handleEditPlaylist = () => {
    if (!playlist) return;
    setEditName(playlist.name);
    setEditDescription(playlist.description || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!playlist || !editName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      await updatePlaylist(playlist.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      setShowEditModal(false);
      await loadPlaylist();
    } catch (error) {
      console.error('Error updating playlist:', error);
      Alert.alert('Error', 'Failed to update playlist');
    }
  };

  const handleDeletePlaylist = () => {
    if (!playlist) return;

    if (playlist.isSystem) {
      Alert.alert('Cannot Delete', 'System playlists cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Playlist',
      `Delete "${playlist.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlaylist(playlist.id);
              router.back();
            } catch (error) {
              console.error('Error deleting playlist:', error);
              Alert.alert('Error', 'Failed to delete playlist');
            }
          },
        },
      ]
    );
  };

  const renderEpisodeItem = ({ item: episode, index }: { item: PodcastEpisode; index: number }) => (
    <EpisodeListItem
      episode={episode}
      onPress={() => router.push(`/(tabs)/preaching/episode/${episode.id}`)}
      onPlay={() => handlePlayEpisode(episode)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
      <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
        No Episodes Yet
      </Text>
      <Text style={[styles.emptyDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        Add episodes to this playlist to see them here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!playlist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Playlist not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.playlistIcon}>
              <Ionicons 
                name={playlist.isSystem ? "cloud-download" : "list"} 
                size={32} 
                color={Colors[colorScheme ?? 'light'].primary} 
              />
            </View>
            <View style={styles.playlistDetails}>
              <Text style={[styles.playlistName, { color: Colors[colorScheme ?? 'light'].text }]}>
                {playlist.name}
              </Text>
              {playlist.description && (
                <HtmlRenderer
                  htmlContent={playlist.description}
                  maxLines={2}
                  style={[styles.playlistDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
                />
              )}
              <Text style={[styles.episodeCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {episodes.length} episode{episodes.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            {!playlist.isSystem && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
                  onPress={handleEditPlaylist}
                >
                  <Ionicons name="create" size={20} color={Colors[colorScheme ?? 'light'].text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
                  onPress={handleDeletePlaylist}
                >
                  <Ionicons name="trash" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Episodes List */}
        <FlatList
          data={episodes}
          keyExtractor={(item) => item.id}
          renderItem={renderEpisodeItem}
          style={styles.episodesList}
          contentContainerStyle={styles.episodesContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors[colorScheme ?? 'light'].text}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />

        <Footer />
      </View>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={[styles.modalCancel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Edit Playlist
            </Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={[styles.modalSave, { color: Colors[colorScheme ?? 'light'].primary }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Name
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: Colors[colorScheme ?? 'light'].surface,
                color: Colors[colorScheme ?? 'light'].text,
                borderColor: Colors[colorScheme ?? 'light'].border,
              }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Playlist name"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            />
            
            <Text style={[styles.inputLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Description (Optional)
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: Colors[colorScheme ?? 'light'].surface,
                color: Colors[colorScheme ?? 'light'].text,
                borderColor: Colors[colorScheme ?? 'light'].border,
              }]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Playlist description"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 24,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playlistDetails: {
    flex: 1,
  },
  playlistName: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  episodeCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  episodesList: {
    flex: 1,
  },
  episodesContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalCancel: {
    fontSize: 16,
    fontFamily: 'Georgia',
    cursor: 'pointer',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    cursor: 'pointer',
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Georgia',
    outlineStyle: 'none',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Georgia',
    height: 80,
    textAlignVertical: 'top',
    outlineStyle: 'none',
  },
});
