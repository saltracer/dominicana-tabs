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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminBookService, BookFilters } from '../../../services/AdminBookService';
import { Book, BookCategory } from '../../../types';
import { useBookCategories } from '../../../hooks/useBookCategories';

export default function BooksListScreenWeb() {
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

  const handleSort = (column: 'title' | 'author' | 'year' | 'created_at' | 'published_at') => {
    if (sortBy === column) {
      // Toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending for text, descending for dates
      setSortBy(column);
      setSortOrder(column === 'created_at' || column === 'published_at' ? 'desc' : 'asc');
    }
    setPage(1); // Reset to first page when sorting changes
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
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <View>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Manage Books
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </Text>
        </View>
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
          {(searchQuery.length > 0 || selectedCategory) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory(undefined);
              }}
            >
              <Ionicons name="close-circle" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Published Status Filter */}
        <View style={styles.filterRow}>
          {(['all Status', 'published', 'draft'] as const).map((status) => (
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
        <View style={styles.categoryRow}>
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
              All Categories
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
        </View>
      </View>

      {/* Books Table */}
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
            <View style={[styles.table, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              {/* Table Header */}
              <View style={[styles.tableHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
                <TouchableOpacity 
                  style={[styles.headerCell, styles.titleColumn, styles.sortableHeader]}
                  onPress={() => handleSort('title')}
                >
                  <Text style={[styles.headerCellText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Title</Text>
                  {sortBy === 'title' && (
                    <Ionicons 
                      name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                      size={14} 
                      color={Colors[colorScheme ?? 'light'].primary} 
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.headerCell, styles.authorColumn, styles.sortableHeader]}
                  onPress={() => handleSort('author')}
                >
                  <Text style={[styles.headerCellText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Author</Text>
                  {sortBy === 'author' && (
                    <Ionicons 
                      name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                      size={14} 
                      color={Colors[colorScheme ?? 'light'].primary} 
                    />
                  )}
                </TouchableOpacity>
                <View style={[styles.headerCell, styles.categoryColumn]}>
                  <Text style={[styles.headerCellText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Category
                  </Text>
                </View>
                <View style={[styles.headerCell, styles.statusColumn]}>
                  <Text style={[styles.headerCellText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Status
                  </Text>
                </View>
                <View style={[styles.headerCell, styles.filesColumn]}>
                  <Text style={[styles.headerCellText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Files
                  </Text>
                </View>
                <View style={[styles.headerCell, styles.actionsColumn]}>
                  <Text style={[styles.headerCellText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Actions
                  </Text>
                </View>
              </View>

              {/* Table Rows */}
              {books.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={[styles.tableRow, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}
                  onPress={() => router.push(`/admin/books/${book.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.tableCell, styles.titleColumn]}>
                    <Text style={[styles.bookTitle, styles.clickableTitle, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      {book.title}
                    </Text>
                    {book.year && (
                      <Text style={[styles.bookYear, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {book.year}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.tableCell, styles.authorColumn]}
                    onPress={(e) => {
                      e.stopPropagation();
                      setSearchQuery(book.author);
                    }}
                  >
                    <Text style={[styles.authorName, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      {book.author}
                    </Text>
                  </TouchableOpacity>
                  <View style={[styles.tableCell, styles.categoryColumn]}>
                    <View style={[styles.categoryBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                      <Text style={[styles.categoryBadgeText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                        {book.category}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, styles.statusColumn]}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: book.published
                            ? Colors[colorScheme ?? 'light'].success + '15'
                            : Colors[colorScheme ?? 'light'].textMuted + '15',
                        },
                      ]}
                    >
                      <Ionicons
                        name={book.published ? 'checkmark-circle' : 'eye-off'}
                        size={14}
                        color={book.published ? Colors[colorScheme ?? 'light'].success : Colors[colorScheme ?? 'light'].textMuted}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
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
                  </View>
                  <View style={[styles.tableCell, styles.filesColumn, styles.filesBadges]}>
                    {book.coverImage && (
                      <View style={[styles.fileBadge, { backgroundColor: Colors[colorScheme ?? 'light'].success + '10' }]}>
                        <Ionicons name="image" size={12} color={Colors[colorScheme ?? 'light'].success} />
                      </View>
                    )}
                    {book.epubPath && (
                      <View style={[styles.fileBadge, { backgroundColor: Colors[colorScheme ?? 'light'].accent + '10' }]}>
                        <Ionicons name="document" size={12} color={Colors[colorScheme ?? 'light'].accent} />
                      </View>
                    )}
                    {book.epubSamplePath && (
                      <View style={[styles.fileBadge, { backgroundColor: Colors[colorScheme ?? 'light'].info + '10' }]}>
                        <Ionicons name="document-text" size={12} color={Colors[colorScheme ?? 'light'].info} />
                      </View>
                    )}
                  </View>
                  <View style={[styles.tableCell, styles.actionsColumn, styles.actions]}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '10' }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/books/${book.id}`);
                      }}
                    >
                      <Ionicons name="create" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].error + '10' }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteBook(book);
                      }}
                    >
                      <Ionicons name="trash" size={16} color={Colors[colorScheme ?? 'light'].error} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
    </View>
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  filters: {
    padding: 24,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  clearButton: {
    padding: 4,
    cursor: 'pointer',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginRight: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    cursor: 'pointer',
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    cursor: 'pointer',
  },
  categoryChipText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
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
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
  },
  table: {
    margin: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 2,
    backgroundColor: '#F5F5F5',
  },
  headerCell: {
    justifyContent: 'center',
  },
  headerCellText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sortableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    cursor: 'pointer',
  },
  tableCell: {
    justifyContent: 'center',
  },
  titleColumn: {
    flex: 3,
  },
  authorColumn: {
    flex: 2,
  },
  categoryColumn: {
    flex: 2,
  },
  statusColumn: {
    flex: 2,
  },
  filesColumn: {
    flex: 1.5,
  },
  actionsColumn: {
    flex: 1.5,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  bookYear: {
    fontSize: 13,
    fontFamily: 'Georgia',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  clickableTitle: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    cursor: 'pointer',
  },
  authorName: {
    fontSize: 14,
    fontFamily: 'Georgia',
    cursor: 'pointer',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  filesBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  fileBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  pageButton: {
    padding: 12,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
});

