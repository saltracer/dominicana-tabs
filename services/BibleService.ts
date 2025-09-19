/**
 * Bible Service
 * 
 * This service loads and parses USX Bible files using the expo-asset pattern
 * to access bundled files from the application bundle.
 */

import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import { USXParser } from './USXParser';
import { BookMetadata, ParsedBook } from '../types/usx-types';

export interface BibleBook {
  code: string;
  title: string;
  shortTitle: string;
  abbreviation: string;
  category: 'old-testament' | 'new-testament' | 'deuterocanonical';
  order: number;
  chapters?: ParsedBook;
}

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface BibleVerse {
  number: number;
  text: string;
  reference: string;
}

export interface BibleChapter {
  number: number;
  verses: BibleVerse[];
}

export class BibleService {
  private parser: USXParser;
  private loadedBooks: Map<string, ParsedBook> = new Map();
  private bookMetadata: Map<string, BookMetadata> = new Map();

  // Bible book information
  private readonly bibleBooks: BibleBook[] = [
    // Old Testament
    { code: 'GEN', title: 'Genesis', shortTitle: 'Genesis', abbreviation: 'Gen', category: 'old-testament', order: 1 },
    { code: 'EXO', title: 'Exodus', shortTitle: 'Exodus', abbreviation: 'Ex', category: 'old-testament', order: 2 },
    { code: 'LEV', title: 'Leviticus', shortTitle: 'Leviticus', abbreviation: 'Lev', category: 'old-testament', order: 3 },
    { code: 'NUM', title: 'Numbers', shortTitle: 'Numbers', abbreviation: 'Num', category: 'old-testament', order: 4 },
    { code: 'DEU', title: 'Deuteronomy', shortTitle: 'Deuteronomy', abbreviation: 'Deut', category: 'old-testament', order: 5 },
    { code: 'JOS', title: 'Joshua', shortTitle: 'Joshua', abbreviation: 'Josh', category: 'old-testament', order: 6 },
    { code: 'JDG', title: 'Judges', shortTitle: 'Judges', abbreviation: 'Judg', category: 'old-testament', order: 7 },
    { code: 'RUT', title: 'Ruth', shortTitle: 'Ruth', abbreviation: 'Ruth', category: 'old-testament', order: 8 },
    { code: '1SA', title: '1 Samuel', shortTitle: '1 Samuel', abbreviation: '1 Sam', category: 'old-testament', order: 9 },
    { code: '2SA', title: '2 Samuel', shortTitle: '2 Samuel', abbreviation: '2 Sam', category: 'old-testament', order: 10 },
    { code: '1KI', title: '1 Kings', shortTitle: '1 Kings', abbreviation: '1 Kgs', category: 'old-testament', order: 11 },
    { code: '2KI', title: '2 Kings', shortTitle: '2 Kings', abbreviation: '2 Kgs', category: 'old-testament', order: 12 },
    { code: '1CH', title: '1 Chronicles', shortTitle: '1 Chronicles', abbreviation: '1 Chr', category: 'old-testament', order: 13 },
    { code: '2CH', title: '2 Chronicles', shortTitle: '2 Chronicles', abbreviation: '2 Chr', category: 'old-testament', order: 14 },
    { code: 'EZR', title: 'Ezra', shortTitle: 'Ezra', abbreviation: 'Ezra', category: 'old-testament', order: 15 },
    { code: 'NEH', title: 'Nehemiah', shortTitle: 'Nehemiah', abbreviation: 'Neh', category: 'old-testament', order: 16 },
    { code: 'TOB', title: 'Tobit', shortTitle: 'Tobit', abbreviation: 'Tob', category: 'deuterocanonical', order: 17 },
    { code: 'JDT', title: 'Judith', shortTitle: 'Judith', abbreviation: 'Jdt', category: 'deuterocanonical', order: 18 },
    { code: 'EST', title: 'Esther', shortTitle: 'Esther', abbreviation: 'Esth', category: 'old-testament', order: 19 },
    { code: '1MA', title: '1 Maccabees', shortTitle: '1 Maccabees', abbreviation: '1 Macc', category: 'deuterocanonical', order: 20 },
    { code: '2MA', title: '2 Maccabees', shortTitle: '2 Maccabees', abbreviation: '2 Macc', category: 'deuterocanonical', order: 21 },
    { code: 'JOB', title: 'Job', shortTitle: 'Job', abbreviation: 'Job', category: 'old-testament', order: 22 },
    { code: 'PSA', title: 'Psalms', shortTitle: 'Psalms', abbreviation: 'Ps', category: 'old-testament', order: 23 },
    { code: 'PRO', title: 'Proverbs', shortTitle: 'Proverbs', abbreviation: 'Prov', category: 'old-testament', order: 24 },
    { code: 'ECC', title: 'Ecclesiastes', shortTitle: 'Ecclesiastes', abbreviation: 'Eccl', category: 'old-testament', order: 25 },
    { code: 'SNG', title: 'Song of Songs', shortTitle: 'Song of Songs', abbreviation: 'Song', category: 'old-testament', order: 26 },
    { code: 'WIS', title: 'Wisdom', shortTitle: 'Wisdom', abbreviation: 'Wis', category: 'deuterocanonical', order: 27 },
    { code: 'SIR', title: 'Sirach', shortTitle: 'Sirach', abbreviation: 'Sir', category: 'deuterocanonical', order: 28 },
    { code: 'ISA', title: 'Isaiah', shortTitle: 'Isaiah', abbreviation: 'Isa', category: 'old-testament', order: 29 },
    { code: 'JER', title: 'Jeremiah', shortTitle: 'Jeremiah', abbreviation: 'Jer', category: 'old-testament', order: 30 },
    { code: 'LAM', title: 'Lamentations', shortTitle: 'Lamentations', abbreviation: 'Lam', category: 'old-testament', order: 31 },
    { code: 'BAR_LjeInBar', title: 'Baruch', shortTitle: 'Baruch', abbreviation: 'Bar', category: 'deuterocanonical', order: 32 },
    { code: 'EZK', title: 'Ezekiel', shortTitle: 'Ezekiel', abbreviation: 'Ezek', category: 'old-testament', order: 33 },
    { code: 'DAN', title: 'Daniel', shortTitle: 'Daniel', abbreviation: 'Dan', category: 'old-testament', order: 34 },
    { code: 'HOS', title: 'Hosea', shortTitle: 'Hosea', abbreviation: 'Hos', category: 'old-testament', order: 35 },
    { code: 'JOL', title: 'Joel', shortTitle: 'Joel', abbreviation: 'Joel', category: 'old-testament', order: 36 },
    { code: 'AMO', title: 'Amos', shortTitle: 'Amos', abbreviation: 'Amos', category: 'old-testament', order: 37 },
    { code: 'OBA', title: 'Obadiah', shortTitle: 'Obadiah', abbreviation: 'Obad', category: 'old-testament', order: 38 },
    { code: 'JON', title: 'Jonah', shortTitle: 'Jonah', abbreviation: 'Jonah', category: 'old-testament', order: 39 },
    { code: 'MIC', title: 'Micah', shortTitle: 'Micah', abbreviation: 'Mic', category: 'old-testament', order: 40 },
    { code: 'NAM', title: 'Nahum', shortTitle: 'Nahum', abbreviation: 'Nah', category: 'old-testament', order: 41 },
    { code: 'HAB', title: 'Habakkuk', shortTitle: 'Habakkuk', abbreviation: 'Hab', category: 'old-testament', order: 42 },
    { code: 'ZEP', title: 'Zephaniah', shortTitle: 'Zephaniah', abbreviation: 'Zeph', category: 'old-testament', order: 43 },
    { code: 'HAG', title: 'Haggai', shortTitle: 'Haggai', abbreviation: 'Hag', category: 'old-testament', order: 44 },
    { code: 'ZEC', title: 'Zechariah', shortTitle: 'Zechariah', abbreviation: 'Zech', category: 'old-testament', order: 45 },
    { code: 'MAL', title: 'Malachi', shortTitle: 'Malachi', abbreviation: 'Mal', category: 'old-testament', order: 46 },
    
    // New Testament
    { code: 'MAT', title: 'Matthew', shortTitle: 'Matthew', abbreviation: 'Matt', category: 'new-testament', order: 47 },
    { code: 'MRK', title: 'Mark', shortTitle: 'Mark', abbreviation: 'Mark', category: 'new-testament', order: 48 },
    { code: 'LUK', title: 'Luke', shortTitle: 'Luke', abbreviation: 'Luke', category: 'new-testament', order: 49 },
    { code: 'JHN', title: 'John', shortTitle: 'John', abbreviation: 'John', category: 'new-testament', order: 50 },
    { code: 'ACT', title: 'Acts', shortTitle: 'Acts', abbreviation: 'Acts', category: 'new-testament', order: 51 },
    { code: 'ROM', title: 'Romans', shortTitle: 'Romans', abbreviation: 'Rom', category: 'new-testament', order: 52 },
    { code: '1CO', title: '1 Corinthians', shortTitle: '1 Corinthians', abbreviation: '1 Cor', category: 'new-testament', order: 53 },
    { code: '2CO', title: '2 Corinthians', shortTitle: '2 Corinthians', abbreviation: '2 Cor', category: 'new-testament', order: 54 },
    { code: 'GAL', title: 'Galatians', shortTitle: 'Galatians', abbreviation: 'Gal', category: 'new-testament', order: 55 },
    { code: 'EPH', title: 'Ephesians', shortTitle: 'Ephesians', abbreviation: 'Eph', category: 'new-testament', order: 56 },
    { code: 'PHP', title: 'Philippians', shortTitle: 'Philippians', abbreviation: 'Phil', category: 'new-testament', order: 57 },
    { code: 'COL', title: 'Colossians', shortTitle: 'Colossians', abbreviation: 'Col', category: 'new-testament', order: 58 },
    { code: '1TH', title: '1 Thessalonians', shortTitle: '1 Thessalonians', abbreviation: '1 Thess', category: 'new-testament', order: 59 },
    { code: '2TH', title: '2 Thessalonians', shortTitle: '2 Thessalonians', abbreviation: '2 Thess', category: 'new-testament', order: 60 },
    { code: '1TI', title: '1 Timothy', shortTitle: '1 Timothy', abbreviation: '1 Tim', category: 'new-testament', order: 61 },
    { code: '2TI', title: '2 Timothy', shortTitle: '2 Timothy', abbreviation: '2 Tim', category: 'new-testament', order: 62 },
    { code: 'TIT', title: 'Titus', shortTitle: 'Titus', abbreviation: 'Titus', category: 'new-testament', order: 63 },
    { code: 'PHM', title: 'Philemon', shortTitle: 'Philemon', abbreviation: 'Phlm', category: 'new-testament', order: 64 },
    { code: 'HEB', title: 'Hebrews', shortTitle: 'Hebrews', abbreviation: 'Heb', category: 'new-testament', order: 65 },
    { code: 'JAS', title: 'James', shortTitle: 'James', abbreviation: 'Jas', category: 'new-testament', order: 66 },
    { code: '1PE', title: '1 Peter', shortTitle: '1 Peter', abbreviation: '1 Pet', category: 'new-testament', order: 67 },
    { code: '2PE', title: '2 Peter', shortTitle: '2 Peter', abbreviation: '2 Pet', category: 'new-testament', order: 68 },
    { code: '1JN', title: '1 John', shortTitle: '1 John', abbreviation: '1 John', category: 'new-testament', order: 69 },
    { code: '2JN', title: '2 John', shortTitle: '2 John', abbreviation: '2 John', category: 'new-testament', order: 70 },
    { code: '3JN', title: '3 John', shortTitle: '3 John', abbreviation: '3 John', category: 'new-testament', order: 71 },
    { code: 'JUD', title: 'Jude', shortTitle: 'Jude', abbreviation: 'Jude', category: 'new-testament', order: 72 },
    { code: 'REV', title: 'Revelation', shortTitle: 'Revelation', abbreviation: 'Rev', category: 'new-testament', order: 73 },
  ];

