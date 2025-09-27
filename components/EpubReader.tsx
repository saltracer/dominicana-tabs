import React, { useState, useEffect } from 'react';
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
import * as FileSystem from 'expo-file-system/legacy';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { Book } from '../types';
import { supabase } from '../lib/supabase';

interface EpubReaderProps {
  book: Book;
  onClose: () => void;
}

export const EpubReader: React.FC<EpubReaderProps> = ({ book, onClose }) => {
  const { colorScheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localFilePath, setLocalFilePath] = useState<string | null>(null);

  useEffect(() => {
    loadEpubFile();
    
    // Cleanup function to delete downloaded file when component unmounts
    return () => {
      if (localFilePath) {
        FileSystem.deleteAsync(localFilePath, { idempotent: true })
          .catch((error: any) => console.warn('Failed to delete EPUB file:', error));
      }
    };
  }, [book]);

  const loadEpubFile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!book.epubPath) {
        throw new Error('No EPUB file available for this book');
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

      // Download the EPUB file locally using the legacy FileSystem API
      const fileName = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      console.log('Downloading EPUB to:', localUri);
      
      const downloadResult = await FileSystem.downloadAsync(
        signedUrlData.signedUrl,
        localUri
      );

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status: ${downloadResult.status}`);
      }

      console.log('EPUB downloaded successfully to:', localUri);
      setLocalFilePath(localUri);
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
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading Book...
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Preparing {book.title} for reading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Error
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
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
        </View>
      </SafeAreaView>
    );
  }

  if (!localFilePath) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            No File Available
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="book-outline" size={48} color={Colors[colorScheme ?? 'light'].textMuted} />
          <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            No EPUB File Available
          </Text>
          <Text style={[styles.errorMessage, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            This book is not available for reading at this time.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          {book.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.readerContainer}>
        <ReadiumView 
          file={{ url: localFilePath }}
          style={styles.readiumView}
          preferences={{
            fontSize: 100, // Default font size percentage
            fontFamily: 'serif',
            pageMargins: 15, // Page margins
          }}
          onLocationChange={(locator) => {
            console.log('Location changed:', locator);
          }}
          onTableOfContents={(toc) => {
            console.log('Table of contents loaded:', toc);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
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
  readerContainer: {
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
