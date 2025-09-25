/**
 * Multi-Version Bible Service
 * 
 * Supports multiple Bible versions (Douay-Rheims USX, Vulgate USFX, etc.)
 * with version selection and unified API
 */

import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import { Platform } from "react-native";
import { USXParser } from './USXParser';
import { USFXParser } from './USFXParser';
import { 
  BibleVersion, 
  BibleServiceConfig, 
  VersionBibleBook, 
  MultiVersionSearchResult,
  BibleParser,
  BibleAssetLoader 
} from '../types/bible-version-types';
import { BibleBook, BibleChapter, BibleVerse, BibleSearchResult, BiblePassage } from '../types';
import { ParsedBook } from '../types/usx-types';
import { parseBibleReference, formatNormalizedReference, normalizeRangeOrder } from '../utils/bibleReference';

export class MultiVersionBibleService {
  private config: BibleServiceConfig;
  private parsers: Map<string, BibleParser> = new Map();
  private assetLoaders: Map<string, BibleAssetLoader> = new Map();
  private loadedBooks: Map<string, Map<string, ParsedBook>> = new Map();
  private currentVersion: string;

  constructor(config?: Partial<BibleServiceConfig>) {
    this.config = {
      defaultVersion: 'douay-rheims',
      availableVersions: this.getDefaultVersions(),
      cacheSize: 10,
      enableOfflineMode: true,
      ...config
    };

    this.currentVersion = this.config.defaultVersion;
    this.initializeParsers();
    this.initializeAssetLoaders();
  }

  /**
   * Get default Bible versions configuration
   */
  private getDefaultVersions(): BibleVersion[] {
    return [
      {
        id: 'douay-rheims',
        name: 'Douay-Rheims Bible',
        shortName: 'Douay-Rheims',
        language: 'en',
        format: 'usx',
        description: 'Catholic English translation',
        isDefault: true,
        bookNames: this.getDouayRheimsBookNames()
      },
      {
        id: 'vulgate',
        name: 'Vulgate Bible',
        shortName: 'Vulgate',
        language: 'la',
        format: 'usfx',
        description: 'Latin Vulgate translation',
        isDefault: false,
        bookNames: this.getVulgateBookNames()
      }
    ];
  }

  /**
   * Initialize parsers for different formats
   */
  private initializeParsers(): void {
    this.parsers.set('usx', new USXParser());
    this.parsers.set('usfx', new USFXParser());
  }

  /**
   * Initialize asset loaders for different versions
   */
  private initializeAssetLoaders(): void {
    this.assetLoaders.set('douay-rheims', new DouayRheimsAssetLoader());
    this.assetLoaders.set('vulgate', new VulgateAssetLoader());
  }

  /**
   * Get all available Bible versions
   */
  getAvailableVersions(): BibleVersion[] {
    return [...this.config.availableVersions];
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.currentVersion;
  }

  /**
   * Set current version
   */
  setCurrentVersion(versionId: string): void {
    if (this.config.availableVersions.find(v => v.id === versionId)) {
      this.currentVersion = versionId;
    } else {
      throw new Error(`Version ${versionId} not available`);
    }
  }

  /**
   * Get current version info
   */
  getCurrentVersionInfo(): BibleVersion {
    const version = this.config.availableVersions.find(v => v.id === this.currentVersion);
    if (!version) {
      throw new Error(`Current version ${this.currentVersion} not found`);
    }
    return version;
  }

  /**
   * Get available books for current version
   */
  async getAvailableBooks(): Promise<VersionBibleBook[]> {
    const version = this.getCurrentVersionInfo();
    const assetLoader = this.assetLoaders.get(this.currentVersion);
    
    if (!assetLoader) {
      throw new Error(`No asset loader for version ${this.currentVersion}`);
    }

    const availableBookCodes = assetLoader.getAvailableBooks(this.currentVersion);
    
    return availableBookCodes.map(code => {
      const bookInfo = version.bookNames[code];
      return {
        code,
        title: bookInfo?.title || code,
        shortTitle: bookInfo?.shortTitle || code,
        abbreviation: bookInfo?.abbreviation || code,
        category: this.getBookCategory(code),
        order: this.getBookOrder(code),
        chapters: this.getBookChapterCount(code),
        versionId: this.currentVersion,
        available: assetLoader.isBookAvailable(this.currentVersion, code)
      };
    });
  }

