/**
 * Bible Book Page (Web)
 * Shows chapter grid if no chapter specified, or chapter reader if chapter specified
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { useBible } from '../../../../contexts/BibleContext';
import { bibleService } from '../../../../services/BibleService.web';
import { multiVersionBibleService } from '../../../../services/MultiVersionBibleService';
import BibleVersionSelectorModal from '../../../../components/BibleVersionSelectorModal';
import { BibleChapter, BibleVerse, Annotation, HighlightColor, BibleBookmark, BibleHighlight } from '../../../../types';
import { VersionBibleBook } from '../../../../types/bible-version-types';
import { getBookInfo, getTestamentColor } from '../../../../constants/bibleBookOrder';
import { useBibleAnnotations } from '../../../../hooks/useBibleAnnotations';
import { ReadingAnnotationOverlay } from '../../../../components/ReadingAnnotationOverlay.web';
import { HighlightColorPicker } from '../../../../components/HighlightColorPicker';
import { AnnotationNoteEditor } from '../../../../components/AnnotationNoteEditor';
import { AnnotationsListView } from '../../../../components/AnnotationsListView';
import Footer from '../../../../components/Footer.web';

export default function BibleBookWebScreen() {
  const { bookCode, chapter, version } = useLocalSearchParams();
  const bookCodeStr = bookCode as string;
  const versionStr = version as string;
  const chapterParam = chapter ? parseInt(chapter as string, 10) : null;

  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { currentVersion, setCurrentVersion, getCurrentVersionInfo } = useBible();
  const [book, setBook] = useState<VersionBibleBook | null>(null);
  const [currentChapter, setCurrentChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVersionSelector, setShowVersionSelector] = useState(false);

  // Annotation state
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showAnnotationsList, setShowAnnotationsList] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);

  const showChapterGrid = chapterParam === null;
  const chapterNumber = chapterParam || 1;

  // Bible annotations hook
  const {
    bookmarks,
    highlights,
    annotations,
    isVerseBookmarked,
    getHighlightForVerse,
    addBookmark,
    removeBookmark,
    updateBookmarkNote,
    addHighlight,
    removeHighlight,
    updateHighlight,
  } = useBibleAnnotations(
    bookCodeStr || '',
    chapterNumber,
    currentVersion
  );

  useEffect(() => {
    if (versionStr && versionStr !== currentVersion) {
      setCurrentVersion(versionStr);
    }
    loadBook();
  }, [bookCodeStr, versionStr]);

  useEffect(() => {
    if (book && !showChapterGrid) {
      loadChapter(chapterNumber);
    }
  }, [book, chapterNumber, currentVersion, showChapterGrid]);

  const loadBook = async () => {
    try {
      setLoading(true);
      setError(null);
      let bookData: VersionBibleBook;
      
      if (currentVersion === 'douay-rheims') {
        const originalBook = await bibleService.getBookByCode(bookCodeStr);
        bookData = {
          code: originalBook.code,
          title: originalBook.title,
          shortTitle: originalBook.shortTitle,
          abbreviation: originalBook.abbreviation,
          category: originalBook.category,
          order: originalBook.order,
          chapters: originalBook.chapters,
          versionId: 'douay-rheims',
          available: true,
        };
      } else {
        const availableBooks = await multiVersionBibleService.getAvailableBooks();
        const foundBook = availableBooks.find(b => b.code === bookCodeStr);
        if (!foundBook) {
          throw new Error(`Book ${bookCodeStr} not found in ${currentVersion}`);
        }
        bookData = foundBook;
      }
      
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
      let chapterData: BibleChapter | null;
      
      if (currentVersion === 'douay-rheims') {
        chapterData = await bibleService.getChapter(bookCodeStr, chapterNum);
      } else {
        chapterData = await multiVersionBibleService.getChapter(bookCodeStr, chapterNum, currentVersion);
      }
      
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

  const handleChapterPress = (chapterNum: number) => {
    router.push(`/(tabs)/study/bible/${bookCodeStr}?chapter=${chapterNum}&version=${currentVersion}`);
  };

  const handlePreviousChapter = () => {
    if (chapterNumber > 1) {
      router.push(`/(tabs)/study/bible/${bookCodeStr}?chapter=${chapterNumber - 1}&version=${currentVersion}`);
    }
  };

  const handleNextChapter = () => {
    const bookInfo = getBookInfo(bookCodeStr);
    const maxChapter = bookInfo?.chapters || book?.chapters || 50;
    if (chapterNumber < maxChapter) {
      router.push(`/(tabs)/study/bible/${bookCodeStr}?chapter=${chapterNumber + 1}&version=${currentVersion}`);
    }
  };

  // Annotation handlers
  const handleVersePress = (verse: number) => {
    setSelectedVerse(verse);
    setShowColorPicker(true);
  };

  const handleAddBookmark = async () => {
    if (!currentChapter || !currentChapter.verses.length) return;
    const verse = selectedVerse || 1;
    const success = await addBookmark(verse);
    if (success) {
      // Alert.alert('Success', 'Bookmark added');
    }
  };

  const handleRemoveBookmark = async () => {
    if (!currentChapter || !currentChapter.verses.length) return;
    const verse = selectedVerse || 1;
    const bookmark = bookmarks.find(b => b.verse === verse);
    if (bookmark) {
      const success = await removeBookmark(bookmark.id);
      if (success) {
        Alert.alert('Success', 'Bookmark removed');
      }
    }
  };

  const handleAddHighlight = () => {
    if (selectedVerse === null) {
      Alert.alert('Select a Verse', 'Please tap on a verse to highlight it');
      return;
    }
    setShowColorPicker(true);
  };

  const handleColorSelect = async (color: HighlightColor) => {
    if (selectedVerse === null || !currentChapter) return;
    
    const verse = currentChapter.verses.find(v => v.number === selectedVerse);
    if (!verse) return;

    const success = await addHighlight(
      selectedVerse,
      selectedVerse,
      verse.text,
      color
    );
    
    if (success) {
      Alert.alert('Success', 'Highlight added');
      setSelectedVerse(null);
    }
  };

  const handleNavigateToAnnotation = (annotation: Annotation) => {
    setShowAnnotationsList(false);
    const data = annotation.data as BibleBookmark | BibleHighlight;
    
    if (data.chapter !== chapterNumber) {
      router.push(`/(tabs)/study/bible/${bookCodeStr}?chapter=${data.chapter}&version=${currentVersion}`);
    }
  };

  const handleDeleteAnnotation = async (annotation: Annotation) => {
    let success = false;
    if (annotation.type === 'bookmark') {
      success = await removeBookmark(annotation.id);
    } else {
      success = await removeHighlight(annotation.id);
    }
    
    if (success) {
      Alert.alert('Success', 'Annotation deleted');
    }
  };

  const handleEditNote = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setShowAnnotationsList(false);
    setShowNoteEditor(true);
  };

  const handleSaveNote = async (note: string) => {
    if (!editingAnnotation) return;
    
    let success = false;
    if (editingAnnotation.type === 'bookmark') {
      success = await updateBookmarkNote(editingAnnotation.id, note);
    } else {
      success = await updateHighlight(editingAnnotation.id, undefined, note);
    }
    
    if (success) {
      setEditingAnnotation(null);
      Alert.alert('Success', 'Note saved');
    }
  };

  const isCurrentLocationBookmarked = () => {
    return bookmarks.length > 0;
  };

  const bookInfo = getBookInfo(bookCodeStr);
  const chapterCount = bookInfo?.chapters || book?.chapters || 50;
  const testament = book?.category === 'new-testament' ? 'new-testament' : 'old-testament';
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

  if (loading && !showChapterGrid && !currentChapter) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons 
            name="alert-circle-outline" 
            size={64} 
            color={colors.error || '#ff6b6b'} 
          />
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
              if (!showChapterGrid) {
                loadChapter(chapterNumber);
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
            style={[styles.retryButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.retryButtonText, { color: colors.primary }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // CHAPTER GRID MODE
  if (showChapterGrid) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.bookTitle, { color: colors.text }]}>
              {book?.title || bookCodeStr}
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
          contentContainerStyle={{ flexGrow: 1 }}
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
          
          <Footer />
        </ScrollView>
      </View>
    );
  }

  // CHAPTER READER MODE
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerCenter}
          onPress={() => setShowVersionSelector(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.bookTitle, { color: colors.text }]}>
            {book?.title || bookCodeStr}
          </Text>
          <View style={styles.versionBadge}>
            <Text style={[styles.versionBadgeText, { color: colors.textSecondary }]}>
              {getCurrentVersionInfo()?.shortName || currentVersion}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
          </View>
          <Text style={[styles.chapterTitle, { color: colors.primary }]}>
            Chapter {chapterNumber}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerSpacer} />
      </View>

      {/* Navigation Controls */}
      <View style={[styles.navigationContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { 
              backgroundColor: chapterNumber > 1 ? colors.primary : colors.surface,
              opacity: chapterNumber > 1 ? 1 : 0.5,
            }
          ]}
          onPress={handlePreviousChapter}
          disabled={chapterNumber <= 1}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={colors.dominicanWhite} 
          />
          <Text style={[styles.navButtonText, { color: colors.dominicanWhite }]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.chapterInfo}>
          <Text style={[styles.chapterInfoText, { color: colors.text }]}>
            {chapterNumber} of {chapterCount}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            { 
              backgroundColor: chapterNumber < chapterCount ? colors.primary : colors.surface,
              opacity: chapterNumber < chapterCount ? 1 : 0.5,
            }
          ]}
          onPress={handleNextChapter}
          disabled={chapterNumber >= chapterCount}
        >
          <Text style={[styles.navButtonText, { color: colors.dominicanWhite }]}>
            Next
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={colors.dominicanWhite} 
          />
        </TouchableOpacity>
      </View>

      {/* Chapter Content */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.chapterContainer}>
          {currentChapter?.verses.map((verse) => {
            const highlight = getHighlightForVerse(verse.number);
            const bookmarked = isVerseBookmarked(verse.number);
            const highlightBgColor = highlight 
              ? colors.highlight[`${highlight.color}Bg` as keyof typeof colors.highlight]
              : undefined;

            return (
              <TouchableOpacity
                key={verse.number}
                style={[
                  styles.verseContainer,
                  highlight && { backgroundColor: highlightBgColor as string, borderRadius: 4, paddingVertical: 8 }
                ]}
                onPress={() => handleVersePress(verse.number)}
              >
                <View style={styles.verseNumberContainer}>
                  <Text style={[styles.verseNumber, { color: colors.primary }]}>
                    {verse.number}
                  </Text>
                  {bookmarked && (
                    <Ionicons 
                      name="bookmark" 
                      size={14} 
                      color={colors.primary} 
                      style={styles.bookmarkIcon}
                    />
                  )}
                </View>
                <View style={styles.verseTextContainer}>
                  <Text style={[styles.verseText, { color: colors.text }]}>
                    {verse.text}
                  </Text>
                  {highlight?.note && (
                    <View style={styles.verseNoteIndicator}>
                      <Ionicons name="document-text" size={14} color={colors.textSecondary} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        
        <Footer />
      </ScrollView>

      {/* Annotation Overlay */}
      {!showChapterGrid && (
        <ReadingAnnotationOverlay
          isBookmarked={isCurrentLocationBookmarked()}
          onAddBookmark={handleAddBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onAddHighlight={handleAddHighlight}
          onViewAnnotations={() => setShowAnnotationsList(true)}
        />
      )}

      {/* Version Selector Modal */}
      <BibleVersionSelectorModal
        visible={showVersionSelector}
        currentVersion={currentVersion}
        onVersionChange={setCurrentVersion}
        onClose={() => setShowVersionSelector(false)}
      />

      {/* Highlight Color Picker */}
      <HighlightColorPicker
        visible={showColorPicker}
        onSelectColor={handleColorSelect}
        onClose={() => {
          setShowColorPicker(false);
          setSelectedVerse(null);
        }}
      />

      {/* Note Editor */}
      <AnnotationNoteEditor
        visible={showNoteEditor}
        initialNote={editingAnnotation?.note || ''}
        context={editingAnnotation?.text || editingAnnotation?.location}
        onSave={handleSaveNote}
        onClose={() => {
          setShowNoteEditor(false);
          setEditingAnnotation(null);
        }}
      />

      {/* Annotations List */}
      <AnnotationsListView
        visible={showAnnotationsList}
        annotations={annotations}
        onClose={() => setShowAnnotationsList(false)}
        onNavigateToAnnotation={handleNavigateToAnnotation}
        onDeleteAnnotation={handleDeleteAnnotation}
        onEditNote={handleEditNote}
      />
    </View>
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
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  headerSpacer: {
    width: 40,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 2,
  },
  versionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  versionBadgeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  chapterTitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 2,
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
  
  // Chapter Grid Styles
  chapterGridContainer: {
    padding: 24,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
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
  },
  chapterButton: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
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
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
  chapterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  verseContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    cursor: 'pointer',
  },
  verseNumberContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 12,
    minWidth: 32,
  },
  verseNumber: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 2,
    textAlign: 'right',
    flex: 1,
  },
  bookmarkIcon: {
    marginLeft: 4,
    marginTop: 2,
  },
  verseTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    flex: 1,
  },
  verseNoteIndicator: {
    marginLeft: 8,
    marginTop: 2,
  },
});