  constructor() {
    this.parser = new USXParser({
      normalizeWhitespace: true,
      includeFormatting: false,
      preserveLineBreaks: false
    });
  }

  /**
   * Get all available Bible books
   */
  getBibleBooks(): BibleBook[] {
    return [...this.bibleBooks];
  }

  /**
   * Get books by category
   */
  getBooksByCategory(category: 'old-testament' | 'new-testament' | 'deuterocanonical'): BibleBook[] {
    return this.bibleBooks.filter(book => book.category === category);
  }

  /**
   * Get a specific book by code
   */
  getBookByCode(code: string): BibleBook | undefined {
    return this.bibleBooks.find(book => book.code === code);
  }

  /**
   * Static mapping of USX files - Metro bundler requires static require() calls
   */
  private getUSXAsset(bookCode: string) {
    const usxAssets: Record<string, any> = {
      '1CH': require('../assets/bibles/douay-rheims/release/USX_1/1CH.usx'),
      '1CO': require('../assets/bibles/douay-rheims/release/USX_1/1CO.usx'),
      '1JN': require('../assets/bibles/douay-rheims/release/USX_1/1JN.usx'),
      '1KI': require('../assets/bibles/douay-rheims/release/USX_1/1KI.usx'),
      '1MA': require('../assets/bibles/douay-rheims/release/USX_1/1MA.usx'),
      '1PE': require('../assets/bibles/douay-rheims/release/USX_1/1PE.usx'),
      '1SA': require('../assets/bibles/douay-rheims/release/USX_1/1SA.usx'),
      '1TH': require('../assets/bibles/douay-rheims/release/USX_1/1TH.usx'),
      '1TI': require('../assets/bibles/douay-rheims/release/USX_1/1TI.usx'),
      '2CH': require('../assets/bibles/douay-rheims/release/USX_1/2CH.usx'),
      '2CO': require('../assets/bibles/douay-rheims/release/USX_1/2CO.usx'),
      '2JN': require('../assets/bibles/douay-rheims/release/USX_1/2JN.usx'),
      '2KI': require('../assets/bibles/douay-rheims/release/USX_1/2KI.usx'),
      '2MA': require('../assets/bibles/douay-rheims/release/USX_1/2MA.usx'),
      '2PE': require('../assets/bibles/douay-rheims/release/USX_1/2PE.usx'),
      '2SA': require('../assets/bibles/douay-rheims/release/USX_1/2SA.usx'),
      '2TH': require('../assets/bibles/douay-rheims/release/USX_1/2TH.usx'),
      '2TI': require('../assets/bibles/douay-rheims/release/USX_1/2TI.usx'),
      '3JN': require('../assets/bibles/douay-rheims/release/USX_1/3JN.usx'),
      'ACT': require('../assets/bibles/douay-rheims/release/USX_1/ACT.usx'),
      'AMO': require('../assets/bibles/douay-rheims/release/USX_1/AMO.usx'),
      'BAR_LjeInBar': require('../assets/bibles/douay-rheims/release/USX_1/BAR_LjeInBar.usx'),
      'COL': require('../assets/bibles/douay-rheims/release/USX_1/COL.usx'),
      'DAN': require('../assets/bibles/douay-rheims/release/USX_1/DAN.usx'),
      'DEU': require('../assets/bibles/douay-rheims/release/USX_1/DEU.usx'),
      'ECC': require('../assets/bibles/douay-rheims/release/USX_1/ECC.usx'),
      'EPH': require('../assets/bibles/douay-rheims/release/USX_1/EPH.usx'),
      'EST': require('../assets/bibles/douay-rheims/release/USX_1/EST.usx'),
      'EXO': require('../assets/bibles/douay-rheims/release/USX_1/EXO.usx'),
      'EZK': require('../assets/bibles/douay-rheims/release/USX_1/EZK.usx'),
      'EZR': require('../assets/bibles/douay-rheims/release/USX_1/EZR.usx'),
      'GAL': require('../assets/bibles/douay-rheims/release/USX_1/GAL.usx'),
      'GEN': require('../assets/bibles/douay-rheims/release/USX_1/GEN.usx'),
      'HAB': require('../assets/bibles/douay-rheims/release/USX_1/HAB.usx'),
      'HAG': require('../assets/bibles/douay-rheims/release/USX_1/HAG.usx'),
      'HEB': require('../assets/bibles/douay-rheims/release/USX_1/HEB.usx'),
      'HOS': require('../assets/bibles/douay-rheims/release/USX_1/HOS.usx'),
      'ISA': require('../assets/bibles/douay-rheims/release/USX_1/ISA.usx'),
      'JAS': require('../assets/bibles/douay-rheims/release/USX_1/JAS.usx'),
      'JDG': require('../assets/bibles/douay-rheims/release/USX_1/JDG.usx'),
      'JDT': require('../assets/bibles/douay-rheims/release/USX_1/JDT.usx'),
      'JER': require('../assets/bibles/douay-rheims/release/USX_1/JER.usx'),
      'JHN': require('../assets/bibles/douay-rheims/release/USX_1/JHN.usx'),
      'JOB': require('../assets/bibles/douay-rheims/release/USX_1/JOB.usx'),
      'JOL': require('../assets/bibles/douay-rheims/release/USX_1/JOL.usx'),
      'JON': require('../assets/bibles/douay-rheims/release/USX_1/JON.usx'),
      'JOS': require('../assets/bibles/douay-rheims/release/USX_1/JOS.usx'),
      'JUD': require('../assets/bibles/douay-rheims/release/USX_1/JUD.usx'),
      'LAM': require('../assets/bibles/douay-rheims/release/USX_1/LAM.usx'),
      'LEV': require('../assets/bibles/douay-rheims/release/USX_1/LEV.usx'),
      'LUK': require('../assets/bibles/douay-rheims/release/USX_1/LUK.usx'),
      'MAL': require('../assets/bibles/douay-rheims/release/USX_1/MAL.usx'),
      'MAT': require('../assets/bibles/douay-rheims/release/USX_1/MAT.usx'),
      'MIC': require('../assets/bibles/douay-rheims/release/USX_1/MIC.usx'),
      'MRK': require('../assets/bibles/douay-rheims/release/USX_1/MRK.usx'),
      'NAM': require('../assets/bibles/douay-rheims/release/USX_1/NAM.usx'),
      'NEH': require('../assets/bibles/douay-rheims/release/USX_1/NEH.usx'),
      'NUM': require('../assets/bibles/douay-rheims/release/USX_1/NUM.usx'),
      'OBA': require('../assets/bibles/douay-rheims/release/USX_1/OBA.usx'),
      'PHM': require('../assets/bibles/douay-rheims/release/USX_1/PHM.usx'),
      'PHP': require('../assets/bibles/douay-rheims/release/USX_1/PHP.usx'),
      'PRO': require('../assets/bibles/douay-rheims/release/USX_1/PRO.usx'),
      'PSA': require('../assets/bibles/douay-rheims/release/USX_1/PSA.usx'),
      'REV': require('../assets/bibles/douay-rheims/release/USX_1/REV.usx'),
      'ROM': require('../assets/bibles/douay-rheims/release/USX_1/ROM.usx'),
      'RUT': require('../assets/bibles/douay-rheims/release/USX_1/RUT.usx'),
      'SIR': require('../assets/bibles/douay-rheims/release/USX_1/SIR.usx'),
      'SNG': require('../assets/bibles/douay-rheims/release/USX_1/SNG.usx'),
      'TIT': require('../assets/bibles/douay-rheims/release/USX_1/TIT.usx'),
      'TOB': require('../assets/bibles/douay-rheims/release/USX_1/TOB.usx'),
      'WIS': require('../assets/bibles/douay-rheims/release/USX_1/WIS.usx'),
      'ZEC': require('../assets/bibles/douay-rheims/release/USX_1/ZEC.usx'),
      'ZEP': require('../assets/bibles/douay-rheims/release/USX_1/ZEP.usx'),
    };

    const asset = usxAssets[bookCode];
    if (!asset) {
      throw new Error(`USX file not found for book code: ${bookCode}`);
    }
    return asset;
  }

