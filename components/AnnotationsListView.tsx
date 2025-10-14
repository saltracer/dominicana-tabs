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
    
    // Extract more details from bookmark data
    const bookmarkData = annotation.data as any;
    let chapterInfo = '';
    try {
      const locData = JSON.parse(bookmarkData.location);
      if (locData.title) {
        chapterInfo = locData.title;
      }
      const progress = locData.locations?.totalProgression;
      if (progress) {
        chapterInfo += ` • ${Math.round(progress * 100)}%`;
      }
    } catch (e) {
      chapterInfo = annotation.location;
    }

    return (
      <View
        key={annotation.id}
        style={[styles.annotationCard, { backgroundColor: colors.surface, borderLeftWidth: 3, borderLeftColor: highlightColor || colors.primary }]}
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
              <View style={styles.locationInfo}>
                <Text style={[styles.location, { color: colors.text }]}>
                  {chapterInfo || annotation.location}
                </Text>
                <Text style={[styles.date, { color: colors.textMuted }]}>
                  {new Date(annotation.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Highlighted Text */}
          {annotation.text && (
            <Text style={[styles.highlightedText, { color: colors.text }]} numberOfLines={2}>
              "{annotation.text}"
            </Text>
          )}

          {/* Note Preview */}
          {annotation.note && (
            <View style={[styles.noteContainer, { backgroundColor: colors.card }]}>
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
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
    >
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? (insets.top || StatusBar.currentHeight || 24) : 0 }]}>
        {/* Pull indicator for swipe to dismiss */}
        {Platform.OS === 'ios' && (
          <View style={styles.pullIndicatorContainer}>
            <View style={[styles.pullIndicator, { backgroundColor: colors.textMuted }]} />
          </View>
        )}
        
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
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {(['all', 'bookmarks', 'highlights', 'notes'] as FilterType[]).map(filterType => (
              <TouchableOpacity
                key={filterType}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: filter === filterType ? colors.primary : colors.surface,
                    borderColor: filter === filterType ? colors.primary : colors.border,
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
        </View>

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
  pullIndicatorContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  pullIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterScrollContent: {
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
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
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  annotationContent: {
    marginBottom: 10,
  },
  annotationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  location: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    fontFamily: 'Georgia',
    marginTop: 2,
  },
  highlightedText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
    marginTop: 6,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  noteContainer: {
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#DAA520',
  },
  noteText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    lineHeight: 18,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
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

