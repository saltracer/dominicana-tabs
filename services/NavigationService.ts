import AsyncStorage from '@react-native-async-storage/async-storage';

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  position: number;
  children: TableOfContentsItem[];
  isExpanded: boolean;
  hasChildren: boolean;
}

interface NavigationHistory {
  id: string;
  bookId: string;
  chapterId: string;
  position: number;
  timestamp: string;
  title: string;
}

interface NavigationBookmark {
  id: string;
  bookId: string;
  chapterId: string;
  position: number;
  title: string;
  note?: string;
  createdAt: string;
  isFavorite: boolean;
}

interface NavigationSettings {
  showTableOfContents: boolean;
  showNavigationHistory: boolean;
  showBookmarks: boolean;
  autoSaveHistory: boolean;
  maxHistoryItems: number;
  navigationStyle: 'sidebar' | 'modal' | 'overlay';
  showProgress: boolean;
  showChapterNumbers: boolean;
}

interface NavigationState {
  currentChapter: string;
  currentPosition: number;
  totalChapters: number;
  progress: number;
  isNavigating: boolean;
  lastNavigation: string;
}

class NavigationService {
  private static readonly TOC_KEY = 'table_of_contents';
  private static readonly NAVIGATION_HISTORY_KEY = 'navigation_history';
  private static readonly NAVIGATION_BOOKMARKS_KEY = 'navigation_bookmarks';
  private static readonly NAVIGATION_SETTINGS_KEY = 'navigation_settings';
  private static readonly NAVIGATION_STATE_KEY = 'navigation_state';

  private navigationState: NavigationState = {
    currentChapter: '',
    currentPosition: 0,
    totalChapters: 0,
    progress: 0,
    isNavigating: false,
    lastNavigation: ''
  };

  /**
   * Build table of contents from book structure
   */
  async buildTableOfContents(bookId: string, bookStructure: {
    chapters: Array<{
      id: string;
      title: string;
      level: number;
      position: number;
      children?: Array<{
        id: string;
        title: string;
        level: number;
        position: number;
      }>;
    }>;
  }): Promise<TableOfContentsItem[]> {
    const toc: TableOfContentsItem[] = [];

    for (const chapter of bookStructure.chapters) {
      const tocItem: TableOfContentsItem = {
        id: chapter.id,
        title: chapter.title,
        level: chapter.level,
        position: chapter.position,
        children: chapter.children ? chapter.children.map(child => ({
          id: child.id,
          title: child.title,
          level: child.level,
          position: child.position,
          children: [],
          isExpanded: false,
          hasChildren: false
        })) : [],
        isExpanded: false,
        hasChildren: chapter.children ? chapter.children.length > 0 : false
      };

      toc.push(tocItem);
    }

    // Save TOC
    await this.saveTableOfContents(bookId, toc);
    return toc;
  }

