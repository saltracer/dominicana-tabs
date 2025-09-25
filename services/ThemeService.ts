import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'sepia' | 'night' | 'custom';
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    accent: string;
    border: string;
    surface: string;
    highlight: string;
    link: string;
    button: string;
    buttonText: string;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: 'normal' | 'bold' | 'light';
  };
  spacing: {
    margin: number;
    padding: number;
    borderRadius: number;
  };
  effects: {
    shadow: boolean;
    blur: boolean;
    transparency: number;
  };
  isDefault: boolean;
  isCustom: boolean;
  createdAt: string;
}

interface CustomTheme extends Theme {
  userId: string;
  isPublic: boolean;
  tags: string[];
  description: string;
}

interface ThemePreferences {
  currentTheme: string;
  autoTheme: boolean;
  darkModeSchedule: {
    start: string;
    end: string;
  };
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margins: {
    horizontal: number;
    vertical: number;
  };
  brightness: number;
  contrast: number;
  saturation: number;
}

interface ThemeCategory {
  id: string;
  name: string;
  description: string;
  themes: string[];
  icon: string;
}

class ThemeService {
  private static readonly THEMES_KEY = 'themes';
  private static readonly CUSTOM_THEMES_KEY = 'custom_themes';
  private static readonly THEME_PREFERENCES_KEY = 'theme_preferences';
  private static readonly THEME_CATEGORIES_KEY = 'theme_categories';

  private defaultThemes: Theme[] = [
    {
      id: 'light',
      name: 'Light',
      type: 'light',
      colors: {
        background: '#FFFFFF',
        text: '#000000',
        textSecondary: '#666666',
        accent: '#007AFF',
        border: '#E0E0E0',
        surface: '#F8F8F8',
        highlight: '#FFEB3B',
        link: '#007AFF',
        button: '#007AFF',
        buttonText: '#FFFFFF'
      },
      typography: {
        fontFamily: 'system-ui',
        fontSize: 16,
        lineHeight: 1.6,
        letterSpacing: 0,
        fontWeight: 'normal'
      },
      spacing: {
        margin: 16,
        padding: 12,
        borderRadius: 8
      },
      effects: {
        shadow: false,
        blur: false,
        transparency: 1.0
      },
      isDefault: true,
      isCustom: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'dark',
      name: 'Dark',
      type: 'dark',
      colors: {
        background: '#1A1A1A',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        accent: '#0A84FF',
        border: '#333333',
        surface: '#2C2C2C',
        highlight: '#FFD60A',
        link: '#0A84FF',
        button: '#0A84FF',
        buttonText: '#FFFFFF'
      },
      typography: {
        fontFamily: 'system-ui',
        fontSize: 16,
        lineHeight: 1.6,
        letterSpacing: 0,
        fontWeight: 'normal'
      },
      spacing: {
        margin: 16,
        padding: 12,
        borderRadius: 8
      },
      effects: {
        shadow: true,
        blur: false,
        transparency: 1.0
      },
      isDefault: true,
      isCustom: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'sepia',
      name: 'Sepia',
      type: 'sepia',
      colors: {
        background: '#F4F1EA',
        text: '#5C4B37',
        textSecondary: '#8B7355',
        accent: '#8B4513',
        border: '#D4C4A8',
        surface: '#F0E6D2',
        highlight: '#D4AF37',
        link: '#8B4513',
        button: '#8B4513',
        buttonText: '#FFFFFF'
      },
      typography: {
        fontFamily: 'Georgia',
        fontSize: 16,
        lineHeight: 1.7,
        letterSpacing: 0.5,
        fontWeight: 'normal'
      },
      spacing: {
        margin: 20,
        padding: 16,
        borderRadius: 4
      },
      effects: {
        shadow: false,
        blur: false,
        transparency: 1.0
      },
      isDefault: true,
      isCustom: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'night',
      name: 'Night',
      type: 'night',
      colors: {
        background: '#000000',
        text: '#FFFFFF',
        textSecondary: '#AAAAAA',
        accent: '#FF6B35',
        border: '#222222',
        surface: '#111111',
        highlight: '#FF6B35',
        link: '#FF6B35',
        button: '#FF6B35',
        buttonText: '#000000'
      },
      typography: {
        fontFamily: 'system-ui',
        fontSize: 16,
        lineHeight: 1.5,
        letterSpacing: 0,
        fontWeight: 'normal'
      },
      spacing: {
        margin: 16,
        padding: 12,
        borderRadius: 8
      },
      effects: {
        shadow: true,
        blur: true,
        transparency: 0.95
      },
      isDefault: true,
      isCustom: false,
      createdAt: new Date().toISOString()
    }
  ];

