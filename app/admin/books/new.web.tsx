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
import { AdminBookService, CreateBookData } from '../../../services/AdminBookService';
import { BookCategory } from '../../../types';
import { useBookCategories } from '../../../hooks/useBookCategories';

export default function NewBookScreenWeb() {
  const { colorScheme } = useTheme();
  const { categories, loading: categoriesLoading } = useBookCategories();
  const [saving, setSaving] = useState(false);
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
  
  // Published status
  const [publishImmediately, setPublishImmediately] = useState(false);
  
  // File state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [epubSampleFile, setEpubSampleFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    // Validation
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

      // Create book with all files at once!
      const book = await AdminBookService.createBook(
        {
          ...formData,
          long_description: paragraphs.length > 0 ? paragraphs : undefined,
          published: publishImmediately,
        },
        {
          cover: coverFile || undefined,
          epub: epubFile || undefined,
          epubSample: epubSampleFile || undefined,
        }
      );
      
      Alert.alert('Success', 'Book created successfully with all files!', [
        {
          text: 'View Book',
          onPress: () => router.push(`/admin/books/${book.id}`),
        },
        {
          text: 'Back to List',
          onPress: () => router.push('/admin/books'),
        },
      ]);
    } catch (error) {
      console.error('Error creating book:', error);
      Alert.alert('Error', 'Failed to create book');
    } finally {
      setSaving(false);
    }
  };

  const handlePickCover = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        setCoverFile(file);
        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
          setCoverPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handlePickEpub = (isSample: boolean = false) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.epub,application/epub+zip';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        if (isSample) {
          setEpubSampleFile(file);
        } else {
          setEpubFile(file);
        }
      }
    };
    input.click();
  };


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
          Add New Book
        </Text>
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
                    {categoriesLoading ? (
                      <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].primary} />
                    ) : (
                      categories.map((category) => (
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
                      ))
                    )}
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
                {coverPreview ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: coverPreview }} 
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
                          Change
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.imageButton, { backgroundColor: Colors[colorScheme ?? 'light'].error }]}
                        onPress={() => {
                          setCoverFile(null);
                          setCoverPreview(null);
                        }}
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
                      Recommended: 400x600px
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* EPUB File */}
              <View style={styles.fileSection}>
                <Text style={[styles.fileLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  EPUB File (Full Version)
                </Text>
                {epubFile ? (
                  <View style={[styles.fileChip, { backgroundColor: Colors[colorScheme ?? 'light'].accent + '10' }]}>
                    <Ionicons name="document" size={20} color={Colors[colorScheme ?? 'light'].accent} />
                    <View style={styles.fileChipInfo}>
                      <Text style={[styles.fileChipName, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {epubFile.name}
                      </Text>
                      <Text style={[styles.fileChipSize, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {(epubFile.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setEpubFile(null)}>
                      <Ionicons name="close-circle" size={24} color={Colors[colorScheme ?? 'light'].error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.uploadBox, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                    onPress={() => handlePickEpub(false)}
                  >
                    <Ionicons name="document-outline" size={40} color={Colors[colorScheme ?? 'light'].accent} />
                    <Text style={[styles.uploadText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Click to upload EPUB
                    </Text>
                    <Text style={[styles.uploadHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      .epub file format
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Sample EPUB File */}
              <View style={styles.fileSection}>
                <Text style={[styles.fileLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Sample EPUB (Optional)
                </Text>
                {epubSampleFile ? (
                  <View style={[styles.fileChip, { backgroundColor: Colors[colorScheme ?? 'light'].info + '10' }]}>
                    <Ionicons name="document-text" size={20} color={Colors[colorScheme ?? 'light'].info} />
                    <View style={styles.fileChipInfo}>
                      <Text style={[styles.fileChipName, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {epubSampleFile.name}
                      </Text>
                      <Text style={[styles.fileChipSize, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {(epubSampleFile.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setEpubSampleFile(null)}>
                      <Ionicons name="close-circle" size={24} color={Colors[colorScheme ?? 'light'].error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.uploadBox, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                    onPress={() => handlePickEpub(true)}
                  >
                    <Ionicons name="document-text-outline" size={40} color={Colors[colorScheme ?? 'light'].info} />
                    <Text style={[styles.uploadText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Click to upload sample
                    </Text>
                    <Text style={[styles.uploadHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Preview for free users
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Published Status */}
              <View style={styles.fileSection}>
                <Text style={[styles.fileLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Publication Status
                </Text>
                <TouchableOpacity
                  style={[
                    styles.publishCard,
                    {
                      backgroundColor: publishImmediately
                        ? Colors[colorScheme ?? 'light'].success + '10'
                        : Colors[colorScheme ?? 'light'].card,
                      borderColor: publishImmediately
                        ? Colors[colorScheme ?? 'light'].success
                        : Colors[colorScheme ?? 'light'].border,
                    },
                  ]}
                  onPress={() => setPublishImmediately(!publishImmediately)}
                >
                  <View style={styles.publishCardLeft}>
                    <Ionicons
                      name={publishImmediately ? 'checkmark-circle' : 'eye-off-outline'}
                      size={24}
                      color={publishImmediately ? Colors[colorScheme ?? 'light'].success : Colors[colorScheme ?? 'light'].textSecondary}
                    />
                    <View style={styles.publishCardInfo}>
                      <Text
                        style={[
                          styles.publishCardTitle,
                          {
                            color: publishImmediately
                              ? Colors[colorScheme ?? 'light'].success
                              : Colors[colorScheme ?? 'light'].text,
                          },
                        ]}
                      >
                        {publishImmediately ? 'Publish Immediately' : 'Save as Draft'}
                      </Text>
                      <Text style={[styles.publishCardHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {publishImmediately
                          ? 'Book will be visible in library'
                          : 'Book will be hidden until published'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.toggle,
                      {
                        backgroundColor: publishImmediately
                          ? Colors[colorScheme ?? 'light'].success
                          : Colors[colorScheme ?? 'light'].border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        {
                          backgroundColor: Colors[colorScheme ?? 'light'].dominicanWhite,
                          transform: [{ translateX: publishImmediately ? 22 : 2 }],
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Info Box */}
              <View style={[styles.infoBox, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '05' }]}>
                <Ionicons name="information-circle" size={18} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  All files are optional. You can add them now or later by editing the book.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <View style={styles.footerLeft}>
          <Text style={[styles.footerHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            * Required fields
          </Text>
        </View>
        <View style={styles.footerRight}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
            onPress={() => router.push('/admin/books')}
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
              <>
                <Ionicons name="checkmark" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                <Text style={[styles.saveButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Create Book
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  fileChipInfo: {
    flex: 1,
  },
  fileChipName: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 2,
  },
  fileChipSize: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Georgia',
    lineHeight: 18,
  },
  publishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
    cursor: 'pointer',
  },
  publishCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  publishCardInfo: {
    flex: 1,
  },
  publishCardTitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 2,
  },
  publishCardHint: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerLeft: {
    flex: 1,
  },
  footerHint: {
    fontSize: 13,
    fontFamily: 'Georgia',
  },
  footerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
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
    minWidth: 160,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
