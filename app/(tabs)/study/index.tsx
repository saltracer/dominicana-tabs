import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { LiturgicalDay, Book, BookCategory } from '../../../types';
import { StudyStyles, getStudyPlatformStyles } from '../../../styles';
import { useAuth } from '../../../contexts/AuthContext';
import { useBooks } from '../../../hooks/useBooks';

export default function StudyScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const { user, loading: authLoading } = useAuth();
  const { books, loading: booksLoading, searchBooks } = useBooks();
  const isWeb = Platform.OS === 'web';
  const platformStyles = getStudyPlatformStyles(isWeb);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'all'>('all');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, selectedCategory]);

  const filterBooks = () => {
    const filtered = books.filter(book => {
      const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setFilteredBooks(filtered);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchBooks(searchQuery, selectedCategory);
    } else {
      filterBooks();
    }
  };

  const categories: { type: BookCategory | 'all'; name: string; icon: string }[] = [
    { type: 'all', name: 'All Books', icon: 'library' },
    { type: 'Philosophy', name: 'Philosophy', icon: 'school' },
    { type: 'Theology', name: 'Theology', icon: 'book' },
    { type: 'Mysticism', name: 'Mysticism', icon: 'heart' },
    { type: 'Science', name: 'Science', icon: 'flask' },
    { type: 'Natural History', name: 'Natural History', icon: 'leaf' },
    { type: 'Spiritual', name: 'Spiritual', icon: 'flower' },
  ];


  const handleLogin = () => {
    router.push('/auth');
  };

  const handleBookPress = (book: Book) => {
    router.push({ pathname: '/(tabs)/study/book/[id]', params: { id: book.id } });
  };

  if (!liturgicalDay || authLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            {!liturgicalDay ? 'Loading liturgical information...' : 'Loading...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Login Status */}
        {!user && (
          <View style={styles.loginBanner}>
            <Ionicons name="lock-closed" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            <Text style={[styles.loginText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Login required to access the library
            </Text>
            <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
              <Text style={[styles.loginButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        )}

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

        {/* Bible Reading */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Sacred Scripture
          </Text>
          
          <TouchableOpacity
            style={[styles.bibleCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            onPress={() => {
              router.push('/(tabs)/study/bible');
            }}
          >
            <View style={styles.bibleCardContent}>
              <View style={styles.bibleIcon}>
                <Ionicons name="book" size={32} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
              <View style={styles.bibleInfo}>
                <Text style={[styles.bibleTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Holy Bible
                </Text>
                <Text style={[styles.bibleSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Douay-Rheims Version
                </Text>
                <Text style={[styles.bibleDescription, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                  Read the complete Catholic Bible with search and navigation features
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Books Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Catholic Classics Library
          </Text>
          
          <View style={styles.booksGrid}>
            {filteredBooks.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={[
                  styles.bookCardGrid,
                  { backgroundColor: Colors[colorScheme ?? 'light'].card }
                ]}
                onPress={() => handleBookPress(book)}
              >
                <View style={styles.bookCover}>
                  <Ionicons 
                    name="book" 
                    size={40} 
                    color={Colors[colorScheme ?? 'light'].primary} 
                  />
                  {book.isDominican && (
                    <View style={styles.dominicanBadge}>
                      <Text style={styles.dominicanBadgeText}>OP</Text>
                    </View>
                  )}
                </View>
                <View style={styles.bookInfo}>
                  <Text style={[styles.bookTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
                    {book.title}
                  </Text>
                  <Text style={[styles.bookAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {book.author}
                  </Text>
                  <Text style={[styles.bookDescription, { color: Colors[colorScheme ?? 'light'].textMuted }]} numberOfLines={2}>
                    {book.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reading Progress */}
        {user && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Continue Reading
            </Text>
            <View style={[styles.progressCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Ionicons name="bookmark" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.progressText, { color: Colors[colorScheme ?? 'light'].text }]}>
                No books in progress. Start reading to track your progress.
              </Text>
            </View>
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
  loginBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.warning,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  bibleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
});
