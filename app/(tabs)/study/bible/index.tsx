import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { useBible } from '../../../../contexts/BibleContext';
import { multiVersionBibleService } from '../../../../services/MultiVersionBibleService';
import { bibleService, BibleBook } from '../../../../services/BibleService';
import BibleVersionSelector from '../../../../components/BibleVersionSelector';
import { VersionBibleBook } from '../../../../types/bible-version-types';
import { StudyStyles, getStudyPlatformStyles } from '../../../../styles';

export default function BibleScreen() {
  const { colorScheme } = useTheme();
  const { currentVersion, setCurrentVersion, getCurrentVersionInfo } = useBible();
  const isWeb = Platform.OS === 'web';
  const platformStyles = getStudyPlatformStyles(isWeb);
  const [books, setBooks] = useState<VersionBibleBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<VersionBibleBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'old-testament' | 'new-testament' | 'deuterocanonical'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBibleBooks();
  }, [currentVersion]);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, selectedCategory]);

  const loadBibleBooks = async () => {
    try {
      setLoading(true);
      let bibleBooks: VersionBibleBook[];
      
      if (currentVersion === 'douay-rheims') {
        // Use original BibleService for Douay-Rheims (has all 73 books)
        const originalBooks = bibleService.getBibleBooks();
        bibleBooks = originalBooks.map(book => ({
          code: book.code,
          title: book.title,
          shortTitle: book.shortTitle,
          abbreviation: book.abbreviation,
          category: book.category,
          order: book.order,
          versionId: 'douay-rheims',
          available: true
        }));
      } else {
        // Use MultiVersionBibleService for other versions (like Vulgate)
        bibleBooks = await multiVersionBibleService.getAvailableBooks();
      }
      
      setBooks(bibleBooks);
    } catch (error) {
      console.error('Error loading Bible books:', error);
      Alert.alert('Error', 'Failed to load Bible books');
    } finally {
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.shortTitle.toLowerCase().includes(query) ||
        book.abbreviation.toLowerCase().includes(query)
      );
    }

    setFilteredBooks(filtered);
  };

  const handleBookPress = (book: VersionBibleBook) => {
    router.push(`/(tabs)/study/bible/${book.code}?version=${currentVersion}`);
  };

  const categories = [
    { type: 'all' as const, name: 'All Books', icon: 'library' },
    { type: 'old-testament' as const, name: 'Old Testament', icon: 'book' },
    { type: 'new-testament' as const, name: 'New Testament', icon: 'bookmark' },
    { type: 'deuterocanonical' as const, name: 'Deuterocanonical', icon: 'star' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading Bible books...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Holy Bible
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {getCurrentVersionInfo()?.name || 'Select Version'}
          </Text>
          
          {/* Version Selector */}
          <BibleVersionSelector
            currentVersion={currentVersion}
            onVersionChange={setCurrentVersion}
            style={styles.versionSelector}
          />
          
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={() => router.push(`/(tabs)/study/bible/search?version=${currentVersion}`)}
          >
            <Ionicons name="search" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            <Text style={[styles.searchButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Search Bible
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Search books..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.type}
                style={[
                  styles.categoryCard,
                  { 
                    backgroundColor: selectedCategory === category.type 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].card,
                  }
                ]}
                onPress={() => setSelectedCategory(category.type)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={20} 
                  color={selectedCategory === category.type 
                    ? Colors[colorScheme ?? 'light'].dominicanWhite 
                    : Colors[colorScheme ?? 'light'].textSecondary
                  } 
                />
                <Text style={[
                  styles.categoryText,
                  { 
                    color: selectedCategory === category.type 
                      ? Colors[colorScheme ?? 'light'].dominicanWhite 
                      : Colors[colorScheme ?? 'light'].text
                  }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Books List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {selectedCategory === 'all' ? 'All Books' : categories.find(c => c.type === selectedCategory)?.name}
            <Text style={[styles.count, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {' '}({filteredBooks.length})
            </Text>
          </Text>
          
          <View style={styles.booksList}>
            {filteredBooks.map((book) => (
              <TouchableOpacity
                key={book.code}
                style={[
                  styles.bookCard,
                  { backgroundColor: Colors[colorScheme ?? 'light'].card }
                ]}
                onPress={() => handleBookPress(book)}
              >
                <View style={styles.bookInfo}>
                  <View style={styles.bookHeader}>
                    <Text style={[styles.bookTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {book.title}
                    </Text>
                    <Text style={[styles.bookAbbreviation, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {book.abbreviation}
                    </Text>
                  </View>
                  <Text style={[styles.bookCategory, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                    {categories.find(c => c.type === book.category)?.name}
                  </Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={Colors[colorScheme ?? 'light'].textSecondary} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Quick Access
          </Text>
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={[styles.quickAccessCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => {
                const psalms = books.find(b => b.code === 'PSA');
                if (psalms) handleBookPress(psalms);
              }}
            >
              <Ionicons name="musical-notes" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.quickAccessText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Psalms
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAccessCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => {
                const john = books.find(b => b.code === 'JHN');
                if (john) handleBookPress(john);
              }}
            >
              <Ionicons name="book" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.quickAccessText, { color: Colors[colorScheme ?? 'light'].text }]}>
                John
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAccessCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => {
                const matthew = books.find(b => b.code === 'MAT');
                if (matthew) handleBookPress(matthew);
              }}
            >
              <Ionicons name="bookmark" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.quickAccessText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Matthew
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickAccessCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => {
                const genesis = books.find(b => b.code === 'GEN');
                if (genesis) handleBookPress(genesis);
              }}
            >
              <Ionicons name="star" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.quickAccessText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Genesis
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Include all shared styles
  ...StudyStyles,
  
  // No unique local styles needed for this component
});
