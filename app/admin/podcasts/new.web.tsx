import React, { useState } from 'react';
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
import { AdminPodcastService, CreatePodcastData } from '../../../services/AdminPodcastService';
import { usePodcastCategories } from '../../../hooks/usePodcastCategories';

export default function NewPodcastWebScreen() {
  const { colorScheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rssUrl, setRssUrl] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<CreatePodcastData>({
    rssUrl: '',
    artworkUrl: '',
    categories: [],
    isCurated: false,
    language: 'en',
  });

  const { categories: commonCategories, loading: categoriesLoading } = usePodcastCategories();

  const handlePreviewRss = async () => {
    if (!rssUrl.trim()) {
      Alert.alert('Error', 'Please enter an RSS feed URL');
      return;
    }

    try {
      setLoading(true);
      const previewData = await AdminPodcastService.previewRssFeed(rssUrl);
      setPreview(previewData);
      setShowPreview(true);
      
      // Pre-fill form data
      setFormData({
        rssUrl,
        artworkUrl: previewData.artworkUrl || '',
        categories: previewData.categories || [],
        isCurated: false,
        language: previewData.language || 'en',
      });
    } catch (error) {
      console.error('Error previewing RSS feed:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to fetch RSS feed');
    } finally {
      setLoading(false);
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

  const handleSubmit = async () => {
    if (!rssUrl.trim()) {
      Alert.alert('Error', 'Please enter an RSS feed URL');
      return;
    }

    if (!showPreview) {
      Alert.alert('Error', 'Please fetch and preview the RSS feed first');
      return;
    }

    try {
      setSaving(true);
      const podcast = await AdminPodcastService.addPodcast({
        ...formData,
        rssUrl,
      });
      
      Alert.alert('Success', 'Podcast added successfully', [
        {
          text: 'OK',
          onPress: () => router.push('/admin/podcasts'),
        },
      ]);
    } catch (error) {
      console.error('Error creating podcast:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create podcast');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Add New Podcast
            </Text>
          </View>
        </View>

        {/* Form Container */}
        <View style={[styles.formContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          {/* RSS URL Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              RSS Feed URL *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                color: Colors[colorScheme ?? 'light'].text,
              }]}
              value={rssUrl}
              onChangeText={setRssUrl}
              placeholder="https://example.com/podcast/feed.xml"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity
              style={[styles.previewButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
              onPress={handlePreviewRss}
              disabled={loading || !rssUrl.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#fff" />
                  <Text style={styles.previewButtonText}>Fetch from RSS</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Preview Section */}
          {showPreview && preview && (
            <View style={[styles.previewCard, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
              <Text style={[styles.previewTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Preview
              </Text>
              
              <View style={styles.previewContent}>
                {preview.artworkUrl && (
                  <Image
                    source={{ uri: preview.artworkUrl }}
                    style={styles.previewArtwork}
                    resizeMode="cover"
                  />
                )}
                
                <View style={styles.previewDetails}>
                  <Text style={[styles.previewText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    <Text style={styles.previewLabel}>Title:</Text> {preview.title}
                  </Text>
                  
                  {preview.author && (
                    <Text style={[styles.previewText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      <Text style={styles.previewLabel}>Author:</Text> {preview.author}
                    </Text>
                  )}
                  
                  {preview.description && (
                    <Text style={[styles.previewText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {preview.description}
                    </Text>
                  )}
                  
                  <Text style={[styles.previewText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    <Text style={styles.previewLabel}>Episodes:</Text> {preview.episodeCount}
                  </Text>
                  
                  {preview.categories && preview.categories.length > 0 && (
                    <View style={styles.previewCategories}>
                      <Text style={[styles.previewLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                        Categories:
                      </Text>
                      <View style={styles.categoryChips}>
                        {preview.categories.map((cat: string) => (
                          <View key={cat} style={[styles.categoryChip, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                            <Text style={[styles.categoryChipText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                              {cat}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Artwork URL Override */}
          {showPreview && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Artwork URL (Optional Override)
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  color: Colors[colorScheme ?? 'light'].text,
                }]}
                value={formData.artworkUrl}
                onChangeText={(text) => setFormData({ ...formData, artworkUrl: text })}
                placeholder="Leave empty to use RSS artwork"
                placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Categories */}
          {showPreview && (
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
                          : Colors[colorScheme ?? 'light'].background,
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
          )}

          {/* Curate Checkbox */}
          {showPreview && (
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
                  Add to curated library
                </Text>
                <Text style={[styles.checkboxHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Make this podcast available to all users
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        {showPreview && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Add Podcast</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  formContainer: {
    borderRadius: 12,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  previewCard: {
    padding: 24,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  previewContent: {
    flexDirection: 'row',
    gap: 16,
  },
  previewArtwork: {
    width: 150,
    height: 150,
    borderRadius: 8,
    flexShrink: 0,
  },
  previewDetails: {
    flex: 1,
    gap: 8,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  previewLabel: {
    fontWeight: '600',
  },
  previewCategories: {
    marginTop: 12,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Georgia',
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
    fontFamily: 'Georgia',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    fontFamily: 'Georgia',
  },
  checkboxHint: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
