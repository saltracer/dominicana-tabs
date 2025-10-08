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
  Image,
  RefreshControl,
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
import { useReadingProgress } from '../../../contexts/ReadingProgressContext';
import { useBooks } from '../../../hooks/useBooks';

export default function StudyScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const { user, loading: authLoading } = useAuth();
  const { progress: readingProgress, getBookProgressPercentage, loading: progressLoading, refreshProgress } = useReadingProgress();
  const { books, loading: booksLoading, searchBooks } = useBooks();
  const isWeb = Platform.OS === 'web';
  const platformStyles = getStudyPlatformStyles(isWeb);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'all'>('all');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, selectedCategory]);

  // Debug reading progress
  useEffect(() => {
    // console.log('📚 Study Screen - Reading Progress Debug:', {
    //   user: user?.id,
    //   readingProgress: readingProgress,
    //   progressLength: readingProgress?.length || 0,
    //   progressLoading,
    //   books: books?.length || 0
    // });
  }, [user, readingProgress, progressLoading, books]);

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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh reading progress data
      await refreshProgress();
      // The books data will be refreshed automatically by the useBooks hook
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
    // Navigate to book detail page instead of requiring login
    router.push(`/(tabs)/study/book/${book.id}`);
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
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
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
        
        {/* Reading Progress */}
        {user && (
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
            ) : readingProgress.length > 0 ? (
              <View style={styles.booksGrid}>
                {readingProgress
                  .filter((progress, index, self) => 
                    // Remove duplicates by keeping only the most recent entry for each book
                    index === self.findIndex(p => p.book_id === progress.book_id)
                  )
                  .sort((a, b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime()) // Sort by most recent
                  .map((progress, index) => {
                  const book = books.find(b => b.id === progress.book_id);
                  // console.log('📚 Book matching debug:', {
                  //   progressBookId: progress.book_id,
                  //   progressBookIdType: typeof progress.book_id,
                  //   booksIds: books.map(b => ({ id: b.id, type: typeof b.id })),
                  //   foundBook: book
                  // });
                  
                  // Create a fallback book object if not found in main books array
                  const bookData = book || {
                    id: progress.book_id,
                    title: progress.book_title,
                    author: 'Unknown Author', // We don't have author in progress data
                    description: 'Continue reading this book',
                    coverImage: null,
                    epubPath: null, // We'll need to handle this
                    category: 'Unknown',
                    year: null,
                    createdAt: progress.created_at || new Date().toISOString(),
                    updatedAt: progress.updated_at || new Date().toISOString()
                  };
                  
                  if (!book) {
                    console.log('📚 Using fallback book data for:', progress.book_title);
                  }
                  
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
              </View>
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
