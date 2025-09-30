/**
 * Bible Service - Web Implementation
 * 
 * Web-specific implementation of the Bible service that handles
 * asset loading and USX file parsing for the web platform.
 */

import { Asset } from "expo-asset";
import { USXParser } from './USXParser';
import { BibleBook, BibleChapter, BibleVerse, BibleSearchResult, BiblePassage } from '../types';
import { ParsedBook } from '../types/usx-types';
import { parseBibleReference, formatNormalizedReference } from '../utils/bibleReference';

export class BibleService {
  private parser: USXParser;
  private loadedBooks: Map<string, ParsedBook> = new Map();
  private bookMetadata: Map<string, any> = new Map();

  constructor() {
    this.parser = new USXParser();
  }

  /**
   * Get all available Bible books
   */
  async getAvailableBooks(): Promise<BibleBook[]> {
    // Return a comprehensive list of Bible books
    return [
      // Old Testament
      { code: 'GEN', title: 'Genesis', shortTitle: 'Gen', abbreviation: 'Gn', category: 'old-testament', order: 1, chapters: 50 },
      { code: 'EXO', title: 'Exodus', shortTitle: 'Ex', abbreviation: 'Ex', category: 'old-testament', order: 2, chapters: 40 },
      { code: 'LEV', title: 'Leviticus', shortTitle: 'Lev', abbreviation: 'Lv', category: 'old-testament', order: 3, chapters: 27 },
      { code: 'NUM', title: 'Numbers', shortTitle: 'Num', abbreviation: 'Nm', category: 'old-testament', order: 4, chapters: 36 },
      { code: 'DEU', title: 'Deuteronomy', shortTitle: 'Deut', abbreviation: 'Dt', category: 'old-testament', order: 5, chapters: 34 },
      { code: 'JOS', title: 'Joshua', shortTitle: 'Josh', abbreviation: 'Jos', category: 'old-testament', order: 6, chapters: 24 },
      { code: 'JDG', title: 'Judges', shortTitle: 'Judg', abbreviation: 'Jg', category: 'old-testament', order: 7, chapters: 21 },
      { code: 'RUT', title: 'Ruth', shortTitle: 'Ruth', abbreviation: 'Ru', category: 'old-testament', order: 8, chapters: 4 },
      { code: '1SA', title: '1 Samuel', shortTitle: '1 Sam', abbreviation: '1 Sm', category: 'old-testament', order: 9, chapters: 31 },
      { code: '2SA', title: '2 Samuel', shortTitle: '2 Sam', abbreviation: '2 Sm', category: 'old-testament', order: 10, chapters: 24 },
      { code: '1KI', title: '1 Kings', shortTitle: '1 Kgs', abbreviation: '1 K', category: 'old-testament', order: 11, chapters: 22 },
      { code: '2KI', title: '2 Kings', shortTitle: '2 Kgs', abbreviation: '2 K', category: 'old-testament', order: 12, chapters: 25 },
      { code: '1CH', title: '1 Chronicles', shortTitle: '1 Chr', abbreviation: '1 Chr', category: 'old-testament', order: 13, chapters: 29 },
      { code: '2CH', title: '2 Chronicles', shortTitle: '2 Chr', abbreviation: '2 Chr', category: 'old-testament', order: 14, chapters: 36 },
      { code: 'EZR', title: 'Ezra', shortTitle: 'Ezra', abbreviation: 'Ezr', category: 'old-testament', order: 15, chapters: 10 },
      { code: 'NEH', title: 'Nehemiah', shortTitle: 'Neh', abbreviation: 'Neh', category: 'old-testament', order: 16, chapters: 13 },
      { code: 'TOB', title: 'Tobit', shortTitle: 'Tob', abbreviation: 'Tb', category: 'deuterocanonical', order: 17, chapters: 14 },
      { code: 'JDT', title: 'Judith', shortTitle: 'Jdt', abbreviation: 'Jdt', category: 'deuterocanonical', order: 18, chapters: 16 },
      { code: 'EST', title: 'Esther', shortTitle: 'Esth', abbreviation: 'Est', category: 'old-testament', order: 19, chapters: 10 },
      { code: '1MA', title: '1 Maccabees', shortTitle: '1 Macc', abbreviation: '1 Mc', category: 'deuterocanonical', order: 20, chapters: 16 },
      { code: '2MA', title: '2 Maccabees', shortTitle: '2 Macc', abbreviation: '2 Mc', category: 'deuterocanonical', order: 21, chapters: 15 },
      { code: 'JOB', title: 'Job', shortTitle: 'Job', abbreviation: 'Jb', category: 'old-testament', order: 22, chapters: 42 },
      { code: 'PSA', title: 'Psalms', shortTitle: 'Ps', abbreviation: 'Ps', category: 'old-testament', order: 23, chapters: 150 },
      { code: 'PRO', title: 'Proverbs', shortTitle: 'Prov', abbreviation: 'Prv', category: 'old-testament', order: 24, chapters: 31 },
      { code: 'ECC', title: 'Ecclesiastes', shortTitle: 'Eccl', abbreviation: 'Eccl', category: 'old-testament', order: 25, chapters: 12 },
      { code: 'SNG', title: 'Song of Songs', shortTitle: 'Song', abbreviation: 'Sg', category: 'old-testament', order: 26, chapters: 8 },
      { code: 'WIS', title: 'Wisdom', shortTitle: 'Wis', abbreviation: 'Wis', category: 'deuterocanonical', order: 27, chapters: 19 },
      { code: 'SIR', title: 'Sirach', shortTitle: 'Sir', abbreviation: 'Sir', category: 'deuterocanonical', order: 28, chapters: 51 },
      { code: 'ISA', title: 'Isaiah', shortTitle: 'Isa', abbreviation: 'Is', category: 'old-testament', order: 29, chapters: 66 },
      { code: 'JER', title: 'Jeremiah', shortTitle: 'Jer', abbreviation: 'Jer', category: 'old-testament', order: 30, chapters: 52 },
      { code: 'LAM', title: 'Lamentations', shortTitle: 'Lam', abbreviation: 'Lam', category: 'old-testament', order: 31, chapters: 5 },
      { code: 'BAR_LjeInBar', title: 'Baruch', shortTitle: 'Bar', abbreviation: 'Bar', category: 'deuterocanonical', order: 32, chapters: 6 },
      { code: 'EZK', title: 'Ezekiel', shortTitle: 'Ezek', abbreviation: 'Ez', category: 'old-testament', order: 33, chapters: 48 },
      { code: 'DAN', title: 'Daniel', shortTitle: 'Dan', abbreviation: 'Dn', category: 'old-testament', order: 34, chapters: 14 },
      { code: 'HOS', title: 'Hosea', shortTitle: 'Hos', abbreviation: 'Hos', category: 'old-testament', order: 35, chapters: 14 },
      { code: 'JOL', title: 'Joel', shortTitle: 'Joel', abbreviation: 'Jl', category: 'old-testament', order: 36, chapters: 4 },
      { code: 'AMO', title: 'Amos', shortTitle: 'Amos', abbreviation: 'Am', category: 'old-testament', order: 37, chapters: 9 },
      { code: 'OBA', title: 'Obadiah', shortTitle: 'Obad', abbreviation: 'Ob', category: 'old-testament', order: 38, chapters: 1 },
      { code: 'JON', title: 'Jonah', shortTitle: 'Jonah', abbreviation: 'Jon', category: 'old-testament', order: 39, chapters: 4 },
      { code: 'MIC', title: 'Micah', shortTitle: 'Mic', abbreviation: 'Mi', category: 'old-testament', order: 40, chapters: 7 },
      { code: 'NAM', title: 'Nahum', shortTitle: 'Nah', abbreviation: 'Na', category: 'old-testament', order: 41, chapters: 3 },
      { code: 'HAB', title: 'Habakkuk', shortTitle: 'Hab', abbreviation: 'Hb', category: 'old-testament', order: 42, chapters: 3 },
      { code: 'ZEP', title: 'Zephaniah', shortTitle: 'Zeph', abbreviation: 'Zep', category: 'old-testament', order: 43, chapters: 3 },
      { code: 'HAG', title: 'Haggai', shortTitle: 'Hag', abbreviation: 'Hg', category: 'old-testament', order: 44, chapters: 2 },
      { code: 'ZEC', title: 'Zechariah', shortTitle: 'Zech', abbreviation: 'Zec', category: 'old-testament', order: 45, chapters: 14 },
      { code: 'MAL', title: 'Malachi', shortTitle: 'Mal', abbreviation: 'Mal', category: 'old-testament', order: 46, chapters: 4 },

      // New Testament
      { code: 'MAT', title: 'Matthew', shortTitle: 'Matt', abbreviation: 'Mt', category: 'new-testament', order: 47, chapters: 28 },
      { code: 'MRK', title: 'Mark', shortTitle: 'Mark', abbreviation: 'Mk', category: 'new-testament', order: 48, chapters: 16 },
      { code: 'LUK', title: 'Luke', shortTitle: 'Luke', abbreviation: 'Lk', category: 'new-testament', order: 49, chapters: 24 },
      { code: 'JHN', title: 'John', shortTitle: 'John', abbreviation: 'Jn', category: 'new-testament', order: 50, chapters: 21 },
      { code: 'ACT', title: 'Acts', shortTitle: 'Acts', abbreviation: 'Acts', category: 'new-testament', order: 51, chapters: 28 },
      { code: 'ROM', title: 'Romans', shortTitle: 'Rom', abbreviation: 'Rom', category: 'new-testament', order: 52, chapters: 16 },
      { code: '1CO', title: '1 Corinthians', shortTitle: '1 Cor', abbreviation: '1 Cor', category: 'new-testament', order: 53, chapters: 16 },
      { code: '2CO', title: '2 Corinthians', shortTitle: '2 Cor', abbreviation: '2 Cor', category: 'new-testament', order: 54, chapters: 13 },
      { code: 'GAL', title: 'Galatians', shortTitle: 'Gal', abbreviation: 'Gal', category: 'new-testament', order: 55, chapters: 6 },
      { code: 'EPH', title: 'Ephesians', shortTitle: 'Eph', abbreviation: 'Eph', category: 'new-testament', order: 56, chapters: 6 },
      { code: 'PHP', title: 'Philippians', shortTitle: 'Phil', abbreviation: 'Phil', category: 'new-testament', order: 57, chapters: 4 },
      { code: 'COL', title: 'Colossians', shortTitle: 'Col', abbreviation: 'Col', category: 'new-testament', order: 58, chapters: 4 },
      { code: '1TH', title: '1 Thessalonians', shortTitle: '1 Thess', abbreviation: '1 Thes', category: 'new-testament', order: 59, chapters: 5 },
      { code: '2TH', title: '2 Thessalonians', shortTitle: '2 Thess', abbreviation: '2 Thes', category: 'new-testament', order: 60, chapters: 3 },
      { code: '1TI', title: '1 Timothy', shortTitle: '1 Tim', abbreviation: '1 Tim', category: 'new-testament', order: 61, chapters: 6 },
      { code: '2TI', title: '2 Timothy', shortTitle: '2 Tim', abbreviation: '2 Tim', category: 'new-testament', order: 62, chapters: 4 },
      { code: 'TIT', title: 'Titus', shortTitle: 'Titus', abbreviation: 'Ti', category: 'new-testament', order: 63, chapters: 3 },
      { code: 'PHM', title: 'Philemon', shortTitle: 'Phlm', abbreviation: 'Phlm', category: 'new-testament', order: 64, chapters: 1 },
      { code: 'HEB', title: 'Hebrews', shortTitle: 'Heb', abbreviation: 'Heb', category: 'new-testament', order: 65, chapters: 13 },
      { code: 'JAS', title: 'James', shortTitle: 'Jas', abbreviation: 'Jas', category: 'new-testament', order: 66, chapters: 5 },
      { code: '1PE', title: '1 Peter', shortTitle: '1 Pet', abbreviation: '1 Pt', category: 'new-testament', order: 67, chapters: 5 },
      { code: '2PE', title: '2 Peter', shortTitle: '2 Pet', abbreviation: '2 Pt', category: 'new-testament', order: 68, chapters: 3 },
      { code: '1JN', title: '1 John', shortTitle: '1 John', abbreviation: '1 Jn', category: 'new-testament', order: 69, chapters: 5 },
      { code: '2JN', title: '2 John', shortTitle: '2 John', abbreviation: '2 Jn', category: 'new-testament', order: 70, chapters: 1 },
      { code: '3JN', title: '3 John', shortTitle: '3 John', abbreviation: '3 Jn', category: 'new-testament', order: 71, chapters: 1 },
      { code: 'JUD', title: 'Jude', shortTitle: 'Jude', abbreviation: 'Jude', category: 'new-testament', order: 72, chapters: 1 },
      { code: 'REV', title: 'Revelation', shortTitle: 'Rev', abbreviation: 'Rev', category: 'new-testament', order: 73, chapters: 22 },
    ];
  }

