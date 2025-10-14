import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { Annotation, HighlightColor } from '../types';

interface AnnotationsListViewProps {
  visible: boolean;
  annotations: Annotation[];
  onClose: () => void;
  onNavigateToAnnotation: (annotation: Annotation) => void;
  onDeleteAnnotation: (annotation: Annotation) => void;
  onEditNote: (annotation: Annotation) => void;
}

type FilterType = 'all' | 'bookmarks' | 'highlights' | 'notes';

export const AnnotationsListView: React.FC<AnnotationsListViewProps> = ({
  visible,
  annotations,
  onClose,
  onNavigateToAnnotation,
  onDeleteAnnotation,
  onEditNote,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter annotations
  const filteredAnnotations = annotations.filter(annotation => {
    // Apply type filter
    if (filter === 'bookmarks' && annotation.type !== 'bookmark') return false;
    if (filter === 'highlights' && annotation.type !== 'highlight') return false;
    if (filter === 'notes' && !annotation.note) return false;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesText = annotation.text?.toLowerCase().includes(query);
      const matchesNote = annotation.note?.toLowerCase().includes(query);
      const matchesLocation = annotation.location.toLowerCase().includes(query);
      return matchesText || matchesNote || matchesLocation;
    }

    return true;
  });

  const handleDelete = (annotation: Annotation) => {
    Alert.alert(
      'Delete Annotation',
      `Are you sure you want to delete this ${annotation.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteAnnotation(annotation),
        },
      ]
    );
  };

  const getHighlightColor = (color?: HighlightColor) => {
    if (!color) return colors.primary;
    return colors.highlight[color] as string;
  };

  const renderAnnotation = (annotation: Annotation) => {
    const isBookmark = annotation.type === 'bookmark';
    const highlightColor = annotation.color ? getHighlightColor(annotation.color) : undefined;

    return (
      <View
        key={annotation.id}
        style={[styles.annotationCard, { backgroundColor: colors.surface }]}
      >
        <TouchableOpacity
          style={styles.annotationContent}
          onPress={() => onNavigateToAnnotation(annotation)}
          activeOpacity={0.7}
        >
          {/* Icon and Type */}
          <View style={styles.annotationHeader}>
            <View style={styles.typeInfo}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: highlightColor || colors.primary + '20' }
              ]}>
                <Ionicons
                  name={isBookmark ? 'bookmark' : 'color-fill'}
                  size={16}
                  color={highlightColor || colors.primary}
                />
              </View>
              <Text style={[styles.location, { color: colors.textSecondary }]}>
                {annotation.location}
              </Text>
            </View>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {new Date(annotation.created_at).toLocaleDateString()}
            </Text>
          </View>

          {/* Highlighted Text */}
          {annotation.text && (
            <Text style={[styles.highlightedText, { color: colors.text }]} numberOfLines={3}>
              {annotation.text}
            </Text>
          )}

          {/* Note */}
          {annotation.note && (
            <View style={[styles.noteContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="document-text" size={14} color={colors.textSecondary} />
              <Text style={[styles.noteText, { color: colors.textSecondary }]} numberOfLines={2}>
                {annotation.note}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => onEditNote(annotation)}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>
              {annotation.note ? 'Edit' : 'Add'} Note
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.card }]}
            onPress={() => handleDelete(annotation)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top || (Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24) }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Annotations ({filteredAnnotations.length})
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search annotations..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {(['all', 'bookmarks', 'highlights', 'notes'] as FilterType[]).map(filterType => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterTab,
                {
                  backgroundColor: filter === filterType ? colors.primary : colors.surface,
                  borderColor: colors.border,
                }
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === filterType ? colors.dominicanWhite : colors.text }
                ]}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Annotations List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredAnnotations.length > 0 ? (
            filteredAnnotations.map(renderAnnotation)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {filter === 'all' 
                  ? 'No annotations yet'
                  : `No ${filter} found`}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                {searchQuery 
                  ? 'Try a different search term'
                  : 'Start adding bookmarks and highlights while reading'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44, // Ensure touch target is large enough
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Georgia',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  annotationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  annotationContent: {
    marginBottom: 12,
  },
  annotationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Georgia',
    flex: 1,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  highlightedText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    lineHeight: 22,
    marginTop: 8,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Georgia',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

