import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import FeastBanner from '../../components/FeastBanner';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { LiturgicalDay, Book, BookCategory } from '../../types';

export default function StudyScreen() {
  const { colorScheme } = useTheme();
  const [liturgicalDay, setLiturgicalDay] = useState<LiturgicalDay | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'all'>('all');
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const today = new Date();
    const day = calendarService.getLiturgicalDay(today);
    setLiturgicalDay(day);
    loadSampleBooks();
  }, []);

  const handleDateChange = (date: Date) => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const day = calendarService.getLiturgicalDay(date);
    setLiturgicalDay(day);
  };

  const loadSampleBooks = () => {
    const sampleBooks: Book[] = [
      {
        id: 'summa-theologica',
        title: 'Summa Theologica',
        author: 'St. Thomas Aquinas',
        category: 'theology',
        language: 'Latin/English',
        filePath: '/books/summa-theologica.epub',
        coverImage: undefined,
        description: 'The masterwork of St. Thomas Aquinas, a comprehensive theological treatise.',
        isDominican: true,
        tags: ['theology', 'philosophy', 'scholasticism', 'dominican'],
        bookmarks: [],
        readingProgress: {
          bookId: 'summa-theologica',
          currentPosition: 0,
          totalPages: 3000,
          lastRead: new Date().toISOString(),
          timeSpent: 0
        }
      },
      {
        id: 'divine-comedy',
        title: 'The Divine Comedy',
        author: 'Dante Alighieri',
        category: 'spirituality',
        language: 'Italian/English',
        filePath: '/books/divine-comedy.epub',
        coverImage: undefined,
        description: 'Dante\'s epic poem describing his journey through Hell, Purgatory, and Paradise.',
        isDominican: false,
        tags: ['poetry', 'medieval', 'spirituality', 'allegory'],
        bookmarks: [],
        readingProgress: {
          bookId: 'divine-comedy',
          currentPosition: 0,
          totalPages: 500,
          lastRead: new Date().toISOString(),
          timeSpent: 0
        }
      },
      {
        id: 'confessions',
        title: 'Confessions',
        author: 'St. Augustine',
        category: 'spirituality',
        language: 'Latin/English',
        filePath: '/books/confessions.epub',
        coverImage: undefined,
        description: 'St. Augustine\'s autobiographical work and theological masterpiece.',
        isDominican: false,
        tags: ['autobiography', 'theology', 'patristic', 'conversion'],
        bookmarks: [],
        readingProgress: {
          bookId: 'confessions',
          currentPosition: 0,
          totalPages: 400,
          lastRead: new Date().toISOString(),
          timeSpent: 0
        }
      },
      {
        id: 'imitation-of-christ',
        title: 'The Imitation of Christ',
        author: 'Thomas à Kempis',
        category: 'spirituality',
        language: 'Latin/English',
        filePath: '/books/imitation-of-christ.epub',
        coverImage: undefined,
        description: 'A classic devotional book on Christian spirituality.',
        isDominican: false,
        tags: ['devotional', 'spirituality', 'meditation', 'christian'],
        bookmarks: [],
        readingProgress: {
          bookId: 'imitation-of-christ',
          currentPosition: 0,
          totalPages: 300,
          lastRead: new Date().toISOString(),
          timeSpent: 0
        }
      }
    ];
    setBooks(sampleBooks);
  };

  const categories: { type: BookCategory | 'all'; name: string; icon: string }[] = [
    { type: 'all', name: 'All Books', icon: 'library' },
    { type: 'theology', name: 'Theology', icon: 'book' },
    { type: 'philosophy', name: 'Philosophy', icon: 'school' },
    { type: 'spirituality', name: 'Spirituality', icon: 'heart' },
    { type: 'history', name: 'History', icon: 'time' },
    { type: 'liturgy', name: 'Liturgy', icon: 'bookmark' },
    { type: 'dominican', name: 'Dominican', icon: 'flower' },
    { type: 'patristic', name: 'Patristic', icon: 'people' },
    { type: 'medieval', name: 'Medieval', icon: 'time' },
  ];

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLogin = () => {
    Alert.alert(
      'Login Required',
      'Please log in to access the Catholic classics library.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Login', 
          onPress: () => {
            // In a real app, this would navigate to login screen
            setIsLoggedIn(true);
            Alert.alert('Success', 'You are now logged in and can access the library.');
          }
        }
      ]
    );
  };

  const handleBookPress = (book: Book) => {
    if (!isLoggedIn) {
      handleLogin();
      return;
    }
    
    Alert.alert(
      'Open Book',
      `Would you like to open "${book.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open', 
          onPress: () => {
            // In a real app, this would open the epub reader
            Alert.alert('Reader', 'Epub reader would open here with the selected book.');
          }
        }
      ]
    );
  };

  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Login Status */}
        {!isLoggedIn && (
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
                  styles.bookCard,
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
        {isLoggedIn && (
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
      
      {/* Feast Banner at Bottom */}
      <FeastBanner 
        liturgicalDay={liturgicalDay} 
        onDateChange={handleDateChange}
        showDatePicker={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
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
  loginText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  loginButton: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'Georgia',
  },
  categoriesScroll: {
    marginBottom: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: 8,
    position: 'relative',
  },
  dominicanBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dominicanBadgeText: {
    color: Colors.light.dominicanWhite,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  bookAuthor: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  bookDescription: {
    fontSize: 11,
    fontFamily: 'Georgia',
    lineHeight: 14,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});
