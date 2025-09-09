import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { useBible } from '../../../../contexts/BibleContext';
import { bibleService, BibleBook } from '../../../../services/BibleService.web';
import { BibleChapter, BibleVerse } from '../../../../types';

export default function BibleReaderWebScreen() {
  const { bookCode, chapter, version } = useLocalSearchParams();
  const bookCodeStr = bookCode as string;
  const versionStr = version as string;
  const initialChapterNum = chapter ? parseInt(chapter as string, 10) : 1;

  const { colorScheme } = useTheme();
  const { currentVersion, setCurrentVersion, getCurrentVersionInfo } = useBible();
  const [book, setBook] = useState<BibleBook | null>(null);
  const [currentChapter, setCurrentChapter] = useState<BibleChapter | null>(null);
  const [chapterNumber, setChapterNumber] = useState(initialChapterNum);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set version from URL params if provided
    if (versionStr && versionStr !== currentVersion) {
      setCurrentVersion(versionStr);
    }
    loadBook();
  }, [bookCodeStr, versionStr]);

  useEffect(() => {
    if (book) {
      loadChapter(chapterNumber);
    }
  }, [book, chapterNumber, currentVersion]);

  const loadBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const bookData = await bibleService.getBookByCode(bookCodeStr);
      setBook(bookData);
    } catch (err) {
      console.error('Error loading book:', err);
      setError(`Failed to load ${bookCodeStr}`);
    } finally {
      setLoading(false);
    }
  };

  const loadChapter = async (chapterNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const chapterData = await bibleService.getChapter(bookCodeStr, chapterNum);
      if (chapterData) {
        setCurrentChapter(chapterData);
      } else {
        setError(`Chapter ${chapterNum} not found in ${bookCodeStr}`);
      }
    } catch (err) {
      console.error('Error loading chapter:', err);
      setError(`Failed to load chapter ${chapterNum}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousChapter = () => {
    if (chapterNumber > 1) {
      setChapterNumber(chapterNumber - 1);
    }
  };

  const handleNextChapter = () => {
    if (book && chapterNumber < book.chapters!) {
      setChapterNumber(chapterNumber + 1);
    }
  };

  const handleVersePress = (verse: BibleVerse) => {
    // Could add verse highlighting or note-taking functionality here
    console.log('Verse pressed:', verse.reference);
  };

  const renderVerse = (verse: BibleVerse) => (
    <View key={verse.number} style={styles.verseContainer}>
      <TouchableOpacity
        style={styles.verseContent}
        onPress={() => handleVersePress(verse)}
      >
        <Text style={[styles.verseNumber, { color: Colors[colorScheme ?? 'light'].primary }]}>
          {verse.number}
        </Text>
        <Text style={[styles.verseText, { color: Colors[colorScheme ?? 'light'].text }]}>
          {verse.text}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !currentChapter) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading {bookCodeStr}...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <Ionicons 
            name="alert-circle-outline" 
            size={64} 
            color={Colors[colorScheme ?? 'light'].error || '#ff6b6b'} 
          />
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Error Loading Content
          </Text>
          <Text style={[styles.errorMessage, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={() => loadChapter(chapterNumber)}
          >
            <Text style={[styles.retryButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Try Again
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.bookTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {book?.title || bookCodeStr}
          </Text>
          <Text style={[styles.chapterTitle, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
            Chapter {chapterNumber}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push(`/(tabs)/study/bible/search?bookCode=${bookCodeStr}`)}
        >
          <Ionicons 
            name="search" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Navigation Controls */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { 
              backgroundColor: chapterNumber > 1 ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].disabled,
              opacity: chapterNumber > 1 ? 1 : 0.5
            }
          ]}
          onPress={handlePreviousChapter}
          disabled={chapterNumber <= 1}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={Colors[colorScheme ?? 'light'].dominicanWhite} 
          />
          <Text style={[styles.navButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.chapterInfo}>
          <Text style={[styles.chapterInfoText, { color: Colors[colorScheme ?? 'light'].text }]}>
            {chapterNumber} of {book?.chapters || '?'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            { 
              backgroundColor: (book && chapterNumber < book.chapters!) ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].disabled,
              opacity: (book && chapterNumber < book.chapters!) ? 1 : 0.5
            }
          ]}
          onPress={handleNextChapter}
          disabled={!book || chapterNumber >= book.chapters!}
        >
          <Text style={[styles.navButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
            Next
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={Colors[colorScheme ?? 'light'].dominicanWhite} 
          />
        </TouchableOpacity>
      </View>

      {/* Chapter Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].primary} />
          </View>
        )}
        
        <View style={styles.chapterContainer}>
          {currentChapter?.verses.map(renderVerse)}
        </View>
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
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  chapterTitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 2,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginHorizontal: 4,
  },
  chapterInfo: {
    alignItems: 'center',
  },
  chapterInfoText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Georgia',
  },
  scrollView: {
    flex: 1,
  },
  loadingOverlay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  chapterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  verseContainer: {
    marginBottom: 16,
  },
  verseContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginRight: 8,
    marginTop: 2,
    minWidth: 20,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
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
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 24,
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
});
