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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminBookService, CreateBookData } from '../../../services/AdminBookService';
import { BookCategory } from '../../../types';

const CATEGORIES: BookCategory[] = [
  'Philosophy',
  'Theology',
  'Mysticism',
  'Science',
  'Natural History',
];

export default function NewBookScreenWeb() {
  const { colorScheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateBookData>({
    title: '',
    author: '',
    year: '',
    category: 'Theology',
    description: '',
    long_description: [''],
  });

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
      const book = await AdminBookService.createBook({
        ...formData,
        long_description: formData.long_description?.filter(p => p.trim()) || undefined,
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

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Back Button */}
      <View style={[styles.topBar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/admin/books')}
        >
          <Ionicons name="arrow-back" size={20} color={Colors[colorScheme ?? 'light'].text} />
          <Text style={[styles.backButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Back to Books
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  form: {
    padding: 24,
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
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'flex-end',
  },
  saveButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
    minWidth: 140,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});

