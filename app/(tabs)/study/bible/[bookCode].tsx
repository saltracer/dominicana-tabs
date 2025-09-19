import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { useBible } from '../../../../contexts/BibleContext';
import { multiVersionBibleService } from '../../../../services/MultiVersionBibleService';
import { bibleService } from '../../../../services/BibleService';
import { BibleChapter, BibleVerse } from '../../../../types';
import { VersionBibleBook } from '../../../../types/bible-version-types';
import { testBibleLoading } from '../../../../services/BibleTest';
import { StudyStyles, getStudyPlatformStyles } from '../../../../styles';

export default function BibleReaderScreen() {
  const { bookCode, chapter, version } = useLocalSearchParams();
  const bookCodeStr = bookCode as string;
  const versionStr = version as string;
  const initialChapterNum = chapter ? parseInt(chapter as string, 10) : 1;
  const { colorScheme } = useTheme();
  const isWeb = Platform.OS === 'web';
  const platformStyles = getStudyPlatformStyles(isWeb);
  const { currentVersion, setCurrentVersion, getCurrentVersionInfo } = useBible();
  const [book, setBook] = useState<VersionBibleBook | null>(null);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [currentChapter, setCurrentChapter] = useState(initialChapterNum);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (bookCodeStr) {
      // Set version from URL params if provided
      if (versionStr && versionStr !== currentVersion) {
        setCurrentVersion(versionStr);
      }
      loadBook();
    }
  }, [bookCodeStr, versionStr]);

  useEffect(() => {
    if (book && bookCodeStr) {
      loadChapter(currentChapter);
    }
  }, [book, currentChapter, bookCodeStr, currentVersion]);

  const loadBook = async () => {
    try {
      setLoading(true);
      setError(null);
      let availableBooks: VersionBibleBook[];
      
      if (currentVersion === 'douay-rheims') {
        // Use original BibleService for Douay-Rheims
        const originalBooks = bibleService.getBibleBooks();
        availableBooks = originalBooks.map(book => ({
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
        // Use MultiVersionBibleService for other versions
        availableBooks = await multiVersionBibleService.getAvailableBooks();
      }
      
      const bibleBook = availableBooks.find(b => b.code === bookCodeStr);
      if (!bibleBook) {
        setError(`Book "${bookCodeStr}" not found in ${currentVersion}`);
        return;
      }
      setBook(bibleBook);
    } catch (error) {
      console.error('Error loading book:', error);
      setError('Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const loadChapter = async (chapterNumber: number) => {
    try {
      setLoading(true);
      setError(null);
      let chapterData: BibleChapter | null;
      
      if (currentVersion === 'douay-rheims') {
        // Use original BibleService for Douay-Rheims
        chapterData = await bibleService.getChapter(bookCodeStr, chapterNumber);
      } else {
        // Use MultiVersionBibleService for other versions
        chapterData = await multiVersionBibleService.getChapter(bookCodeStr, chapterNumber, currentVersion);
      }
      
      if (!chapterData) {
        setError(`Chapter ${chapterNumber} not found in ${bookCodeStr}`);
        return;
      }
      setChapterData(chapterData);
    } catch (error) {
      console.error('Error loading chapter:', error);
      setError('Failed to load chapter');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    // We don't know the total chapters without loading the book, so we'll try to load the next chapter
    setCurrentChapter(currentChapter + 1);
  };

  const handleVersePress = (verse: BibleVerse) => {
    // Could implement verse highlighting, notes, etc.
    console.log('Verse pressed:', verse.reference);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await multiVersionBibleService.search(searchQuery, bookCodeStr);
      if (results.length > 0) {
        const firstResult = results[0];
        setCurrentChapter(firstResult.chapter);
        setShowSearch(false);
        setSearchQuery('');
      } else {
        Alert.alert('No Results', 'No verses found matching your search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Search failed');
    }
  };

  const renderVerse = (verse: BibleVerse) => (
    <TouchableOpacity
      key={verse.number}
      style={styles.verseContainer}
      onPress={() => handleVersePress(verse)}
    >
      <Text style={[styles.verseNumber, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        {verse.number}
      </Text>
      <Text style={[styles.verseText, { 
        color: Colors[colorScheme ?? 'light'].text,
        fontSize: fontSize
      }]}>
        {verse.text}
      </Text>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors[colorScheme ?? 'light'].error || '#ff6b6b'} />
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Error Loading Content
          </Text>
          <Text style={[styles.errorMessage, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={() => {
              setError(null);
              if (book) {
                loadChapter(currentChapter);
              } else {
                loadBook();
              }
            }}
          >
            <Text style={[styles.retryButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Try Again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: Colors[colorScheme ?? 'light'].secondary || '#6c757d' }]}
            onPress={async () => {
              console.log('Running Bible loading test...');
              await testBibleLoading();
            }}
          >
            <Text style={[styles.testButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Test Bible Loading
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.backButton, { borderColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading && !chapterData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading chapter...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={Colors[colorScheme ?? 'light'].primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.bookTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {book?.title}
          </Text>
          <Text style={[styles.versionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {getCurrentVersionInfo()?.shortName || currentVersion}
          </Text>
          <TouchableOpacity
            onPress={() => setShowChapterSelector(true)}
            style={styles.chapterSelector}
          >
            <Text style={[styles.chapterText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Chapter {currentChapter}
            </Text>
            <Ionicons name="chevron-down" size={16} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push(`/(tabs)/study/bible/search?bookCode=${bookCodeStr}&version=${currentVersion}`)}
          >
            <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFontSize(fontSize === 16 ? 18 : fontSize === 18 ? 20 : 16)}
          >
            <Ionicons name="text" size={20} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Search in this book..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Chapter Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {chapterData && (
          <View style={styles.chapterContent}>
            <Text style={[styles.chapterTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Chapter {chapterData.number}
            </Text>
            {chapterData.verses.map(renderVerse)}
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navigation, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <TouchableOpacity
          style={[styles.navButton, currentChapter <= 1 && styles.navButtonDisabled]}
          onPress={handlePreviousChapter}
          disabled={currentChapter <= 1}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={currentChapter <= 1 ? Colors[colorScheme ?? 'light'].textMuted : Colors[colorScheme ?? 'light'].primary} 
          />
          <Text style={[styles.navButtonText, { 
            color: currentChapter <= 1 ? Colors[colorScheme ?? 'light'].textMuted : Colors[colorScheme ?? 'light'].primary 
          }]}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNextChapter}
        >
          <Text style={[styles.navButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
            Next
          </Text>
          <Ionicons name="chevron-forward" size={24} color={Colors[colorScheme ?? 'light'].primary} />
        </TouchableOpacity>
      </View>

      {/* Chapter Selector Modal */}
      <Modal
        visible={showChapterSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChapterSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Select Chapter
            </Text>
            <ScrollView style={styles.chapterList}>
              {Array.from({ length: 50 }, (_, i) => i + 1).map((chapterNum) => (
                <TouchableOpacity
                  key={chapterNum}
                  style={[
                    styles.chapterItem,
                    currentChapter === chapterNum && { backgroundColor: Colors[colorScheme ?? 'light'].primary }
                  ]}
                  onPress={() => {
                    setCurrentChapter(chapterNum);
                    setShowChapterSelector(false);
                  }}
                >
                  <Text style={[
                    styles.chapterItemText,
                    { 
                      color: currentChapter === chapterNum 
                        ? Colors[colorScheme ?? 'light'].dominicanWhite 
                        : Colors[colorScheme ?? 'light'].text 
                    }
                  ]}>
                    Chapter {chapterNum}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
              onPress={() => setShowChapterSelector(false)}
            >
              <Text style={[styles.modalCloseText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Include all shared styles
  ...StudyStyles,
  
  // Add/override with unique local styles for Bible reader
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  chapterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chapterText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginRight: 4,
  },
  headerRight: {
    flexDirection: 'row',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  searchButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  chapterContent: {
    padding: 16,
  },
  chapterTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 20,
    textAlign: 'center',
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 4,
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginRight: 12,
    minWidth: 24,
    textAlign: 'right',
  },
  verseText: {
    flex: 1,
    lineHeight: 24,
    fontFamily: 'Georgia',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 16,
    textAlign: 'center',
  },
  chapterList: {
    maxHeight: 300,
  },
  chapterItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  chapterItemText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  modalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
