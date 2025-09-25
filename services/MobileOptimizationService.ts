import { Dimensions, Platform } from 'react-native';

interface MobileConfig {
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  orientation: 'portrait' | 'landscape';
  deviceType: 'phone' | 'tablet';
  platform: 'ios' | 'android' | 'web';
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

interface ReadingPreferences {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  marginHorizontal: number;
  marginVertical: number;
  theme: 'light' | 'dark' | 'sepia' | 'night';
  brightness: number;
  contrast: number;
  autoScroll: boolean;
  scrollSpeed: number;
  gestureNavigation: boolean;
  hapticFeedback: boolean;
}

interface TouchGestures {
  swipeLeft: () => void;
  swipeRight: () => void;
  swipeUp: () => void;
  swipeDown: () => void;
  pinchZoom: (scale: number) => void;
  doubleTap: () => void;
  longPress: () => void;
}

interface MobileOptimization {
  lazyLoading: boolean;
  imageOptimization: boolean;
  textRendering: 'fast' | 'balanced' | 'quality';
  memoryManagement: boolean;
  batteryOptimization: boolean;
  networkOptimization: boolean;
}

class MobileOptimizationService {
  private config: MobileConfig;
  private preferences: ReadingPreferences;
  private optimization: MobileOptimization;
  private gestures: TouchGestures | null = null;

  constructor() {
    this.config = this.initializeMobileConfig();
    this.preferences = this.getDefaultReadingPreferences();
    this.optimization = this.getDefaultOptimization();
  }

  /**
   * Initialize mobile configuration
   */
  private initializeMobileConfig(): MobileConfig {
    const { width, height } = Dimensions.get('window');
    const screenSize = this.getScreenSize(width, height);
    const orientation = width > height ? 'landscape' : 'portrait';
    const deviceType = this.getDeviceType(width, height);
    const platform = Platform.OS as 'ios' | 'android' | 'web';

    return {
      screenSize,
      orientation,
      deviceType,
      platform,
      safeAreaInsets: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    };
  }

  /**
   * Get screen size category
   */
  private getScreenSize(width: number, height: number): 'small' | 'medium' | 'large' | 'xlarge' {
    const diagonal = Math.sqrt(width * width + height * height);
    const diagonalInches = diagonal / 160; // Assuming 160 DPI

    if (diagonalInches < 4) return 'small';
    if (diagonalInches < 6) return 'medium';
    if (diagonalInches < 8) return 'large';
    return 'xlarge';
  }

  /**
   * Get device type
   */
  private getDeviceType(width: number, height: number): 'phone' | 'tablet' {
    const minDimension = Math.min(width, height);
    return minDimension < 600 ? 'phone' : 'tablet';
  }

  /**
   * Get default reading preferences
   */
  private getDefaultReadingPreferences(): ReadingPreferences {
    return {
      fontSize: this.getOptimalFontSize(),
      lineHeight: 1.6,
      fontFamily: this.getOptimalFontFamily(),
      marginHorizontal: this.getOptimalMargins().horizontal,
      marginVertical: this.getOptimalMargins().vertical,
      theme: 'light',
      brightness: 1.0,
      contrast: 1.0,
      autoScroll: false,
      scrollSpeed: 1.0,
      gestureNavigation: true,
      hapticFeedback: true
    };
  }

  /**
   * Get optimal font size based on screen size
   */
  private getOptimalFontSize(): number {
    switch (this.config.screenSize) {
      case 'small': return 14;
      case 'medium': return 16;
      case 'large': return 18;
      case 'xlarge': return 20;
      default: return 16;
    }
  }

  /**
   * Get optimal font family
   */
  private getOptimalFontFamily(): string {
    if (this.config.platform === 'ios') {
      return 'San Francisco';
    } else if (this.config.platform === 'android') {
      return 'Roboto';
    } else {
      return 'system-ui';
    }
  }

  /**
   * Get optimal margins
   */
  private getOptimalMargins(): { horizontal: number; vertical: number } {
    if (this.config.deviceType === 'phone') {
      return { horizontal: 16, vertical: 20 };
    } else {
      return { horizontal: 32, vertical: 40 };
    }
  }

  /**
   * Get default optimization settings
   */
  private getDefaultOptimization(): MobileOptimization {
    return {
      lazyLoading: true,
      imageOptimization: true,
      textRendering: 'balanced',
      memoryManagement: true,
      batteryOptimization: true,
      networkOptimization: true
    };
  }

