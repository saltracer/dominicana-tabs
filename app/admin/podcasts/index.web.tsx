import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
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

  const loadPodcasts = async () => {
    try {
      setLoading(true);
      const filters: PodcastFilters = {};
      
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter === 'curated') filters.isCurated = true;
      filters.sortBy = sortBy;
      filters.sortOrder = sortOrder;

      const result = await AdminPodcastService.listPodcasts(filters, { page: 1, limit: 100 });
      setPodcasts(result.podcasts);
    } catch (error) {
      console.error('Error loading podcasts:', error);
      Alert.alert('Error', 'Failed to load podcasts');
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
        <ScrollView style={styles.scrollView}>
          {/* Podcasts Table */}
          <View style={[styles.tableContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <View style={[styles.tableHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
              <TouchableOpacity
                style={styles.tableHeaderCell}
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
              <View style={styles.tableHeaderCell}>
                <Text style={[styles.tableHeaderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Author
                </Text>
              </View>
              <TouchableOpacity
                style={styles.tableHeaderCell}
                onPress={() => handleSort('created_at')}
              >
                <Text style={[styles.tableHeaderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Created
                </Text>
                {sortBy === 'created_at' && (
                  <Ionicons
                    name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors[colorScheme ?? 'light'].textSecondary}
                  />
                )}
              </TouchableOpacity>
              <View style={styles.tableHeaderCell}>
                <Text style={[styles.tableHeaderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Status
                </Text>
              </View>
              <View style={styles.tableHeaderCell}>
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
                <View key={podcast.id} style={[styles.tableRow, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
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
                  <View style={styles.tableCell}>
                    <Text style={[styles.tableCellText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {podcast.author || '—'}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={[styles.tableCellText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {new Date(podcast.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.tableCell}>
                    <View style={styles.badges}>
                      {podcast.isCurated && (
                        <View style={[styles.badge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                          <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                            Curated
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
                  <View style={styles.tableCell}>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push(`/admin/podcasts/${podcast.id}`)}
                      >
                        <Ionicons name="create-outline" size={18} color={Colors[colorScheme ?? 'light'].primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeletePodcast(podcast)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
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
  addButton: {
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
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 2,
  },
  tableHeaderCell: {
    flex: 1,
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
  },
  podcastInfo: {
    flex: 2,
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
    flex: 1,
  },
  tableCellText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
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
});