  /**
   * Get a book by its code
   */
  async getBookByCode(bookCode: string): Promise<BibleBook> {
    const books = await this.getAvailableBooks();
    const book = books.find(b => b.code === bookCode);
    if (!book) {
      throw new Error(`Book not found: ${bookCode}`);
    }
    return book;
  }

  /**
   * Get the USX asset for a book code
   */
  private getUSXAsset(bookCode: string) {
    const usxAssets: { [key: string]: any } = {
      'GEN': require('../assets/bibles/douay-rheims/release/USX_1/GEN.usx'),
      'EXO': require('../assets/bibles/douay-rheims/release/USX_1/EXO.usx'),
      'LEV': require('../assets/bibles/douay-rheims/release/USX_1/LEV.usx'),
      'NUM': require('../assets/bibles/douay-rheims/release/USX_1/NUM.usx'),
      'DEU': require('../assets/bibles/douay-rheims/release/USX_1/DEU.usx'),
      'JOS': require('../assets/bibles/douay-rheims/release/USX_1/JOS.usx'),
      'JDG': require('../assets/bibles/douay-rheims/release/USX_1/JDG.usx'),
      'RUT': require('../assets/bibles/douay-rheims/release/USX_1/RUT.usx'),
      '1SA': require('../assets/bibles/douay-rheims/release/USX_1/1SA.usx'),
      '2SA': require('../assets/bibles/douay-rheims/release/USX_1/2SA.usx'),
      '1KI': require('../assets/bibles/douay-rheims/release/USX_1/1KI.usx'),
      '2KI': require('../assets/bibles/douay-rheims/release/USX_1/2KI.usx'),
      '1CH': require('../assets/bibles/douay-rheims/release/USX_1/1CH.usx'),
      '2CH': require('../assets/bibles/douay-rheims/release/USX_1/2CH.usx'),
      'EZR': require('../assets/bibles/douay-rheims/release/USX_1/EZR.usx'),
      'NEH': require('../assets/bibles/douay-rheims/release/USX_1/NEH.usx'),
      'TOB': require('../assets/bibles/douay-rheims/release/USX_1/TOB.usx'),
      'JDT': require('../assets/bibles/douay-rheims/release/USX_1/JDT.usx'),
      'EST': require('../assets/bibles/douay-rheims/release/USX_1/EST.usx'),
      '1MA': require('../assets/bibles/douay-rheims/release/USX_1/1MA.usx'),
      '2MA': require('../assets/bibles/douay-rheims/release/USX_1/2MA.usx'),
      'JOB': require('../assets/bibles/douay-rheims/release/USX_1/JOB.usx'),
      'PSA': require('../assets/bibles/douay-rheims/release/USX_1/PSA.usx'),
      'PRO': require('../assets/bibles/douay-rheims/release/USX_1/PRO.usx'),
      'ECC': require('../assets/bibles/douay-rheims/release/USX_1/ECC.usx'),
      'SNG': require('../assets/bibles/douay-rheims/release/USX_1/SNG.usx'),
      'WIS': require('../assets/bibles/douay-rheims/release/USX_1/WIS.usx'),
      'SIR': require('../assets/bibles/douay-rheims/release/USX_1/SIR.usx'),
      'ISA': require('../assets/bibles/douay-rheims/release/USX_1/ISA.usx'),
      'JER': require('../assets/bibles/douay-rheims/release/USX_1/JER.usx'),
      'LAM': require('../assets/bibles/douay-rheims/release/USX_1/LAM.usx'),
      'BAR_LjeInBar': require('../assets/bibles/douay-rheims/release/USX_1/BAR_LjeInBar.usx'),
      'EZK': require('../assets/bibles/douay-rheims/release/USX_1/EZK.usx'),
      'DAN': require('../assets/bibles/douay-rheims/release/USX_1/DAN.usx'),
      'HOS': require('../assets/bibles/douay-rheims/release/USX_1/HOS.usx'),
      'JOL': require('../assets/bibles/douay-rheims/release/USX_1/JOL.usx'),
      'AMO': require('../assets/bibles/douay-rheims/release/USX_1/AMO.usx'),
      'OBA': require('../assets/bibles/douay-rheims/release/USX_1/OBA.usx'),
      'JON': require('../assets/bibles/douay-rheims/release/USX_1/JON.usx'),
      'MIC': require('../assets/bibles/douay-rheims/release/USX_1/MIC.usx'),
      'NAM': require('../assets/bibles/douay-rheims/release/USX_1/NAM.usx'),
      'HAB': require('../assets/bibles/douay-rheims/release/USX_1/HAB.usx'),
      'ZEP': require('../assets/bibles/douay-rheims/release/USX_1/ZEP.usx'),
      'HAG': require('../assets/bibles/douay-rheims/release/USX_1/HAG.usx'),
      'ZEC': require('../assets/bibles/douay-rheims/release/USX_1/ZEC.usx'),
      'MAL': require('../assets/bibles/douay-rheims/release/USX_1/MAL.usx'),
      'MAT': require('../assets/bibles/douay-rheims/release/USX_1/MAT.usx'),
      'MRK': require('../assets/bibles/douay-rheims/release/USX_1/MRK.usx'),
      'LUK': require('../assets/bibles/douay-rheims/release/USX_1/LUK.usx'),
      'JHN': require('../assets/bibles/douay-rheims/release/USX_1/JHN.usx'),
      'ACT': require('../assets/bibles/douay-rheims/release/USX_1/ACT.usx'),
      'ROM': require('../assets/bibles/douay-rheims/release/USX_1/ROM.usx'),
      '1CO': require('../assets/bibles/douay-rheims/release/USX_1/1CO.usx'),
      '2CO': require('../assets/bibles/douay-rheims/release/USX_1/2CO.usx'),
      'GAL': require('../assets/bibles/douay-rheims/release/USX_1/GAL.usx'),
      'EPH': require('../assets/bibles/douay-rheims/release/USX_1/EPH.usx'),
      'PHP': require('../assets/bibles/douay-rheims/release/USX_1/PHP.usx'),
      'COL': require('../assets/bibles/douay-rheims/release/USX_1/COL.usx'),
      '1TH': require('../assets/bibles/douay-rheims/release/USX_1/1TH.usx'),
      '2TH': require('../assets/bibles/douay-rheims/release/USX_1/2TH.usx'),
      '1TI': require('../assets/bibles/douay-rheims/release/USX_1/1TI.usx'),
      '2TI': require('../assets/bibles/douay-rheims/release/USX_1/2TI.usx'),
      'TIT': require('../assets/bibles/douay-rheims/release/USX_1/TIT.usx'),
      'PHM': require('../assets/bibles/douay-rheims/release/USX_1/PHM.usx'),
      'HEB': require('../assets/bibles/douay-rheims/release/USX_1/HEB.usx'),
      'JAS': require('../assets/bibles/douay-rheims/release/USX_1/JAS.usx'),
      '1PE': require('../assets/bibles/douay-rheims/release/USX_1/1PE.usx'),
      '2PE': require('../assets/bibles/douay-rheims/release/USX_1/2PE.usx'),
      '1JN': require('../assets/bibles/douay-rheims/release/USX_1/1JN.usx'),
      '2JN': require('../assets/bibles/douay-rheims/release/USX_1/2JN.usx'),
      '3JN': require('../assets/bibles/douay-rheims/release/USX_1/3JN.usx'),
      'JUD': require('../assets/bibles/douay-rheims/release/USX_1/JUD.usx'),
      'REV': require('../assets/bibles/douay-rheims/release/USX_1/REV.usx'),
    };

    const asset = usxAssets[bookCode];
    if (!asset) {
      throw new Error(`USX file not found for book code: ${bookCode}`);
    }
    return asset;
  }

