import React, { useState, useEffect } from 'react';
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
import { bibleService, BibleBook } from '../../../../services/BibleService.web';

export default function BibleIndexWebScreen() {
  const { colorScheme } = useTheme();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BibleBook[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchText.toLowerCase()) ||
        book.shortTitle.toLowerCase().includes(searchText.toLowerCase()) ||
        book.abbreviation.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [searchText, books]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const bibleBooks = await bibleService.getAvailableBooks();
      setBooks(bibleBooks);
      setFilteredBooks(bibleBooks);
    } catch (error) {
      console.error('Error loading Bible books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (book: BibleBook) => {
    router.push(`/(tabs)/study/bible/${book.code}`);
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/study/bible/search');
  };

  const renderBookSection = (title: string, books: BibleBook[]) => (
    <View key={title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
        {title}
      </Text>
      <View style={styles.booksGrid}>
        {books.map((book) => (
          <TouchableOpacity
            key={book.code}
            style={[styles.bookCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            onPress={() => handleBookPress(book)}
          >
            <Text style={[styles.bookTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {book.title}
            </Text>
            <Text style={[styles.bookSubtitle, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
              {book.shortTitle}
            </Text>
            {book.chapters && (
              <Text style={[styles.chapterCount, { color: Colors[colorScheme ?? 'light'].primary }]}>
                {book.chapters} chapters
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading Bible books...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const oldTestamentBooks = filteredBooks.filter(book => book.category === 'old-testament');
  const newTestamentBooks = filteredBooks.filter(book => book.category === 'new-testament');
  const deuterocanonicalBooks = filteredBooks.filter(book => book.category === 'deuterocanonical');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Sacred Scripture
        </Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <Ionicons 
            name="search" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            color: Colors[colorScheme ?? 'light'].text,
            borderColor: Colors[colorScheme ?? 'light'].border
          }]}
          placeholder="Search books..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].secondaryText}
          value={searchText}
          onChangeText={setSearchText}
        />
        <Ionicons 
          name="search" 
          size={20} 
          color={Colors[colorScheme ?? 'light'].secondaryText} 
          style={styles.searchIcon}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {oldTestamentBooks.length > 0 && renderBookSection('Old Testament', oldTestamentBooks)}
        {newTestamentBooks.length > 0 && renderBookSection('New Testament', newTestamentBooks)}
        {deuterocanonicalBooks.length > 0 && renderBookSection('Deuterocanonical', deuterocanonicalBooks)}
        
        {filteredBooks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons 
              name="book-outline" 
              size={64} 
              color={Colors[colorScheme ?? 'light'].secondaryText} 
            />
            <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
              No books found
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    position: 'relative',
    marginHorizontal: 20,
    marginVertical: 16,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 40,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  booksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
  },
  bookCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  bookSubtitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  chapterCount: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Georgia',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
  },
});
