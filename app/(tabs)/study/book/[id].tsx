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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { Book } from '../../../../types';
import { StudyStyles } from '../../../../styles';
import { useAuth } from '../../../../contexts/AuthContext';
import { useReading } from '../../../../contexts/ReadingContext';
import { useReadingProgress } from '../../../../contexts/ReadingProgressContext';
import { useBooks } from '../../../../hooks/useBooks';
import { supabase } from '../../../../lib/supabase';
import { EpubReader } from '../../../../components/EpubReader';
import { getTabBarStyle } from '../../../../utils/tabBarStyles';

export default function BookDetailScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const { setIsReading } = useReading();
  const { getBookProgressPercentage, isBookInProgress } = useReadingProgress();
  const { getBookById } = useBooks();
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReader, setShowReader] = useState(false);

  useEffect(() => {
    loadBook();
  }, [id]);

  // Set header title when book is loaded
  useEffect(() => {
    if (book) {
      navigation.setOptions({
        title: book.title,
        headerBackButtonDisplayMode: 'minimal', // Show only back arrow, no text
      });
    }
  }, [book, navigation]);

  // Hide header/tab bar when reader is shown
  useFocusEffect(
    React.useCallback(() => {
      // Update reading state for feast banner visibility
      setIsReading(showReader);
      
      navigation.setOptions({
        headerShown: !showReader, // Hide header when reader is shown
      });
      
      // Hide tab bar when reader is shown
      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        parentNavigation.setOptions({
          tabBarStyle: getTabBarStyle({
            colorScheme: colorScheme ?? 'light',
            insets,
            isHidden: showReader,
          }),
          tabBarVisible: !showReader
        });
      }
      
      // Cleanup function to restore tab bar when leaving
      return () => {
        setIsReading(false); // Reset reading state
        if (parentNavigation) {
          parentNavigation.setOptions({
            tabBarStyle: getTabBarStyle({
              colorScheme: colorScheme ?? 'light',
              insets,
              isHidden: false,
            })
          });
        }
      };
    }, [navigation, showReader, setIsReading, insets, colorScheme])
  );

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

  const handleRead = () => {
    if (!book?.epubPath) {
      Alert.alert('Reading Unavailable', 'This book is not available for reading.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to read books.');
      return;
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
        return;
      }

      if (!signedUrlData?.signedUrl) {
        return;
      }

      const downloadUrl = signedUrlData.signedUrl;
      const fileName = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;

      console.log('Generated signed URL:', downloadUrl);

      if (Platform.OS === 'web') {
        // For web, create a proper download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile, use Linking to open the download URL
        const canOpen = await Linking.canOpenURL(downloadUrl);
        if (canOpen) {
          await Linking.openURL(downloadUrl);
        }
      }
    } catch (error) {
      console.error('Error downloading book:', error);
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        

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

            {/* Reading Progress Section */}
            {user && isBookInProgress(book.id) && (
            <View style={styles.section}>
              {/* <Text style={[styles.categoryLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Reading Progress
              </Text> */}
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
                  {book.epubPath ? 'Read Book' : 'Reading Unavailable'}
                </Text>
              </TouchableOpacity>
              
              {/* <TouchableOpacity 
                style={[
                  styles.downloadButton, 
                  { 
                    backgroundColor: book.epubPath ? Colors[colorScheme ?? 'light'].surface : Colors[colorScheme ?? 'light'].surface,
                    borderColor: Colors[colorScheme ?? 'light'].primary,
                    borderWidth: 1,
                    opacity: book.epubPath ? 1 : 0.5
                  }
                ]}
                onPress={handleDownload}
                disabled={!book.epubPath}
              >
                <Ionicons 
                  name="download" 
                  size={20} 
                  color={book.epubPath ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textMuted} 
                />
                <Text style={[
                  styles.downloadButtonText, 
                  { 
                    color: book.epubPath ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textMuted 
                  }
                ]}>
                  {book.epubPath ? 'Download EPUB' : 'Download Unavailable'}
                </Text>
              </TouchableOpacity> */}
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
  
  bottomPadding: {
    // Dynamic height is set inline to account for safe area insets
  },
});
