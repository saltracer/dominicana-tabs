import React, { useState } from 'react';
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
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { usePlaylists } from '../../../hooks/usePlaylists';
import { Playlist } from '../../../types';
import { router } from 'expo-router';
import { useIsMobile, useIsTablet, useIsDesktop } from '../../../hooks/useMediaQuery';

export default function PlaylistsScreen() {
  const { colorScheme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  const { playlists, loading, error, createPlaylist, deletePlaylist } = usePlaylists();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Playlists will auto-refresh when the hook loads
    setRefreshing(false);
  };

  const handleCreatePlaylist = () => {
    Alert.prompt(
      'Create Playlist',
      'Enter a name for your playlist:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async (name) => {
            if (!name || name.trim() === '') {
              Alert.alert('Error', 'Please enter a playlist name');
              return;
            }
            try {
              await createPlaylist(name.trim());
            } catch (err) {
              console.error('Error creating playlist:', err);
              Alert.alert('Error', 'Failed to create playlist');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
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
            } catch (err) {
              console.error('Error deleting playlist:', err);
              Alert.alert('Error', 'Failed to delete playlist');
            }
          },
        },
      ]
    );
  };

  const handlePlaylistPress = (playlist: Playlist) => {
    router.push(`/(tabs)/preaching/playlists/${playlist.id}`);
  };

  const renderPlaylistItem = ({ item: playlist }: { item: Playlist }) => (
    <TouchableOpacity
      style={[styles.playlistItem, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
      onPress={() => handlePlaylistPress(playlist)}
      activeOpacity={0.7}
    >
      <View style={styles.playlistInfo}>
        <View style={styles.playlistIcon}>
          <Ionicons 
            name={playlist.isSystem ? "cloud-download" : "list"} 
            size={24} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />
        </View>
        
        <View style={styles.playlistDetails}>
          <Text style={[styles.playlistName, { color: Colors[colorScheme ?? 'light'].text }]}>
            {playlist.name}
          </Text>
          {playlist.description && (
            <Text style={[styles.playlistDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={2}>
              {playlist.description}
            </Text>
          )}
          <Text style={[styles.playlistMeta, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {playlist.isSystem ? 'System Playlist' : 'User Playlist'} • {new Date(playlist.updatedAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.playlistActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
            onPress={() => handlePlaylistPress(playlist)}
          >
            <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          
          {!playlist.isSystem && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
              onPress={() => handleDeletePlaylist(playlist)}
            >
              <Ionicons name="trash" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
      <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
        No Playlists Yet
      </Text>
      <Text style={[styles.emptyDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        Create your first playlist to organize your favorite episodes
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
        onPress={handleCreatePlaylist}
      >
        <Text style={styles.createButtonText}>Create Playlist</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && playlists.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={[styles.content, { maxWidth: isDesktop ? 1000 : '100%' }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Playlists
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={handleCreatePlaylist}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Playlists List */}
        {playlists.length > 0 ? (
          <FlatList
            data={playlists}
            keyExtractor={(item) => item.id}
            renderItem={renderPlaylistItem}
            style={styles.playlistsList}
            contentContainerStyle={styles.playlistsContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors[colorScheme ?? 'light'].text}
              />
            }
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  createButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  playlistsList: {
    flex: 1,
  },
  playlistsContent: {
    padding: 16,
  },
  playlistItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playlistIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  playlistDetails: {
    flex: 1,
    marginRight: 12,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  playlistActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    textAlign: 'center',
    fontFamily: 'Georgia',
    marginBottom: 24,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
});
