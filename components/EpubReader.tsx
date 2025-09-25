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
import BookService from '../services/BookService';
import AudioService from '../services/AudioService';
import OfflineStorageService from '../services/OfflineStorageService';
import AccessibilityService from '../services/AccessibilityService';
import { Book, Bookmark, ReadingProgress } from '../types';

interface EpubReaderProps {
  book: Book;
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

const EpubReader: React.FC<EpubReaderProps> = ({ book, onClose, initialPosition }) => {
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
  const [isOffline, setIsOffline] = useState(false);
  const [audioState, setAudioState] = useState(AudioService.getAudioState());
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState(AccessibilityService.getAccessibilitySettings());

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    checkAuthentication();
    loadBookmarks();
    loadReadingProgress();
    checkOfflineStatus();
    setupAudioListeners();
    setupAccessibility();
  }, []);

  useEffect(() => {
    if (readingState.isReading) {
      startTimeRef.current = Date.now();
    }
  }, [readingState.isReading]);

  const checkAuthentication = () => {
    const authenticated = BookService.isUserAuthenticated();
    setIsAuthenticated(authenticated);
  };

  const loadBookmarks = () => {
    if (!isAuthenticated) return;
    
    setBookmarks(book.bookmarks);
  };

  const loadReadingProgress = () => {
    if (!isAuthenticated) return;
    
    const progress = book.readingProgress;
    setReadingState(prev => ({
      ...prev,
      currentPosition: progress.currentPosition.toString(),
      currentChapter: Math.floor(progress.currentPosition / 100) + 1,
      totalChapters: Math.ceil(progress.totalPages / 100),
      progressPercentage: (progress.currentPosition / progress.totalPages) * 100,
      timeSpent: progress.timeSpent,
    }));
  };

  const saveReadingProgress = () => {
    if (!isAuthenticated) return;
    
    BookService.updateReadingProgress(book.id, {
      currentPosition: parseInt(readingState.currentPosition) || 0,
      totalPages: book.readingProgress.totalPages,
      timeSpent: readingState.timeSpent,
    });
  };

  const addBookmark = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please log in to add bookmarks.');
      return;
    }

    try {
      BookService.addBookmark(book.id, {
        bookId: book.id,
        position: parseInt(readingState.currentPosition) || 0,
        note: `Chapter ${readingState.currentChapter}`,
      });
      loadBookmarks();
      
      // Accessibility announcement
      AccessibilityService.announceBookmarkCreated(`Chapter ${readingState.currentChapter}`);
      
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

  const checkOfflineStatus = async () => {
    const isBookOffline = await OfflineStorageService.isBookOffline(book.id);
    setIsOffline(isBookOffline);
  };

  const setupAudioListeners = () => {
    // Set up audio state listeners
    const interval = setInterval(() => {
      setAudioState(AudioService.getAudioState());
    }, 1000);

    return () => clearInterval(interval);
  };

  const setupAccessibility = () => {
    // Initialize accessibility settings
    setAccessibilitySettings(AccessibilityService.getAccessibilitySettings());
    
    // Announce reader opening
    AccessibilityService.announceToScreenReader(`Opening ${book.title} for reading`);
  };

  const handleAudioToggle = async () => {
    if (audioState.isPlaying) {
      if (audioState.isPaused) {
        AudioService.resumeSpeaking();
      } else {
        AudioService.pauseSpeaking();
      }
    } else {
      // Get current chapter text and start speaking
      const chapterText = getCurrentChapterText();
      await AudioService.startSpeaking(chapterText);
    }
  };

  const handleAudioStop = () => {
    AudioService.stopSpeaking();
  };

  const getCurrentChapterText = (): string => {
    // In a real implementation, this would extract text from the current chapter
    return `Chapter ${readingState.currentChapter} of ${book.title}. This is the content that would be read aloud.`;
  };

  const handleDownloadForOffline = async () => {
    try {
      await OfflineStorageService.downloadBook(book);
      setIsOffline(true);
      Alert.alert('Success', 'Book downloaded for offline reading');
    } catch (error) {
      Alert.alert('Error', 'Failed to download book for offline reading');
    }
  };

  const handleClose = () => {
    if (readingState.isReading) {
      const timeSpent = readingState.timeSpent + (Date.now() - startTimeRef.current) / 1000;
      setReadingState(prev => ({ ...prev, timeSpent }));
      saveReadingProgress();
    }
    AudioService.stopSpeaking();
    onClose();
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${book.title}</title>
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
        .toc-container {
          position: fixed;
          top: 0;
          left: -300px;
          width: 300px;
          height: 100vh;
          background: white;
          border-right: 1px solid #e9ecef;
          transition: left 0.3s ease;
          z-index: 1000;
          overflow-y: auto;
        }
        .toc-container.open {
          left: 0;
        }
        .toc-item {
          padding: 10px 15px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
        }
        .toc-item:hover {
          background: #f8f9fa;
        }
        .toc-item.active {
          background: #e3f2fd;
          color: #1976d2;
        }
        .search-container {
          padding: 15px;
          border-bottom: 1px solid #e9ecef;
        }
        .search-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .search-results {
          max-height: 200px;
          overflow-y: auto;
        }
        .search-result {
          padding: 8px 15px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          font-size: 14px;
        }
        .search-result:hover {
          background: #f8f9fa;
        }
        .highlight {
          background-color: yellow;
          padding: 2px 4px;
          border-radius: 2px;
        }
        .annotation {
          position: relative;
        }
        .annotation-marker {
          background-color: #ffeb3b;
          cursor: pointer;
        }
        .annotation-popup {
          position: absolute;
          top: -30px;
          left: 0;
          background: #333;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          z-index: 1000;
        }
        .theme-dark {
          background-color: #1a1a1a;
          color: #ffffff;
        }
        .theme-sepia {
          background-color: #f4f1ea;
          color: #5c4b37;
        }
        .font-size-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .font-size-button {
          width: 30px;
          height: 30px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
    </head>
    <body>
      <div class="reader-container">
        <div class="reader-header">
          <div class="navigation-controls">
            <button class="nav-button" id="prevChapter">Previous</button>
            <button class="nav-button" id="nextChapter">Next</button>
            <button class="nav-button" id="tocToggle">TOC</button>
            <button class="nav-button" id="searchToggle">Search</button>
            <div class="font-size-controls">
              <button class="font-size-button" id="fontDecrease">A-</button>
              <button class="font-size-button" id="fontIncrease">A+</button>
            </div>
            <button class="nav-button" id="themeToggle">Theme</button>
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

      <!-- Table of Contents -->
      <div class="toc-container" id="tocContainer">
        <div class="search-container">
          <input type="text" class="search-input" id="searchInput" placeholder="Search in book...">
          <div class="search-results" id="searchResults"></div>
        </div>
        <div id="tocList">
          <div class="toc-item active" data-chapter="1">Chapter 1: Introduction</div>
          <div class="toc-item" data-chapter="2">Chapter 2: The First Question</div>
          <div class="toc-item" data-chapter="3">Chapter 3: The Second Question</div>
          <div class="toc-item" data-chapter="4">Chapter 4: The Third Question</div>
          <div class="toc-item" data-chapter="5">Chapter 5: The Fourth Question</div>
        </div>
      </div>

      <script>
        // Enhanced Readium Web Toolkit integration
        let currentPosition = '${initialPosition || ''}';
        let currentChapter = 1;
        let totalChapters = 5;
        let progressPercentage = 0;
        let currentTheme = 'light';
        let currentFontSize = 16;
        let searchResults = [];
        let annotations = [];

        // Initialize Readium with enhanced features
        function initializeReadium() {
          console.log('Initializing enhanced Readium for: ${book.title}');
          
          // Load initial content
          setTimeout(() => {
            loadChapterContent(currentChapter);
            setupEventListeners();
            sendMessageToReactNative({ type: 'READIUM_READY' });
          }, 1000);
        }

        function setupEventListeners() {
          // Navigation
          document.getElementById('prevChapter').addEventListener('click', () => {
            if (currentChapter > 1) {
              currentChapter--;
              loadChapterContent(currentChapter);
              updateTOC();
            }
          });

          document.getElementById('nextChapter').addEventListener('click', () => {
            if (currentChapter < totalChapters) {
              currentChapter++;
              loadChapterContent(currentChapter);
              updateTOC();
            }
          });

          // TOC
          document.getElementById('tocToggle').addEventListener('click', () => {
            const toc = document.getElementById('tocContainer');
            toc.classList.toggle('open');
          });

          // Search
          document.getElementById('searchToggle').addEventListener('click', () => {
            const toc = document.getElementById('tocContainer');
            toc.classList.toggle('open');
            document.getElementById('searchInput').focus();
          });

          document.getElementById('searchInput').addEventListener('input', (e) => {
            performSearch(e.target.value);
          });

          // Font size
          document.getElementById('fontDecrease').addEventListener('click', () => {
            currentFontSize = Math.max(12, currentFontSize - 2);
            updateFontSize();
          });

          document.getElementById('fontIncrease').addEventListener('click', () => {
            currentFontSize = Math.min(24, currentFontSize + 2);
            updateFontSize();
          });

          // Theme
          document.getElementById('themeToggle').addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'sepia' : 'light';
            updateTheme();
          });

          // TOC items
          document.querySelectorAll('.toc-item').forEach(item => {
            item.addEventListener('click', () => {
              const chapter = parseInt(item.dataset.chapter);
              currentChapter = chapter;
              loadChapterContent(chapter);
              updateTOC();
              document.getElementById('tocContainer').classList.remove('open');
            });
          });

          // Text selection for annotations
          document.addEventListener('mouseup', handleTextSelection);
        }

        function loadChapterContent(chapter) {
          const content = document.getElementById('readerContent');
          const chapterData = getChapterData(chapter);
          
          content.innerHTML = \`
            <div class="chapter-title">\${chapterData.title}</div>
            <div class="chapter-content">\${chapterData.content}</div>
          \`;
          
          updateProgress();
          applyAnnotations();
        }

        function getChapterData(chapter) {
          const chapters = {
            1: {
              title: "Chapter 1: Introduction",
              content: \`
                <p>This is the beginning of "${book.title}" by ${book.author}.</p>
                <p>In this first chapter, we explore the fundamental principles that will guide our understanding throughout this work.</p>
                <p>The author presents a comprehensive overview of the subject matter, establishing the foundation for the detailed analysis that follows.</p>
                <p>Key concepts introduced in this chapter include the nature of the inquiry, the methodology employed, and the scope of the investigation.</p>
                <p>As we progress through this work, we will see how these initial concepts develop and interconnect with the broader themes.</p>
              \`
            },
            2: {
              title: "Chapter 2: The First Question",
              content: \`
                <p>In this second chapter, we address the first major question that arises from our initial investigation.</p>
                <p>The author presents a detailed analysis of the problem, examining it from multiple perspectives and considering various approaches to its solution.</p>
                <p>Historical context is provided to help the reader understand how this question has been addressed by previous thinkers.</p>
                <p>The chapter concludes with a preliminary answer that will be further developed in subsequent chapters.</p>
              \`
            },
            3: {
              title: "Chapter 3: The Second Question",
              content: \`
                <p>Building upon the foundation established in the previous chapters, we now turn to the second major question.</p>
                <p>This question is more complex and requires a deeper understanding of the principles established earlier.</p>
                <p>The author employs a systematic approach to break down the question into its component parts.</p>
                <p>Various arguments are presented and evaluated, leading to a nuanced conclusion.</p>
              \`
            },
            4: {
              title: "Chapter 4: The Third Question",
              content: \`
                <p>The third question represents a significant challenge that requires the integration of concepts from all previous chapters.</p>
                <p>Here we see the author's analytical skills at their finest, as complex ideas are presented with clarity and precision.</p>
                <p>The chapter includes detailed examples and case studies to illustrate the principles being discussed.</p>
                <p>Critical analysis of opposing viewpoints is provided, demonstrating the author's thorough approach to the subject.</p>
              \`
            },
            5: {
              title: "Chapter 5: The Fourth Question",
              content: \`
                <p>In this final chapter, we address the fourth and most comprehensive question of the work.</p>
                <p>All previous concepts are brought together to provide a complete answer to this complex question.</p>
                <p>The author demonstrates how the various principles and methods discussed throughout the work can be applied in practice.</p>
                <p>The chapter concludes with a summary of the main findings and their implications for future study.</p>
              \`
            }
          };
          
          return chapters[chapter] || chapters[1];
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

        function updateTOC() {
          document.querySelectorAll('.toc-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.dataset.chapter) === currentChapter) {
              item.classList.add('active');
            }
          });
        }

        function performSearch(query) {
          if (query.length < 2) {
            document.getElementById('searchResults').innerHTML = '';
            return;
          }

          const results = [];
          // Simulate search results
          for (let i = 1; i <= totalChapters; i++) {
            const chapterData = getChapterData(i);
            if (chapterData.content.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                chapter: i,
                title: chapterData.title,
                snippet: chapterData.content.substring(0, 100) + '...'
              });
            }
          }

          const resultsContainer = document.getElementById('searchResults');
          resultsContainer.innerHTML = results.map(result => \`
            <div class="search-result" onclick="goToChapter(\${result.chapter})">
              <strong>\${result.title}</strong><br>
              <small>\${result.snippet}</small>
            </div>
          \`).join('');
        }

        function goToChapter(chapter) {
          currentChapter = chapter;
          loadChapterContent(chapter);
          updateTOC();
          document.getElementById('tocContainer').classList.remove('open');
        }

        function updateFontSize() {
          document.querySelector('.chapter-content').style.fontSize = currentFontSize + 'px';
        }

        function updateTheme() {
          const body = document.body;
          body.className = body.className.replace(/theme-\\w+/g, '');
          body.classList.add('theme-' + currentTheme);
        }

        function handleTextSelection() {
          const selection = window.getSelection();
          if (selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString();
            
            // Create annotation marker
            const marker = document.createElement('span');
            marker.className = 'annotation-marker';
            marker.textContent = selectedText;
            marker.onclick = () => showAnnotationPopup(marker);
            
            range.deleteContents();
            range.insertNode(marker);
            
            // Store annotation
            annotations.push({
              id: Date.now(),
              text: selectedText,
              chapter: currentChapter,
              position: range.startOffset
            });
            
            selection.removeAllRanges();
          }
        }

        function showAnnotationPopup(marker) {
          const popup = document.createElement('div');
          popup.className = 'annotation-popup';
          popup.textContent = 'Annotation: ' + marker.textContent;
          marker.appendChild(popup);
          
          setTimeout(() => {
            popup.remove();
          }, 3000);
        }

        function applyAnnotations() {
          // Apply stored annotations to current chapter
          const chapterAnnotations = annotations.filter(a => a.chapter === currentChapter);
          // Implementation would apply highlights and notes
        }

        function sendMessageToReactNative(message) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          }
        }

        // Handle messages from React Native
        document.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'GO_TO_POSITION':
                currentPosition = data.position;
                break;
              case 'NAVIGATE_CHAPTER':
                if (data.direction === 'prev' && currentChapter > 1) {
                  currentChapter--;
                  loadChapterContent(currentChapter);
                  updateTOC();
                } else if (data.direction === 'next' && currentChapter < totalChapters) {
                  currentChapter++;
                  loadChapterContent(currentChapter);
                  updateTOC();
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
            {book.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Chapter {readingState.currentChapter} of {readingState.totalChapters}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={addBookmark} 
            style={styles.headerButton}
            accessibilityLabel="Add bookmark"
            accessibilityHint="Add a bookmark to the current position"
            accessibilityRole="button"
          >
            <Ionicons name="bookmark-outline" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setShowBookmarks(!showBookmarks)} style={styles.headerButton}>
            <Ionicons name="list" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAudioToggle} style={styles.headerButton}>
            <Ionicons 
              name={audioState.isPlaying ? (audioState.isPaused ? "play" : "pause") : "volume-high"} 
              size={24} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
          </TouchableOpacity>

          {audioState.isPlaying && (
            <TouchableOpacity onPress={handleAudioStop} style={styles.headerButton}>
              <Ionicons name="stop" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          )}

          {!isOffline && (
            <TouchableOpacity onPress={handleDownloadForOffline} style={styles.headerButton}>
              <Ionicons name="download" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          )}
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