  private themeCategories: ThemeCategory[] = [
    {
      id: 'default',
      name: 'Default Themes',
      description: 'Built-in reading themes',
      themes: ['light', 'dark', 'sepia', 'night'],
      icon: 'palette'
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      description: 'High contrast and accessible themes',
      themes: [],
      icon: 'accessibility'
    },
    {
      id: 'custom',
      name: 'Custom Themes',
      description: 'User-created themes',
      themes: [],
      icon: 'create'
    }
  ];

  /**
   * Get all themes
   */
  async getThemes(): Promise<Theme[]> {
    try {
      const data = await AsyncStorage.getItem(ThemeService.THEMES_KEY);
      const storedThemes = data ? JSON.parse(data) : [];
      
      // Merge with default themes
      const allThemes = [...this.defaultThemes, ...storedThemes];
      return allThemes;
    } catch (error) {
      console.error('Error getting themes:', error);
      return this.defaultThemes;
    }
  }

  /**
   * Get theme by ID
   */
  async getTheme(themeId: string): Promise<Theme | null> {
    const themes = await this.getThemes();
    return themes.find(theme => theme.id === themeId) || null;
  }

  /**
   * Get current theme
   */
  async getCurrentTheme(): Promise<Theme> {
    const preferences = await this.getThemePreferences();
    const theme = await this.getTheme(preferences.currentTheme);
    return theme || this.defaultThemes[0];
  }

  /**
   * Set current theme
   */
  async setCurrentTheme(themeId: string): Promise<void> {
    const preferences = await this.getThemePreferences();
    preferences.currentTheme = themeId;
    await this.saveThemePreferences(preferences);
  }

  /**
   * Create custom theme
   */
  async createCustomTheme(theme: Omit<CustomTheme, 'id' | 'createdAt'>): Promise<string> {
    const themeId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTheme: CustomTheme = {
      ...theme,
      id: themeId,
      type: 'custom',
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const customThemes = await this.getCustomThemes();
    customThemes[themeId] = newTheme;
    await this.saveCustomThemes(customThemes);

    return themeId;
  }

  /**
   * Update custom theme
   */
  async updateCustomTheme(themeId: string, updates: Partial<CustomTheme>): Promise<void> {
    const customThemes = await this.getCustomThemes();
    if (customThemes[themeId]) {
      customThemes[themeId] = { ...customThemes[themeId], ...updates };
      await this.saveCustomThemes(customThemes);
    }
  }

  /**
   * Delete custom theme
   */
  async deleteCustomTheme(themeId: string): Promise<void> {
    const customThemes = await this.getCustomThemes();
    delete customThemes[themeId];
    await this.saveCustomThemes(customThemes);
  }

  /**
   * Get custom themes
   */
  async getCustomThemes(): Promise<Record<string, CustomTheme>> {
    try {
      const data = await AsyncStorage.getItem(ThemeService.CUSTOM_THEMES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting custom themes:', error);
      return {};
    }
  }

  /**
   * Get theme preferences
   */
  async getThemePreferences(): Promise<ThemePreferences> {
    try {
      const data = await AsyncStorage.getItem(ThemeService.THEME_PREFERENCES_KEY);
      return data ? JSON.parse(data) : {
        currentTheme: 'light',
        autoTheme: false,
        darkModeSchedule: {
          start: '20:00',
          end: '06:00'
        },
        fontSize: 16,
        fontFamily: 'system-ui',
        lineHeight: 1.6,
        margins: {
          horizontal: 16,
          vertical: 20
        },
        brightness: 1.0,
        contrast: 1.0,
        saturation: 1.0
      };
    } catch (error) {
      console.error('Error getting theme preferences:', error);
      return {
        currentTheme: 'light',
        autoTheme: false,
        darkModeSchedule: {
          start: '20:00',
          end: '06:00'
        },
        fontSize: 16,
        fontFamily: 'system-ui',
        lineHeight: 1.6,
        margins: {
          horizontal: 16,
          vertical: 20
        },
        brightness: 1.0,
        contrast: 1.0,
        saturation: 1.0
      };
    }
  }

  /**
   * Update theme preferences
   */
  async updateThemePreferences(preferences: Partial<ThemePreferences>): Promise<void> {
    const currentPreferences = await this.getThemePreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    await this.saveThemePreferences(updatedPreferences);
  }

  /**
   * Get theme categories
   */
  getThemeCategories(): ThemeCategory[] {
    return [...this.themeCategories];
  }

  /**
   * Get themes by category
   */
  async getThemesByCategory(categoryId: string): Promise<Theme[]> {
    const category = this.themeCategories.find(cat => cat.id === categoryId);
    if (!category) return [];

    const allThemes = await this.getThemes();
    return allThemes.filter(theme => category.themes.includes(theme.id));
  }

  /**
   * Apply theme to reading interface
   */
  applyTheme(theme: Theme): {
    styles: any;
    css: string;
    variables: Record<string, string>;
  } {
    const styles = {
      container: {
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize,
        lineHeight: theme.typography.lineHeight,
        letterSpacing: theme.typography.letterSpacing,
        fontWeight: theme.typography.fontWeight,
        margin: theme.spacing.margin,
        padding: theme.spacing.padding,
        borderRadius: theme.spacing.borderRadius
      },
      text: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize,
        lineHeight: theme.typography.lineHeight
      },
      button: {
        backgroundColor: theme.colors.button,
        color: theme.colors.buttonText,
        borderRadius: theme.spacing.borderRadius,
        padding: theme.spacing.padding
      },
      surface: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.spacing.borderRadius
      }
    };

    const css = `
      :root {
        --bg-color: ${theme.colors.background};
        --text-color: ${theme.colors.text};
        --text-secondary: ${theme.colors.textSecondary};
        --accent-color: ${theme.colors.accent};
        --border-color: ${theme.colors.border};
        --surface-color: ${theme.colors.surface};
        --highlight-color: ${theme.colors.highlight};
        --link-color: ${theme.colors.link};
        --button-color: ${theme.colors.button};
        --button-text: ${theme.colors.buttonText};
        --font-family: ${theme.typography.fontFamily};
        --font-size: ${theme.typography.fontSize}px;
        --line-height: ${theme.typography.lineHeight};
        --letter-spacing: ${theme.typography.letterSpacing}px;
        --margin: ${theme.spacing.margin}px;
        --padding: ${theme.spacing.padding}px;
        --border-radius: ${theme.spacing.borderRadius}px;
        --shadow: ${theme.effects.shadow ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'};
        --blur: ${theme.effects.blur ? 'blur(1px)' : 'none'};
        --opacity: ${theme.effects.transparency};
      }
    `;

    const variables = {
      '--bg-color': theme.colors.background,
      '--text-color': theme.colors.text,
      '--accent-color': theme.colors.accent,
      '--font-family': theme.typography.fontFamily,
      '--font-size': `${theme.typography.fontSize}px`
    };

    return { styles, css, variables };
  }