  /**
   * Load a USX file from the bundled assets (Web optimized)
   */
  private async loadUSXFile(bookCode: string): Promise<string> {
    try {
      console.log(`Loading USX file for book: ${bookCode}`);
      
      // Get the asset object from the bundled file
      const asset = Asset.fromModule(this.getUSXAsset(bookCode));
      console.log(`Asset loaded for ${bookCode}:`, asset);

      // For web, we need to handle asset loading differently
      if (typeof window !== 'undefined') {
        // Web environment - use fetch instead of readAsStringAsync
        await asset.downloadAsync();
        console.log(`Asset downloaded for ${bookCode}, localUri:`, asset.localUri);
        
        if (asset.localUri) {
          // Use fetch to read the file content on web
          const response = await fetch(asset.localUri);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${bookCode}.usx: ${response.status} ${response.statusText}`);
          }
          const fileContents = await response.text();
          console.log(`File contents loaded for ${bookCode}, length:`, fileContents.length);
          return fileContents;
        } else {
          throw new Error(`Local URI not available for ${bookCode}.usx on web`);
        }
      } else {
        // Mobile environment - this shouldn't be called in web version
        throw new Error(`Mobile file system access not available in web environment for ${bookCode}`);
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
      console.log(`Book ${bookCode} loaded, available chapters:`, book.chapters.map(c => c.number));
      
      const chapter = book.chapters.find(c => c.number === chapterNumber);
      
      if (chapter) {
        //console.log(`Chapter ${chapterNumber} found in ${bookCode}, verses:`, chapter.verses.length);
        return {
          number: chapter.number,
          verses: chapter.verses.map(verse => ({
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
   * Get a passage by Bible reference string (e.g., "Genesis 1:1-2:7", "Mat 5:3-9")
   */
  async getPassageByReference(reference: string): Promise<BiblePassage | null> {
    const parsed = parseBibleReference(reference);
    if (!parsed) return null;

    const book = await this.loadBook(parsed.bookCode);
    const startRef = `${parsed.bookCode} ${parsed.startChapter}:${parsed.startVerse}`;
    const endRef = `${parsed.bookCode} ${parsed.endChapter}:${parsed.endVerse}`;

    const hasRange = typeof (this.parser as any).getVerseRange === 'function';
    const verses = hasRange
      ? (this.parser as any).getVerseRange(book, startRef, endRef)
      : this.fallbackCollectRange(book, parsed.startChapter, parsed.startVerse, parsed.endChapter, parsed.endVerse);

    return {
      bookCode: parsed.bookCode,
      startChapter: parsed.startChapter,
      startVerse: parsed.startVerse,
      endChapter: parsed.endChapter,
      endVerse: parsed.endVerse,
      verses: verses.map((v: any) => ({ number: v.number, text: v.text, reference: v.reference })),
      reference: formatNormalizedReference(parsed)
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
  async getPassageText(reference: string, options?: { includeVerseNumbers?: boolean; separator?: string }): Promise<string | null> {
    const passage = await this.getPassageByReference(reference);
    if (!passage) return null;
    const includeNums = options?.includeVerseNumbers ?? false;
    const sep = options?.separator ?? ' ';
    const parts = passage.verses.map(v => includeNums ? `${v.number} ${v.text}` : v.text);
    return parts.join(sep).trim();
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
          const allBooks = await this.getAvailableBooks();
          const booksToSearch = allBooks.filter(book => book.category === bookCode);
          
          for (const book of booksToSearch) {
            try {
              const parsedBook = await this.loadBook(book.code);
              for (const chapter of parsedBook.chapters) {
                for (const verse of chapter.verses) {
                  const text = caseSensitive ? verse.text : verse.text.toLowerCase();
                  const search = caseSensitive ? searchText : searchText.toLowerCase();
                  
                  if (text.includes(search)) {
                    results.push({
                      book: book.code,
                      chapter: chapter.number,
                      verse: verse.number,
                      text: verse.text,
                      reference: verse.reference
                    });
                  }
                }
              }
            } catch (error) {
              console.warn(`Failed to search in ${book.code}:`, error);
            }
          }
        } else {
          // Search in specific book
          const book = await this.loadBook(bookCode);
          for (const chapter of book.chapters) {
            for (const verse of chapter.verses) {
              const text = caseSensitive ? verse.text : verse.text.toLowerCase();
              const search = caseSensitive ? searchText : searchText.toLowerCase();
              
              if (text.includes(search)) {
                results.push({
                  book: bookCode,
                  chapter: chapter.number,
                  verse: verse.number,
                  text: verse.text,
                  reference: verse.reference
                });
              }
            }
          }
        }
      } else {
        // Search in all available books (this could be expensive, so limit to first few books for demo)
        const books = await this.getAvailableBooks();
        const booksToSearch = books.slice(0, 5); // Limit to first 5 books for performance
        
        for (const book of booksToSearch) {
          try {
            const parsedBook = await this.loadBook(book.code);
            for (const chapter of parsedBook.chapters) {
              for (const verse of chapter.verses) {
                const text = caseSensitive ? verse.text : verse.text.toLowerCase();
                const search = caseSensitive ? searchText : searchText.toLowerCase();
                
                if (text.includes(search)) {
                  results.push({
                    book: book.code,
                    chapter: chapter.number,
                    verse: verse.number,
                    text: verse.text,
                    reference: verse.reference
                  });
                }
              }
            }
          } catch (error) {
            console.error(`Error searching in book ${book.code}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    
    return results;
  }
}

// Export singleton instance
export const bibleService = new BibleService();