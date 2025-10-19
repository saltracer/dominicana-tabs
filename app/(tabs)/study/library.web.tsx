/**
 * Library Web - Browse Catholic Classics
 * Web-specific library page for browsing books
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import { Book, BookCategory } from '../../../types';
import { StudyStyles, getStudyPlatformStyles } from '../../../styles';
import { useAuth } from '../../../contexts/AuthContext';
import { useReadingProgress } from '../../../contexts/ReadingProgressContext';
import { useBooks } from '../../../hooks/useBooks';
import { useBookCategories } from '../../../hooks/useBookCategories';
import Footer from '../../../components/Footer.web';

export default function LibraryWebScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const { user, loading: authLoading } = useAuth();
  const { progress: readingProgress, getBookProgressPercentage, loading: progressLoading, refreshProgress } = useReadingProgress();
  const { books, loading: booksLoading, searchBooks } = useBooks();
  const { categories: bookCategories, loading: categoriesLoading } = useBookCategories();
  const isWeb = true;
  const platformStyles = getStudyPlatformStyles(isWeb);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'all'>('all');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, selectedCategory]);

  const filterBooks = () => {
    const filtered = books.filter(book => {
      const matchesCategory = selectedCategory === 'all' || book.categories.includes(selectedCategory);
      const matchesSearch = searchQuery === '' || 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setFilteredBooks(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshProgress();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchBooks(searchQuery, selectedCategory);
    } else {
      filterBooks();
    }
  };

  // Icon mapping for categories
  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      'Philosophy': 'school',
      'Theology': 'book',
      'Mysticism': 'heart',
      'Science': 'flask',
      'Natural History': 'leaf',
      'Spiritual': 'flower',
      'History': 'time',
      'Biography': 'person',
      'Liturgy': 'calendar',
      'Scripture': 'book-outline',
      'Saints': 'star',
      'Apologetics': 'shield',
    };
    return iconMap[category] || 'book';
  };

  // Build categories list from database with "All Books" first
  const categories: { type: BookCategory | 'all'; name: string; icon: string }[] = [
    { type: 'all', name: 'All Books', icon: 'library' },
    ...bookCategories.map(cat => ({
      type: cat as BookCategory,
      name: cat,
      icon: getCategoryIcon(cat),
    })),
  ];

  const handleLogin = () => {
    router.push('/auth');
  };

  const handleBookPress = (book: Book) => {
    router.push(`/(tabs)/study/book/${book.id}`);
  };

  if (!liturgicalDay || authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            {!liturgicalDay ? 'Loading liturgical information...' : 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  // Filter continue reading by selected category
  const filteredContinueReading = readingProgress.filter(progress => {
    if (selectedCategory === 'all') return true;
    const book = books.find(b => {
      const bookIdNum = typeof b.id === 'string' ? parseInt(b.id, 10) : b.id;
      return bookIdNum === progress.book_id;
    });
    if (!book) return false;
    return book.categories.includes(selectedCategory);
  });

  const showContinueReading = user && filteredContinueReading.length > 0;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme ?? 'light'].primary}
            colors={[Colors[colorScheme ?? 'light'].primary]}
          />
        }
      >

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

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categoriesLoading ? (
              <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Loading categories...
              </Text>
            ) : (
              categories.map((category) => (
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
              ))
            )}
          </ScrollView>
          
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
        </View>
        
        {/* Reading Progress */}
        {showContinueReading && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Continue Reading
            </Text>
            {progressLoading ? (
              <View style={[styles.progressCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Text style={[styles.progressText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Loading reading progress...
                </Text>
              </View>
            ) : filteredContinueReading.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {filteredContinueReading
                  .filter((progress, index, self) => 
                    index === self.findIndex(p => p.book_id === progress.book_id)
                  )
                  .sort((a, b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime())
                  .map((progress, index) => {
                  const book = books.find(b => b.id === progress.book_id);
                  
                  const bookData = book || {
                    id: progress.book_id,
                    title: progress.book_title,
                    author: 'Unknown Author',
                    description: 'Continue reading this book',
                    coverImage: null,
                    epubPath: null,
                    categories: [],
                    published: false,
                    publishedAt: null,
                    year: null,
                    createdAt: progress.created_at || new Date().toISOString(),
                    updatedAt: progress.updated_at || new Date().toISOString()
                  };
                  
                  return (
                    <TouchableOpacity
                      key={`continue-reading-${progress.book_id}-${index}`}
                      style={[
                        platformStyles.bookCardGrid,
                        { backgroundColor: Colors[colorScheme ?? 'light'].card }
                      ]}
                      onPress={() => handleBookPress(bookData)}
                    >
                      <View style={styles.bookCover}>
                        {bookData.coverImage ? (
                          <Image 
                            source={{ uri: bookData.coverImage }} 
                            style={styles.bookCoverImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Ionicons 
                            name="book" 
                            size={40} 
                            color={Colors[colorScheme ?? 'light'].primary} 
                          />
                        )}
                      </View>
                      <View style={styles.bookInfo}>
                        <Text style={[styles.bookTitleGrid, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
                          {bookData.title}
                        </Text>
                        <Text style={[styles.bookAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                          {bookData.author}
                        </Text>
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBarContainer}>
                            <View 
                              style={[
                                styles.progressBar, 
                                { 
                                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                                  borderColor: Colors[colorScheme ?? 'light'].border 
                                }
                              ]}
                            >
                              <View 
                                style={[
                                  styles.progressBarFill, 
                                  { 
                                    backgroundColor: Colors[colorScheme ?? 'light'].primary,
                                    width: `${getBookProgressPercentage(progress.book_id)}%`
                                  }
                                ]} 
                              />
                            </View>
                            <Text style={[styles.progressText, { color: Colors[colorScheme ?? 'light'].text }]}>
                              {Math.round(getBookProgressPercentage(progress.book_id))}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={[styles.progressCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Ionicons name="bookmark" size={24} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.progressText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  No books in progress. Start reading to track your progress.
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Books Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Catholic Classics Library
          </Text>
          
          <View style={styles.booksGrid}>
             {filteredBooks.map((book) => (
               <TouchableOpacity
                 key={`library-${book.id}`}
                 style={[
                   platformStyles.bookCardGrid,
                   { backgroundColor: Colors[colorScheme ?? 'light'].card }
                 ]}
                 onPress={() => handleBookPress(book)}
               >
                <View style={styles.bookCover}>
                  {book.coverImage ? (
                    <Image 
                      source={{ uri: book.coverImage }} 
                      style={styles.bookCoverImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons 
                      name="book" 
                      size={40} 
                      color={Colors[colorScheme ?? 'light'].primary} 
                    />
                  )}
                </View>
                <View style={styles.bookInfo}>
                  <Text style={[styles.bookTitleGrid, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
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

        <Footer />
    </ScrollView>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
});