  /**
   * Generate theme from image
   */
  async generateThemeFromImage(imageUrl: string): Promise<Theme> {
    // In a real implementation, this would analyze the image colors
    // For now, return a generated theme based on common patterns
    return {
      id: `generated_${Date.now()}`,
      name: 'Generated Theme',
      type: 'custom',
      colors: {
        background: '#F8F8F8',
        text: '#333333',
        textSecondary: '#666666',
        accent: '#007AFF',
        border: '#E0E0E0',
        surface: '#FFFFFF',
        highlight: '#FFEB3B',
        link: '#007AFF',
        button: '#007AFF',
        buttonText: '#FFFFFF'
      },
      typography: {
        fontFamily: 'system-ui',
        fontSize: 16,
        lineHeight: 1.6,
        letterSpacing: 0,
        fontWeight: 'normal'
      },
      spacing: {
        margin: 16,
        padding: 12,
        borderRadius: 8
      },
      effects: {
        shadow: false,
        blur: false,
        transparency: 1.0
      },
      isDefault: false,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Export theme
   */
  async exportTheme(themeId: string): Promise<string> {
    const theme = await this.getTheme(themeId);
    if (!theme) {
      throw new Error('Theme not found');
    }

    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme
   */
  async importTheme(themeData: string): Promise<string> {
    const theme = JSON.parse(themeData);
    const themeId = await this.createCustomTheme(theme);
    return themeId;
  }

  /**
   * Get theme recommendations
   */
  getThemeRecommendations(): {
    forReading: string[];
    forAccessibility: string[];
    forNight: string[];
  } {
    return {
      forReading: ['sepia', 'light'],
      forAccessibility: ['light', 'dark'],
      forNight: ['night', 'dark']
    };
  }

  /**
   * Save theme preferences
   */
  private async saveThemePreferences(preferences: ThemePreferences): Promise<void> {
    await AsyncStorage.setItem(
      ThemeService.THEME_PREFERENCES_KEY,
      JSON.stringify(preferences)
    );
  }

  /**
   * Save custom themes
   */
  private async saveCustomThemes(themes: Record<string, CustomTheme>): Promise<void> {
    await AsyncStorage.setItem(
      ThemeService.CUSTOM_THEMES_KEY,
      JSON.stringify(themes)
    );
  }
}

export default new ThemeService();