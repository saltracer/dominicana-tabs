import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { usePreventRemove, useTheme as useNavTheme } from '@react-navigation/native';
import { HeaderBackButton } from '@react-navigation/elements';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { Book, Annotation } from '../../../../types';
import { StudyStyles } from '../../../../styles';
import { useAuth } from '../../../../contexts/AuthContext';
import { useReading } from '../../../../contexts/ReadingContext';
import { useReadingProgress } from '../../../../contexts/ReadingProgressContext';
import { useBooks } from '../../../../hooks/useBooks';
import { useBookCache } from '../../../../hooks/useCache';
import { supabase } from '../../../../lib/supabase';
import { EpubReader } from '../../../../components/EpubReader';
import { getTabBarStyle } from '../../../../utils/tabBarStyles';
import { useBookAnnotations } from '../../../../hooks/useBookAnnotations';
import { AnnotationsListView } from '../../../../components/AnnotationsListView';
import { AnnotationNoteEditor } from '../../../../components/AnnotationNoteEditor';

export default function BookDetailScreen() {
  const { colorScheme } = useTheme();
  const navTheme = useNavTheme();
  const { user } = useAuth();
  const { setIsReading } = useReading();
  const { getBookProgressPercentage, isBookInProgress, deleteProgress, refreshProgress } = useReadingProgress();
  const { getBookById } = useBooks();
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReader, setShowReader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAnnotationsList, setShowAnnotationsList] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  // Book annotations hook (only if book is loaded)
  const {
    bookmarks,
    highlights,
    annotations,
    removeBookmark,
    removeHighlight,
    updateBookmarkNote,
    updateHighlight,
  } = useBookAnnotations(book?.id || 0);

  // Debug annotations
  useEffect(() => {
    if (book) {
      console.log('📕 Book details page - Annotations:', {
        bookId: book.id,
        bookmarks: bookmarks.length,
        highlights: highlights.length,
        annotations: annotations.length,
      });
    }
  }, [book, bookmarks, highlights, annotations]);
  
  // Cache hook
  const {
    isDownloaded,
    isDownloading,
    downloadProgress,
    downloadBook,
    removeDownload,
    getCachedPath,
    refresh: refreshCacheStatus,
  } = useBookCache(id as string);

  useEffect(() => {
    loadBook();
  }, [id]);

  // Set header title when book is loaded
  // useEffect(() => {
  //   if (book) {
  //     navigation.setOptions({
  //       headerTitle: book.title || '',
  //       headerBackTitle: '', // Ensure back button has no text
  //     });
  //   } else {
  //     // Set to empty string if book is not loaded yet
  //     navigation.setOptions({
  //       headerTitle: '',
  //       headerBackTitle: '',
  //     });
  //   }
  // }, [book, navigation]);

  // Intercept back navigation when reader is shown
  usePreventRemove(showReader, () => {
    // Close the reader instead of navigating back
    console.log('⬅️ Back navigation intercepted - closing reader');
    setShowReader(false);
  });

  // Hide header/tab bar when reader is shown
  useFocusEffect(
    React.useCallback(() => {
      // Update reading state for feast banner visibility
      setIsReading(showReader);
      
      // Set header options including title (preserve title when setting other options)
      console.log('[book/[id]] nav theme before setOptions', {
        navPrimary: navTheme.colors?.primary,
        navText: navTheme.colors?.text,
        navBackground: navTheme.colors?.background,
        navCard: navTheme.colors?.card,
      });
      console.log('[book/[id]] setOptions before', {
        showReader,
        colorScheme,
        intendedHeaderTintColor: Colors[colorScheme ?? 'light'].text,
        intendedHeaderBg: Colors[colorScheme ?? 'light'].surface,
        bookTitle: book?.title,
      });
      navigation.setOptions({
        headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].surface }, 
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        headerTitle: book?.title || '',
        headerShown: !showReader, // Hide header when reader is shown
        headerBackTitle: '', // Ensure back button has no text
        // Provide a custom back button so its color isn't driven by NavigationTheme.colors.primary
        headerLeft: (props) => (
          <HeaderBackButton
            {...props}
            tintColor={Colors[colorScheme ?? 'light'].text}
            onPress={() => {
              console.log('[book/[id]] headerBack pressed');
              if ((navigation as any).canGoBack?.()) {
                (navigation as any).goBack();
              }
            }}
            // optional: ensure minimal back button style if needed
            labelVisible={false}
          />
        ),
        // Control back button menu based on reader state
        headerBackButtonMenuEnabled: !showReader, // Enabled when reader is hidden, disabled when shown
      });
      console.log('[book/[id]] setOptions after submit');
      // Post-commit check (next tick)
      setTimeout(() => {
        console.log('[book/[id]] nav theme after setOptions (timeout 0)', {
          navPrimary: navTheme.colors?.primary,
          navText: navTheme.colors?.text,
          navBackground: navTheme.colors?.background,
          navCard: navTheme.colors?.card,
        });
      }, 0);
      
      // Hide tab bar when reader is shown
      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        parentNavigation.setOptions({
          tabBarStyle: getTabBarStyle({
            //colorScheme: colorScheme ?? 'light',
            insets,
            isHidden: showReader,
          }),
          tabBarVisible: !showReader
        });
      }
      
      // Cleanup function to restore tab bar when leaving
      return () => {
        console.log('[book/[id]] cleanup (leaving focus)', { showReaderAtCleanup: showReader });
        setIsReading(false); // Reset reading state
        if (parentNavigation) {
          parentNavigation.setOptions({
            tabBarStyle: getTabBarStyle({
              //colorScheme: colorScheme ?? 'light',
              insets,
              isHidden: false,
            })
          });
        }
      };
    }, [navigation, showReader, setIsReading, insets, colorScheme, book])
  );

  // Debug: track dependency changes that can affect header options
  useEffect(() => {
    console.log('[book/[id]] deps changed', { showReader, colorScheme, bookTitle: book?.title });
  }, [showReader, colorScheme, book]);

  // Debug: navigation lifecycle events
  useEffect(() => {
    const unsub1 = navigation.addListener('focus', () => console.log('[book/[id]] navigation focus'));
    const unsub2 = navigation.addListener('blur', () => console.log('[book/[id]] navigation blur'));
    const unsub3 = navigation.addListener('transitionEnd', () => console.log('[book/[id]] navigation transitionEnd'));
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [navigation]);

  // Debug: observe navigation theme changes
  useEffect(() => {
    console.log('[book/[id]] nav theme changed', {
      navPrimary: navTheme.colors?.primary,
      navText: navTheme.colors?.text,
      navBackground: navTheme.colors?.background,
      navCard: navTheme.colors?.card,
    });
  }, [navTheme.colors?.primary, navTheme.colors?.text, navTheme.colors?.background, navTheme.colors?.card]);

  const loadBook = async () => {
    try {
      setLoading(true);
      if (id) {
        const bookData = await getBookById(id as string);
        setBook(bookData);
      }
    } catch (error) {
      console.error('Error loading book:', error);
      Alert.alert('Error', 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async () => {
    if (!book?.epubPath) {
      Alert.alert('Reading Unavailable', 'This book is not available for reading.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to read books.');
      return;
    }

    // Check if we have cached version
    const cachedPath = await getCachedPath();
    if (cachedPath) {
      console.log('Using cached EPUB:', cachedPath);
    }

    setShowReader(true);
  };

  const handleDownload = async () => {
    if (!book?.epubPath) {
      Alert.alert('Download Unavailable', 'This book is not available for download.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to download books.');
      return;
    }

    try {
      await downloadBook(book);
      Alert.alert('Success', 'Book downloaded successfully!');
    } catch (error) {
      console.error('Error downloading book:', error);
      Alert.alert('Download Failed', 'Unable to download book. Please try again.');
    }
  };

  const handleRemoveDownload = () => {
    Alert.alert(
      'Remove Download',
      'Remove this book from your device? Your reading progress will be kept.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeDownload();
              Alert.alert('Success', 'Book removed from device.');
            } catch (error) {
              console.error('Error removing download:', error);
              Alert.alert('Error', 'Failed to remove download. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/auth');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh both book data and reading progress
      await Promise.all([
        loadBook(),
        refreshProgress()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearProgress = async () => {
    if (!book || !user) return;

    Alert.alert(
      'Clear Reading Progress',
      'Are you sure you want to clear your reading progress for this book? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Progress',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProgress(book.id);
              Alert.alert('Success', 'Reading progress has been cleared.');
            } catch (error) {
              console.error('Error clearing progress:', error);
              Alert.alert('Error', 'Failed to clear reading progress. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleViewAnnotations = () => {
    console.log('Opening annotations list from book details, annotations:', annotations.length);
    setShowAnnotationsList(true);
  };

  const handleNavigateToAnnotation = (annotation: Annotation) => {
    console.log('🎯 Navigating to annotation from book details');
    setShowAnnotationsList(false);
    // Open the book reader - it will automatically navigate to the saved location
    // since the hook loads the most recent position
    setShowReader(true);
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
      // Close note editor and reopen annotations list
      setShowNoteEditor(false);
      setEditingAnnotation(null);
      setShowAnnotationsList(true);
    } else {
      Alert.alert('Error', 'Failed to save note');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading book details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showReader && book) {
    return (
      <EpubReader 
        book={book} 
        onClose={() => setShowReader(false)} 
      />
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="book-outline" size={48} color={Colors[colorScheme ?? 'light'].textMuted} />
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Book not found
          </Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme ?? 'light'].primary}
            colors={[Colors[colorScheme ?? 'light'].primary]}
          />
        }
      >
        

        {/* Book Cover and Basic Info */}
        <View style={styles.bookHeader}>
          <View style={styles.bookCoverContainer}>
            {book.coverImage ? (
              <Image 
                source={{ uri: book.coverImage }} 
                style={styles.bookCoverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.bookCoverPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                <Ionicons 
                  name="book" 
                  size={60} 
                  color={Colors[colorScheme ?? 'light'].primary} 
                />
              </View>
            )}
          </View>
          
          <View style={styles.bookInfo}>
            <Text style={[styles.bookTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              {book.title}
            </Text>
            <Text style={[styles.bookAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              by {book.author}
            </Text>
            {book.year && (
              <Text style={[styles.bookYear, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                {book.year}
              </Text>
            )}
            <View style={styles.categoryContainer}>
              <Text style={[styles.categoryLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                {book.categories.length > 1 ? 'Categories:' : 'Category:'}
              </Text>
              <View style={styles.categoriesRow}>
                {book.categories.map((category, index) => (
                  <View key={index} style={[styles.categoryBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                    <Text style={[styles.categoryValue, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      {category}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Reading Progress Section */}
            {user && isBookInProgress(book.id) && (
            <View style={styles.section}>
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
                          width: `${getBookProgressPercentage(book.id)}%`
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {Math.round(getBookProgressPercentage(book.id))}% Complete
                  </Text>
                </View>
              </View>
            </View>
            )}

          </View>
        </View>

        {/* Reading Section */}
        {user ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Reading Options
            </Text>
            <View style={styles.buttonContainer}>
              {/* Primary Read Button */}
              <TouchableOpacity 
                style={[
                  styles.readButton, 
                  { 
                    backgroundColor: book.epubPath ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].surface,
                    opacity: book.epubPath ? 1 : 0.5
                  }
                ]}
                onPress={handleRead}
                disabled={!book.epubPath}
              >
                <Ionicons 
                  name="book" 
                  size={20} 
                  color={book.epubPath ? Colors[colorScheme ?? 'light'].dominicanWhite : Colors[colorScheme ?? 'light'].textMuted} 
                />
                <Text style={[
                  styles.readButtonText, 
                  { 
                    color: book.epubPath ? Colors[colorScheme ?? 'light'].dominicanWhite : Colors[colorScheme ?? 'light'].textMuted 
                  }
                ]}>
                  {book.epubPath ? (isDownloaded ? 'Read Book (Downloaded)' : 'Read Book') : 'Reading Unavailable'}
                </Text>
              </TouchableOpacity>

              {/* View Annotations Button */}
              {annotations.length > 0 && (
                <TouchableOpacity 
                  style={[
                    styles.annotationsButton, 
                    { 
                      backgroundColor: Colors[colorScheme ?? 'light'].surface,
                      borderColor: Colors[colorScheme ?? 'light'].primary,
                      borderWidth: 1,
                    }
                  ]}
                  onPress={handleViewAnnotations}
                >
                  <Ionicons 
                    name="bookmarks" 
                    size={18} 
                    color={Colors[colorScheme ?? 'light'].primary} 
                  />
                  <Text style={[
                    styles.annotationsButtonText, 
                    { color: Colors[colorScheme ?? 'light'].primary }
                  ]}>
                    View Annotations ({annotations.length})
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Secondary Buttons Row */}
              {(book.epubPath && Platform.OS !== 'web') || isBookInProgress(book.id) ? (
                <View style={styles.secondaryButtonsRow}>
                  {/* Download or Remove Download Button */}
                  {book.epubPath && Platform.OS !== 'web' && (
                    !isDownloaded ? (
                      <TouchableOpacity 
                        style={[
                          styles.secondaryButton,
                          isBookInProgress(book.id) ? styles.secondaryButtonHalf : styles.secondaryButtonFull,
                          { 
                            backgroundColor: Colors[colorScheme ?? 'light'].surface,
                            borderColor: Colors[colorScheme ?? 'light'].border,
                            borderWidth: 1,
                          }
                        ]}
                        onPress={handleDownload}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <>
                            <Ionicons 
                              name="hourglass" 
                              size={16} 
                              color={Colors[colorScheme ?? 'light'].textSecondary} 
                            />
                            <Text style={[
                              styles.secondaryButtonText, 
                              { color: Colors[colorScheme ?? 'light'].textSecondary }
                            ]}>
                              {Math.round(downloadProgress * 100)}%
                            </Text>
                          </>
                        ) : (
                          <>
                            <Ionicons 
                              name="download-outline" 
                              size={16} 
                              color={Colors[colorScheme ?? 'light'].textSecondary} 
                            />
                            <Text style={[
                              styles.secondaryButtonText, 
                              { color: Colors[colorScheme ?? 'light'].textSecondary }
                            ]}>
                              Download
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={[
                          styles.secondaryButton,
                          isBookInProgress(book.id) ? styles.secondaryButtonHalf : styles.secondaryButtonFull,
                          { 
                            backgroundColor: Colors[colorScheme ?? 'light'].surface,
                            borderColor: Colors[colorScheme ?? 'light'].border,
                            borderWidth: 1,
                          }
                        ]}
                        onPress={handleRemoveDownload}
                      >
                        <Ionicons 
                          name="trash-outline" 
                          size={16} 
                          color={Colors[colorScheme ?? 'light'].textSecondary} 
                        />
                        <Text style={[
                          styles.secondaryButtonText, 
                          { color: Colors[colorScheme ?? 'light'].textSecondary }
                        ]}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    )
                  )}

                  {/* Clear Progress Button */}
                  {isBookInProgress(book.id) && (
                    <TouchableOpacity 
                      style={[
                        styles.secondaryButton,
                        (book.epubPath && Platform.OS !== 'web') ? styles.secondaryButtonHalf : styles.secondaryButtonFull,
                        { 
                          backgroundColor: Colors[colorScheme ?? 'light'].surface,
                          borderColor: Colors[colorScheme ?? 'light'].border,
                          borderWidth: 1,
                        }
                      ]}
                      onPress={handleClearProgress}
                    >
                      <Ionicons 
                        name="close-circle-outline" 
                        size={16} 
                        color={Colors[colorScheme ?? 'light'].textSecondary} 
                      />
                      <Text style={[
                        styles.secondaryButtonText, 
                        { color: Colors[colorScheme ?? 'light'].textSecondary }
                      ]}>
                        Clear Progress
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </View>
            {!book.epubPath && (
              <Text style={[styles.downloadNote, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                This book is not available for reading or download at this time.
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={[styles.loginPrompt, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <Ionicons name="lock-closed" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.loginPromptText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Login required to read and download books
              </Text>
              <TouchableOpacity 
                style={[styles.loginButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={handleLogin}
              >
                <Text style={[styles.loginButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Description - Show long description if available, otherwise show regular description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Description
          </Text>
          {book.longDescription && book.longDescription.length > 0 ? (
            // Show long description as paragraphs
            book.longDescription.map((paragraph, index) => (
              <Text 
                key={index}
                style={[styles.longDescription, { color: Colors[colorScheme ?? 'light'].text }]}
              >
                {paragraph}
              </Text>
            ))
          ) : (
            // Show regular description
            <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].text }]}>
              {book.description}
            </Text>
          )}
        </View>

        {/* Bottom padding to ensure content is accessible */}
        <View style={[styles.bottomPadding, { height: 80 + Math.max(insets.bottom, 10) }]} />

      </ScrollView>

      {/* Note Editor Modal */}
      <AnnotationNoteEditor
        visible={showNoteEditor}
        initialNote={editingAnnotation?.note || ''}
        context={editingAnnotation ? (() => {
          // Extract rich context from bookmark/highlight data
          try {
            const data = editingAnnotation.data as any;
            const locData = JSON.parse(data.location);
            let context = '';
            if (locData.title) {
              context = locData.title;
            }
            const progress = locData.locations?.totalProgression;
            if (progress) {
              context += ` • ${Math.round(progress * 100)}% through book`;
            }
            return context || editingAnnotation.location;
          } catch (e) {
            return editingAnnotation.text || editingAnnotation.location;
          }
        })() : ''}
        onSave={handleSaveNote}
        onClose={() => {
          setShowNoteEditor(false);
          setEditingAnnotation(null);
          // Return to annotations list
          setShowAnnotationsList(true);
        }}
      />

      {/* Annotations List Modal */}
      <AnnotationsListView
        visible={showAnnotationsList}
        annotations={annotations}
        onClose={() => setShowAnnotationsList(false)}
        onNavigateToAnnotation={handleNavigateToAnnotation}
        onDeleteAnnotation={handleDeleteAnnotation}
        onEditNote={handleEditNote}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...StudyStyles,
  
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
    padding: 20,
  },
  
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  errorText: {
    fontSize: 18,
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 24,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  backButton: {
    padding: 8,
  },
  
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  
  headerSpacer: {
    width: 40,
  },
  
  bookHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  bookCoverContainer: {
    width: 120,
    height: 160,
    marginRight: 16,
    position: 'relative',
  },
  
  bookCoverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  
  bookCoverPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  bookInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  
  bookTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  
  bookAuthor: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  
  bookYear: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  categoryLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginRight: 8,
  },
  
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  
  categoryValue: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 12,
  },
  
  description: {
    fontSize: 16,
    fontFamily: 'Georgia',
    lineHeight: 24,
  },
  
  longDescription: {
    fontSize: 16,
    fontFamily: 'Georgia',
    lineHeight: 24,
    marginBottom: 12,
  },
  
  buttonContainer: {
    gap: 12,
  },
  
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  
  readButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  annotationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  
  annotationsButtonText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  
  secondaryButtonHalf: {
    flex: 1,
  },
  
  secondaryButtonFull: {
    flex: 1,
  },
  
  secondaryButtonText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '500',
    marginLeft: 6,
  },
  
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  
  downloadButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  downloadNote: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  
  loginPromptText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    flex: 1,
    marginLeft: 12,
  },
  
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  
  loginButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  
  progressContainer: {
    marginTop: 8,
  },
  
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  
  progressText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'right',
  },
  
  clearProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  
  clearProgressText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '500',
    marginLeft: 4,
  },
  
  bottomPadding: {
    // Dynamic height is set inline to account for safe area insets
  },
});
