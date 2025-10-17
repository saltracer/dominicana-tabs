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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminBookService, CreateBookData } from '../../../services/AdminBookService';
import { BookCategory } from '../../../types';
import { useBookCategories } from '../../../hooks/useBookCategories';

export default function NewBookScreen() {
  const { colorScheme } = useTheme();
  const { categories, loading: categoriesLoading } = useBookCategories();
  const [saving, setSaving] = useState(false);
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
  
  // Published status
  const [publishImmediately, setPublishImmediately] = useState(false);

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
    if (!formData.categories || formData.categories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }
    if (formData.categories.length > 10) {
      Alert.alert('Error', 'Maximum 10 categories allowed');
      return;
    }

    try {
      setSaving(true);
      
      // Parse long description into paragraphs (split by double line breaks)
      const paragraphs = longDescriptionText
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      const book = await AdminBookService.createBook({
        ...formData,
        long_description: paragraphs.length > 0 ? paragraphs : undefined,
        published: publishImmediately,
      });
      
      Alert.alert('Success', 'Book created successfully', [
        {
          text: 'OK',
          onPress: () => router.push(`/admin/books/${book.id}`),
        },
      ]);
    } catch (error) {
      console.error('Error creating book:', error);
      Alert.alert('Error', 'Failed to create book');
    } finally {
      setSaving(false);
    }
  };


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

          {/* Categories */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Categories * ({formData.categories.length}/10)
            </Text>
            <Text style={[styles.hint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Select 1-10 categories. Tap arrows to reorder.
            </Text>

            {/* Selected Categories */}
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
                          <Ionicons name="arrow-up" size={12} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
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
                          <Ionicons name="arrow-down" size={12} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => {
                          const newCategories = formData.categories.filter(c => c !== cat);
                          setFormData({ ...formData, categories: newCategories });
                        }}
                        style={styles.removeButton}
                      >
                        <Ionicons name="close" size={12} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Available Categories */}
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
              placeholder="Enter detailed description. Separate paragraphs with a blank line."
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              multiline
              numberOfLines={8}
            />
            <Text style={[styles.hint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Tip: Use double line breaks to create paragraphs
            </Text>
          </View>

          {/* Published Status */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Publication Status
            </Text>
            <TouchableOpacity
              style={[
                styles.publishToggle,
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
              <View style={styles.publishToggleLeft}>
                <Ionicons
                  name={publishImmediately ? 'checkmark-circle' : 'eye-off-outline'}
                  size={24}
                  color={publishImmediately ? Colors[colorScheme ?? 'light'].success : Colors[colorScheme ?? 'light'].textSecondary}
                />
                <View style={styles.publishToggleInfo}>
                  <Text
                    style={[
                      styles.publishToggleTitle,
                      {
                        color: publishImmediately
                          ? Colors[colorScheme ?? 'light'].success
                          : Colors[colorScheme ?? 'light'].text,
                      },
                    ]}
                  >
                    {publishImmediately ? 'Publish Immediately' : 'Save as Draft'}
                  </Text>
                  <Text style={[styles.publishToggleHint, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {publishImmediately
                      ? 'Book will be visible in library'
                      : 'Book will be hidden until published'}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggleSwitch,
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

          {/* Note about file uploads */}
          <View style={[styles.infoBox, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '10' }]}>
            <Ionicons name="information-circle" size={20} color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].text }]}>
              After creating the book, you can add cover images and EPUB files on the edit page.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
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
              Create Book
            </Text>
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
  hint: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#666',
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
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  selectedCategoryText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
    marginTop: 8,
  },
  categoryCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  categoryCheckboxText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  longTextArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 160,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 6,
    fontStyle: 'italic',
  },
  publishToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    borderWidth: 2,
  },
  publishToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  publishToggleInfo: {
    flex: 1,
  },
  publishToggleTitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 2,
  },
  publishToggleHint: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  toggleSwitch: {
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
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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

