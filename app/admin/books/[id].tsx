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
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminBookService, CreateBookData } from '../../../services/AdminBookService';
import { Book, BookCategory } from '../../../types';

const CATEGORIES: BookCategory[] = [
  'Philosophy',
  'Theology',
  'Mysticism',
  'Science',
  'Natural History',
];

export default function EditBookScreen() {
  const { colorScheme } = useTheme();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<CreateBookData>({
    title: '',
    author: '',
    year: '',
    category: 'Theology',
    description: '',
    long_description: [''],
  });
  const [uploadProgress, setUploadProgress] = useState<{
    cover?: number;
    epub?: number;
    epubSample?: number;
  }>({});

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const bookData = await AdminBookService.getBook(Number(id));
      setBook(bookData);
      setFormData({
        title: bookData.title,
        author: bookData.author,
        year: bookData.year || '',
        category: bookData.category,
        description: bookData.description,
        long_description: bookData.longDescription || [''],
      });
    } catch (error) {
      console.error('Error loading book:', error);
      Alert.alert('Error', 'Failed to load book details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a book title');
      return;
    }
    if (!formData.author.trim()) {
      Alert.alert('Error', 'Please enter an author name');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      setSaving(true);
      await AdminBookService.updateBook(Number(id), {
        ...formData,
        long_description: formData.long_description?.filter(p => p.trim()) || undefined,
      });
      
      Alert.alert('Success', 'Book updated successfully');
      loadBook(); // Reload to get fresh data
    } catch (error) {
      console.error('Error updating book:', error);
      Alert.alert('Error', 'Failed to update book');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = () => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book?.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminBookService.deleteBook(Number(id));
              Alert.alert('Success', 'Book deleted successfully', [
                { text: 'OK', onPress: () => router.push('/admin/books') },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete book');
            }
          },
        },
      ]
    );
  };

  const handlePickCover = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Convert to Blob for upload
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        setUploadProgress({ ...uploadProgress, cover: 0 });
        
        try {
          await AdminBookService.uploadCoverImage(blob, Number(id));
          setUploadProgress({ ...uploadProgress, cover: 100 });
          Alert.alert('Success', 'Cover image uploaded successfully');
          loadBook(); // Reload to show new cover
        } catch (error) {
          console.error('Error uploading cover:', error);
          Alert.alert('Error', 'Failed to upload cover image');
        } finally {
          setUploadProgress({ ...uploadProgress, cover: undefined });
        }
      }
    } catch (error) {
      console.error('Error picking cover:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handlePickEpub = async (isSample: boolean = false) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/epub+zip',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Convert to Blob
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        const progressKey = isSample ? 'epubSample' : 'epub';
        setUploadProgress({ ...uploadProgress, [progressKey]: 0 });
        
        try {
          await AdminBookService.uploadEpubFile(blob, Number(id), isSample);
          setUploadProgress({ ...uploadProgress, [progressKey]: 100 });
          Alert.alert('Success', `${isSample ? 'Sample ' : ''}EPUB uploaded successfully`);
          loadBook();
        } catch (error) {
          console.error('Error uploading EPUB:', error);
          Alert.alert('Error', `Failed to upload ${isSample ? 'sample ' : ''}EPUB`);
        } finally {
          setUploadProgress({ ...uploadProgress, [progressKey]: undefined });
        }
      }
    } catch (error) {
      console.error('Error picking EPUB:', error);
      Alert.alert('Error', 'Failed to select EPUB file');
    }
  };

  const handleDeleteCover = () => {
    Alert.alert('Delete Cover', 'Remove the cover image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AdminBookService.deleteCoverImage(Number(id));
            Alert.alert('Success', 'Cover image deleted');
            loadBook();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete cover');
          }
        },
      },
    ]);
  };

  const handleDeleteEpub = (isSample: boolean = false) => {
    Alert.alert(
      'Delete EPUB',
      `Remove the ${isSample ? 'sample ' : ''}EPUB file?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminBookService.deleteEpubFile(Number(id), isSample);
              Alert.alert('Success', `${isSample ? 'Sample ' : ''}EPUB deleted`);
              loadBook();
            } catch (error) {
              Alert.alert('Error', `Failed to delete ${isSample ? 'sample ' : ''}EPUB`);
            }
          },
        },
      ]
    );
  };

  const addParagraph = () => {
    setFormData({
      ...formData,
      long_description: [...(formData.long_description || ['']), ''],
    });
  };

  const removeParagraph = (index: number) => {
    const paragraphs = formData.long_description || [];
    setFormData({
      ...formData,
      long_description: paragraphs.filter((_, i) => i !== index),
    });
  };

  const updateParagraph = (index: number, text: string) => {
    const paragraphs = [...(formData.long_description || [''])];
    paragraphs[index] = text;
    setFormData({ ...formData, long_description: paragraphs });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading book...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView}>
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
              placeholder="Enter book title"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </View>

          {/* Author */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Author *
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

          {/* Year */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Year
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
              }]}
              value={formData.year}
              onChangeText={(text) => setFormData({ ...formData, year: text })}
              placeholder="e.g., 1265"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Category *
            </Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor:
                        formData.category === category
                          ? Colors[colorScheme ?? 'light'].primary
                          : Colors[colorScheme ?? 'light'].card,
                      borderColor: Colors[colorScheme ?? 'light'].border,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, category })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color:
                          formData.category === category
                            ? Colors[colorScheme ?? 'light'].dominicanWhite
                            : Colors[colorScheme ?? 'light'].text,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Short Description *
            </Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
              }]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Enter a brief description"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Long Description */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Long Description
              </Text>
              <TouchableOpacity
                style={[styles.addParagraphButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}
                onPress={addParagraph}
              >
                <Ionicons name="add" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.addParagraphText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  Add Paragraph
                </Text>
              </TouchableOpacity>
            </View>
            {formData.long_description?.map((paragraph, index) => (
              <View key={index} style={styles.paragraphContainer}>
                <TextInput
                  style={[styles.textArea, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].card,
                    color: Colors[colorScheme ?? 'light'].text,
                    flex: 1,
                  }]}
                  value={paragraph}
                  onChangeText={(text) => updateParagraph(index, text)}
                  placeholder={`Paragraph ${index + 1}`}
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                  multiline
                  numberOfLines={3}
                />
                {formData.long_description && formData.long_description.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeParagraphButton}
                    onPress={() => removeParagraph(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors[colorScheme ?? 'light'].error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Cover Image */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Cover Image
            </Text>
            {book?.coverImage ? (
              <View style={styles.filePreview}>
                <Image source={{ uri: book.coverImage }} style={styles.coverPreview} />
                <View style={styles.fileActions}>
                  <TouchableOpacity
                    style={[styles.fileButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                    onPress={handlePickCover}
                  >
                    <Ionicons name="refresh" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                    <Text style={[styles.fileButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                      Replace
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.fileButton, { backgroundColor: Colors[colorScheme ?? 'light'].error }]}
                    onPress={handleDeleteCover}
                  >
                    <Ionicons name="trash" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                    <Text style={[styles.fileButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                onPress={handlePickCover}
              >
                <Ionicons name="cloud-upload" size={32} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.uploadButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Upload Cover Image
                </Text>
                <Text style={[styles.uploadButtonHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Recommended: 400x600px, JPG/PNG
                </Text>
              </TouchableOpacity>
            )}
            {uploadProgress.cover !== undefined && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress.cover}%` }]} />
              </View>
            )}
          </View>

          {/* EPUB File */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              EPUB File (Full Version)
            </Text>
            {book?.epubPath ? (
              <View style={styles.fileInfo}>
                <Ionicons name="document" size={24} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.fileInfoText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  EPUB file uploaded
                </Text>
                <View style={styles.fileActions}>
                  <TouchableOpacity
                    style={[styles.fileButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                    onPress={() => handlePickEpub(false)}
                  >
                    <Ionicons name="refresh" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                    <Text style={[styles.fileButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                      Replace
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.fileButton, { backgroundColor: Colors[colorScheme ?? 'light'].error }]}
                    onPress={() => handleDeleteEpub(false)}
                  >
                    <Ionicons name="trash" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                    <Text style={[styles.fileButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                onPress={() => handlePickEpub(false)}
              >
                <Ionicons name="cloud-upload" size={32} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.uploadButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Upload EPUB File
                </Text>
              </TouchableOpacity>
            )}
            {uploadProgress.epub !== undefined && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress.epub}%` }]} />
              </View>
            )}
          </View>

          {/* Sample EPUB File */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              EPUB Sample (Optional)
            </Text>
            {book?.epubSamplePath ? (
              <View style={styles.fileInfo}>
                <Ionicons name="document-text" size={24} color={Colors[colorScheme ?? 'light'].accent} />
                <Text style={[styles.fileInfoText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Sample EPUB uploaded
                </Text>
                <View style={styles.fileActions}>
                  <TouchableOpacity
                    style={[styles.fileButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                    onPress={() => handlePickEpub(true)}
                  >
                    <Ionicons name="refresh" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                    <Text style={[styles.fileButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                      Replace
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.fileButton, { backgroundColor: Colors[colorScheme ?? 'light'].error }]}
                    onPress={() => handleDeleteEpub(true)}
                  >
                    <Ionicons name="trash" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                    <Text style={[styles.fileButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                onPress={() => handlePickEpub(true)}
              >
                <Ionicons name="cloud-upload" size={32} color={Colors[colorScheme ?? 'light'].accent} />
                <Text style={[styles.uploadButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Upload Sample EPUB
                </Text>
                <Text style={[styles.uploadButtonHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Preview for free/authenticated users
                </Text>
              </TouchableOpacity>
            )}
            {uploadProgress.epubSample !== undefined && (
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress.epubSample}%` }]} />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: Colors[colorScheme ?? 'light'].error }]}
          onPress={handleDeleteBook}
          disabled={saving}
        >
          <Text style={[styles.deleteButtonText, { color: Colors[colorScheme ?? 'light'].error }]}>
            Delete
          </Text>
        </TouchableOpacity>
        <View style={styles.footerRight}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            ) : (
              <Text style={[styles.saveButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  form: {
    padding: 16,
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  addParagraphButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addParagraphText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  paragraphContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  removeParagraphButton: {
    padding: 4,
  },
  uploadButton: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginTop: 12,
  },
  uploadButtonHint: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  filePreview: {
    gap: 12,
  },
  coverPreview: {
    width: 200,
    height: 300,
    borderRadius: 8,
    alignSelf: 'center',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 12,
  },
  fileInfoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  fileButtonText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8C1515',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerRight: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
