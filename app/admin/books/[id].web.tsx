import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminBookService, CreateBookData } from '../../../services/AdminBookService';
import { Book, BookCategory } from '../../../types';
import { useBookCategories } from '../../../hooks/useBookCategories';

export default function EditBookScreenWeb() {
  const { colorScheme } = useTheme();
  const { categories, loading: categoriesLoading } = useBookCategories();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<CreateBookData>({
    title: '',
    author: '',
    year: '',
    categories: [],
    description: '',
    long_description: [],
  });
  
  // Single long description text
  const [longDescriptionText, setLongDescriptionText] = useState('');
  
  // Unpublish confirmation modal
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);

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
        categories: bookData.categories || [],
        description: bookData.description,
        long_description: bookData.longDescription || [],
        published: bookData.published,
      });
      
      // Convert long_description array to text with double line breaks
      if (bookData.longDescription && bookData.longDescription.length > 0) {
        setLongDescriptionText(bookData.longDescription.join('\n\n'));
      }
    } catch (error) {
      console.error('Error loading book:', error);
      window.alert('Failed to load book details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      window.alert('Please enter a book title');
      return;
    }
    if (!formData.author.trim()) {
      window.alert('Please enter an author name');
      return;
    }
    if (!formData.description.trim()) {
      window.alert('Please enter a description');
      return;
    }
    if (!formData.categories || formData.categories.length === 0) {
      window.alert('Please select at least one category');
      return;
    }
    if (formData.categories.length > 10) {
      window.alert('Maximum 10 categories allowed');
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
      
      window.alert('Book updated successfully');
      loadBook();
    } catch (error) {
      console.error('Error updating book:', error);
      window.alert('Failed to update book');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = () => {
    if (!window.confirm(`Are you sure you want to delete "${book?.title}"? This action cannot be undone and will delete all associated files.`)) {
      return;
    }
    
    (async () => {
      try {
        await AdminBookService.deleteBook(Number(id));
        window.alert('Book deleted successfully');
        router.push('/admin/books');
      } catch (error) {
        window.alert('Failed to delete book');
      }
    })();
  };

  const handleTogglePublished = async () => {
    if (!book) return;

    // If unpublishing, show in-app confirmation
    if (book.published) {
      setShowUnpublishConfirm(true);
    } else {
      // Publishing - just do it
      try {
        await AdminBookService.publishBook(book.id);
        await loadBook();
      } catch (error) {
        console.error('Publish error:', error);
        alert('Error: Failed to publish book');
      }
    }
  };

  const confirmUnpublish = async () => {
    if (!book) return;
    
    try {
      setShowUnpublishConfirm(false);
      await AdminBookService.unpublishBook(book.id);
      await loadBook();
    } catch (error) {
      console.error('❌ Unpublish error:', error);
      alert('Error: Failed to unpublish book');
    }
  };

  const cancelUnpublish = () => {
    setShowUnpublishConfirm(false);
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
        window.alert('Cover image uploaded successfully');
        loadBook();
      } catch (error) {
        console.error('Error uploading cover:', error);
        window.alert('Failed to upload cover image');
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
        window.alert(`${isSample ? 'Sample ' : ''}EPUB uploaded successfully`);
        loadBook();
      } catch (error) {
        console.error('Error uploading EPUB:', error);
        window.alert(`Failed to upload ${isSample ? 'sample ' : ''}EPUB`);
      }
    };
    input.click();
  };

  const handleDeleteCover = () => {
    if (!window.confirm('Remove the cover image?')) {
      return;
    }
    
    (async () => {
      try {
        await AdminBookService.deleteCoverImage(Number(id));
        window.alert('Cover image deleted');
        loadBook();
      } catch (error) {
        window.alert('Failed to delete cover');
      }
    })();
  };

  const handleDeleteEpub = (isSample: boolean = false) => {
    if (!window.confirm(`Remove the ${isSample ? 'sample ' : ''}EPUB file?`)) {
      return;
    }
    
    (async () => {
      try {
        await AdminBookService.deleteEpubFile(Number(id), isSample);
        window.alert(`${isSample ? 'Sample ' : ''}EPUB deleted`);
        loadBook();
      } catch (error) {
        window.alert(`Failed to delete ${isSample ? 'sample ' : ''}EPUB`);
      }
    })();
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
      {/* Unpublish Confirmation Modal */}
      {showUnpublishConfirm && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Unpublish Book
            </Text>
            <Text style={[styles.modalMessage, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              This will hide the book from the public library. Users will no longer be able to see or access it.
            </Text>
            <Text style={[styles.modalMessage, { color: Colors[colorScheme ?? 'light'].textSecondary, marginTop: 8 }]}>
              Continue?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: Colors[colorScheme ?? 'light'].border }]}
                onPress={cancelUnpublish}
              >
                <Text style={[styles.modalButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: Colors[colorScheme ?? 'light'].error }]}
                onPress={confirmUnpublish}
              >
                <Text style={[styles.modalButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Unpublish
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Header with Back Button and Status */}
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
        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: book?.published
                ? Colors[colorScheme ?? 'light'].success + '20'
                : Colors[colorScheme ?? 'light'].textMuted + '20',
            },
          ]}
        >
          <Ionicons
            name={book?.published ? 'checkmark-circle' : 'eye-off'}
            size={16}
            color={book?.published ? Colors[colorScheme ?? 'light'].success : Colors[colorScheme ?? 'light'].textMuted}
          />
          <Text
            style={[
              styles.statusBadgeText,
              {
                color: book?.published
                  ? Colors[colorScheme ?? 'light'].success
                  : Colors[colorScheme ?? 'light'].textMuted,
              },
            ]}
          >
            {book?.published ? 'Published' : 'Draft'}
          </Text>
        </View>
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
                    Categories * ({formData.categories.length}/10)
                  </Text>
                  <Text style={[styles.hint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Select 1-10 categories. Click to add/remove, drag to reorder.
                  </Text>
                  
                  {/* Selected Categories with Reordering */}
                  {formData.categories.length > 0 && (
                    <View style={styles.selectedCategoriesContainer}>
                      {formData.categories.map((cat, index) => (
                        <View key={`selected-${cat}`} style={[styles.selectedCategoryChip, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                          <Text style={[styles.selectedCategoryText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                            {cat}
                          </Text>
                          <View style={styles.categoryActions}>
                            {index > 0 && (
                              <TouchableOpacity
                                onPress={() => {
                                  const newCategories = [...formData.categories];
                                  [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
                                  setFormData({ ...formData, categories: newCategories });
                                }}
                                style={styles.reorderButton}
                              >
                                <Ionicons name="arrow-up" size={14} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                              </TouchableOpacity>
                            )}
                            {index < formData.categories.length - 1 && (
                              <TouchableOpacity
                                onPress={() => {
                                  const newCategories = [...formData.categories];
                                  [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
                                  setFormData({ ...formData, categories: newCategories });
                                }}
                                style={styles.reorderButton}
                              >
                                <Ionicons name="arrow-down" size={14} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              onPress={() => {
                                const newCategories = formData.categories.filter(c => c !== cat);
                                setFormData({ ...formData, categories: newCategories });
                              }}
                              style={styles.removeButton}
                            >
                              <Ionicons name="close" size={14} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Available Categories (checkboxes) */}
                  <View style={styles.categoryGrid}>
                    {categoriesLoading ? (
                      <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].primary} />
                    ) : (
                      categories.map((category) => {
                        const isSelected = formData.categories.includes(category);
                        const isMaxReached = formData.categories.length >= 10 && !isSelected;
                        return (
                          <TouchableOpacity
                            key={category}
                            style={[
                              styles.categoryCheckbox,
                              {
                                backgroundColor: isSelected
                                  ? Colors[colorScheme ?? 'light'].primary + '15'
                                  : Colors[colorScheme ?? 'light'].card,
                                borderColor: isSelected
                                  ? Colors[colorScheme ?? 'light'].primary
                                  : Colors[colorScheme ?? 'light'].border,
                                opacity: isMaxReached ? 0.5 : 1,
                              },
                            ]}
                            onPress={() => {
                              if (isMaxReached) return;
                              if (isSelected) {
                                setFormData({
                                  ...formData,
                                  categories: formData.categories.filter(c => c !== category),
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  categories: [...formData.categories, category],
                                });
                              }
                            }}
                            disabled={isMaxReached}
                          >
                            <Ionicons
                              name={isSelected ? 'checkbox' : 'square-outline'}
                              size={20}
                              color={isSelected ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary}
                            />
                            <Text
                              style={[
                                styles.categoryCheckboxText,
                                {
                                  color: isSelected
                                    ? Colors[colorScheme ?? 'light'].primary
                                    : Colors[colorScheme ?? 'light'].text,
                                },
                              ]}
                            >
                              {category}
                            </Text>
                          </TouchableOpacity>
                        );
                      })
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
                {book?.coverImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: `${book.coverImage}?t=${Date.now()}` }} 
                      style={styles.imagePreview}
                      resizeMode="contain"
                      key={book.coverImage}
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

              {/* Published Status Toggle */}
              <View style={styles.fileSection}>
                <Text style={[styles.fileLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Publication Status
                </Text>
                <TouchableOpacity
                  style={[
                    styles.publishCard,
                    {
                      backgroundColor: book?.published
                        ? Colors[colorScheme ?? 'light'].success + '10'
                        : Colors[colorScheme ?? 'light'].card,
                      borderColor: book?.published
                        ? Colors[colorScheme ?? 'light'].success
                        : Colors[colorScheme ?? 'light'].border,
                    },
                  ]}
                  onPress={handleTogglePublished}
                  activeOpacity={0.7}
                >
                  <View style={styles.publishCardLeft} pointerEvents="none">
                    <Ionicons
                      name={book?.published ? 'checkmark-circle' : 'eye-off-outline'}
                      size={24}
                      color={book?.published ? Colors[colorScheme ?? 'light'].success : Colors[colorScheme ?? 'light'].textSecondary}
                    />
                    <View style={styles.publishCardInfo}>
                      <Text
                        style={[
                          styles.publishCardTitle,
                          {
                            color: book?.published
                              ? Colors[colorScheme ?? 'light'].success
                              : Colors[colorScheme ?? 'light'].text,
                          },
                        ]}
                      >
                        {book?.published ? 'Published' : 'Draft'}
                      </Text>
                      <Text style={[styles.publishCardHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {book?.published
                          ? 'Visible in library'
                          : 'Hidden from library'}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.toggle,
                      {
                        backgroundColor: book?.published
                          ? Colors[colorScheme ?? 'light'].success
                          : Colors[colorScheme ?? 'light'].border,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        {
                          backgroundColor: Colors[colorScheme ?? 'light'].dominicanWhite,
                          transform: [{ translateX: book?.published ? 22 : 2 }],
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
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
                {book?.publishedAt && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, { color: Colors[colorScheme ?? 'light'].success }]}>
                      Published
                    </Text>
                    <Text style={[styles.metaValue, { color: Colors[colorScheme ?? 'light'].success }]}>
                      {new Date(book.publishedAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '600',
    textTransform: 'uppercase',
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
  hint: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 4,
    marginBottom: 8,
  },
  selectedCategoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  selectedCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  selectedCategoryText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reorderButton: {
    padding: 2,
  },
  removeButton: {
    padding: 2,
    marginLeft: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    cursor: 'pointer',
  },
  categoryCheckboxText: {
    fontSize: 14,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Georgia',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonConfirm: {
    // backgroundColor set inline
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