  /**
   * Load a specific book
   */
  async loadBook(bookCode: string, versionId?: string): Promise<ParsedBook> {
    const version = versionId || this.currentVersion;
    
    // Check cache first
    if (this.loadedBooks.has(version)) {
      const versionCache = this.loadedBooks.get(version)!;
      if (versionCache.has(bookCode)) {
        return versionCache.get(bookCode)!;
      }
    }

    // Load from asset
    const assetLoader = this.assetLoaders.get(version);
    if (!assetLoader) {
      throw new Error(`No asset loader for version ${version}`);
    }

    const versionInfo = this.config.availableVersions.find(v => v.id === version);
    if (!versionInfo) {
      throw new Error(`Version ${version} not found`);
    }

    const parser = this.parsers.get(versionInfo.format);
    if (!parser) {
      throw new Error(`No parser for format ${versionInfo.format}`);
    }

    try {
      const content = await assetLoader.loadBook(version, bookCode);
      
      // Call the appropriate parser method based on format
      let result;
      if (versionInfo.format === 'usx') {
        result = (parser as any).parseUSXContent(content);
      } else if (versionInfo.format === 'usfx') {
        result = (parser as any).parseUSFXContent(content);
      } else {
        throw new Error(`Unsupported format: ${versionInfo.format}`);
      }
      
      if (result.success && result.book) {
        // Cache the result
        if (!this.loadedBooks.has(version)) {
          this.loadedBooks.set(version, new Map());
        }
        this.loadedBooks.get(version)!.set(bookCode, result.book);
        
        return result.book;
      } else {
        throw new Error(result.error || 'Failed to parse book');
      }
    } catch (error) {
      throw new Error(`Failed to load book ${bookCode}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific verse
   */
  async getVerse(bookCode: string, chapter: number, verse: number, versionId?: string): Promise<BibleVerse | null> {
    try {
      const book = await this.loadBook(bookCode, versionId);
      const version = versionId || this.currentVersion;
      const versionInfo = this.config.availableVersions.find(v => v.id === version);
      
      if (!versionInfo) return null;
      
      const parser = this.parsers.get(versionInfo.format);
      if (!parser) return null;
      
      const reference = `${bookCode} ${chapter}:${verse}`;
      const verseObj = parser.getVerseByReference(book, reference);
      
      if (verseObj) {
        return {
          number: verseObj.number,
          text: verseObj.text,
          reference: verseObj.reference
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting verse ${bookCode} ${chapter}:${verse}:`, error);
      return null;
    }
  }

