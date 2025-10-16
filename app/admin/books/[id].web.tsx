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
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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

export default function EditBookScreenWeb() {
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
    long_description: [],
  });
  
  // Single long description text
  const [longDescriptionText, setLongDescriptionText] = useState('');

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
        long_description: bookData.longDescription || [],
      });
      
      // Convert long_description array to text with double line breaks
      if (bookData.longDescription && bookData.longDescription.length > 0) {
        setLongDescriptionText(bookData.longDescription.join('\n\n'));
      }
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
      
      // Parse long description into paragraphs (split by double line breaks)
      const paragraphs = longDescriptionText
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      await AdminBookService.updateBook(Number(id), {
        ...formData,
        long_description: paragraphs.length > 0 ? paragraphs : undefined,
      });
      
      Alert.alert('Success', 'Book updated successfully');
      loadBook();
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
      `Are you sure you want to delete "${book?.title}"? This action cannot be undone and will delete all associated files.`,
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

  const handlePickCover = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        await AdminBookService.uploadCoverImage(file, Number(id));
        Alert.alert('Success', 'Cover image uploaded successfully');
        loadBook();
      } catch (error) {
        console.error('Error uploading cover:', error);
        Alert.alert('Error', 'Failed to upload cover image');
      }
    };
    input.click();
  };

  const handlePickEpub = async (isSample: boolean = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.epub,application/epub+zip';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        await AdminBookService.uploadEpubFile(file, Number(id), isSample);
        Alert.alert('Success', `${isSample ? 'Sample ' : ''}EPUB uploaded successfully`);
        loadBook();
      } catch (error) {
        console.error('Error uploading EPUB:', error);
        Alert.alert('Error', `Failed to upload ${isSample ? 'sample ' : ''}EPUB`);
      }
    };
    input.click();
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


  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading book...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header with Back Button */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/admin/books')}
        >
          <Ionicons name="arrow-back" size={20} color={Colors[colorScheme ?? 'light'].text} />
          <Text style={[styles.backButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Back to Books
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Edit Book
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          {/* Main Content: Two Columns */}
          <View style={styles.columns}>
            {/* Left Column: Book Details */}
            <View style={styles.leftColumn}>
              <Text style={[styles.columnTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Book Information
              </Text>

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

              {/* Year and Category Row */}
              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
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

                <View style={[styles.field, { flex: 2 }]}>
                  <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Category *
                  </Text>
                  <View style={styles.categoryRow}>
                    {CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryChip,
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
                            styles.categoryChipText,
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
                  placeholder="Enter a brief description (1-2 sentences)"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Long Description */}
              <View style={styles.field}>
                <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Long Description (Optional)
                </Text>
                <TextInput
                  style={[styles.longTextArea, { 
                    backgroundColor: Colors[colorScheme ?? 'light'].card,
                    color: Colors[colorScheme ?? 'light'].text,
                  }]}
                  value={longDescriptionText}
                  onChangeText={setLongDescriptionText}
                  placeholder="Enter detailed description. Use double line breaks to separate paragraphs.&#10;&#10;First paragraph...&#10;&#10;Second paragraph..."
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                  multiline
                  numberOfLines={20}
                />
                <Text style={[styles.hint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Tip: Separate paragraphs with a blank line (double Enter)
                </Text>
              </View>
            </View>

            {/* Right Column: Files */}
            <View style={styles.rightColumn}>
              <Text style={[styles.columnTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Media Files
              </Text>

              {/* Cover Image */}
              <View style={styles.fileSection}>
                <Text style={[styles.fileLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Cover Image
                </Text>
                {book?.coverImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: book.coverImage }} 
                      style={styles.imagePreview}
                      resizeMode="contain"
                    />
                    <View style={styles.imageOverlay}>
                      <TouchableOpacity
                        style={[styles.imageButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                        onPress={handlePickCover}
                      >
                        <Ionicons name="refresh" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                        <Text style={[styles.imageButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                          Replace
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.imageButton, { backgroundColor: Colors[colorScheme ?? 'light'].error }]}
                        onPress={handleDeleteCover}
                      >
                        <Ionicons name="trash" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                        <Text style={[styles.imageButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.uploadBox, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                    onPress={handlePickCover}
                  >
                    <Ionicons name="image-outline" size={40} color={Colors[colorScheme ?? 'light'].primary} />
                    <Text style={[styles.uploadText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Click to upload cover
                    </Text>
                    <Text style={[styles.uploadHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      400x600px recommended
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* EPUB File */}
              <View style={styles.fileSection}>
                <Text style={[styles.fileLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  EPUB File (Full Version)
                </Text>
                {book?.epubPath ? (
                  <View style={[styles.fileCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                    <Ionicons name="document" size={24} color={Colors[colorScheme ?? 'light'].accent} />
                    <View style={styles.fileCardInfo}>
                      <Text style={[styles.fileCardTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        EPUB Uploaded
                      </Text>
                      <Text style={[styles.fileCardHint, { color: Colors[colorScheme ?? 'light'].success }]}>
                        ✓ Ready for readers
                      </Text>
                    </View>
                    <View style={styles.fileCardActions}>
                      <TouchableOpacity
                        style={[styles.smallButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}
                        onPress={() => handlePickEpub(false)}
                      >
                        <Ionicons name="refresh" size={14} color={Colors[colorScheme ?? 'light'].primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallButton, { backgroundColor: Colors[colorScheme ?? 'light'].error + '20' }]}
                        onPress={() => handleDeleteEpub(false)}
                      >
                        <Ionicons name="trash" size={14} color={Colors[colorScheme ?? 'light'].error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.fileUploadButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                    onPress={() => handlePickEpub(false)}
                  >
                    <Ionicons name="document-outline" size={24} color={Colors[colorScheme ?? 'light'].accent} />
                    <Text style={[styles.fileUploadText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Upload EPUB
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Sample EPUB File */}
              <View style={styles.fileSection}>
                <Text style={[styles.fileLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Sample EPUB (Optional)
                </Text>
                {book?.epubSamplePath ? (
                  <View style={[styles.fileCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                    <Ionicons name="document-text" size={24} color={Colors[colorScheme ?? 'light'].info} />
                    <View style={styles.fileCardInfo}>
                      <Text style={[styles.fileCardTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        Sample Uploaded
                      </Text>
                      <Text style={[styles.fileCardHint, { color: Colors[colorScheme ?? 'light'].success }]}>
                        ✓ Preview available
                      </Text>
                    </View>
                    <View style={styles.fileCardActions}>
                      <TouchableOpacity
                        style={[styles.smallButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}
                        onPress={() => handlePickEpub(true)}
                      >
                        <Ionicons name="refresh" size={14} color={Colors[colorScheme ?? 'light'].primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.smallButton, { backgroundColor: Colors[colorScheme ?? 'light'].error + '20' }]}
                        onPress={() => handleDeleteEpub(true)}
                      >
                        <Ionicons name="trash" size={14} color={Colors[colorScheme ?? 'light'].error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.fileUploadButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                    onPress={() => handlePickEpub(true)}
                  >
                    <Ionicons name="document-text-outline" size={24} color={Colors[colorScheme ?? 'light'].info} />
                    <Text style={[styles.fileUploadText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Upload Sample
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Book ID and Dates */}
              <View style={[styles.metaCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Book ID
                  </Text>
                  <Text style={[styles.metaValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                    #{book?.id}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Created
                  </Text>
                  <Text style={[styles.metaValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {new Date(book?.createdAt || '').toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Last Updated
                  </Text>
                  <Text style={[styles.metaValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {new Date(book?.updatedAt || '').toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
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
          <Ionicons name="trash" size={18} color={Colors[colorScheme ?? 'light'].error} />
          <Text style={[styles.deleteButtonText, { color: Colors[colorScheme ?? 'light'].error }]}>
            Delete Book
          </Text>
        </TouchableOpacity>
        <View style={styles.footerSpacer} />
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
              <Text style={[styles.saveButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                Save Changes
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
  formContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    padding: 32,
  },
  columns: {
    flexDirection: 'row',
    gap: 32,
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
    minWidth: 320,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 14,
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
    fontSize: 15,
    fontFamily: 'Georgia',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    fontFamily: 'Georgia',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  longTextArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    fontFamily: 'Georgia',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 6,
    fontStyle: 'italic',
  },
  fileSection: {
    marginBottom: 24,
  },
  fileLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  uploadBox: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    cursor: 'pointer',
  },
  uploadText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginTop: 12,
  },
  uploadHint: {
    fontSize: 13,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    gap: 8,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  imageButtonText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fileCardInfo: {
    flex: 1,
  },
  fileCardTitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 2,
  },
  fileCardHint: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  fileCardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  smallButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    cursor: 'pointer',
  },
  fileUploadText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  metaCard: {
    padding: 16,
    borderRadius: 8,
    gap: 10,
    marginTop: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 13,
    fontFamily: 'Georgia',
  },
  metaValue: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  footerSpacer: {
    flex: 1,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    minWidth: 180,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
