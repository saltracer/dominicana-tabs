import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ReadiumView } from 'react-native-readium';
import { File, Directory, Paths } from 'expo-file-system';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { Book } from '../types';
import { supabase } from '../lib/supabase';
import { useReadingProgress } from '../contexts/ReadingProgressContext';
import { ReadingProgressService } from '../services/ReadingProgressService';

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

  // Debounced progress saving
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
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
    
    // Cleanup function to delete downloaded file when component unmounts or book changes
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (localFilePath) {
        try {
          const file = new File(localFilePath);
          if (file.exists) {
            console.log('Cleaning up EPUB file:', localFilePath);
            file.delete();
          }
        } catch (error: any) {
          console.warn('Failed to delete EPUB file:', error);
        }
      }
    };
  }, [book, localFilePath]);

  const navigateToSavedLocation = useCallback(() => {
    if (initialLocation && readiumViewRef) {
      console.log('🎯 Navigating to saved location:', initialLocation);
      try {
        // Use the ReadiumView's navigation method
        if (readiumViewRef.goToLocation) {
          readiumViewRef.goToLocation(initialLocation);
          console.log('✅ Successfully navigated to saved location');
        } else {
          console.log('⚠️ goToLocation method not available on ReadiumView');
        }
      } catch (error) {
        console.error('❌ Error navigating to saved location:', error);
      }
    }
  }, [initialLocation, readiumViewRef]);

  // Navigate to saved location after ReadiumView loads
  useEffect(() => {
    if (initialLocation && readiumViewRef) {
      // Add a small delay to ensure ReadiumView is fully loaded
      const timer = setTimeout(() => {
        navigateToSavedLocation();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [initialLocation, readiumViewRef, navigateToSavedLocation]);

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

      // Clean up any existing file for this book first
      const fileName = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
      const existingFile = new File(Paths.cache, fileName);
      if (existingFile.exists) {
        console.log('Cleaning up existing file before new download');
        existingFile.delete();
      }

      // Extract file path from the URL
      const urlPath = book.epubPath;
      let filePath = '';
      
      if (urlPath.includes('/storage/v1/object/')) {
        const parts = urlPath.split('/storage/v1/object/');
        if (parts.length > 1) {
          const pathParts = parts[1].split('/');
          if (pathParts.length > 2) {
            filePath = pathParts.slice(2).join('/'); // Remove 'public' and bucket name
          }
        }
      }

      console.log('Original URL:', urlPath);
      console.log('Extracted file path:', filePath);

      // Generate signed URL for private storage access
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('epub_files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (signedUrlError) {
        console.error('Error generating signed URL:', signedUrlError);
        throw new Error('Failed to generate download URL');
      }

      if (!signedUrlData?.signedUrl) {
        throw new Error('No download URL available');
      }

      console.log('Generated signed URL:', signedUrlData.signedUrl);

      // Download the EPUB file locally using the new FileSystem API
      const outputFile = new File(Paths.cache, fileName);
      
      console.log('Downloading EPUB to:', outputFile.uri);
      
      // Use File.downloadFileAsync for downloading
      const downloadedFile = await File.downloadFileAsync(
        signedUrlData.signedUrl,
        outputFile
      );

      if (!downloadedFile.exists) {
        throw new Error('Download failed - file does not exist');
      }

      console.log('EPUB downloaded successfully to:', downloadedFile.uri);
      setLocalFilePath(downloadedFile.uri);
    } catch (err) {
      console.error('Error loading EPUB file:', err);
      setError(err instanceof Error ? err.message : 'Failed to load EPUB file');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadEpubFile();
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
    <View style={styles.container}>
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
        style={styles.readiumView}
        preferences={{
          // fontSize: 100, // Default font size percentage
          // fontFamily: 'serif',
          // pageMargins: 15, // Page margins
          theme: colorScheme === 'dark' ? 'dark' : 'light',
        }}
        onLocationChange={(locator) => {
          console.log('🔄 Location changed:', {
            href: locator?.href,
            locations: locator?.locations,
            progression: locator?.locations?.progression,
            totalProgression: locator?.locations?.totalProgression,
            position: locator?.locations?.position
          });
        
        // Only save if location has actually changed and we're not currently saving
        const currentLocation = JSON.stringify(locator);
        const hasChanged = currentLocation !== lastSavedLocation;
        const isNotSaving = !savingProgress;
        
        console.log('📊 Location change analysis:', {
          hasChanged,
          isNotSaving,
          willSave: hasChanged && isNotSaving,
          lastSavedLength: lastSavedLocation?.length || 0,
          currentLength: currentLocation.length
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