  /**
   * Get a chapter
   */
  async getChapter(bookCode: string, chapterNumber: number, versionId?: string): Promise<BibleChapter | null> {
    try {
      const book = await this.loadBook(bookCode, versionId);
      const chapter = book.chapters.find(c => c.number === chapterNumber);
      
      if (chapter) {
        return {
          number: chapter.number,
          verses: chapter.verses.map(verse => ({
            number: verse.number,
            text: verse.text,
            reference: verse.reference
          }))
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting chapter ${bookCode} ${chapterNumber}:`, error);
      return null;
    }
  }

  /**
   * Get a passage by Bible reference string (e.g., "Genesis 1:1-2:7", "Mat 5:3-9")
   */
  async getPassageByReference(reference: string, versionId?: string): Promise<BiblePassage | null> {
    const parsed = parseBibleReference(reference);
    if (!parsed) return null;
    const normalized = normalizeRangeOrder(parsed);

    const version = versionId || this.currentVersion;
    const versionInfo = this.config.availableVersions.find(v => v.id === version);
    if (!versionInfo) return null;

    const parser = this.parsers.get(versionInfo.format);
    if (!parser) return null;

    const book = await this.loadBook(normalized.bookCode, version);

    const startRef = `${normalized.bookCode} ${normalized.startChapter}:${normalized.startVerse}`;
    const endRef = `${normalized.bookCode} ${normalized.endChapter}:${normalized.endVerse}`;

    // Prefer dedicated range method if available
    const hasRange = typeof (parser as any).getVerseRange === 'function';
    const verses = hasRange
      ? (parser as any).getVerseRange(book, startRef, endRef)
      : this.fallbackCollectRange(book, parsed.startChapter, parsed.startVerse, parsed.endChapter, parsed.endVerse);

    return {
      bookCode: normalized.bookCode,
      startChapter: normalized.startChapter,
      startVerse: normalized.startVerse,
      endChapter: normalized.endChapter,
      endVerse: normalized.endVerse,
      verses: verses.map((v: any) => ({ number: v.number, text: v.text, reference: v.reference })),
      reference: formatNormalizedReference(normalized)
    };
  }

  private fallbackCollectRange(book: ParsedBook, sc: number, sv: number, ec: number, ev: number) {
    const results: any[] = [];
    for (const chapter of book.chapters) {
      if (chapter.number < sc || chapter.number > ec) continue;
      if (sc === ec && chapter.number === sc) {
        results.push(...chapter.verses.filter(v => v.number >= sv && v.number <= ev));
      } else if (chapter.number === sc) {
        results.push(...chapter.verses.filter(v => v.number >= sv));
      } else if (chapter.number === ec) {
        results.push(...chapter.verses.filter(v => v.number <= ev));
      } else {
        results.push(...chapter.verses);
      }
    }
    return results;
  }

  /**
   * Get passage text as a single string suitable for LOH content
   */
  async getPassageText(reference: string, options?: { includeVerseNumbers?: boolean; separator?: string }, versionId?: string): Promise<string | null> {
    const passage = await this.getPassageByReference(reference, versionId);
    if (!passage) return null;
    const includeNums = options?.includeVerseNumbers ?? false;
    const sep = options?.separator ?? ' ';
    const parts = passage.verses.map(v => includeNums ? `${v.number} ${v.text}` : v.text);
    return parts.join(sep).trim();
  }

  /**
   * Search across current version
   */
  async search(searchText: string, bookCode?: string, caseSensitive: boolean = false): Promise<BibleSearchResult[]> {
    const results: BibleSearchResult[] = [];
    const versionInfo = this.getCurrentVersionInfo();
    const parser = this.parsers.get(versionInfo.format);
    
    if (!parser) return results;
    
    try {
      if (bookCode) {
        // Check if bookCode is a category (old-testament, new-testament, deuterocanonical)
        if (bookCode === 'old-testament' || bookCode === 'new-testament' || bookCode === 'deuterocanonical') {
          // Search in all books of the specified category
          const availableBooks = await this.getAvailableBooks();
          const booksToSearch = availableBooks.filter(book => book.category === bookCode);
          
          for (const bibleBook of booksToSearch) {
            try {
              const book = await this.loadBook(bibleBook.code);
              const searchResults = parser.searchInBook(book, searchText, caseSensitive);
              
              results.push(...searchResults.map(verse => ({
                book: bibleBook.code,
                chapter: this.getChapterNumberFromReference(verse.reference),
                verse: verse.number,
                text: verse.text,
                reference: verse.reference
              })));
            } catch (error) {
              console.warn(`Failed to search in ${bibleBook.code}:`, error);
            }
          }
        } else {
          // Search in specific book
          const book = await this.loadBook(bookCode);
          const searchResults = parser.searchInBook(book, searchText, caseSensitive);
          
          results.push(...searchResults.map(verse => ({
            book: bookCode,
            chapter: this.getChapterNumberFromReference(verse.reference),
            verse: verse.number,
            text: verse.text,
            reference: verse.reference
          })));
        }
      } else {
        // Search in all available books (limit for performance)
        const availableBooks = await this.getAvailableBooks();
        const booksToSearch = availableBooks.slice(0, 5); // Limit to first 5 books
        
        for (const bibleBook of booksToSearch) {
          try {
            const book = await this.loadBook(bibleBook.code);
            const searchResults = parser.searchInBook(book, searchText, caseSensitive);
            
            results.push(...searchResults.map(verse => ({
              book: bibleBook.code,
              chapter: this.getChapterNumberFromReference(verse.reference),
              verse: verse.number,
              text: verse.text,
              reference: verse.reference
            })));
          } catch (error) {
            console.warn(`Failed to search in ${bibleBook.code}:`, error);
          }
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error during search:', error);
      return [];
    }
  }

  /**
   * Search across multiple versions
   */
  async searchMultipleVersions(searchText: string, versionIds?: string[]): Promise<MultiVersionSearchResult[]> {
    const results: MultiVersionSearchResult[] = [];
    const versionsToSearch = versionIds || this.config.availableVersions.map(v => v.id);
    
    for (const versionId of versionsToSearch) {
      const currentVersion = this.currentVersion;
      this.setCurrentVersion(versionId);
      
      try {
        const versionResults = await this.search(searchText, undefined, false);
        const versionInfo = this.getCurrentVersionInfo();
        
        results.push(...versionResults.map(result => ({
          ...result,
          versionId,
          versionName: versionInfo.shortName
        })));
      } catch (error) {
        console.warn(`Failed to search in version ${versionId}:`, error);
      } finally {
        this.setCurrentVersion(currentVersion);
      }
    }
    
    return results;
  }

  // Helper methods
  private getBookCategory(code: string): 'old-testament' | 'new-testament' | 'deuterocanonical' {
    // Implementation based on book code
    const oldTestament = ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'];
    const newTestament = ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'];
    const deuterocanonical = ['TOB', 'JDT', 'WIS', 'SIR', 'BAR', '1MA', '2MA'];
    
    if (oldTestament.includes(code)) return 'old-testament';
    if (newTestament.includes(code)) return 'new-testament';
    if (deuterocanonical.includes(code)) return 'deuterocanonical';
    return 'old-testament'; // default
  }

  private getBookOrder(code: string): number {
    const allBooks = ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'TOB', 'JDT', 'EST', '1MA', '2MA', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'WIS', 'SIR', 'ISA', 'JER', 'LAM', 'BAR', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'];
    return allBooks.indexOf(code) + 1;
  }

  private getBookChapterCount(code: string): number {
    // Chapter counts for all Bible books (same for both Douay-Rheims and Vulgate)
    const chapterCounts: { [key: string]: number } = {
      'GEN': 50, 'EXO': 40, 'LEV': 27, 'NUM': 36, 'DEU': 34, 'JOS': 24, 'JDG': 21, 'RUT': 4,
      '1SA': 31, '2SA': 24, '1KI': 22, '2KI': 25, '1CH': 29, '2CH': 36, 'EZR': 10, 'NEH': 13,
      'TOB': 14, 'JDT': 16, 'EST': 10, '1MA': 16, '2MA': 15, 'JOB': 42, 'PSA': 150, 'PRO': 31,
      'ECC': 12, 'SNG': 8, 'WIS': 19, 'SIR': 51, 'ISA': 66, 'JER': 52, 'LAM': 5, 'BAR': 6,
      'EZK': 48, 'DAN': 14, 'HOS': 14, 'JOL': 4, 'AMO': 9, 'OBA': 1, 'JON': 4, 'MIC': 7,
      'NAM': 3, 'HAB': 3, 'ZEP': 3, 'HAG': 2, 'ZEC': 14, 'MAL': 4, 'MAT': 28, 'MRK': 16,
      'LUK': 24, 'JHN': 21, 'ACT': 28, 'ROM': 16, '1CO': 16, '2CO': 13, 'GAL': 6, 'EPH': 6,
      'PHP': 4, 'COL': 4, '1TH': 5, '2TH': 3, '1TI': 6, '2TI': 4, 'TIT': 3, 'PHM': 1,
      'HEB': 13, 'JAS': 5, '1PE': 5, '2PE': 3, '1JN': 5, '2JN': 1, '3JN': 1, 'JUD': 1, 'REV': 22
    };
    return chapterCounts[code] || 0;
  }

  private getChapterNumberFromReference(reference: string): number {
    const match = reference.match(/\w+\s+(\d+):\d+/);
    return match ? parseInt(match[1], 10) : 0;
  }

  private getDouayRheimsBookNames() {
    // Return Douay-Rheims book names
    return {
      'GEN': { title: 'Genesis', shortTitle: 'Genesis', abbreviation: 'Gen' },
      'EXO': { title: 'Exodus', shortTitle: 'Exodus', abbreviation: 'Ex' },
      // ... add all books
    };
  }

  private getVulgateBookNames() {
    // Return Vulgate book names
    return {
      'GEN': { title: 'GENESIS', shortTitle: 'GENESIS', abbreviation: 'GEN' },
      'EXO': { title: 'EXODUS', shortTitle: 'EXODUS', abbreviation: 'EXO' },
      // ... add all books
    };
  }
}

// Asset Loader Implementations
class DouayRheimsAssetLoader implements BibleAssetLoader {
  private usxAssets: Record<string, any> = {
    'GEN': require('../assets/bibles/douay-rheims/release/USX_1/GEN.usx'),
    'EXO': require('../assets/bibles/douay-rheims/release/USX_1/EXO.usx'),
    // ... add all books
  };

  async loadBook(versionId: string, bookCode: string): Promise<string> {
    const asset = this.usxAssets[bookCode];
    if (!asset) {
      throw new Error(`USX file not found for book code: ${bookCode}`);
    }

    const assetObj = Asset.fromModule(asset);
    await assetObj.downloadAsync();
    
    if (assetObj.localUri) {
      if (Platform.OS === 'web') {
        // Use fetch for web
        const response = await fetch(assetObj.localUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${bookCode}.usx: ${response.statusText}`);
        }
        return await response.text();
      } else {
        // Use new File API for native
        const file = new File(assetObj.localUri);
        return await file.text();
      }
    } else {
      throw new Error(`Local URI not available for ${bookCode}.usx`);
    }
  }

  getAvailableBooks(versionId: string): string[] {
    return Object.keys(this.usxAssets);
  }

  isBookAvailable(versionId: string, bookCode: string): boolean {
    return bookCode in this.usxAssets;
  }
}

