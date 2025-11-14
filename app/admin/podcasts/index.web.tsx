import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminPodcastService } from '../../../services/AdminPodcastService';
import { Podcast, PodcastFilters } from '../../../types';

export default function PodcastsListWebScreen() {
  const { colorScheme } = useTheme();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'curated' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'last_fetched'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [selectedPodcastIds, setSelectedPodcastIds] = useState<Set<string>>(new Set());
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      const filters: PodcastFilters = {};
      
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter === 'curated') filters.isCurated = true;
      if (statusFilter === 'active') filters.isActive = true;
      if (statusFilter === 'inactive') filters.isActive = false;
      filters.sortBy = sortBy;
      filters.sortOrder = sortOrder;

      const result = await AdminPodcastService.listPodcasts(filters, { page: 1, limit: 100 });
      setPodcasts(result.podcasts);
    } catch (error) {
      console.error('Error loading podcasts:', error);
      window.alert('Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPodcasts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, sortBy, sortOrder]);

  const handleSort = (column: 'title' | 'created_at' | 'last_fetched') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'created_at' || column === 'last_fetched' ? 'desc' : 'asc');
    }
  };

  const handleDeletePodcast = async (podcast: Podcast) => {
    if (!window.confirm(`Are you sure you want to delete "${podcast.title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await AdminPodcastService.deletePodcast(podcast.id);
      window.alert('Podcast deleted successfully');
      loadPodcasts();
    } catch (error) {
      window.alert('Failed to delete podcast');
    }
  };

  const handleRefreshEpisodes = async (podcast: Podcast) => {
    if (!window.confirm(`Fetch latest episodes from "${podcast.title}"? This will check for new episodes and update existing ones.`)) {
      return;
    }
    
    try {
      await AdminPodcastService.refreshEpisodes(podcast.id);
      window.alert('Episodes refreshed successfully');
      loadPodcasts();
    } catch (error) {
      window.alert('Failed to refresh episodes');
    }
  };

  const handleForceReparse = async (podcast: Podcast) => {
    if (!window.confirm(`This will force a complete re-fetch and re-parse of the RSS feed for "${podcast.title}", updating all episode metadata including durations. Continue?`)) {
      return;
    }
    
    try {
      await AdminPodcastService.refreshEpisodes(podcast.id);
      window.alert('RSS feed reparsed successfully. All episode data has been updated.');
      loadPodcasts();
    } catch (error) {
      console.error('Force reparse error:', error);
      window.alert('Failed to reparse RSS feed');
    }
  };

  const handleRefreshAll = async () => {
    const activePodcastCount = podcasts.filter(p => p.isActive).length;
    
    if (!window.confirm(`Fetch latest episodes from all ${activePodcastCount} active podcasts? This may take a few minutes.`)) {
      return;
    }

    try {
      setRefreshingAll(true);
      
      const stats = await AdminPodcastService.refreshAllEpisodes({ onlyActive: true });
      
      let message = `✅ Successfully refreshed ${stats.succeeded} of ${stats.total} podcasts.`;
      if (stats.failed > 0) {
        message += `\n\n⚠️ ${stats.failed} failed:\n`;
        message += stats.errors.slice(0, 5).map(e => `• ${e.podcastTitle}: ${e.error}`).join('\n');
        if (stats.errors.length > 5) {
          message += `\n...and ${stats.errors.length - 5} more`;
        }
      }
      
      window.alert(message);
      loadPodcasts();
    } catch (error) {
      console.error('Refresh all error:', error);
      window.alert('Failed to refresh podcasts. Please try again.');
    } finally {
      setRefreshingAll(false);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedPodcastIds.size === podcasts.length) {
      setSelectedPodcastIds(new Set());
    } else {
      setSelectedPodcastIds(new Set(podcasts.map(p => p.id)));
    }
  };

  const handleSelectPodcast = (podcastId: string) => {
    const newSelection = new Set(selectedPodcastIds);
    if (newSelection.has(podcastId)) {
      newSelection.delete(podcastId);
    } else {
      newSelection.add(podcastId);
    }
    setSelectedPodcastIds(newSelection);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedPodcastIds.size} selected podcast(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setBulkActionInProgress(true);
      let succeeded = 0;
      let failed = 0;

      for (const id of selectedPodcastIds) {
        try {
          await AdminPodcastService.deletePodcast(id);
          succeeded++;
        } catch (error) {
          failed++;
        }
      }

      window.alert(`Deleted ${succeeded} podcast(s)${failed > 0 ? `, ${failed} failed` : ''}`);
      setSelectedPodcastIds(new Set());
      loadPodcasts();
    } catch (error) {
      window.alert('Failed to delete podcasts');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkActivate = async () => {
    if (!window.confirm(`Activate ${selectedPodcastIds.size} selected podcast(s)?`)) {
      return;
    }

    try {
      setBulkActionInProgress(true);
      let succeeded = 0;
      let failed = 0;

      for (const id of selectedPodcastIds) {
        try {
          await AdminPodcastService.updatePodcast(id, { isActive: true });
          succeeded++;
        } catch (error) {
          failed++;
        }
      }

      window.alert(`Activated ${succeeded} podcast(s)${failed > 0 ? `, ${failed} failed` : ''}`);
      setSelectedPodcastIds(new Set());
      loadPodcasts();
    } catch (error) {
      window.alert('Failed to activate podcasts');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (!window.confirm(`Deactivate ${selectedPodcastIds.size} selected podcast(s)?`)) {
      return;
    }

    try {
      setBulkActionInProgress(true);
      let succeeded = 0;
      let failed = 0;

      for (const id of selectedPodcastIds) {
        try {
          await AdminPodcastService.updatePodcast(id, { isActive: false });
          succeeded++;
        } catch (error) {
          failed++;
        }
      }

      window.alert(`Deactivated ${succeeded} podcast(s)${failed > 0 ? `, ${failed} failed` : ''}`);
      setSelectedPodcastIds(new Set());
      loadPodcasts();
    } catch (error) {
      window.alert('Failed to deactivate podcasts');
    } finally {
      setBulkActionInProgress(false);
    }
  };

  const handlePromoteToCurated = async (podcast: Podcast) => {
    const subCount = podcast.subscriptionCount || 0;
    const message = `Promote "${podcast.title}" to curated status?\n\nThis will make it visible to all users in the curated library.${subCount > 0 ? `\n\nCurrently ${subCount} user(s) are subscribed.` : ''}`;
    
    if (!window.confirm(message)) {
      return;
    }
    
    try {
      await AdminPodcastService.promoteToCurated(podcast.id);
      window.alert(`Successfully promoted "${podcast.title}" to curated status!`);
      loadPodcasts();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to promote podcast';
      window.alert(errorMsg);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <View>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Manage Podcasts
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {podcasts.length} {podcasts.length === 1 ? 'podcast' : 'podcasts'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.refreshAllButton, { backgroundColor: '#3b82f6', opacity: refreshingAll || podcasts.length === 0 ? 0.5 : 1 }]}
            onPress={handleRefreshAll}
            disabled={refreshingAll || podcasts.length === 0}
          >
            {refreshingAll ? (
              <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            ) : (
              <Ionicons name="refresh" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            )}
            <Text style={[styles.addButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Refresh All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={() => router.push('/admin/podcasts/new')}
          >
            <Ionicons name="add" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            <Text style={[styles.addButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Add Podcast
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.filters, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Search podcasts..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter */}
        <View style={styles.filterRow}>
          {(['all', 'curated', 'active', 'inactive'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                statusFilter === status && {
                  backgroundColor: Colors[colorScheme ?? 'light'].primary,
                },
                statusFilter !== status && {
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                },
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      statusFilter === status
                        ? Colors[colorScheme ?? 'light'].dominicanWhite
                        : Colors[colorScheme ?? 'light'].text,
                  },
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          horizontal={true}
          showsHorizontalScrollIndicator={true}
        >
          {/* Podcasts Table */}
          <View style={[styles.tableContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <View style={[styles.tableHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
              <View style={styles.checkboxCell}>
                <TouchableOpacity onPress={handleSelectAll}>
                  <Ionicons 
                    name={selectedPodcastIds.size === podcasts.length && podcasts.length > 0 ? 'checkbox' : 'square-outline'} 
                    size={20} 
                    color={Colors[colorScheme ?? 'light'].primary} 
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.tableHeaderCell, { width: 300 }]}
                onPress={() => handleSort('title')}
              >
                <Text style={[styles.tableHeaderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Podcast
                </Text>
                {sortBy === 'title' && (
                  <Ionicons
                    name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors[colorScheme ?? 'light'].textSecondary}
                  />
                )}
              </TouchableOpacity>
              <View style={[styles.tableHeaderCell, { width: 120 }]}>
                <Text style={[styles.tableHeaderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Author
                </Text>
              </View>
              <View style={[styles.tableHeaderCell, { width: 80 }]}>
                <Text style={[styles.tableHeaderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Episodes
                </Text>
              </View>
              <View style={[styles.tableHeaderCell, { width: 80 }]}>
                <Text style={[styles.tableHeaderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Subs
                </Text>
              </View>
              <View style={[styles.tableHeaderCell, { width: 120 }]}>
                <Text style={[styles.tableHeaderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Last Fetched
                </Text>
              </View>
              <View style={[styles.tableHeaderCell, { width: 180 }]}>
                <Text style={[styles.tableHeaderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Status
                </Text>
              </View>
              <View style={[styles.tableHeaderCell, { width: 240 }]}>
                <Text style={[styles.tableHeaderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Actions
                </Text>
              </View>
            </View>

            {podcasts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="radio-outline" size={48} color={Colors[colorScheme ?? 'light'].textSecondary} />
                <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  No podcasts found
                </Text>
              </View>
            ) : (
              podcasts.map((podcast) => (
                <View 
                  key={podcast.id} 
                  style={[
                    styles.tableRow, 
                    { 
                      borderBottomColor: Colors[colorScheme ?? 'light'].border,
                      backgroundColor: podcast.isCurated 
                        ? (colorScheme === 'dark' ? 'rgba(139, 92, 59, 0.1)' : 'rgba(139, 92, 59, 0.05)')
                        : 'transparent'
                    }
                  ]}
                >
                  <View style={styles.checkboxCell}>
                    <TouchableOpacity onPress={() => handleSelectPodcast(podcast.id)}>
                      <Ionicons 
                        name={selectedPodcastIds.has(podcast.id) ? 'checkbox' : 'square-outline'} 
                        size={20} 
                        color={Colors[colorScheme ?? 'light'].primary} 
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.podcastInfo}>
                    {podcast.artworkUrl ? (
                      <Image
                        source={{ uri: podcast.artworkUrl }}
                        style={styles.podcastArtwork}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.podcastArtworkPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                        <Ionicons name="radio" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                      </View>
                    )}
                    <View style={styles.podcastDetails}>
                      <Text style={[styles.podcastTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {podcast.title}
                      </Text>
                      {podcast.categories && podcast.categories.length > 0 && (
                        <View style={styles.categories}>
                          {podcast.categories.slice(0, 2).map((cat) => (
                            <View
                              key={cat}
                              style={[styles.categoryTag, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}
                            >
                              <Text style={[styles.categoryText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                                {cat}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 120 }]}>
                    <Text style={[styles.tableCellText, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={1}>
                      {podcast.author || '—'}
                    </Text>
                  </View>
                  <View style={[styles.tableCellCompact, { width: 80 }]}>
                    <Text style={[styles.tableCellText, { color: Colors[colorScheme ?? 'light'].text, textAlign: 'center' }]}>
                      {podcast.episodeCount || 0}
                    </Text>
                  </View>
                  <View style={[styles.tableCellCompact, { width: 80 }]}>
                    <Text style={[styles.tableCellText, { color: Colors[colorScheme ?? 'light'].text, textAlign: 'center' }]}>
                      {podcast.subscriptionCount || 0}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { width: 120 }]}>
                    <Text style={[styles.tableCellText, { color: Colors[colorScheme ?? 'light'].textSecondary, fontSize: 12 }]}>
                      {podcast.lastFetchedAt ? new Date(podcast.lastFetchedAt).toLocaleDateString() : 'Never'}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, { width: 180 }]}>
                    <View style={styles.badges}>
                      {podcast.isCurated && (
                        <View style={[styles.badge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                          <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                            Curated
                          </Text>
                        </View>
                      )}
                      {!podcast.isCurated && (
                        <View style={[styles.badge, { backgroundColor: '#3b82f6' }]}>
                          <Text style={[styles.badgeText, { color: '#fff' }]}>
                            User-Added
                          </Text>
                        </View>
                      )}
                      {!podcast.isActive && (
                        <View style={[styles.badge, { backgroundColor: '#999' }]}>
                          <Text style={[styles.badgeText, { color: '#fff' }]}>
                            Inactive
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={[styles.tableCell, { width: 240 }]}>
                    <View style={styles.actions}>
                      <View title="Edit podcast details">
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => router.push(`/admin/podcasts/${podcast.id}`)}
                        >
                          <Ionicons name="create-outline" size={18} color={Colors[colorScheme ?? 'light'].primary} />
                        </TouchableOpacity>
                      </View>
                      <View title="Refresh - Check for new episodes and update existing ones">
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleRefreshEpisodes(podcast)}
                        >
                          <Ionicons name="refresh-outline" size={18} color="#3b82f6" />
                        </TouchableOpacity>
                      </View>
                      <View title="Force Reparse - Complete re-fetch and re-parse of RSS feed, updates all episode metadata">
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleForceReparse(podcast)}
                        >
                          <Ionicons name="sync-outline" size={18} color="#8b5cf6" />
                        </TouchableOpacity>
                      </View>
                      {!podcast.isCurated && (
                        <View title="Promote to Curated - Make this podcast visible to all users in curated library">
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handlePromoteToCurated(podcast)}
                          >
                            <Ionicons name="star-outline" size={18} color="#f59e0b" />
                          </TouchableOpacity>
                        </View>
                      )}
                      <View title="Delete podcast and all episodes permanently">
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeletePodcast(podcast)}
                        >
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Bulk Action Bar */}
      {selectedPodcastIds.size > 0 && (
        <View style={[styles.bulkActionBar, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
          <Text style={[styles.bulkActionText, { color: Colors[colorScheme ?? 'light'].text }]}>
            {selectedPodcastIds.size} selected
          </Text>
          <View style={styles.bulkActions}>
            <TouchableOpacity
              style={[styles.bulkActionButton, { backgroundColor: '#10b981', opacity: bulkActionInProgress ? 0.5 : 1 }]}
              onPress={handleBulkActivate}
              disabled={bulkActionInProgress}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.bulkActionButtonText}>Activate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, { backgroundColor: '#f59e0b', opacity: bulkActionInProgress ? 0.5 : 1 }]}
              onPress={handleBulkDeactivate}
              disabled={bulkActionInProgress}
            >
              <Ionicons name="pause-circle-outline" size={18} color="#fff" />
              <Text style={styles.bulkActionButtonText}>Deactivate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, { backgroundColor: '#ef4444', opacity: bulkActionInProgress ? 0.5 : 1 }]}
              onPress={handleBulkDelete}
              disabled={bulkActionInProgress}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={styles.bulkActionButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bulkActionButton, { backgroundColor: '#6b7280', opacity: bulkActionInProgress ? 0.5 : 1 }]}
              onPress={() => setSelectedPodcastIds(new Set())}
              disabled={bulkActionInProgress}
            >
              <Text style={styles.bulkActionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  refreshAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  filters: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  clearButton: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  scrollView: {
    flex: 1,
  },
  tableContainer: {
    margin: 24,
    borderRadius: 8,
    overflow: 'visible',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 2,
    minWidth: 1400,
  },
  tableHeaderCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
    minWidth: 1400,
  },
  podcastInfo: {
    width: 300,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  podcastArtwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  podcastArtworkPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  podcastDetails: {
    flex: 1,
  },
  podcastTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  categories: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  tableCell: {
    width: 120,
  },
  tableCellText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  tableCellCompact: {
    width: 80,
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'column',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
    width: 240,
  },
  actionButton: {
    padding: 6,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
  },
  checkboxCell: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulkActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bulkActionText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  bulkActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
