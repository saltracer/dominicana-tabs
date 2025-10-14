/**
 * Bible Book Page
 * Shows chapter grid if no chapter specified, or chapter reader if chapter specified
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
import { getBookInfo, getTestamentColor } from '../../../../constants/bibleBookOrder';

export default function BibleBookScreen() {
  const { bookCode, chapter, version } = useLocalSearchParams();
  const bookCodeStr = bookCode as string;
  const versionStr = version as string;
  const chapterParam = chapter ? parseInt(chapter as string, 10) : null;
  
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentVersion, setCurrentVersion, getCurrentVersionInfo } = useBible();
  const [book, setBook] = useState<VersionBibleBook | null>(null);
  const [chapterData, setChapterData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(16);

  // Determine mode: chapter grid or chapter reader
  const showChapterGrid = chapterParam === null;
  const currentChapter = chapterParam || 1;

  useEffect(() => {
    if (bookCodeStr) {
      if (versionStr && versionStr !== currentVersion) {
        setCurrentVersion(versionStr);
      }
      loadBook();
    }
  }, [bookCodeStr, versionStr]);

  useEffect(() => {
    if (book && bookCodeStr && !showChapterGrid) {
      loadChapter(currentChapter);
    }
  }, [book, currentChapter, bookCodeStr, currentVersion, showChapterGrid]);

  const loadBook = async () => {
    try {
      setLoading(true);
      setError(null);
      let availableBooks: VersionBibleBook[];
      
      if (currentVersion === 'douay-rheims') {
        const originalBooks = bibleService.getBibleBooks();
        availableBooks = originalBooks.map(book => ({
          code: book.code,
          title: book.title,
          shortTitle: book.shortTitle,
          abbreviation: book.abbreviation,
          category: book.category,
          order: book.order,
          versionId: 'douay-rheims',
          available: true,
        }));
      } else {
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
        chapterData = await bibleService.getChapter(bookCodeStr, chapterNumber);
      } else {
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

  const handleChapterPress = (chapterNum: number) => {
    router.push(`/(tabs)/study/bible/${bookCodeStr}?chapter=${chapterNum}&version=${currentVersion}`);
  };

  const handlePreviousChapter = () => {
    if (currentChapter > 1) {
      router.push(`/(tabs)/study/bible/${bookCodeStr}?chapter=${currentChapter - 1}&version=${currentVersion}`);
    }
  };

  const handleNextChapter = () => {
    const bookInfo = getBookInfo(bookCodeStr);
    const maxChapter = bookInfo?.chapters || 50;
    if (currentChapter < maxChapter) {
      router.push(`/(tabs)/study/bible/${bookCodeStr}?chapter=${currentChapter + 1}&version=${currentVersion}`);
    }
  };

  // Get chapter count
  const bookInfo = getBookInfo(bookCodeStr);
  const chapterCount = bookInfo?.chapters || 50;
  const testament = book?.category === 'new-testament' ? 'new-testament' : 'old-testament';
  const testamentColor = getTestamentColor(testament);

  // Generate chapter array
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error || '#ff6b6b'} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Error Loading Content
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setError(null);
              if (book && !showChapterGrid) {
                loadChapter(currentChapter);
              } else {
                loadBook();
              }
            }}
          >
            <Text style={[styles.retryButtonText, { color: colors.dominicanWhite }]}>
              Try Again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {showChapterGrid ? 'Loading book...' : 'Loading chapter...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // CHAPTER GRID MODE
  if (showChapterGrid) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.bookTitle, { color: colors.text }]}>
              {book?.title}
            </Text>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              {getCurrentVersionInfo()?.shortName || currentVersion}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View style={styles.chapterGridContainer}>
            <Text style={[styles.chapterGridLabel, { color: colors.text }]}>
              Chapters ({chapterCount}):
            </Text>
            
            <View style={styles.chapterGrid}>
              {chapters.map((chapterNum) => (
                <TouchableOpacity
                  key={chapterNum}
                  style={[
                    styles.chapterButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleChapterPress(chapterNum)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chapterButtonText, { color: colors.text }]}>
                    {chapterNum}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // CHAPTER READER MODE
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.bookTitle, { color: colors.text }]}>
            {book?.title}
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            {getCurrentVersionInfo()?.shortName || currentVersion}
          </Text>
          <Text style={[styles.chapterText, { color: colors.primary }]}>
            Chapter {currentChapter}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setFontSize(fontSize === 16 ? 18 : fontSize === 18 ? 20 : 16)}
          >
            <Ionicons name="text" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chapter Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {chapterData && (
          <View style={styles.chapterContent}>
            <Text style={[styles.chapterTitle, { color: colors.text }]}>
              Chapter {chapterData.number}
            </Text>
            {chapterData.verses.map((verse) => (
              <View key={verse.number} style={styles.verseContainer}>
                <Text style={[styles.verseNumber, { color: colors.textSecondary }]}>
                  {verse.number}
                </Text>
                <Text style={[styles.verseText, { color: colors.text, fontSize }]}>
                  {verse.text}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navigation, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.navButton, currentChapter <= 1 && styles.navButtonDisabled]}
          onPress={handlePreviousChapter}
          disabled={currentChapter <= 1}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={currentChapter <= 1 ? colors.textMuted : colors.primary} 
          />
          <Text style={[styles.navButtonText, { 
            color: currentChapter <= 1 ? colors.textMuted : colors.primary 
          }]}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, currentChapter >= chapterCount && styles.navButtonDisabled]}
          onPress={handleNextChapter}
          disabled={currentChapter >= chapterCount}
        >
          <Text style={[styles.navButtonText, { 
            color: currentChapter >= chapterCount ? colors.textMuted : colors.primary 
          }]}>
            Next
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={currentChapter >= chapterCount ? colors.textMuted : colors.primary} 
          />
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
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
  chapterText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  
  // Chapter Grid Styles
  chapterGridContainer: {
    padding: 16,
    alignItems: 'center',
  },
  chapterGridLabel: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 600,
  },
  chapterButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chapterButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  
  // Chapter Reader Styles
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
    borderTopWidth: 1,
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
});