  /**
   * Get mobile configuration
   */
  getMobileConfig(): MobileConfig {
    return { ...this.config };
  }

  /**
   * Get reading preferences
   */
  getReadingPreferences(): ReadingPreferences {
    return { ...this.preferences };
  }

  /**
   * Update reading preferences
   */
  updateReadingPreferences(preferences: Partial<ReadingPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
  }

  /**
   * Get optimization settings
   */
  getOptimizationSettings(): MobileOptimization {
    return { ...this.optimization };
  }

  /**
   * Update optimization settings
   */
  updateOptimizationSettings(optimization: Partial<MobileOptimization>): void {
    this.optimization = { ...this.optimization, ...optimization };
  }

  /**
   * Set up touch gestures
   */
  setupTouchGestures(gestures: TouchGestures): void {
    this.gestures = gestures;
  }

  /**
   * Handle touch gesture
   */
  handleTouchGesture(gesture: string, data?: any): void {
    if (!this.gestures) return;

    switch (gesture) {
      case 'swipeLeft':
        this.gestures.swipeLeft();
        break;
      case 'swipeRight':
        this.gestures.swipeRight();
        break;
      case 'swipeUp':
        this.gestures.swipeUp();
        break;
      case 'swipeDown':
        this.gestures.swipeDown();
        break;
      case 'pinchZoom':
        this.gestures.pinchZoom(data.scale);
        break;
      case 'doubleTap':
        this.gestures.doubleTap();
        break;
      case 'longPress':
        this.gestures.longPress();
        break;
    }
  }

  /**
   * Get responsive styles
   */
  getResponsiveStyles(): {
    container: any;
    text: any;
    button: any;
    header: any;
    navigation: any;
  } {
    const baseStyles = {
      container: {
        flex: 1,
        paddingHorizontal: this.preferences.marginHorizontal,
        paddingVertical: this.preferences.marginVertical,
      },
      text: {
        fontSize: this.preferences.fontSize,
        lineHeight: this.preferences.fontSize * this.preferences.lineHeight,
        fontFamily: this.preferences.fontFamily,
      },
      button: {
        minHeight: this.config.deviceType === 'phone' ? 44 : 48,
        paddingHorizontal: this.config.deviceType === 'phone' ? 16 : 24,
        paddingVertical: this.config.deviceType === 'phone' ? 8 : 12,
      },
      header: {
        height: this.config.deviceType === 'phone' ? 56 : 64,
        paddingHorizontal: this.preferences.marginHorizontal,
      },
      navigation: {
        height: this.config.deviceType === 'phone' ? 48 : 56,
        paddingHorizontal: this.preferences.marginHorizontal,
      }
    };

    // Adjust for orientation
    if (this.config.orientation === 'landscape') {
      baseStyles.container.paddingHorizontal = this.preferences.marginHorizontal * 0.5;
      baseStyles.text.fontSize = this.preferences.fontSize * 0.9;
    }

    return baseStyles;
  }

  /**
   * Get reading layout configuration
   */
  getReadingLayoutConfig(): {
    columns: number;
    maxWidth: number;
    fontSize: number;
    lineHeight: number;
    margins: { top: number; bottom: number; left: number; right: number };
  } {
    const { width, height } = Dimensions.get('window');
    
    let columns = 1;
    let maxWidth = width;
    
    if (this.config.deviceType === 'tablet') {
      if (this.config.orientation === 'landscape') {
        columns = 2;
        maxWidth = width / 2;
      } else {
        columns = 1;
        maxWidth = Math.min(width, 600);
      }
    }

    return {
      columns,
      maxWidth,
      fontSize: this.preferences.fontSize,
      lineHeight: this.preferences.fontSize * this.preferences.lineHeight,
      margins: {
        top: this.preferences.marginVertical,
        bottom: this.preferences.marginVertical,
        left: this.preferences.marginHorizontal,
        right: this.preferences.marginHorizontal
      }
    };
  }

  /**
   * Optimize for battery life
   */
  optimizeForBattery(): void {
    this.optimization.batteryOptimization = true;
    this.optimization.textRendering = 'fast';
    this.optimization.memoryManagement = true;
    this.preferences.autoScroll = false;
    this.preferences.hapticFeedback = false;
  }

  /**
   * Optimize for performance
   */
  optimizeForPerformance(): void {
    this.optimization.lazyLoading = true;
    this.optimization.imageOptimization = true;
    this.optimization.textRendering = 'fast';
    this.optimization.memoryManagement = true;
  }

