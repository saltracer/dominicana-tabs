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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminBookService, BookFilters } from '../../../services/AdminBookService';
import { Book, BookCategory } from '../../../types';
import { useBookCategories } from '../../../hooks/useBookCategories';

export default function BooksListScreen() {
  const { colorScheme } = useTheme();
  const { categories, loading: categoriesLoading } = useBookCategories();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | undefined>();
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'year' | 'created_at' | 'published_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadBooks();
  }, [searchQuery, selectedCategory, publishedFilter, sortBy, sortOrder, page]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const filters: BookFilters = {};
      
      if (searchQuery) filters.search = searchQuery;
      if (selectedCategory) filters.category = selectedCategory;
      if (publishedFilter !== 'all') filters.publishedStatus = publishedFilter;
      filters.sortBy = sortBy;
      filters.sortOrder = sortOrder;

      const result = await AdminBookService.listBooks(filters, { page, limit: 20 });
      setBooks(result.books);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading books:', error);
      Alert.alert('Error', 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const sortOptions = [
    { value: 'title', label: 'Title (A-Z)', icon: 'text' },
    { value: 'author', label: 'Author (A-Z)', icon: 'person' },
    { value: 'year', label: 'Year', icon: 'calendar' },
    { value: 'created_at', label: 'Recently Added', icon: 'time' },
    { value: 'published_at', label: 'Recently Published', icon: 'checkmark-circle' },
  ] as const;

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    const directionLabel = sortOrder === 'asc' ? '↑' : '↓';
    return option ? `${option.label} ${directionLabel}` : 'Sort';
  };

  const handleDeleteBook = async (book: Book) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminBookService.deleteBook(book.id);
              Alert.alert('Success', 'Book deleted successfully');
              loadBooks();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete book');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Manage Books
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={() => router.push('/admin/books/new')}
        >
          <Ionicons name="add" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          <Text style={[styles.addButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
            Add Book
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={[styles.filters, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Search books..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Sort Selector */}
        <View style={styles.sortContainer}>
          <Ionicons name="swap-vertical" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <Text style={[styles.sortLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Sort:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortChip,
                  sortBy === option.value && {
                    backgroundColor: Colors[colorScheme ?? 'light'].primary,
                  },
                ]}
                onPress={() => {
                  if (sortBy === option.value) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(option.value);
                    setSortOrder(option.value === 'created_at' || option.value === 'published_at' ? 'desc' : 'asc');
                  }
                  setPage(1);
                }}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    {
                      color: sortBy === option.value
                        ? Colors[colorScheme ?? 'light'].dominicanWhite
                        : Colors[colorScheme ?? 'light'].text,
                    },
                  ]}
                >
                  {option.label} {sortBy === option.value && (sortOrder === 'asc' ? '↑' : '↓')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Published Status Filter */}
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Status:
          </Text>
          {(['all', 'published', 'draft'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                publishedFilter === status && {
                  backgroundColor: Colors[colorScheme ?? 'light'].primary,
                },
              ]}
              onPress={() => {
                setPublishedFilter(status);
                setPage(1);
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: publishedFilter === status
                      ? Colors[colorScheme ?? 'light'].dominicanWhite
                      : Colors[colorScheme ?? 'light'].text,
                  },
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && {
                backgroundColor: Colors[colorScheme ?? 'light'].primary,
              },
            ]}
            onPress={() => {
              setSelectedCategory(undefined);
              setPage(1);
            }}
          >
            <Text
              style={[
                styles.categoryChipText,
                {
                  color: !selectedCategory
                    ? Colors[colorScheme ?? 'light'].dominicanWhite
                    : Colors[colorScheme ?? 'light'].text,
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categoriesLoading ? (
            <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].primary} />
          ) : (
            categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && {
                    backgroundColor: Colors[colorScheme ?? 'light'].primary,
                  },
                ]}
                onPress={() => {
                  setSelectedCategory(category);
                  setPage(1);
                }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color:
                        selectedCategory === category
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
        </ScrollView>
      </View>

      {/* Books List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {books.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No books found
              </Text>
            </View>
          ) : (
            books.map((book) => (
              <View
                key={book.id}
                style={[styles.bookCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              >
                <View style={styles.bookInfo}>
                  <Text style={[styles.bookTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {book.title}
                  </Text>
                  <Text style={[styles.bookAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {book.author}
                    {book.year && ` (${book.year})`}
                  </Text>
                  {book.publishedAt && (
                    <Text style={[styles.publishedDate, { color: Colors[colorScheme ?? 'light'].success }]}>
                      Published: {new Date(book.publishedAt).toLocaleDateString()}
                    </Text>
                  )}
                  <View style={styles.bookMeta}>
                    {/* Categories (show first 3 + more indicator) */}
                    <View style={styles.categoryBadges}>
                      {book.categories.slice(0, 3).map((category) => (
                        <View key={category} style={[styles.categoryBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                          <Text style={[styles.categoryBadgeText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                            {category}
                          </Text>
                        </View>
                      ))}
                      {book.categories.length > 3 && (
                        <Text style={[styles.moreBadge, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                          +{book.categories.length - 3}
                        </Text>
                      )}
                    </View>
                    {/* Published Status Badge */}
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: book.published
                            ? Colors[colorScheme ?? 'light'].success + '10'
                            : Colors[colorScheme ?? 'light'].textMuted + '10',
                        },
                      ]}
                    >
                      <Ionicons
                        name={book.published ? 'checkmark-circle' : 'eye-off'}
                        size={12}
                        color={book.published ? Colors[colorScheme ?? 'light'].success : Colors[colorScheme ?? 'light'].textMuted}
                      />
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: book.published
                              ? Colors[colorScheme ?? 'light'].success
                              : Colors[colorScheme ?? 'light'].textMuted,
                          },
                        ]}
                      >
                        {book.published ? 'Published' : 'Draft'}
                      </Text>
                    </View>
                    {book.coverImage && (
                      <View style={[styles.badge, { backgroundColor: Colors[colorScheme ?? 'light'].success + '10' }]}>
                        <Ionicons name="image" size={12} color={Colors[colorScheme ?? 'light'].success} />
                        <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].success }]}>
                          Cover
                        </Text>
                      </View>
                    )}
                    {book.epubPath && (
                      <View style={[styles.badge, { backgroundColor: Colors[colorScheme ?? 'light'].accent + '10' }]}>
                        <Ionicons name="document" size={12} color={Colors[colorScheme ?? 'light'].accent} />
                        <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].accent }]}>
                          EPUB
                        </Text>
                      </View>
                    )}
                    {book.epubSamplePath && (
                      <View style={[styles.badge, { backgroundColor: Colors[colorScheme ?? 'light'].info + '10' }]}>
                        <Ionicons name="document-text" size={12} color={Colors[colorScheme ?? 'light'].info} />
                        <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].info }]}>
                          Sample
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.bookActions}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => router.push(`/admin/books/${book.id}`)}
                  >
                    <Ionicons name="create-outline" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleDeleteBook(book)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors[colorScheme ?? 'light'].error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  page === 1 && styles.pageButtonDisabled,
                  { backgroundColor: Colors[colorScheme ?? 'light'].card },
                ]}
                onPress={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={page === 1 ? Colors[colorScheme ?? 'light'].textMuted : Colors[colorScheme ?? 'light'].text}
                />
              </TouchableOpacity>
              <Text style={[styles.pageText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Page {page} of {totalPages}
              </Text>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  page === totalPages && styles.pageButtonDisabled,
                  { backgroundColor: Colors[colorScheme ?? 'light'].card },
                ]}
                onPress={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    page === totalPages
                      ? Colors[colorScheme ?? 'light'].textMuted
                      : Colors[colorScheme ?? 'light'].text
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  filters: {
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  sortScroll: {
    flexGrow: 0,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sortChipText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
  },
  bookCard: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  publishedDate: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  bookMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  categoryBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  moreBadge: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  bookActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  iconButton: {
    padding: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  pageButton: {
    padding: 8,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});

