import { AccessibilityInfo, Platform } from 'react-native';

interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  voiceOverEnabled: boolean;
  talkBackEnabled: boolean;
}

interface AccessibilityFeatures {
  announcePageChange: boolean;
  announceChapterChange: boolean;
  announceProgress: boolean;
  announceBookmarks: boolean;
  announceAnnotations: boolean;
  keyboardNavigation: boolean;
  focusManagement: boolean;
  semanticLabels: boolean;
}

class AccessibilityService {
  private settings: AccessibilitySettings = {
    screenReaderEnabled: false,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    voiceOverEnabled: false,
    talkBackEnabled: false
  };

  private features: AccessibilityFeatures = {
    announcePageChange: true,
    announceChapterChange: true,
    announceProgress: true,
    announceBookmarks: true,
    announceAnnotations: true,
    keyboardNavigation: true,
    focusManagement: true,
    semanticLabels: true
  };

  constructor() {
    this.initializeAccessibility();
  }

  /**
   * Initialize accessibility settings
   */
  private async initializeAccessibility(): Promise<void> {
    try {
      // Check if screen reader is enabled
      const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.settings.screenReaderEnabled = isScreenReaderEnabled;

      // Check for high contrast mode
      const isHighContrastEnabled = await AccessibilityInfo.isHighContrastEnabled();
      this.settings.highContrast = isHighContrastEnabled;

      // Check for reduced motion preference
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      this.settings.reducedMotion = isReduceMotionEnabled;

      // Platform-specific screen readers
      if (Platform.OS === 'ios') {
        this.settings.voiceOverEnabled = isScreenReaderEnabled;
      } else if (Platform.OS === 'android') {
        this.settings.talkBackEnabled = isScreenReaderEnabled;
      }

      console.log('Accessibility initialized:', this.settings);
    } catch (error) {
      console.error('Error initializing accessibility:', error);
    }
  }

  /**
   * Announce text to screen reader
   */
  announceToScreenReader(text: string, priority: 'high' | 'normal' | 'low' = 'normal'): void {
    if (this.settings.screenReaderEnabled) {
      AccessibilityInfo.announceForAccessibility(text);
    }
  }

  /**
   * Announce page change
   */
  announcePageChange(currentPage: number, totalPages: number): void {
    if (this.features.announcePageChange) {
      const text = `Page ${currentPage} of ${totalPages}`;
      this.announceToScreenReader(text, 'normal');
    }
  }

  /**
   * Announce chapter change
   */
  announceChapterChange(chapterTitle: string, chapterNumber: number): void {
    if (this.features.announceChapterChange) {
      const text = `Chapter ${chapterNumber}: ${chapterTitle}`;
      this.announceToScreenReader(text, 'high');
    }
  }

  /**
   * Announce reading progress
   */
  announceProgress(percentage: number): void {
    if (this.features.announceProgress) {
      const text = `${Math.round(percentage)}% complete`;
      this.announceToScreenReader(text, 'low');
    }
  }

  /**
   * Announce bookmark creation
   */
  announceBookmarkCreated(position: string): void {
    if (this.features.announceBookmarks) {
      const text = `Bookmark created at ${position}`;
      this.announceToScreenReader(text, 'normal');
    }
  }

  /**
   * Announce annotation creation
   */
  announceAnnotationCreated(text: string): void {
    if (this.features.announceAnnotations) {
      const announcement = `Annotation created: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`;
      this.announceToScreenReader(announcement, 'normal');
    }
  }

