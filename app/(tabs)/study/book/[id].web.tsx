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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { Book } from '../../../../types';
import { StudyStyles } from '../../../../styles';
import { useAuth } from '../../../../contexts/AuthContext';
import { useBooks } from '../../../../hooks/useBooks';

export default function BookDetailWebScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { getBookById } = useBooks();
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBook();
  }, [id]);

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

  const handleDownload = async () => {
    if (!book?.epubPath) {
      Alert.alert('Download Unavailable', 'This book is not available for download.');
      return;
    }

    try {
      // For now, we'll show an alert. In a real app, you'd implement actual download logic
      Alert.alert(
        'Download Book',
        `Would you like to download "${book.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Download', 
            onPress: () => {
              // In a real app, this would trigger the download
              Alert.alert('Download Started', 'The book download has been initiated.');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error downloading book:', error);
      Alert.alert('Error', 'Failed to download book');
    }
  };

  const handleLogin = () => {
    router.push('/auth');
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Book Details
          </Text>
          <View style={styles.headerSpacer} />
        </View>

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
                Category:
              </Text>
              <Text style={[styles.categoryValue, { color: Colors[colorScheme ?? 'light'].primary }]}>
                {book.category}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].text }]}>
            {book.description}
          </Text>
        </View>

        {/* Download Section */}
        {user ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Download
            </Text>
            <TouchableOpacity 
              style={[
                styles.downloadButton, 
                { 
                  backgroundColor: book.epubPath ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].surface,
                  opacity: book.epubPath ? 1 : 0.5
                }
              ]}
              onPress={handleDownload}
              disabled={!book.epubPath}
            >
              <Ionicons 
                name="download" 
                size={20} 
                color={book.epubPath ? Colors[colorScheme ?? 'light'].dominicanWhite : Colors[colorScheme ?? 'light'].textMuted} 
              />
              <Text style={[
                styles.downloadButtonText, 
                { 
                  color: book.epubPath ? Colors[colorScheme ?? 'light'].dominicanWhite : Colors[colorScheme ?? 'light'].textMuted 
                }
              ]}>
                {book.epubPath ? 'Download EPUB' : 'Download Unavailable'}
              </Text>
            </TouchableOpacity>
            {!book.epubPath && (
              <Text style={[styles.downloadNote, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                This book is not available for download at this time.
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={[styles.loginPrompt, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <Ionicons name="lock-closed" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.loginPromptText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Login required to download books
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

      </ScrollView>
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
    cursor: 'pointer',
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
  },
  
  categoryLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginRight: 8,
  },
  
  categoryValue: {
    fontSize: 14,
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
  
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
    cursor: 'pointer',
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
    cursor: 'pointer',
  },
  
  loginButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    cursor: 'pointer',
  },
  
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
});
