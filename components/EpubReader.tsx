import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ReadiumView } from 'react-native-readium';
import { File, Directory, Paths } from 'expo-file-system';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { Book, Annotation, HighlightColor } from '../types';
import { supabase } from '../lib/supabase';
import { useReadingProgress } from '../contexts/ReadingProgressContext';
import { ReadingProgressService } from '../services/ReadingProgressService';
import { useBookAnnotations } from '../hooks/useBookAnnotations';
import { ReadingAnnotationOverlay } from './ReadingAnnotationOverlay';
import { HighlightColorPicker } from './HighlightColorPicker';
import { AnnotationNoteEditor } from './AnnotationNoteEditor';
import { AnnotationsListView } from './AnnotationsListView';
import { BookCacheService } from '../services/BookCacheService';

interface EpubReaderProps {
  book: Book;
  onClose: () => void;
}

export const EpubReader: React.FC<EpubReaderProps> = ({ book, onClose }) => {
  const { colorScheme } = useTheme();
  const { saveProgress, getBookProgress } = useReadingProgress();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localFilePath, setLocalFilePath] = useState<string | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [lastSavedLocation, setLastSavedLocation] = useState<string | null>(null);
  const [initialLocation, setInitialLocation] = useState<any>(null);
  const [readiumViewRef, setReadiumViewRef] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [navigationTarget, setNavigationTarget] = useState<any>(null);

  // Annotation state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showAnnotationsList, setShowAnnotationsList] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  
  // FAB visibility state (sync with ReadiumView header)
  const [showFab, setShowFab] = useState(false);
  const fabTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch tracking for distinguishing taps from swipes
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Debounced progress saving
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Book annotations hook
  const {
    bookmarks,
    highlights,
    annotations,
    isBookmarked,
    addBookmark,
    removeBookmark,
    updateBookmarkNote,
    addHighlight,
    removeHighlight,
    updateHighlight,
  } = useBookAnnotations(book.id);

  // Debug annotations loading
  useEffect(() => {
    console.log('📊 Annotations state updated:', {
      bookId: book.id,
      bookmarks: bookmarks.length,
      highlights: highlights.length,
      annotations: annotations.length,
    });
  }, [bookmarks, highlights, annotations, book.id]);

  // Clear navigation target after it's been used
  useEffect(() => {
    if (navigationTarget) {
      console.log('🧹 Clearing navigation target after use');
      const timer = setTimeout(() => {
        setNavigationTarget(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [navigationTarget]);

  // Handle touch events to distinguish taps from swipes
  const handlePressIn = (event: any) => {
    console.log('🔘 Press in detected');
    const { pageX, pageY } = event.nativeEvent;
    touchStartRef.current = {
      x: pageX,
      y: pageY,
      time: Date.now()
    };
  };

  const handlePressOut = (event: any) => {
    console.log('🔘 Press out detected');
    if (!touchStartRef.current) return;

    const { pageX, pageY } = event.nativeEvent;
    const deltaX = Math.abs(pageX - touchStartRef.current.x);
    const deltaY = Math.abs(pageY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    console.log('🔘 Touch analysis:', { deltaX, deltaY, deltaTime });
    
    // Consider it a tap if:
    // - Movement is less than 15 pixels
    // - Duration is less than 300ms
    const isTap = deltaX < 15 && deltaY < 15 && deltaTime < 300;
    
    console.log('🔘 Is tap?', isTap);
    
    if (isTap) {
      console.log('🔘 Tapping FAB toggle');
      // Toggle FAB visibility on tap
      setShowFab(prev => !prev);
      
      // Clear existing timeout
      // if (fabTimeoutRef.current) {
      //   clearTimeout(fabTimeoutRef.current);
      // }
      
      // If FAB is now visible, set timer to hide it after 3 seconds
      // if (!showFab) {
      //   fabTimeoutRef.current = setTimeout(() => {
      //     setShowFab(false);
      //   }, 3000);
      // }
    }
    
    // Reset touch tracking
    touchStartRef.current = null;
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fabTimeoutRef.current) {
        clearTimeout(fabTimeoutRef.current);
      }
    };
  }, []);

  // Hide status bar when EPUB reader is active
  useEffect(() => {
    // Status bar will be hidden by the StatusBar component below
    return () => {
      // Status bar will be restored when component unmounts
    };
  }, []);

  // Track if current page is bookmarked (re-compute when location or bookmarks change)
  const [isPageBookmarked, setIsPageBookmarked] = useState(false);
  
  useEffect(() => {
    console.log('════════════════════════════════════');
    console.log('🔄 BOOKMARK STATUS CHECK TRIGGERED');
    console.log('Current location:', currentLocation?.href, 'position:', currentLocation?.locations?.position);
    console.log('Total bookmarks:', bookmarks.length);
    console.log('Current isPageBookmarked state:', isPageBookmarked);
    
    if (!currentLocation || !currentLocation.href) {
      console.log('🔍 No current location, setting bookmarked to FALSE');
      setIsPageBookmarked(false);
      return;
    }
    
    // Check if we're near any bookmark (same href AND within 2 positions)
    const currentHref = currentLocation.href;
    const currentPosition = currentLocation.locations?.position || 0;
    const POSITION_THRESHOLD = 0; // Consider within 2 positions as "near"
    
    console.log('Checking if near bookmark:', currentHref, 'position:', currentPosition);
    
    // Log all bookmarks for comparison
    console.log('All bookmarks:', bookmarks.map(b => {
      try {
        const loc = JSON.parse(b.location);
        return `${loc.href} pos:${loc.locations?.position}`;
      } catch (e) {
        return 'parse error';
      }
    }));
    
    const nearBookmark = bookmarks.some(bookmark => {
      try {
        const bookmarkLoc = JSON.parse(bookmark.location);
        const bookmarkPosition = bookmarkLoc.locations?.position || 0;
        
        // Must be same href
        if (bookmarkLoc.href !== currentHref) {
          return false;
        }
        
        // Must be within threshold positions
        const positionDiff = Math.abs(currentPosition - bookmarkPosition);
        const isNear = positionDiff <= POSITION_THRESHOLD;
        
        console.log(`  Bookmark at pos ${bookmarkPosition}, current ${currentPosition}, diff ${positionDiff}, near? ${isNear}`);
        return isNear;
      } catch (e) {
        console.log('  Parse error for bookmark');
        return false;
      }
    });
    
    console.log('🎯 FINAL RESULT: Setting bookmark status to:', nearBookmark);
    console.log('════════════════════════════════════');
    setIsPageBookmarked(nearBookmark);
  }, [currentLocation?.href, currentLocation?.locations?.position, bookmarks]);
  
  const saveProgressDebounced = useCallback(
    (locator: any) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout
      saveTimeoutRef.current = setTimeout(async () => {
        if (savingProgress) return;
        
        try {
          setSavingProgress(true);
          
            const progressPercentage = ReadingProgressService.calculateProgressPercentage(locator);
            const pageInfo = ReadingProgressService.extractPageInfo(locator);
            const locationString = JSON.stringify(locator);
            
            console.log('💾 Saving progress:', {
              bookId: book.id,
              bookTitle: book.title,
              progressPercentage,
              pageInfo,
              locatorProgression: locator?.locations?.progression,
              locatorTotalProgression: locator?.locations?.totalProgression,
              locationString: locationString.substring(0, 100) + '...'
            });
          
          await saveProgress({
            book_id: book.id,
            book_title: book.title,
            current_location: locationString,
            progress_percentage: progressPercentage,
            total_pages: pageInfo.totalPages,
            current_page: pageInfo.currentPage,
          });
          
          setLastSavedLocation(locationString);
          console.log('✅ Progress saved successfully');
        } catch (error) {
          console.error('❌ Error saving progress:', error);
        } finally {
          setSavingProgress(false);
        }
      }, 2000); // Increased to 2 seconds to reduce frequency
      
    },
    [book, saveProgress, savingProgress]
  );

  useEffect(() => {
    loadSavedProgress();
    loadEpubFile();
    
    // Cleanup function - don't delete cached files, keep them for reuse
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Note: We keep the cached EPUB file for future use
      console.log('📚 EpubReader unmounting, keeping cached file for reuse');
    };
  }, [book, localFilePath]);

  // Note: Navigation to saved progress is handled by file.initialLocation prop
  // Navigation to bookmarks is handled by location prop

  const loadSavedProgress = async () => {
    try {
      console.log('🔍 Loading saved progress for book:', book.id);
      const savedProgress = await getBookProgress(book.id);
      
      if (savedProgress && savedProgress.current_location) {
        console.log('✅ Found saved progress:', {
          bookId: savedProgress.book_id,
          progressPercentage: savedProgress.progress_percentage,
          currentLocation: savedProgress.current_location,
          lastReadAt: savedProgress.last_read_at
        });
        
        const location = JSON.parse(savedProgress.current_location);
        console.log('📍 Parsed location:', location);
        
        setInitialLocation(location);
        setLastSavedLocation(savedProgress.current_location);
        console.log('🎯 Set initial location for ReadiumView');
      } else {
        console.log('❌ No saved progress found, starting from beginning');
        setInitialLocation(null);
        setLastSavedLocation(null);
      }
    } catch (error) {
      console.error('❌ Error loading saved progress:', error);
      setInitialLocation(null);
      setLastSavedLocation(null);
    }
  };

  const loadEpubFile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!book.epubPath) {
        throw new Error('No EPUB file available for this book');
      }

      console.log('📚 Loading EPUB for book:', book.id, book.title);

      // Use BookCacheService to get cached file or download if needed
      const cachedPath = await BookCacheService.downloadEpub(book, (progress) => {
        console.log('📥 Download progress:', Math.round(progress * 100) + '%');
      });

      if (!cachedPath) {
        throw new Error('Failed to get EPUB file path');
      }

      console.log('✅ EPUB ready at:', cachedPath);
      setLocalFilePath(cachedPath);
    } catch (err) {
      console.error('❌ Error loading EPUB file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load EPUB file');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadEpubFile();
  };

  // Annotation handlers
  const handleAddBookmark = async () => {
    console.log('📑 handleAddBookmark called');
    console.log('Current location:', currentLocation);
    console.log('Book ID:', book.id);
    console.log('Existing bookmarks:', bookmarks.length);
    
    if (!currentLocation) {
      console.warn('❌ No current location available');
      Alert.alert('Please Wait', 'Location not yet available. Please try again in a moment.');
      return;
    }
    
    const locationString = JSON.stringify(currentLocation);
    console.log('📍 Adding bookmark with location:', locationString.substring(0, 100) + '...');
    
    const success = await addBookmark(locationString);
    
    console.log('✅ Bookmark add result:', success);
    console.log('📚 Total bookmarks after add:', bookmarks.length);
    
    if (success) {
      // Alert.alert('Success', 'Bookmark added');
    } else {
      Alert.alert('Error', 'Failed to add bookmark');
    }
  };

  const handleRemoveBookmark = async () => {
    if (!currentLocation || !currentLocation.href) return;
    
    // Find bookmark on the same page (href)
    const currentHref = currentLocation.href;
    const bookmark = bookmarks.find(b => {
      try {
        const bookmarkLoc = JSON.parse(b.location);
        return bookmarkLoc.href === currentHref;
      } catch (e) {
        return false;
      }
    });
    
    if (bookmark) {
      console.log('🗑️ Removing bookmark:', bookmark.id);
      const success = await removeBookmark(bookmark.id);
      if (success) {
        Alert.alert('Success', 'Bookmark removed');
      }
    } else {
      console.log('⚠️ No bookmark found on this page');
      Alert.alert('Info', 'No bookmark found on this page');
    }
  };

  const handleAddHighlight = () => {
    Alert.alert(
      'Add Highlight',
      'Highlights in EPUB books are stored but not visually rendered due to current reader limitations. You can view all highlights in the annotations list.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => setShowColorPicker(true) }
      ]
    );
  };

  const handleViewAnnotations = () => {
    console.log('📋 Opening annotations list');
    console.log('Total annotations:', annotations.length);
    console.log('Bookmarks:', bookmarks.length);
    console.log('Highlights:', highlights.length);
    console.log('Show modal state before:', showAnnotationsList);
    console.log('Annotations array:', JSON.stringify(annotations, null, 2));
    setShowAnnotationsList(true);
    console.log('Show modal state after:', true);
  };

  const handleColorSelect = async (color: HighlightColor) => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }
    
    const locationString = JSON.stringify(currentLocation);
    // For EPUB, we store highlight metadata without visual rendering
    const success = await addHighlight(
      locationString,
      'Highlighted text', // Placeholder - would need text selection to get actual text
      color
    );
    
    if (success) {
      Alert.alert('Success', 'Highlight added to annotations');
    }
  };

  const handleNavigateToAnnotation = (annotation: Annotation) => {
    console.log('🎯 Navigating to annotation:', annotation.id);
    setShowAnnotationsList(false);
    
    try {
      // Get the actual location data from the data field (BookBookmark has location as JSON string)
      const bookmarkData = annotation.data as any;
      console.log('📍 Bookmark data:', bookmarkData);
      
      if (!bookmarkData.location) {
        console.error('❌ No location data in bookmark');
        Alert.alert('Error', 'This bookmark has no location data');
        return;
      }
      
      const locationData = JSON.parse(bookmarkData.location);
      console.log('📍 Parsed location:', locationData);
      console.log('🚀 Setting navigation target to update ReadiumView location prop...');
      
      // react-native-readium uses the `location` prop for navigation, not a ref method
      setNavigationTarget(locationData);
      console.log('✅ Navigation target set - ReadiumView will navigate on next render');
    } catch (error) {
      console.error('❌ Error navigating to annotation:', error);
      Alert.alert('Error', 'Failed to navigate to annotation');
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
    console.log('✏️ Opening note editor for annotation:', annotation.id);
    setEditingAnnotation(annotation);
    setShowAnnotationsList(false);
    setShowNoteEditor(true);
  };

  const handleSaveNote = async (note: string) => {
    if (!editingAnnotation) return;
    
    console.log('💾 Saving note for annotation:', editingAnnotation.id);
    let success = false;
    if (editingAnnotation.type === 'bookmark') {
      success = await updateBookmarkNote(editingAnnotation.id, note);
    } else {
      success = await updateHighlight(editingAnnotation.id, undefined, note);
    }
    
    if (success) {
      console.log('✅ Note saved, returning to annotations list');
      // Close note editor and reopen annotations list
      setShowNoteEditor(false);
      setEditingAnnotation(null);
      // Return to annotations list
      setShowAnnotationsList(true);
    } else {
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const isCurrentLocationBookmarked = () => {
    if (!currentLocation || !currentLocation.href) {
      console.log('🔍 isCurrentLocationBookmarked: No current location');
      return false;
    }
    
    // Check if any bookmark is on the same page (href), not exact position
    const currentHref = currentLocation.href;
    const bookmarkedOnThisPage = bookmarks.some(bookmark => {
      try {
        const bookmarkLoc = JSON.parse(bookmark.location);
        return bookmarkLoc.href === currentHref;
      } catch (e) {
        return false;
      }
    });
    
    console.log('🔍 isCurrentLocationBookmarked:', bookmarkedOnThisPage, 'Current href:', currentHref, 'Total bookmarks:', bookmarks.length);
    return bookmarkedOnThisPage;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Preparing {book.title} for reading...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.errorContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Ionicons name="alert-circle" size={48} color={Colors[colorScheme ?? 'light'].error} />
        <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Unable to Load Book
        </Text>
        <Text style={[styles.errorMessage, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={handleRetry}
        >
          <Text style={[styles.retryButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
            Try Again
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface, marginTop: 10 }]}
          onPress={onClose}
        >
          <Text style={[styles.retryButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Close
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!localFilePath) {
    return (
      <SafeAreaView style={[styles.errorContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Ionicons name="book-outline" size={48} color={Colors[colorScheme ?? 'light'].textMuted} />
        <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          No EPUB File Available
        </Text>
        <Text style={[styles.errorMessage, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          This book is not available for reading at this time.
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={onClose}
        >
          <Text style={[styles.retryButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
            Close
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  console.log('📖 Rendering ReadiumView with:', {
    hasLocalFile: !!localFilePath,
    hasInitialLocation: !!initialLocation,
    initialLocation: initialLocation ? {
      href: initialLocation.href,
      locations: initialLocation.locations
    } : null
  });

  return (
    <>
      {/* Hide status bar when FAB is hidden for immersive reading experience */}
      <StatusBar hidden={!showFab} />
      <View style={styles.container}>
        {/* Bookmark Ribbon Indicator */}
        {isPageBookmarked && (
          <View style={styles.bookmarkRibbonContainer}>
            <View style={[styles.bookmarkRibbon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
              <Ionicons name="bookmark" size={18} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            </View>
            {/* V-notch at bottom */}
            <View style={styles.ribbonNotch}>
              <View style={[styles.ribbonNotchLeft, { borderTopColor: Colors[colorScheme ?? 'light'].primary }]} />
              <View style={[styles.ribbonNotchRight, { borderTopColor: Colors[colorScheme ?? 'light'].primary }]} />
            </View>
          </View>
        )}
        
        <TouchableWithoutFeedback 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.readiumView}>
            <ReadiumView 
              ref={(ref: any) => {
                if (ref && !readiumViewRef) {
                  setReadiumViewRef(ref);
                }
              }}
              file={{ 
                url: localFilePath,
                initialLocation: initialLocation
              }}
              location={navigationTarget} // Use location prop for navigation
              style={styles.readiumView}
            preferences={{
              // fontSize: 100, // Default font size percentage
              // fontFamily: 'serif',
              // pageMargins: 15, // Page margins
              theme: colorScheme === 'dark' ? 'dark' : 'light',
            }}
            onLocationChange={(locator) => {
          const newHref = locator?.href;
          const oldHref = currentLocation?.href;
          const newProgression = locator?.locations?.totalProgression || 0;
          const oldProgression = currentLocation?.locations?.totalProgression || 0;
          const direction = newProgression > oldProgression ? 'forward' : 'backward';
          
          console.log('🔄 Location changed:', {
            direction,
            oldHref,
            newHref,
            progression: locator?.locations?.progression,
            totalProgression: locator?.locations?.totalProgression,
            position: locator?.locations?.position
          });
        
        // Update current location for annotations - This triggers bookmark status update
        console.log('📍 Setting current location to:', newHref);
        setCurrentLocation(locator);
        
        // Only save if location has actually changed and we're not currently saving
        const currentLocationStr = JSON.stringify(locator);
        const hasChanged = currentLocationStr !== lastSavedLocation;
        const isNotSaving = !savingProgress;
        
        console.log('📊 Location change analysis:', {
          hasChanged,
          isNotSaving,
          willSave: hasChanged && isNotSaving,
          lastSavedLength: lastSavedLocation?.length || 0,
          currentLength: currentLocationStr.length
        });
        
        if (hasChanged && isNotSaving) {
          console.log('🚀 Triggering save progress...');
          saveProgressDebounced(locator);
        } else {
          console.log('⏸️ Skipping save (no change or already saving)');
        }
      }}
      onTableOfContents={(toc) => {
        console.log('Table of contents loaded:', toc);
      }}
        />
          </View>
        </TouchableWithoutFeedback>
      </View>

      {/* Annotation Overlay - Outside main container for proper z-index */}
      <View style={styles.overlayContainer}>
        <ReadingAnnotationOverlay
          isBookmarked={isPageBookmarked}
          onAddBookmark={handleAddBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onAddHighlight={handleAddHighlight}
          onViewAnnotations={handleViewAnnotations}
          visible={showFab}
        />
      </View>

      {/* Highlight Color Picker */}
      <HighlightColorPicker
        visible={showColorPicker}
        onSelectColor={handleColorSelect}
        onClose={() => setShowColorPicker(false)}
      />

      {/* Note Editor */}
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
          // Return to annotations list instead of dismissing everything
          setShowAnnotationsList(true);
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'box-none', // Allow touches to pass through except on children
  },
  bookmarkRibbonContainer: {
    position: 'absolute',
    top: 0,
    right: 16,
    zIndex: 100,
  },
  bookmarkRibbon: {
    width: 30,
    height: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  ribbonNotch: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  ribbonNotchLeft: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopColor: 'red', // Will be overridden inline
    borderRightColor: 'transparent',
  },
  ribbonNotchRight: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 15,
    borderLeftWidth: 15,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopColor: 'red', // Will be overridden inline
    borderLeftColor: 'transparent',
  },
  readiumView: {
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
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: '600',
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
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
});