class VulgateAssetLoader implements BibleAssetLoader {
  private vulgateAsset = require('../assets/bibles/vulgate/latVUC_usfx.xml');

  async loadBook(versionId: string, bookCode: string): Promise<string> {
    const asset = Asset.fromModule(this.vulgateAsset);
    await asset.downloadAsync();
    
    if (asset.localUri) {
      let content: string;
      if (Platform.OS === 'web') {
        // Use fetch for web
        const response = await fetch(asset.localUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch Vulgate USFX file: ${response.statusText}`);
        }
        content = await response.text();
      } else {
        // Use new File API for native
        const file = new File(asset.localUri);
        content = await file.text();
      }
      return this.extractBookFromVulgate(content, bookCode);
    } else {
      throw new Error(`Local URI not available for Vulgate USFX file`);
    }
  }

  getAvailableBooks(versionId: string): string[] {
    // Return all available book codes for Vulgate
    return ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'TOB', 'JDT', 'WIS', 'SIR', 'BAR', '1MA', '2MA', 'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'];
  }

  isBookAvailable(versionId: string, bookCode: string): boolean {
    return this.getAvailableBooks(versionId).includes(bookCode);
  }

  private extractBookFromVulgate(vulgateContent: string, bookCode: string): string {
    const bookStartPattern = `<book id="${bookCode}">`;
    const bookStartIndex = vulgateContent.indexOf(bookStartPattern);
    
    if (bookStartIndex === -1) {
      throw new Error(`Book ${bookCode} not found in Vulgate file`);
    }

    const nextBookPattern = /<book id="[^"]+">/g;
    nextBookPattern.lastIndex = bookStartIndex + bookStartPattern.length;
    const nextBookMatch = nextBookPattern.exec(vulgateContent);
    
    const bookEndIndex = nextBookMatch ? nextBookMatch.index : vulgateContent.length;
    const bookContent = vulgateContent.substring(bookStartIndex, bookEndIndex);
    
    return `<?xml version="1.0" encoding="utf-8"?>
<usfx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://eBible.org/usfx.xsd">
<languageCode>lat</languageCode>
${bookContent}
</usfx>`;
  }
}

// Export singleton instance
export const multiVersionBibleService = new MultiVersionBibleService();