  /**
   * Get table of contents for a book
   */
  async getTableOfContents(bookId: string): Promise<TableOfContentsItem[]> {
    try {
      const data = await AsyncStorage.getItem(`${NavigationService.TOC_KEY}_${bookId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting table of contents:', error);
      return [];
    }
  }

  /**
   * Navigate to a specific chapter
   */
  async navigateToChapter(bookId: string, chapterId: string, position: number = 0): Promise<void> {
    this.navigationState.isNavigating = true;
    this.navigationState.currentChapter = chapterId;
    this.navigationState.currentPosition = position;
    this.navigationState.lastNavigation = new Date().toISOString();

    // Save navigation history
    await this.addNavigationHistory(bookId, chapterId, position);

    // Update navigation state
    await this.saveNavigationState();

    // Announce navigation
    console.log(`Navigating to chapter ${chapterId} at position ${position}`);
  }

  /**
   * Navigate to next chapter
   */
  async navigateNext(bookId: string): Promise<void> {
    const toc = await this.getTableOfContents(bookId);
    const currentIndex = toc.findIndex(item => item.id === this.navigationState.currentChapter);
    
    if (currentIndex < toc.length - 1) {
      const nextChapter = toc[currentIndex + 1];
      await this.navigateToChapter(bookId, nextChapter.id, 0);
    }
  }

  /**
   * Navigate to previous chapter
   */
  async navigatePrevious(bookId: string): Promise<void> {
    const toc = await this.getTableOfContents(bookId);
    const currentIndex = toc.findIndex(item => item.id === this.navigationState.currentChapter);
    
    if (currentIndex > 0) {
      const previousChapter = toc[currentIndex - 1];
      await this.navigateToChapter(bookId, previousChapter.id, 0);
    }
  }

  /**
   * Get navigation history
   */
  async getNavigationHistory(bookId?: string): Promise<NavigationHistory[]> {
    try {
      const data = await AsyncStorage.getItem(NavigationService.NAVIGATION_HISTORY_KEY);
      const history = data ? JSON.parse(data) : [];
      
      if (bookId) {
        return history.filter((item: NavigationHistory) => item.bookId === bookId);
      }
      
      return history.sort((a: NavigationHistory, b: NavigationHistory) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error getting navigation history:', error);
      return [];
    }
  }

  /**
   * Add navigation history entry
   */
  private async addNavigationHistory(bookId: string, chapterId: string, position: number): Promise<void> {
    const history = await this.getNavigationHistory();
    const toc = await this.getTableOfContents(bookId);
    const chapter = toc.find(item => item.id === chapterId);
    
    const historyEntry: NavigationHistory = {
      id: `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookId,
      chapterId,
      position,
      timestamp: new Date().toISOString(),
      title: chapter?.title || 'Unknown Chapter'
    };

    history.unshift(historyEntry);

    // Limit history size
    const settings = await this.getNavigationSettings();
    const limitedHistory = history.slice(0, settings.maxHistoryItems);

    await AsyncStorage.setItem(
      NavigationService.NAVIGATION_HISTORY_KEY,
      JSON.stringify(limitedHistory)
    );
  }

  /**
   * Clear navigation history
   */
  async clearNavigationHistory(bookId?: string): Promise<void> {
    if (bookId) {
      const history = await this.getNavigationHistory();
      const filteredHistory = history.filter(item => item.bookId !== bookId);
      await AsyncStorage.setItem(
        NavigationService.NAVIGATION_HISTORY_KEY,
        JSON.stringify(filteredHistory)
      );
    } else {
      await AsyncStorage.removeItem(NavigationService.NAVIGATION_HISTORY_KEY);
    }
  }

  /**
   * Add navigation bookmark
   */
  async addNavigationBookmark(bookId: string, chapterId: string, position: number, title: string, note?: string): Promise<string> {
    const bookmarkId = `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const bookmark: NavigationBookmark = {
      id: bookmarkId,
      bookId,
      chapterId,
      position,
      title,
      note,
      createdAt: new Date().toISOString(),
      isFavorite: false
    };

    const bookmarks = await this.getNavigationBookmarks();
    bookmarks[bookmarkId] = bookmark;
    await this.saveNavigationBookmarks(bookmarks);

    return bookmarkId;
  }

  /**
   * Get navigation bookmarks
   */
  async getNavigationBookmarks(bookId?: string): Promise<Record<string, NavigationBookmark>> {
    try {
      const data = await AsyncStorage.getItem(NavigationService.NAVIGATION_BOOKMARKS_KEY);
      const bookmarks = data ? JSON.parse(data) : {};
      
      if (bookId) {
        const filteredBookmarks: Record<string, NavigationBookmark> = {};
        Object.entries(bookmarks).forEach(([id, bookmark]) => {
          if ((bookmark as NavigationBookmark).bookId === bookId) {
            filteredBookmarks[id] = bookmark as NavigationBookmark;
          }
        });
        return filteredBookmarks;
      }
      
      return bookmarks;
    } catch (error) {
      console.error('Error getting navigation bookmarks:', error);
      return {};
    }
  }

  /**
   * Update navigation bookmark
   */
  async updateNavigationBookmark(bookmarkId: string, updates: Partial<NavigationBookmark>): Promise<void> {
    const bookmarks = await this.getNavigationBookmarks();
    if (bookmarks[bookmarkId]) {
      bookmarks[bookmarkId] = { ...bookmarks[bookmarkId], ...updates };
      await this.saveNavigationBookmarks(bookmarks);
    }
  }

  /**
   * Delete navigation bookmark
   */
  async deleteNavigationBookmark(bookmarkId: string): Promise<void> {
    const bookmarks = await this.getNavigationBookmarks();
    delete bookmarks[bookmarkId];
    await this.saveNavigationBookmarks(bookmarks);
  }

  /**
   * Get navigation settings
   */
  async getNavigationSettings(): Promise<NavigationSettings> {
    try {
      const data = await AsyncStorage.getItem(NavigationService.NAVIGATION_SETTINGS_KEY);
      return data ? JSON.parse(data) : {
        showTableOfContents: true,
        showNavigationHistory: true,
        showBookmarks: true,
        autoSaveHistory: true,
        maxHistoryItems: 50,
        navigationStyle: 'sidebar',
        showProgress: true,
        showChapterNumbers: true
      };
    } catch (error) {
      console.error('Error getting navigation settings:', error);
      return {
        showTableOfContents: true,
        showNavigationHistory: true,
        showBookmarks: true,
        autoSaveHistory: true,
        maxHistoryItems: 50,
        navigationStyle: 'sidebar',
        showProgress: true,
        showChapterNumbers: true
      };
    }
  }

  /**
   * Update navigation settings
   */
  async updateNavigationSettings(settings: Partial<NavigationSettings>): Promise<void> {
    const currentSettings = await this.getNavigationSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(
      NavigationService.NAVIGATION_SETTINGS_KEY,
      JSON.stringify(updatedSettings)
    );
  }

  /**
   * Get current navigation state
   */
  getNavigationState(): NavigationState {
    return { ...this.navigationState };
  }

  /**
   * Update navigation state
   */
  async updateNavigationState(updates: Partial<NavigationState>): Promise<void> {
    this.navigationState = { ...this.navigationState, ...updates };
    await this.saveNavigationState();
  }

  /**
   * Search in table of contents
   */
  async searchTableOfContents(bookId: string, query: string): Promise<TableOfContentsItem[]> {
    const toc = await this.getTableOfContents(bookId);
    const searchQuery = query.toLowerCase();
    
    return toc.filter(item => 
      item.title.toLowerCase().includes(searchQuery)
    );
  }

  /**
   * Get chapter progress
   */
  async getChapterProgress(bookId: string, chapterId: string): Promise<{
    position: number;
    progress: number;
    timeSpent: number;
    lastRead: string;
  }> {
    // In a real implementation, this would get from reading progress service
    return {
      position: 0,
      progress: 0,
      timeSpent: 0,
      lastRead: new Date().toISOString()
    };
  }

  /**
   * Get reading progress for all chapters
   */
  async getReadingProgress(bookId: string): Promise<Record<string, {
    progress: number;
    timeSpent: number;
    lastRead: string;
  }>> {
    const toc = await this.getTableOfContents(bookId);
    const progress: Record<string, any> = {};

    for (const chapter of toc) {
      progress[chapter.id] = await this.getChapterProgress(bookId, chapter.id);
    }

    return progress;
  }

  /**
   * Export navigation data
   */
  async exportNavigationData(bookId: string): Promise<{
    tableOfContents: TableOfContentsItem[];
    history: NavigationHistory[];
    bookmarks: NavigationBookmark[];
    settings: NavigationSettings;
  }> {
    return {
      tableOfContents: await this.getTableOfContents(bookId),
      history: await this.getNavigationHistory(bookId),
      bookmarks: Object.values(await this.getNavigationBookmarks(bookId)),
      settings: await this.getNavigationSettings()
    };
  }

  /**
   * Import navigation data
   */
  async importNavigationData(bookId: string, data: {
    tableOfContents?: TableOfContentsItem[];
    history?: NavigationHistory[];
    bookmarks?: NavigationBookmark[];
    settings?: NavigationSettings;
  }): Promise<void> {
    if (data.tableOfContents) {
      await this.saveTableOfContents(bookId, data.tableOfContents);
    }

    if (data.settings) {
      await this.updateNavigationSettings(data.settings);
    }

    // Import history and bookmarks would require more complex logic
    // to avoid conflicts with existing data
  }

  /**
   * Save table of contents
   */
  private async saveTableOfContents(bookId: string, toc: TableOfContentsItem[]): Promise<void> {
    await AsyncStorage.setItem(
      `${NavigationService.TOC_KEY}_${bookId}`,
      JSON.stringify(toc)
    );
  }

  /**
   * Save navigation bookmarks
   */
  private async saveNavigationBookmarks(bookmarks: Record<string, NavigationBookmark>): Promise<void> {
    await AsyncStorage.setItem(
      NavigationService.NAVIGATION_BOOKMARKS_KEY,
      JSON.stringify(bookmarks)
    );
  }

  /**
   * Save navigation state
   */
  private async saveNavigationState(): Promise<void> {
    await AsyncStorage.setItem(
      NavigationService.NAVIGATION_STATE_KEY,
      JSON.stringify(this.navigationState)
    );
  }

  /**
   * Load navigation state
   */
  private async loadNavigationState(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(NavigationService.NAVIGATION_STATE_KEY);
      if (data) {
        this.navigationState = JSON.parse(data);
      }
    } catch (error) {
        console.error('Error loading navigation state:', error);
      }
  }

  /**
   * Clear all navigation data
   */
  async clearAllNavigationData(): Promise<void> {
    await AsyncStorage.removeItem(NavigationService.NAVIGATION_HISTORY_KEY);
    await AsyncStorage.removeItem(NavigationService.NAVIGATION_BOOKMARKS_KEY);
    await AsyncStorage.removeItem(NavigationService.NAVIGATION_STATE_KEY);
    
    // Clear TOC for all books (this would need to be more specific in practice)
    const keys = await AsyncStorage.getAllKeys();
    const tocKeys = keys.filter(key => key.startsWith(NavigationService.TOC_KEY));
    await AsyncStorage.multiRemove(tocKeys);
  }
}

export default new NavigationService();