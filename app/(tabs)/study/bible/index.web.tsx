/**
 * Bible Index Web - Grid-based Navigation
 * Shows all Bible books in canonical order with testament sections
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { useBible } from '../../../../contexts/BibleContext';
import { bibleService } from '../../../../services/BibleService.web';
import { multiVersionBibleService } from '../../../../services/MultiVersionBibleService';
import BibleVersionSelector from '../../../../components/BibleVersionSelector';
import { VersionBibleBook } from '../../../../types/bible-version-types';
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS, getTestamentColor } from '../../../../constants/bibleBookOrder';

export default function BibleIndexWebScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentVersion, setCurrentVersion } = useBible();
  const [books, setBooks] = useState<VersionBibleBook[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, [currentVersion]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      let bibleBooks: VersionBibleBook[];
      
      if (currentVersion === 'douay-rheims') {
        const originalBooks = await bibleService.getAvailableBooks();
        bibleBooks = originalBooks.map(book => ({
          code: book.code,
          title: book.title,
          shortTitle: book.shortTitle,
          abbreviation: book.abbreviation,
          category: book.category,
          order: book.order,
          chapters: book.chapters,
          versionId: 'douay-rheims',
          available: true,
        }));
      } else {
        bibleBooks = await multiVersionBibleService.getAvailableBooks();
      }
      
      setBooks(bibleBooks);
    } catch (error) {
      console.error('Error loading Bible books:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sort books by canonical order
  const sortedBooks = useMemo(() => {
    const bookMap = new Map(books.map(b => [b.code, b]));
    const sorted: VersionBibleBook[] = [];

    // Add OT books in canonical order
    OLD_TESTAMENT_BOOKS.forEach(canonicalBook => {
      const book = bookMap.get(canonicalBook.code);
      if (book) {
        sorted.push(book);
      }
    });

    // Add NT books in canonical order
    NEW_TESTAMENT_BOOKS.forEach(canonicalBook => {
      const book = bookMap.get(canonicalBook.code);
      if (book) {
        sorted.push(book);
      }
    });

    return sorted;
  }, [books]);

  // Filter books by search
  const filteredBooks = useMemo(() => {
    if (!searchText.trim()) return sortedBooks;

    const query = searchText.toLowerCase();
    return sortedBooks.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.shortTitle.toLowerCase().includes(query) ||
      book.abbreviation.toLowerCase().includes(query)
    );
  }, [sortedBooks, searchText]);

  // Group by testament
  const oldTestamentBooks = filteredBooks.filter(b => b.category === 'old-testament' || b.category === 'deuterocanonical');
  const newTestamentBooks = filteredBooks.filter(b => b.category === 'new-testament');

  const handleBookPress = (book: VersionBibleBook) => {
    router.push(`/(tabs)/study/bible/${book.code}?version=${currentVersion}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading Bible books...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Sacred Scripture
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Version Selector */}
      <View style={styles.versionContainer}>
        <BibleVersionSelector
          currentVersion={currentVersion}
          onVersionChange={setCurrentVersion}
          style={styles.versionSelector}
        />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search Bible books..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Old Testament Section */}
        {oldTestamentBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Old Testament
            </Text>
            
            <View style={styles.bookGrid}>
              {oldTestamentBooks.map((book) => {
                const bookInfo = OLD_TESTAMENT_BOOKS.find(b => b.code === book.code);
                const chapters = bookInfo?.chapters || 50;
                const isDeutero = bookInfo?.isDeuterocanonical || false;
                
                return (
                  <TouchableOpacity
                    key={book.code}
                    style={[
                      styles.bookCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isDeutero ? '#DAA520' : getTestamentColor('old-testament'),
                      },
                    ]}
                    onPress={() => handleBookPress(book)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.bookAbbreviation, { color: colors.text }]} numberOfLines={1}>
                      {book.abbreviation}
                    </Text>
                    <Text style={[styles.chapterCount, { color: colors.textSecondary }]}>
                      {chapters} ch
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* New Testament Section */}
        {newTestamentBooks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              New Testament
            </Text>
            
            <View style={styles.bookGrid}>
              {newTestamentBooks.map((book) => {
                const bookInfo = NEW_TESTAMENT_BOOKS.find(b => b.code === book.code);
                const chapters = bookInfo?.chapters || 28;
                
                return (
                  <TouchableOpacity
                    key={book.code}
                    style={[
                      styles.bookCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: getTestamentColor('new-testament'),
                      },
                    ]}
                    onPress={() => handleBookPress(book)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.bookAbbreviation, { color: colors.text }]} numberOfLines={1}>
                      {book.abbreviation}
                    </Text>
                    <Text style={[styles.chapterCount, { color: colors.textSecondary }]}>
                      {chapters} ch
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No books found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Try a different search term
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  versionContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  versionSelector: {
    marginVertical: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  bookCard: {
    width: 90,
    height: 110,
    borderRadius: 8,
    borderWidth: 2,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  bookAbbreviation: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  chapterCount: {
    fontSize: 12,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 8,
  },
});
