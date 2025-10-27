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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminPodcastService, UpdatePodcastData } from '../../../services/AdminPodcastService';
import { Podcast, PodcastEpisode } from '../../../types';

export default function EditPodcastScreen() {
  const { colorScheme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [formData, setFormData] = useState<UpdatePodcastData>({
    title: '',
    description: '',
    author: '',
    artworkUrl: '',
    websiteUrl: '',
    language: 'en',
    categories: [],
    isCurated: false,
    isActive: true,
  });

  const commonCategories = ['Religion', 'Christianity', 'Catholicism', 'Theology', 'Spirituality', 'Philosophy', 'History'];

  useEffect(() => {
    if (id) {
      loadPodcast();
    }
  }, [id]);

  const loadPodcast = async () => {
    try {
      setLoading(true);
      const podcastData = await AdminPodcastService.getPodcast(id!);
      setPodcast(podcastData);
      setFormData({
        title: podcastData.title,
        description: podcastData.description || '',
        author: podcastData.author || '',
        artworkUrl: podcastData.artworkUrl || '',
        websiteUrl: podcastData.websiteUrl || '',
        language: podcastData.language || 'en',
        categories: podcastData.categories || [],
        isCurated: podcastData.isCurated,
        isActive: podcastData.isActive,
      });

      // Load episodes
      const episodesData = await AdminPodcastService.getEpisodes(id!);
      setEpisodes(episodesData);
    } catch (error) {
      console.error('Error loading podcast:', error);
      Alert.alert('Error', 'Failed to load podcast details');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPodcast();
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      Alert.alert('Error', 'Please enter a podcast title');
      return;
    }

    try {
      setSaving(true);
      await AdminPodcastService.updatePodcast(id!, formData);
      Alert.alert('Success', 'Podcast updated successfully');
      loadPodcast();
    } catch (error) {
      console.error('Error updating podcast:', error);
      Alert.alert('Error', 'Failed to update podcast');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePodcast = () => {
    Alert.alert(
      'Delete Podcast',
      `Are you sure you want to delete "${podcast?.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminPodcastService.deletePodcast(id!);
              Alert.alert('Success', 'Podcast deleted successfully', [
                { text: 'OK', onPress: () => router.push('/admin/podcasts') },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete podcast');
            }
          },
        },
      ]
    );
  };

  const handleRefreshEpisodes = async () => {
    try {
      Alert.alert('Refreshing', 'Fetching latest episodes from RSS feed...');
      await AdminPodcastService.refreshEpisodes(id!);
      Alert.alert('Success', 'Episodes refreshed successfully');
      loadPodcast();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh episodes');
    }
  };

  const toggleCategory = (category: string) => {
    const currentCategories = formData.categories || [];
    if (currentCategories.includes(category)) {
      setFormData({
        ...formData,
        categories: currentCategories.filter(c => c !== category),
      });
    } else {
      setFormData({
        ...formData,
        categories: [...currentCategories, category],
      });
    }
  };

  if (loading && !podcast) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Loading podcast...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!podcast) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Title *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
              }]}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter podcast title"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Description
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
              }]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter podcast description"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Author */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Author
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
              }]}
              value={formData.author}
              onChangeText={(text) => setFormData({ ...formData, author: text })}
              placeholder="Enter author name"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </View>

          {/* Artwork URL */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Artwork URL
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
              }]}
              value={formData.artworkUrl}
              onChangeText={(text) => setFormData({ ...formData, artworkUrl: text })}
              placeholder="https://example.com/artwork.jpg"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              autoCapitalize="none"
            />
          </View>

          {/* Website URL */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Website URL
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
              }]}
              value={formData.websiteUrl}
              onChangeText={(text) => setFormData({ ...formData, websiteUrl: text })}
              placeholder="https://example.com"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              autoCapitalize="none"
            />
          </View>

          {/* Categories */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Categories
            </Text>
            <View style={styles.categoryButtons}>
              {commonCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    { 
                      backgroundColor: (formData.categories || []).includes(category)
                        ? Colors[colorScheme ?? 'light'].primary
                        : Colors[colorScheme ?? 'light'].card,
                    }
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { 
                        color: (formData.categories || []).includes(category)
                          ? '#fff'
                          : Colors[colorScheme ?? 'light'].text,
                      }
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status Toggles */}
          <View style={styles.field}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFormData({ ...formData, isCurated: !formData.isCurated })}
            >
              <View style={[
                styles.checkbox,
                { 
                  backgroundColor: formData.isCurated 
                    ? Colors[colorScheme ?? 'light'].primary 
                    : 'transparent',
                  borderColor: Colors[colorScheme ?? 'light'].primary,
                }
              ]}>
                {formData.isCurated && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </View>
              <View style={styles.checkboxLabel}>
                <Text style={[styles.checkboxText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Curated library
                </Text>
                <Text style={[styles.checkboxHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Available to all users
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
            >
              <View style={[
                styles.checkbox,
                { 
                  backgroundColor: formData.isActive 
                    ? Colors[colorScheme ?? 'light'].primary 
                    : 'transparent',
                  borderColor: Colors[colorScheme ?? 'light'].primary,
                }
              ]}>
                {formData.isActive && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </View>
              <View style={styles.checkboxLabel}>
                <Text style={[styles.checkboxText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Active
                </Text>
                <Text style={[styles.checkboxHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Show in listings
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Episodes Section */}
          <View style={styles.field}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Episodes ({episodes.length})
              </Text>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={handleRefreshEpisodes}
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {episodes.length === 0 ? (
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No episodes found
              </Text>
            ) : (
              episodes.slice(0, 10).map((episode) => (
                <View key={episode.id} style={[styles.episodeItem, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                  <Text style={[styles.episodeTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {episode.title}
                  </Text>
                  {episode.publishedAt && (
                    <Text style={[styles.episodeDate, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {new Date(episode.publishedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ))
            )}
            {episodes.length > 10 && (
              <Text style={[styles.moreText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                + {episodes.length - 10} more episodes
              </Text>
            )}
          </View>

          {/* Danger Zone */}
          <View style={styles.field}>
            <View style={[styles.dangerZone, { borderColor: '#ef4444' }]}>
              <Text style={[styles.dangerTitle, { color: '#ef4444' }]}>
                Danger Zone
              </Text>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: '#ef4444' }]}
                onPress={handleDeletePodcast}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.deleteButtonText}>Delete Podcast</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkboxHint: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  episodeItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  episodeTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  episodeDate: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 24,
  },
  moreText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  dangerZone: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
