import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminPodcastService } from '../../../services/AdminPodcastService';
import { Podcast, PodcastFilters } from '../../../types';

export default function PodcastsListScreen() {
  const { colorScheme } = useTheme();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [curatedFilter, setCuratedFilter] = useState<'all' | 'curated' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'last_fetched_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPodcasts();
  }, [searchQuery, curatedFilter, sortBy, sortOrder, page]);

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      const filters: PodcastFilters = {};
      
      if (searchQuery) filters.search = searchQuery;
      if (curatedFilter === 'curated') filters.isCurated = true;
      if (curatedFilter === 'draft') filters.isCurated = false;
      filters.sortBy = sortBy;
      filters.sortOrder = sortOrder;

      const result = await AdminPodcastService.listPodcasts(filters, { page, limit: 20 });
      setPodcasts(result.podcasts);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading podcasts:', error);
      Alert.alert('Error', 'Failed to load podcasts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPodcasts();
  };

  const handleDeletePodcast = async (podcast: Podcast) => {
    Alert.alert(
      'Delete Podcast',
      `Are you sure you want to delete "${podcast.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminPodcastService.deletePodcast(podcast.id);
              Alert.alert('Success', 'Podcast deleted successfully');
              loadPodcasts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete podcast');
            }
          },
        },
      ]
    );
  };

  const handleRefreshEpisodes = async (podcast: Podcast) => {
    Alert.alert(
      'Refresh Episodes',
      `Fetch latest episodes from "${podcast.title}"? This will check for new episodes and update existing ones.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          style: 'default',
          onPress: async () => {
            try {
              Alert.alert('Refreshing', 'Fetching latest episodes from RSS feed...');
              await AdminPodcastService.refreshEpisodes(podcast.id);
              Alert.alert('Success', 'Episodes refreshed successfully');
              loadPodcasts();
            } catch (error) {
              Alert.alert('Error', 'Failed to refresh episodes');
            }
          },
        },
      ]
    );
  };

  const handleForceReparse = async (podcast: Podcast) => {
    Alert.alert(
      'Force Reparse RSS Feed',
      `This will force a complete re-fetch and re-parse of the RSS feed for "${podcast.title}", updating all episode metadata including durations. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Force Reparse',
          style: 'default',
          onPress: async () => {
            try {
              Alert.alert('Reparsing', 'Force reparsing RSS feed...');
              await AdminPodcastService.refreshEpisodes(podcast.id);
              Alert.alert('Success', 'RSS feed reparsed successfully. All episode data has been updated.');
              loadPodcasts();
            } catch (error) {
              console.error('Force reparse error:', error);
              Alert.alert('Error', 'Failed to reparse RSS feed');
            }
          },
        },
      ]
    );
  };

  if (loading && podcasts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading podcasts...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Manage Podcasts
        </Text>
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
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {(['all', 'curated', 'draft'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                curatedFilter === filter && {
                  backgroundColor: Colors[colorScheme ?? 'light'].primary,
                },
              ]}
              onPress={() => setCuratedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  { color: curatedFilter === filter ? '#fff' : Colors[colorScheme ?? 'light'].text },
                ]}
              >
                {filter === 'all' ? 'All' : filter === 'curated' ? 'Curated' : 'Drafts'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Podcast List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {podcasts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="radio-outline" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              No podcasts found
            </Text>
          </View>
        ) : (
          podcasts.map((podcast) => (
            <View key={podcast.id} style={[styles.podcastCard, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <View style={styles.podcastInfo}>
                <Text style={[styles.podcastTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {podcast.title}
                </Text>
                {podcast.author && (
                  <Text style={[styles.podcastAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {podcast.author}
                  </Text>
                )}
                <View style={styles.podcastMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: podcast.isCurated ? '#10b981' : '#f59e0b' }]}>
                    <Text style={styles.statusBadgeText}>
                      {podcast.isCurated ? 'Curated' : 'Draft'}
                    </Text>
                  </View>
                  {podcast.lastFetchedAt && (
                    <Text style={[styles.metaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Last updated: {new Date(podcast.lastFetchedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                  onPress={() => router.push(`/admin/podcasts/${podcast.id}`)}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
                  onPress={() => handleRefreshEpisodes(podcast)}
                >
                  <Ionicons name="refresh-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
                  onPress={() => handleForceReparse(podcast)}
                >
                  <Ionicons name="sync-outline" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                  onPress={() => handleDeletePodcast(podcast)}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              disabled={page === 1}
              onPress={() => setPage(page - 1)}
              style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
            >
              <Text style={[styles.pageButtonText, page === 1 && { opacity: 0.5 }]}>Previous</Text>
            </TouchableOpacity>
            <Text style={[styles.pageText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Page {page} of {totalPages}
            </Text>
            <TouchableOpacity
              disabled={page === totalPages}
              onPress={() => setPage(page + 1)}
              style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
            >
              <Text style={[styles.pageButtonText, page === totalPages && { opacity: 0.5 }]}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filters: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  podcastCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  podcastInfo: {
    marginBottom: 12,
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  podcastAuthor: {
    fontSize: 14,
    marginBottom: 8,
  },
  podcastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  pageText: {
    fontSize: 16,
  },
});