  /**
   * Load a USX file from the bundled assets
   */
  private async loadUSXFile(bookCode: string): Promise<string> {
    try {
      console.log(`Loading USX file for book: ${bookCode}`);
      
      // Get the asset object from the bundled file
      const asset = Asset.fromModule(this.getUSXAsset(bookCode));
      console.log(`Asset loaded for ${bookCode}:`, asset);

      // Ensure the asset is downloaded (if not already)
      await asset.downloadAsync();
      console.log(`Asset downloaded for ${bookCode}, localUri:`, asset.localUri);

      // Check if a local URI is available
      if (asset.localUri) {
        // Read the content of the file as a string using new File API
        const file = new File(asset.localUri);
        const fileContents = await file.text();
        console.log(`File contents loaded for ${bookCode}, length:`, fileContents.length);
        return fileContents;
      } else {
        throw new Error(`Local URI not available for ${bookCode}.usx`);
      }
    } catch (error) {
      console.error(`Error reading bundled USX file ${bookCode}:`, error);
      throw new Error(`Failed to load ${bookCode}.usx: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load and parse a Bible book
   */
  async loadBook(bookCode: string): Promise<ParsedBook> {
    console.log(`Loading book: ${bookCode}`);
    
    // Check if already loaded
    if (this.loadedBooks.has(bookCode)) {
      console.log(`Book ${bookCode} already loaded from cache`);
      return this.loadedBooks.get(bookCode)!;
    }

    try {
      // Load the USX file content
      const usxContent = await this.loadUSXFile(bookCode);
      console.log(`USX content loaded for ${bookCode}, parsing...`);
      
      // Parse the content
      const result = this.parser.parseUSXContent(usxContent);
      console.log(`Parse result for ${bookCode}:`, result.success ? 'SUCCESS' : 'FAILED', result.error);
      
      if (result.success && result.book) {
        console.log(`Book ${bookCode} parsed successfully, chapters:`, result.book.chapters.length);
        
        // Cache the parsed book
        this.loadedBooks.set(bookCode, result.book);
        
        // Cache metadata if available
        if (result.metadata) {
          this.bookMetadata.set(bookCode, result.metadata);
        }
        
        return result.book;
      } else {
        throw new Error(result.error || 'Failed to parse book');
      }
    } catch (error) {
      console.error(`Error loading book ${bookCode}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific verse
   */
  async getVerse(bookCode: string, chapter: number, verse: number): Promise<BibleVerse | null> {
    try {
      const book = await this.loadBook(bookCode);
      const reference = `${bookCode} ${chapter}:${verse}`;
      const verseObj = this.parser.getVerseByReference(book, reference);
      
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
  async getChapter(bookCode: string, chapterNumber: number): Promise<BibleChapter | null> {
    try {
      console.log(`Getting chapter ${chapterNumber} from book ${bookCode}`);
      const book = await this.loadBook(bookCode);
      console.log(`Book ${bookCode} loaded, available chapters:`, book.chapters.map((c: any) => c.number));
      
      const chapter = book.chapters.find((c: any) => c.number === chapterNumber);
      
      if (chapter) {
        console.log(`Chapter ${chapterNumber} found in ${bookCode}, verses:`, chapter.verses.length);
        return {
          number: chapter.number,
          verses: chapter.verses.map((verse: any) => ({
            number: verse.number,
            text: verse.text,
            reference: verse.reference
          }))
        };
      }
      
      console.log(`Chapter ${chapterNumber} not found in ${bookCode}`);
      return null;
    } catch (error) {
      console.error(`Error getting chapter ${bookCode} ${chapterNumber}:`, error);
      return null;
    }
  }

  /**
   * Search for text across all loaded books or a specific book
   */
  async search(searchText: string, bookCode?: string, caseSensitive: boolean = false): Promise<BibleSearchResult[]> {
    const results: BibleSearchResult[] = [];
    
    try {
      if (bookCode) {
        // Check if bookCode is a category (old-testament, new-testament, deuterocanonical)
        if (bookCode === 'old-testament' || bookCode === 'new-testament' || bookCode === 'deuterocanonical') {
          // Search in all books of the specified category
          const booksToSearch = this.getBooksByCategory(bookCode as 'old-testament' | 'new-testament' | 'deuterocanonical');
          
          for (const bibleBook of booksToSearch) {
            try {
              const book = await this.loadBook(bibleBook.code);
              const searchResults = this.parser.searchInBook(book, searchText, caseSensitive);
              
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
          const searchResults = this.parser.searchInBook(book, searchText, caseSensitive);
          
          results.push(...searchResults.map(verse => ({
            book: bookCode,
            chapter: this.getChapterNumberFromReference(verse.reference),
            verse: verse.number,
            text: verse.text,
            reference: verse.reference
          })));
        }
      } else {
        // Search in all books (this could be expensive, so we might want to limit it)
        const booksToSearch = this.bibleBooks.slice(0, 10); // Limit to first 10 books for performance
        
        for (const bibleBook of booksToSearch) {
          try {
            const book = await this.loadBook(bibleBook.code);
            const searchResults = this.parser.searchInBook(book, searchText, caseSensitive);
            
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
   * Get book statistics
   */
  async getBookStats(bookCode: string): Promise<{
    totalChapters: number;
    totalVerses: number;
    totalWords: number;
    totalCharacters: number;
  } | null> {
    try {
      const book = await this.loadBook(bookCode);
      return this.parser.getBookStats(book);
    } catch (error) {
      console.error(`Error getting stats for ${bookCode}:`, error);
      return null;
    }
  }

  /**
   * Helper method to extract chapter number from reference
   */
  private getChapterNumberFromReference(reference: string): number {
    const match = reference.match(/\w+\s+(\d+):\d+/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Clear loaded books cache (useful for memory management)
   */
  clearCache(): void {
    this.loadedBooks.clear();
    this.bookMetadata.clear();
  }

  /**
   * Get cached book if available
   */
  getCachedBook(bookCode: string): ParsedBook | null {
    return this.loadedBooks.get(bookCode) || null;
  }
}

// Export a default instance
export const bibleService = new BibleService();
