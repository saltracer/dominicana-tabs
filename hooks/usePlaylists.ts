import { useState, useEffect, useCallback } from 'react';
import { Playlist, PlaylistWithEpisodes, PlaylistFilters, PodcastEpisode } from '../types/podcast-types';
import { PodcastPlaylistService } from '../services/PodcastPlaylistService';

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PodcastPlaylistService.getUserPlaylists();
      setPlaylists(data);
    } catch (err) {
      console.error('Error loading playlists:', err);
      setError(err instanceof Error ? err.message : 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlaylist = useCallback(async (name: string, description?: string) => {
    try {
      const newPlaylist = await PodcastPlaylistService.createPlaylist(name, description);
      setPlaylists(prev => [...prev, newPlaylist]);
      return newPlaylist;
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to create playlist');
      throw err;
    }
  }, []);

  const updatePlaylist = useCallback(async (playlistId: string, updates: Partial<Playlist>) => {
    try {
      await PodcastPlaylistService.updatePlaylist(playlistId, updates);
      setPlaylists(prev => 
        prev.map(playlist => 
          playlist.id === playlistId 
            ? { ...playlist, ...updates }
            : playlist
        )
      );
    } catch (err) {
      console.error('Error updating playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to update playlist');
      throw err;
    }
  }, []);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    try {
      await PodcastPlaylistService.deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
    } catch (err) {
      console.error('Error deleting playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete playlist');
      throw err;
    }
  }, []);

  const addEpisodeToPlaylist = useCallback(async (playlistId: string, episodeId: string) => {
    try {
      await PodcastPlaylistService.addEpisodeToPlaylist(playlistId, episodeId);
      // Optionally refresh playlists to update episode counts
      await loadPlaylists();
    } catch (err) {
      console.error('Error adding episode to playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to add episode to playlist');
      throw err;
    }
  }, [loadPlaylists]);

  const removeEpisodeFromPlaylist = useCallback(async (playlistId: string, episodeId: string) => {
    try {
      await PodcastPlaylistService.removeEpisodeFromPlaylist(playlistId, episodeId);
      // Optionally refresh playlists to update episode counts
      await loadPlaylists();
    } catch (err) {
      console.error('Error removing episode from playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove episode from playlist');
      throw err;
    }
  }, [loadPlaylists]);

  const reorderPlaylistItems = useCallback(async (playlistId: string, itemIds: string[]) => {
    try {
      await PodcastPlaylistService.reorderPlaylistItems(playlistId, itemIds);
    } catch (err) {
      console.error('Error reordering playlist items:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder playlist items');
      throw err;
    }
  }, []);

  const getPlaylistEpisodes = useCallback(async (playlistId: string, filters?: PlaylistFilters): Promise<PodcastEpisode[]> => {
    try {
      return await PodcastPlaylistService.getPlaylistEpisodes(playlistId, filters);
    } catch (err) {
      console.error('Error getting playlist episodes:', err);
      setError(err instanceof Error ? err.message : 'Failed to get playlist episodes');
      throw err;
    }
  }, []);

  const getOrCreateDownloadedPlaylist = useCallback(async () => {
    try {
      return await PodcastPlaylistService.getOrCreateDownloadedPlaylist();
    } catch (err) {
      console.error('Error getting downloaded playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to get downloaded playlist');
      throw err;
    }
  }, []);

  const syncDownloadedPlaylist = useCallback(async () => {
    try {
      await PodcastPlaylistService.syncDownloadedPlaylist();
      await loadPlaylists();
    } catch (err) {
      console.error('Error syncing downloaded playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync downloaded playlist');
      throw err;
    }
  }, [loadPlaylists]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  return {
    playlists,
    loading,
    error,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addEpisodeToPlaylist,
    removeEpisodeFromPlaylist,
    reorderPlaylistItems,
    getPlaylistEpisodes,
    getOrCreateDownloadedPlaylist,
    syncDownloadedPlaylist,
    refetch: loadPlaylists,
  };
}
