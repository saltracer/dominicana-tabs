import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import EbookService, { EbookMetadata, UserReadingProgress } from '../services/EbookService';

interface EpubReaderProps {
  ebook: EbookMetadata;
  onClose: () => void;
  initialPosition?: string;
}

interface ReadingState {
  currentPosition: string;
  currentChapter: number;
  totalChapters: number;
  progressPercentage: number;
  timeSpent: number;
  isReading: boolean;
}

const EpubReader: React.FC<EpubReaderProps> = ({ ebook, onClose, initialPosition }) => {
  const { colorScheme } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [readingState, setReadingState] = useState<ReadingState>({
    currentPosition: initialPosition || '',
    currentChapter: 1,
    totalChapters: 0,
    progressPercentage: 0,
    timeSpent: 0,
    isReading: false,
  });
  const [showControls, setShowControls] = useState(true);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    checkAuthentication();
    loadBookmarks();
    loadReadingProgress();
  }, []);

  useEffect(() => {
    if (readingState.isReading) {
      startTimeRef.current = Date.now();
    }
  }, [readingState.isReading]);

  const checkAuthentication = async () => {
    try {
      const authenticated = await EbookService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  };

  const loadBookmarks = async () => {
    if (!isAuthenticated) return;
    
    try {
      const userBookmarks = await EbookService.getUserBookmarks(ebook.id);
      setBookmarks(userBookmarks);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadReadingProgress = async () => {
    if (!isAuthenticated) return;
    
    try {
      const progress = await EbookService.getUserReadingProgress(ebook.id);
      if (progress) {
        setReadingState(prev => ({
          ...prev,
          currentPosition: progress.current_position,
          currentChapter: progress.current_chapter,
          totalChapters: progress.total_chapters,
          progressPercentage: progress.progress_percentage,
          timeSpent: progress.time_spent,
        }));
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
    }
  };

  const saveReadingProgress = async () => {
    if (!isAuthenticated) return;
    
    try {
      await EbookService.updateReadingProgress(ebook.id, {
        current_position: readingState.currentPosition,
        current_chapter: readingState.currentChapter,
        total_chapters: readingState.totalChapters,
        progress_percentage: readingState.progressPercentage,
        time_spent: readingState.timeSpent,
      });
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  };

  const addBookmark = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to add bookmarks.');
      return;
    }

    try {
      await EbookService.addBookmark(ebook.id, {
        position: readingState.currentPosition,
        chapter_title: `Chapter ${readingState.currentChapter}`,
        note: '',
      });
      loadBookmarks();
      Alert.alert('Success', 'Bookmark added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add bookmark.');
      console.error('Error adding bookmark:', error);
    }
  };

  const goToBookmark = (bookmark: any) => {
    setReadingState(prev => ({
      ...prev,
      currentPosition: bookmark.position,
      currentChapter: bookmark.chapter_title.includes('Chapter') ? 
        parseInt(bookmark.chapter_title.split(' ')[1]) : 1,
    }));
    setShowBookmarks(false);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'READIUM_READY':
          setLoading(false);
          break;
        case 'READIUM_POSITION_CHANGED':
          setReadingState(prev => ({
            ...prev,
            currentPosition: data.position,
            currentChapter: data.chapter || prev.currentChapter,
            totalChapters: data.totalChapters || prev.totalChapters,
            progressPercentage: data.progressPercentage || prev.progressPercentage,
            isReading: true,
          }));
          break;
        case 'READIUM_NAVIGATION':
          setReadingState(prev => ({
            ...prev,
            currentChapter: data.chapter,
            totalChapters: data.totalChapters,
            progressPercentage: data.progressPercentage,
          }));
          break;
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  const sendMessageToWebView = (message: any) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  const goToPosition = (position: string) => {
    sendMessageToWebView({
      type: 'GO_TO_POSITION',
      position: position,
    });
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    sendMessageToWebView({
      type: 'NAVIGATE_CHAPTER',
      direction: direction,
    });
  };

  const toggleFullscreen = () => {
    setShowControls(!showControls);
  };

  const handleClose = () => {
    if (readingState.isReading) {
      const timeSpent = readingState.timeSpent + (Date.now() - startTimeRef.current) / 1000;
      setReadingState(prev => ({ ...prev, timeSpent }));
      saveReadingProgress();
    }
    onClose();
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${ebook.title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #ffffff;
          color: #000000;
          line-height: 1.6;
        }
        .reader-container {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .reader-header {
          background: #f8f9fa;
          padding: 10px;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .reader-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        .chapter-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
        }
        .chapter-content {
          font-size: 16px;
          line-height: 1.8;
        }
        .navigation-controls {
          display: flex;
          gap: 10px;
        }
        .nav-button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .nav-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e9ecef;
          margin: 10px 0;
        }
        .progress-fill {
          height: 100%;
          background: #007bff;
          transition: width 0.3s ease;
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 18px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="reader-container">
        <div class="reader-header">
          <div class="navigation-controls">
            <button class="nav-button" id="prevChapter">Previous</button>
            <button class="nav-button" id="nextChapter">Next</button>
          </div>
          <div id="chapterInfo">Chapter 1 of 10</div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="progressFill" style="width: 0%"></div>
        </div>
        <div class="reader-content" id="readerContent">
          <div class="loading">Loading EPUB content...</div>
        </div>
      </div>

      <script>
        // Readium Web Toolkit integration
        let currentPosition = '${initialPosition || ''}';
        let currentChapter = 1;
        let totalChapters = 10;
        let progressPercentage = 0;

        // Initialize Readium
        function initializeReadium() {
          // This would integrate with the actual Readium Web Toolkit
          // For now, we'll simulate the functionality
          console.log('Initializing Readium for: ${ebook.title}');
          
          // Simulate loading content
          setTimeout(() => {
            loadChapterContent(currentChapter);
            sendMessageToReactNative({ type: 'READIUM_READY' });
          }, 1000);
        }

        function loadChapterContent(chapter) {
          const content = document.getElementById('readerContent');
          content.innerHTML = \`
            <div class="chapter-title">Chapter \${chapter}</div>
            <div class="chapter-content">
              <p>This is the content of Chapter \${chapter} of "${ebook.title}".</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
            </div>
          \`;
          
          updateProgress();
        }

        function updateProgress() {
          const progressFill = document.getElementById('progressFill');
          const chapterInfo = document.getElementById('chapterInfo');
          
          progressPercentage = (currentChapter / totalChapters) * 100;
          progressFill.style.width = progressPercentage + '%';
          chapterInfo.textContent = \`Chapter \${currentChapter} of \${totalChapters}\`;
          
          sendMessageToReactNative({
            type: 'READIUM_POSITION_CHANGED',
            position: currentPosition,
            chapter: currentChapter,
            totalChapters: totalChapters,
            progressPercentage: progressPercentage
          });
        }

        function sendMessageToReactNative(message) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          }
        }

        // Event listeners
        document.getElementById('prevChapter').addEventListener('click', () => {
          if (currentChapter > 1) {
            currentChapter--;
            loadChapterContent(currentChapter);
            sendMessageToReactNative({
              type: 'READIUM_NAVIGATION',
              chapter: currentChapter,
              totalChapters: totalChapters,
              progressPercentage: progressPercentage
            });
          }
        });

        document.getElementById('nextChapter').addEventListener('click', () => {
          if (currentChapter < totalChapters) {
            currentChapter++;
            loadChapterContent(currentChapter);
            sendMessageToReactNative({
              type: 'READIUM_NAVIGATION',
              chapter: currentChapter,
              totalChapters: totalChapters,
              progressPercentage: progressPercentage
            });
          }
        });

        // Handle messages from React Native
        document.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'GO_TO_POSITION':
                currentPosition = data.position;
                // Navigate to position
                break;
              case 'NAVIGATE_CHAPTER':
                if (data.direction === 'prev' && currentChapter > 1) {
                  currentChapter--;
                  loadChapterContent(currentChapter);
                } else if (data.direction === 'next' && currentChapter < totalChapters) {
                  currentChapter++;
                  loadChapterContent(currentChapter);
                }
                break;
            }
          } catch (error) {
            console.error('Error handling message:', error);
          }
        });

        // Initialize when page loads
        window.addEventListener('load', initializeReadium);
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
          <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={1}>
            {ebook.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Chapter {readingState.currentChapter} of {readingState.totalChapters}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={addBookmark} style={styles.headerButton}>
            <Ionicons name="bookmark-outline" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setShowBookmarks(!showBookmarks)} style={styles.headerButton}>
            <Ionicons name="list" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <View style={[styles.progressBar, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].primary,
                width: `${readingState.progressPercentage}%` 
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          {Math.round(readingState.progressPercentage)}%
        </Text>
      </View>

      {/* WebView Reader */}
      <View style={styles.readerContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Loading book...
            </Text>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
      </View>

      {/* Navigation Controls */}
      {showControls && (
        <View style={[styles.controls, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <TouchableOpacity 
            onPress={() => navigateChapter('prev')} 
            style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
            disabled={readingState.currentChapter <= 1}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={readingState.currentChapter <= 1 ? Colors[colorScheme ?? 'light'].textMuted : Colors[colorScheme ?? 'light'].text} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={toggleFullscreen} 
            style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
          >
            <Ionicons name="expand" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigateChapter('next')} 
            style={[styles.controlButton, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
            disabled={readingState.currentChapter >= readingState.totalChapters}
          >
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={readingState.currentChapter >= readingState.totalChapters ? Colors[colorScheme ?? 'light'].textMuted : Colors[colorScheme ?? 'light'].text} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Bookmarks Modal */}
      <Modal
        visible={showBookmarks}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookmarks(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <View style={[styles.modalHeader, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Bookmarks
            </Text>
            <TouchableOpacity onPress={() => setShowBookmarks(false)}>
              <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {bookmarks.length === 0 ? (
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                No bookmarks yet
              </Text>
            ) : (
              bookmarks.map((bookmark) => (
                <TouchableOpacity
                  key={bookmark.id}
                  style={[styles.bookmarkItem, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                  onPress={() => goToBookmark(bookmark)}
                >
                  <Text style={[styles.bookmarkTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {bookmark.chapter_title}
                  </Text>
                  {bookmark.note && (
                    <Text style={[styles.bookmarkNote, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {bookmark.note}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    borderBottomColor: '#e9ecef',
  },
  headerButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  readerContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  webView: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  controlButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
  },
  bookmarkItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  bookmarkNote: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default EpubReader;