  /**
   * Get accessibility settings
   */
  getAccessibilitySettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  /**
   * Update accessibility settings
   */
  updateAccessibilitySettings(newSettings: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get accessibility features
   */
  getAccessibilityFeatures(): AccessibilityFeatures {
    return { ...this.features };
  }

  /**
   * Update accessibility features
   */
  updateAccessibilityFeatures(newFeatures: Partial<AccessibilityFeatures>): void {
    this.features = { ...this.features, ...newFeatures };
  }

  /**
   * Check if screen reader is enabled
   */
  isScreenReaderEnabled(): boolean {
    return this.settings.screenReaderEnabled;
  }

  /**
   * Check if high contrast is enabled
   */
  isHighContrastEnabled(): boolean {
    return this.settings.highContrast;
  }

  /**
   * Check if reduced motion is enabled
   */
  isReduceMotionEnabled(): boolean {
    return this.settings.reducedMotion;
  }

  /**
   * Get accessibility-friendly styles
   */
  getAccessibilityStyles(): {
    highContrast: any;
    largeText: any;
    reducedMotion: any;
  } {
    return {
      highContrast: this.settings.highContrast ? {
        backgroundColor: '#000000',
        color: '#FFFFFF',
        borderColor: '#FFFFFF',
        borderWidth: 2
      } : {},
      largeText: this.settings.largeText ? {
        fontSize: 18,
        lineHeight: 24
      } : {},
      reducedMotion: this.settings.reducedMotion ? {
        transition: 'none',
        animation: 'none'
      } : {}
    };
  }

  /**
   * Get semantic labels for UI elements
   */
  getSemanticLabels(): Record<string, string> {
    return {
      'reading-progress': 'Reading progress',
      'chapter-navigation': 'Chapter navigation',
      'bookmark-button': 'Add bookmark',
      'bookmark-list': 'Bookmark list',
      'search-button': 'Search in book',
      'audio-button': 'Text to speech',
      'theme-button': 'Change reading theme',
      'font-size-button': 'Adjust font size',
      'table-of-contents': 'Table of contents',
      'annotation-button': 'Add annotation',
      'export-button': 'Export reading data',
      'offline-button': 'Download for offline reading'
    };
  }

  /**
   * Get keyboard navigation handlers
   */
  getKeyboardNavigationHandlers(): Record<string, () => void> {
    return {
      'ArrowLeft': () => this.navigatePrevious(),
      'ArrowRight': () => this.navigateNext(),
      'ArrowUp': () => this.scrollUp(),
      'ArrowDown': () => this.scrollDown(),
      'Space': () => this.toggleAudio(),
      'Enter': () => this.selectElement(),
      'Escape': () => this.closeReader(),
      'Tab': () => this.focusNext(),
      'Shift+Tab': () => this.focusPrevious()
    };
  }

  /**
   * Navigate to previous chapter
   */
  private navigatePrevious(): void {
    this.announceToScreenReader('Navigating to previous chapter');
    // Implementation would trigger previous chapter navigation
  }

  /**
   * Navigate to next chapter
   */
  private navigateNext(): void {
    this.announceToScreenReader('Navigating to next chapter');
    // Implementation would trigger next chapter navigation
  }

  /**
   * Scroll up
   */
  private scrollUp(): void {
    this.announceToScreenReader('Scrolling up');
    // Implementation would trigger scroll up
  }

  /**
   * Scroll down
   */
  private scrollDown(): void {
    this.announceToScreenReader('Scrolling down');
    // Implementation would trigger scroll down
  }

  /**
   * Toggle audio
   */
  private toggleAudio(): void {
    this.announceToScreenReader('Toggling text to speech');
    // Implementation would toggle audio
  }

  /**
   * Select focused element
   */
  private selectElement(): void {
    this.announceToScreenReader('Element selected');
    // Implementation would select focused element
  }

  /**
   * Close reader
   */
  private closeReader(): void {
    this.announceToScreenReader('Closing reader');
    // Implementation would close reader
  }

  /**
   * Focus next element
   */
  private focusNext(): void {
    this.announceToScreenReader('Focusing next element');
    // Implementation would focus next element
  }

  /**
   * Focus previous element
   */
  private focusPrevious(): void {
    this.announceToScreenReader('Focusing previous element');
    // Implementation would focus previous element
  }

  /**
   * Get accessibility recommendations
   */
  getAccessibilityRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.settings.screenReaderEnabled) {
      recommendations.push('Enable screen reader for better accessibility');
    }

    if (!this.features.announcePageChange) {
      recommendations.push('Enable page change announcements');
    }

    if (!this.features.keyboardNavigation) {
      recommendations.push('Enable keyboard navigation for better usability');
    }

    if (!this.features.semanticLabels) {
      recommendations.push('Enable semantic labels for screen readers');
    }

    return recommendations;
  }

  /**
   * Test accessibility features
   */
  async testAccessibilityFeatures(): Promise<{
    screenReader: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    keyboardNavigation: boolean;
  }> {
    return {
      screenReader: this.settings.screenReaderEnabled,
      highContrast: this.settings.highContrast,
      reducedMotion: this.settings.reducedMotion,
      keyboardNavigation: this.features.keyboardNavigation
    };
  }
}

export default new AccessibilityService();