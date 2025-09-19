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
import { useBible } from '../../../../contexts/BibleContext';
import { bibleService } from '../../../../services/BibleService.web';
import { multiVersionBibleService } from '../../../../services/MultiVersionBibleService';
import BibleVersionSelector from '../../../../components/BibleVersionSelector';
import { VersionBibleBook } from '../../../../types/bible-version-types';
import { StudyStyles, getStudyPlatformStyles } from '../../../../styles';

export default function BibleIndexWebScreen() {
  const { colorScheme } = useTheme();
  const { currentVersion, setCurrentVersion, getCurrentVersionInfo } = useBible();
  const isWeb = true;
  const platformStyles = getStudyPlatformStyles(isWeb);
  const [books, setBooks] = useState<VersionBibleBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<VersionBibleBook[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, [currentVersion]);

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
      let bibleBooks: VersionBibleBook[];
      
      if (currentVersion === 'douay-rheims') {
        // Use original BibleService for Douay-Rheims (has all 73 books)
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
          available: true
        }));
      } else {
        // Use MultiVersionBibleService for other versions (like Vulgate)
        bibleBooks = await multiVersionBibleService.getAvailableBooks();
      }
      
      setBooks(bibleBooks);
      setFilteredBooks(bibleBooks);
    } catch (error) {
      console.error('Error loading Bible books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (book: VersionBibleBook) => {
    router.push(`/(tabs)/study/bible/${book.code}?version=${currentVersion}`);
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/study/bible/search');
  };

  const renderBookSection = (title: string, books: VersionBibleBook[]) => (
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

      {/* Version Selector */}
      <BibleVersionSelector
        currentVersion={currentVersion}
        onVersionChange={setCurrentVersion}
        style={styles.versionSelector}
      />

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
  // Include all shared styles
  ...StudyStyles,
  
  // Add/override with unique local styles
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
