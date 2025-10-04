import { Platform } from 'react-native';

/**
 * Utility for loading and managing exsurge.js library
 */
export class ExsurgeLoader {
  private static instance: ExsurgeLoader;
  private isLoaded = false;
  private loadPromise: Promise<boolean> | null = null;

  private constructor() {}

  public static getInstance(): ExsurgeLoader {
    if (!ExsurgeLoader.instance) {
      ExsurgeLoader.instance = new ExsurgeLoader();
    }
    return ExsurgeLoader.instance;
  }

  /**
   * Check if exsurge.js is available
   */
  public isExsurgeAvailable(): boolean {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' && typeof (window as any).exsurge !== 'undefined';
    }
    return false;
  }

  /**
   * Load exsurge.js library
   */
  public async loadExsurge(): Promise<boolean> {
    if (this.isLoaded) {
      return true;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._loadLibrary();
    return this.loadPromise;
  }

  private async _loadLibrary(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // For web platform, check if exsurge is already loaded
        if (this.isExsurgeAvailable()) {
          this.isLoaded = true;
          return true;
        }

        // Try to load from CDN or local file
        await this._loadFromWeb();
      } else {
        // For React Native, exsurge.js will be loaded in WebView
        // This is handled by the WebView component
        this.isLoaded = true;
        return true;
      }

      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('Failed to load exsurge.js:', error);
      this.isLoaded = false;
      return false;
    }
  }

  private async _loadFromWeb(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window object not available'));
        return;
      }

      // Check if already loaded
      if (typeof (window as any).exsurge !== 'undefined') {
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = '/lib/exsurge.min.js';
      script.async = true;
      script.onload = () => {
        if (typeof (window as any).exsurge !== 'undefined') {
          resolve();
        } else {
          reject(new Error('Exsurge library failed to load'));
        }
      };
      script.onerror = () => {
        reject(new Error('Failed to load exsurge.js script'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Get exsurge library instance
   */
  public getExsurge(): any {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return (window as any).exsurge;
    }
    return null;
  }

  /**
   * Create a ChantContext with theme support
   */
  public createChantContext(theme: 'light' | 'dark' = 'light'): any {
    const exsurge = this.getExsurge();
    if (!exsurge) {
      throw new Error('Exsurge library not loaded');
    }

    const context = new exsurge.ChantContext();
    
    // Apply theme-specific settings
    if (theme === 'dark') {
      // Configure for dark mode
      context.theme = 'dark';
      context.backgroundColor = '#1a1a1a';
      context.textColor = '#ffffff';
      context.staffColor = '#ffffff';
      context.noteColor = '#ffffff';
    } else {
      // Configure for light mode
      context.theme = 'light';
      context.backgroundColor = '#ffffff';
      context.textColor = '#000000';
      context.staffColor = '#000000';
      context.noteColor = '#000000';
    }

    return context;
  }

  /**
   * Parse GABC data with error handling
   */
  public parseGabc(gabcData: string, context: any): any {
    const exsurge = this.getExsurge();
    if (!exsurge) {
      throw new Error('Exsurge library not loaded');
    }

    try {
      return exsurge.Gabc.createMappingsFromSource(context, gabcData);
    } catch (error) {
      console.error('Error parsing GABC:', error);
      throw new Error(`Failed to parse GABC data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create ChantScore with error handling
   */
  public createChantScore(context: any, mappings: any): any {
    const exsurge = this.getExsurge();
    if (!exsurge) {
      throw new Error('Exsurge library not loaded');
    }

    try {
      return new exsurge.ChantScore(context, mappings, true);
    } catch (error) {
      console.error('Error creating ChantScore:', error);
      throw new Error(`Failed to create chant score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Render chant to SVG with progress tracking
   */
  public async renderChant(
    score: any,
    context: any,
    width: number,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        onProgress?.(10);

        // Perform layout
        score.performLayout(context, () => {
          onProgress?.(50);

          // Layout chant lines
          score.layoutChantLines(context, width, () => {
            try {
              onProgress?.(90);

              // Create drawable SVG
              const svgContent = score.createDrawable(context);
              onProgress?.(100);

              resolve(svgContent);
            } catch (error) {
              console.error('Error in final rendering:', error);
              reject(new Error(`Failed to render SVG: ${error instanceof Error ? error.message : 'Unknown error'}`));
            }
          });
        });
      } catch (error) {
        console.error('Error in chant rendering:', error);
        reject(new Error(`Failed to render chant: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Get library status
   */
  public getStatus(): {
    isLoaded: boolean;
    isAvailable: boolean;
    platform: string;
  } {
    return {
      isLoaded: this.isLoaded,
      isAvailable: this.isExsurgeAvailable(),
      platform: Platform.OS,
    };
  }

  /**
   * Reset loader state (for testing)
   */
  public reset(): void {
    this.isLoaded = false;
    this.loadPromise = null;
  }
}

// Export singleton instance
export const exsurgeLoader = ExsurgeLoader.getInstance();
