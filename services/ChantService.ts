import { ChantResource, ChantNotation } from '../types/compline-types';
import { getGabcFileInfo, mapUserPreferenceToNotationType, ChantNotationType } from './GabcMapping';

export class ChantService {
  private static instance: ChantService;
  private gabcCache: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): ChantService {
    if (!ChantService.instance) {
      ChantService.instance = new ChantService();
    }
    return ChantService.instance;
  }

  /**
   * Get GABC content for a specific Marian hymn based on notation preferences
   */
  public async getMarianHymnGabc(hymnId: string, notationPreference: string = 'dominican'): Promise<string | null> {
    const notationType = mapUserPreferenceToNotationType(notationPreference);
    const cacheKey = `marian-hymn-${hymnId}-${notationType}`;
    
    // Check cache first
    if (this.gabcCache.has(cacheKey)) {
      return this.gabcCache.get(cacheKey)!;
    }

    try {
      // Get the GABC file info from the mapping
      const gabcFileInfo = getGabcFileInfo(hymnId, notationType);
      if (!gabcFileInfo) {
        console.warn(`No GABC file found for Marian hymn: ${hymnId} with notation: ${notationType}`);
        return null;
      }

      // Load the GABC file
      const gabcContent = await this.loadGabcFile(gabcFileInfo.fileName);
      
      if (gabcContent) {
        // Cache the content
        this.gabcCache.set(cacheKey, gabcContent);
        return gabcContent;
      }

      return null;
    } catch (error) {
      console.error(`Error loading GABC for ${hymnId} with notation ${notationType}:`, error);
      return null;
    }
  }

  /**
   * Get a ChantResource for a specific Marian hymn based on notation preferences
   */
  public async getMarianHymnChantResource(hymnId: string, notationPreference: string = 'dominican'): Promise<ChantResource | null> {
    const notationType = mapUserPreferenceToNotationType(notationPreference);
    const gabcContent = await this.getMarianHymnGabc(hymnId, notationPreference);
    
    if (!gabcContent) {
      return null;
    }

    const gabcFileInfo = getGabcFileInfo(hymnId, notationType);
    const metadata = {
      composer: 'Traditional',
      century: '11th-12th century',
      source: gabcFileInfo?.source || 'Traditional',
      mode: gabcFileInfo?.mode || this.getModeForHymn(hymnId),
      tradition: gabcFileInfo?.tradition,
      complexity: gabcFileInfo?.complexity,
      description: gabcFileInfo?.description
    };

    return {
      id: `marian-hymn-${hymnId}-${notationType}`,
      notation: 'gabc' as ChantNotation,
      data: gabcContent,
      metadata
    };
  }

  /**
   * Load a GABC file from the assets
   */
  private async loadGabcFile(fileName: string): Promise<string | null> {
    try {
      // Static mapping of GABC files - Metro bundler requires static require() calls
      const gabcAssets: Record<string, any> = {
        // Dominican tradition
        '4971-an--alma_redemptoris--dominican.gabc': require('../assets/data/liturgy/compline/chant/gabc/4971-an--alma_redemptoris--dominican.gabc'),
        '4586-an--ave_regina_caelorum--dominican.gabc': require('../assets/data/liturgy/compline/chant/gabc/4586-an--ave_regina_caelorum--dominican.gabc'),
        '5320-an--regina_caeli--dominican.gabc': require('../assets/data/liturgy/compline/chant/gabc/5320-an--regina_caeli--dominican.gabc'),
        '9961-an--salve_regina--dominican.gabc': require('../assets/data/liturgy/compline/chant/gabc/9961-an--salve_regina--dominican.gabc'),
        
        // Solesmes tradition
        '1851-an--alma_redemptoris_(simple_tone)--solesmes_1961.1.gabc': require('../assets/data/liturgy/compline/chant/gabc/1851-an--alma_redemptoris_(simple_tone)--solesmes_1961.1.gabc'),
        '12108-an--ave_regina_caelorum--solesmes.gabc': require('../assets/data/liturgy/compline/chant/gabc/12108-an--ave_regina_caelorum--solesmes.gabc'),
        '2435-an--salve_regina_(simple_tone)--solesmes.1.gabc': require('../assets/data/liturgy/compline/chant/gabc/2435-an--salve_regina_(simple_tone)--solesmes.1.gabc'),
        
        // Simplex
        '15266-an--regina_caeli--simplex.gabc': require('../assets/data/liturgy/compline/chant/gabc/15266-an--regina_caeli--simplex.gabc'),
        
        // Other
        '8127-an--salve_regina_(simple_tone_with_english_translation)--solesmes.gabc': require('../assets/data/liturgy/compline/chant/gabc/8127-an--salve_regina_(simple_tone_with_english_translation)--solesmes.gabc'),
        'te-lucis.gabc': require('../assets/data/liturgy/compline/chant/gabc/te-lucis.gabc')
      };

      const gabcAsset = gabcAssets[fileName];
      if (!gabcAsset) {
        console.warn(`GABC asset not found: ${fileName}`);
        return null;
      }

      // With GABC files configured as source extensions, they should be imported as text
      // Handle both default export and direct export
      const content = gabcAsset.default || gabcAsset;
      
      if (typeof content === 'string') {
        return content;
      } else {
        console.warn(`GABC file ${fileName} did not return string content:`, typeof content);
        return null;
      }
    } catch (error) {
      console.error(`Error loading GABC file ${fileName}:`, error);
      return null;
    }
  }

  /**
   * Get the Gregorian mode for a specific hymn
   */
  private getModeForHymn(hymnId: string): number {
    const modeMap: Record<string, number> = {
      'alma-redemptoris-mater': 1,
      'ave-regina-caelorum': 2,
      'regina-caeli': 1,
      'salve-regina': 1
    };

    return modeMap[hymnId] || 1;
  }

  /**
   * Clear the GABC cache
   */
  public clearCache(): void {
    this.gabcCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.gabcCache.size,
      keys: Array.from(this.gabcCache.keys())
    };
  }
}
