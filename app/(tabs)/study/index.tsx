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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner';
import EpubReader from '../../../components/EpubReader';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import EbookService, { EbookMetadata } from '../../../services/EbookService';
import { LiturgicalDay, Book, BookCategory } from '../../../types';
import { StudyStyles, getStudyPlatformStyles } from '../../../styles';

export default function StudyScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const isWeb = Platform.OS === 'web';
  const platformStyles = getStudyPlatformStyles(isWeb);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'all'>('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [ebooks, setEbooks] = useState<EbookMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEbook, setSelectedEbook] = useState<EbookMetadata | null>(null);
  const [showEpubReader, setShowEpubReader] = useState(false);

  useEffect(() => {
    loadSampleBooks();
    loadEbooks();
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const authenticated = await EbookService.isAuthenticated();
      setIsLoggedIn(authenticated);
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  };

  const loadEbooks = async () => {
    try {
      setLoading(true);
      const ebooksData = isLoggedIn 
        ? await EbookService.getAllEbooks()
        : await EbookService.getPublicEbooks();
      setEbooks(ebooksData);
    } catch (error) {
      console.error('Error loading ebooks:', error);
      Alert.alert('Error', 'Failed to load ebooks. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const filteredEbooks = ebooks.filter(ebook => {
    const matchesCategory = selectedCategory === 'all' || ebook.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      ebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ebook.author.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleEbookPress = (ebook: EbookMetadata) => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to read this book.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: () => {
              setIsLoggedIn(true);
              Alert.alert('Success', 'You are now logged in and can access the library.');
            }
          }
        ]
      );
      return;
    }
    
    setSelectedEbook(ebook);
    setShowEpubReader(true);
  };

  const handleCloseEpubReader = () => {
    setShowEpubReader(false);
    setSelectedEbook(null);
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

        {/* Ebooks Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Catholic Classics Library
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Loading ebooks...
              </Text>
            </View>
          ) : (
            <View style={styles.booksGrid}>
              {filteredEbooks.map((ebook) => (
                <TouchableOpacity
                  key={ebook.id}
                  style={[
                    styles.bookCardGrid,
                    { backgroundColor: Colors[colorScheme ?? 'light'].card }
                  ]}
                  onPress={() => handleEbookPress(ebook)}
                >
                  <View style={styles.bookCover}>
                    <Ionicons 
                      name="book" 
                      size={40} 
                      color={Colors[colorScheme ?? 'light'].primary} 
                    />
                    {ebook.is_dominican && (
                      <View style={styles.dominicanBadge}>
                        <Text style={styles.dominicanBadgeText}>OP</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={[styles.bookTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
                      {ebook.title}
                    </Text>
                    <Text style={[styles.bookAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {ebook.author}
                    </Text>
                    <Text style={[styles.bookDescription, { color: Colors[colorScheme ?? 'light'].textMuted }]} numberOfLines={2}>
                      {ebook.description}
                    </Text>
                    {!isLoggedIn && (
                      <View style={styles.loginPrompt}>
                        <Ionicons name="lock-closed" size={16} color={Colors[colorScheme ?? 'light'].textMuted} />
                        <Text style={[styles.loginPromptText, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                          Login to read
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Legacy Books Grid (for backward compatibility) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Sample Books (Legacy)
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

      {/* EpubReader Modal */}
      <Modal
        visible={showEpubReader}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseEpubReader}
      >
        {selectedEbook && (
          <EpubReader
            ebook={selectedEbook}
            onClose={handleCloseEpubReader}
          />
        )}
      </Modal>
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
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loginPromptText: {
    fontSize: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
});
