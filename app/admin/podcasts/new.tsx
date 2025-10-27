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
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminPodcastService, CreatePodcastData } from '../../../services/AdminPodcastService';
import { usePodcastCategories } from '../../../hooks/usePodcastCategories';

export default function NewPodcastScreen() {
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
          onPress: () => router.back(),
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
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* RSS URL Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              RSS Feed URL *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
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
            <View style={[styles.previewCard, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <Text style={[styles.previewTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Preview
              </Text>
              
              {preview.artworkUrl && (
                <Image
                  source={{ uri: preview.artworkUrl }}
                  style={styles.previewArtwork}
                  resizeMode="cover"
                />
              )}
              
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
          )}

          {/* Artwork URL Override */}
          {showPreview && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Artwork URL (Optional Override)
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].card,
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
      </ScrollView>

      {/* Submit Button */}
      {showPreview && (
        <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 12,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewArtwork: {
    width: 200,
    height: 200,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 8,
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
  },
  checkboxHint: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