  /**
   * Optimize for quality
   */
  optimizeForQuality(): void {
    this.optimization.textRendering = 'quality';
    this.optimization.imageOptimization = true;
    this.preferences.fontSize = Math.max(this.preferences.fontSize, 16);
  }

  /**
   * Get accessibility recommendations
   */
  getAccessibilityRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.preferences.fontSize < 16) {
      recommendations.push('Consider increasing font size for better readability');
    }

    if (this.preferences.lineHeight < 1.4) {
      recommendations.push('Consider increasing line height for better readability');
    }

    if (this.preferences.contrast < 1.2) {
      recommendations.push('Consider increasing contrast for better visibility');
    }

    if (!this.preferences.gestureNavigation) {
      recommendations.push('Enable gesture navigation for easier mobile interaction');
    }

    return recommendations;
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    if (!this.optimization.lazyLoading) {
      recommendations.push('Enable lazy loading for better performance');
    }

    if (!this.optimization.imageOptimization) {
      recommendations.push('Enable image optimization for faster loading');
    }

    if (this.optimization.textRendering === 'quality' && this.config.deviceType === 'phone') {
      recommendations.push('Consider using balanced text rendering on phones for better performance');
    }

    if (!this.optimization.memoryManagement) {
      recommendations.push('Enable memory management for better stability');
    }

    return recommendations;
  }

  /**
   * Handle orientation change
   */
  handleOrientationChange(newOrientation: 'portrait' | 'landscape'): void {
    this.config.orientation = newOrientation;
    
    // Adjust preferences for orientation
    if (newOrientation === 'landscape') {
      this.preferences.fontSize = Math.max(this.preferences.fontSize * 0.9, 14);
      this.preferences.marginHorizontal = this.preferences.marginHorizontal * 0.5;
    } else {
      this.preferences.fontSize = Math.min(this.preferences.fontSize / 0.9, 24);
      this.preferences.marginHorizontal = this.preferences.marginHorizontal * 2;
    }
  }

  /**
   * Get device capabilities
   */
  getDeviceCapabilities(): {
    hasHapticFeedback: boolean;
    hasGyroscope: boolean;
    hasAccelerometer: boolean;
    hasCamera: boolean;
    hasMicrophone: boolean;
    hasGPS: boolean;
  } {
    return {
      hasHapticFeedback: this.config.platform !== 'web',
      hasGyroscope: this.config.platform !== 'web',
      hasAccelerometer: this.config.platform !== 'web',
      hasCamera: this.config.platform !== 'web',
      hasMicrophone: this.config.platform !== 'web',
      hasGPS: this.config.platform !== 'web'
    };
  }

  /**
   * Test mobile optimization
   */
  async testMobileOptimization(): Promise<{
    performance: number;
    accessibility: number;
    usability: number;
    recommendations: string[];
  }> {
    const performance = this.calculatePerformanceScore();
    const accessibility = this.calculateAccessibilityScore();
    const usability = this.calculateUsabilityScore();
    const recommendations = [
      ...this.getAccessibilityRecommendations(),
      ...this.getPerformanceRecommendations()
    ];

    return {
      performance,
      accessibility,
      usability,
      recommendations
    };
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(): number {
    let score = 100;

    if (!this.optimization.lazyLoading) score -= 20;
    if (!this.optimization.imageOptimization) score -= 15;
    if (this.optimization.textRendering === 'quality' && this.config.deviceType === 'phone') score -= 10;
    if (!this.optimization.memoryManagement) score -= 15;

    return Math.max(score, 0);
  }

  /**
   * Calculate accessibility score
   */
  private calculateAccessibilityScore(): number {
    let score = 100;

    if (this.preferences.fontSize < 16) score -= 20;
    if (this.preferences.lineHeight < 1.4) score -= 15;
    if (this.preferences.contrast < 1.2) score -= 20;
    if (!this.preferences.gestureNavigation) score -= 10;

    return Math.max(score, 0);
  }

  /**
   * Calculate usability score
   */
  private calculateUsabilityScore(): number {
    let score = 100;

    if (this.config.screenSize === 'small' && this.preferences.fontSize < 16) score -= 15;
    if (this.config.deviceType === 'phone' && this.preferences.marginHorizontal < 16) score -= 10;
    if (!this.preferences.hapticFeedback) score -= 5;

    return Math.max(score, 0);
  }
}

export default new MobileOptimizationService();