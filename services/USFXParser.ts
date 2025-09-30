/**
 * USFX (Unified Scripture Format XML) Parser Service
 * 
 * This service parses USFX files using fast-xml-parser and provides
 * structured access to biblical text content. USFX format is similar to USX
 * but uses different XML structure and element naming.
 */

import { XMLParser } from 'fast-xml-parser';
import {
  USXDocument,
  ParsedBook,
  ParsedChapter,
  ParsedVerse,
  BookMetadata,
  USXParserOptions,
  USXParseResult,
} from '../types/usx-types';

// USFX-specific types
export interface USFXDocument {
  usfx: {
    languageCode: string;
    book: USFXBook;
  };
}

export interface USFXBook {
  '@_id': string;
  id?: USFXBookId;
  h?: string; // Heading
  toc?: USFXToc | USFXToc[];
  p?: USFXPara | USFXPara[];
  c?: USFXChapter | USFXChapter[];
}

export interface USFXBookId {
  '@_id': string;
}

export interface USFXToc {
  '@_level': string;
  '#text': string;
}

export interface USFXChapter {
  '@_id': string;
}

export interface USFXPara {
  '@_sfm'?: string;
  '@_style'?: string;
  '#text'?: string;
  v?: USFXVerse | USFXVerse[];
  ve?: any; // Verse end marker
  f?: USFXFootnote | USFXFootnote[];
}

export interface USFXVerse {
  '@_id': string;
  '@_bcv': string; // Book.Chapter.Verse reference
  '#text': string;
  f?: USFXFootnote | USFXFootnote[];
}

export interface USFXFootnote {
  '@_caller'?: string;
  fr?: USFXFootnoteRef | USFXFootnoteRef[];
  fk?: USFXFootnoteKeyword | USFXFootnoteKeyword[];
  ft?: USFXFootnoteText | USFXFootnoteText[];
}

export interface USFXFootnoteRef {
  '#text': string;
}

export interface USFXFootnoteKeyword {
  '#text': string;
}

export interface USFXFootnoteText {
  '#text': string;
}

export class USFXParser {
  private parser: XMLParser;
  private options: USXParserOptions;

  constructor(options: USXParserOptions = {}) {
    this.options = {
      includeFootnotes: false,
      includeCrossReferences: false,
      includeFormatting: true,
      normalizeWhitespace: true,
      preserveLineBreaks: false,
      ...options
    };

    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: this.options.normalizeWhitespace,
      removeNSPrefix: true,
      processEntities: true,
      htmlEntities: true
    });
  }

  /**
   * Parse a USFX file from raw XML content
   */
  parseUSFXContent(usfxContent: string): USXParseResult {
    try {
      const parsedXML = this.parser.parse(usfxContent) as USFXDocument;
      return this.processUSFXDocument(parsedXML, usfxContent);
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse USFX content: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process the parsed USFX document into a structured format
   */
  private processUSFXDocument(doc: USFXDocument, originalContent: string): USXParseResult {
    try {
      const book = doc.usfx.book;
      const metadata = this.extractBookMetadata(doc);
      const chapters = this.extractChapters(doc, originalContent);

      const parsedBook: ParsedBook = {
        code: book['@_id'],
        title: metadata.title,
        shortTitle: metadata.shortTitle,
        abbreviation: metadata.abbreviation,
        chapters
      };

      return {
        success: true,
        book: parsedBook,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to process USFX document: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Extract book metadata from USFX headers
   */
  private extractBookMetadata(doc: USFXDocument): BookMetadata {
    const book = doc.usfx.book;
    
    let title = '';
    let shortTitle = '';
    let abbreviation = '';
    let longTitle = '';
    let category = '';

    // Extract from heading
    if (book.h) {
      title = book.h.trim();
      shortTitle = title;
      abbreviation = book['@_id'];
    }

    // Extract from table of contents
    if (book.toc) {
      const tocArray = Array.isArray(book.toc) ? book.toc : [book.toc];
      
      for (const toc of tocArray) {
        if (toc['@_level'] === '1') {
          longTitle = toc['#text']?.trim() || '';
        } else if (toc['@_level'] === '2') {
          shortTitle = toc['#text']?.trim() || title;
        }
      }
    }

    // Extract from paragraphs
    if (book.p) {
      const paraArray = Array.isArray(book.p) ? book.p : [book.p];
      
      for (const para of paraArray) {
        if (para['@_style'] === 'mt1' && para['#text']) {
          if (!title) title = para['#text'].trim();
        }
      }
    }

    // Fallback values if not found
    if (!title) title = book['@_id'];
    if (!shortTitle) shortTitle = title;
    if (!abbreviation) abbreviation = book['@_id'];

    return {
      code: book['@_id'],
      title,
      shortTitle,
      abbreviation,
      longTitle: longTitle || title,
      category
    };
  }

  /**
   * Extract chapters and verses from the USFX document
   */
  private extractChapters(doc: USFXDocument, originalContent: string): ParsedChapter[] {
    const chapters: ParsedChapter[] = [];
    const bookCode = doc.usfx.book['@_id'];
    
    // Parse the original XML content directly to get proper chapter structure
    const chapterMatches = originalContent.match(/<c[^>]*id="(\d+)"[^>]*>/g);
    
    if (!chapterMatches) {
      console.log('No chapter markers found in USFX content');
      return chapters;
    }

    console.log(`Found ${chapterMatches.length} chapter markers in ${bookCode}`);

    // Extract each chapter by finding its content between chapter markers
    for (let i = 0; i < chapterMatches.length; i++) {
      const chapterMatch = chapterMatches[i];
      const chapterNumber = parseInt(chapterMatch.match(/id="(\d+)"/)?.[1] || '0', 10);
      
      if (chapterNumber === 0) continue;

      // Find the start and end of this chapter's content
      const chapterStartPattern = `<c[^>]*id="${chapterNumber}"[^>]*>`;
      const chapterEndPattern = i < chapterMatches.length - 1 
        ? `<c[^>]*id="${chapterNumber + 1}"[^>]*>`
        : '</usfx>';

      const startMatch = originalContent.search(new RegExp(chapterStartPattern));
      const endMatch = originalContent.search(new RegExp(chapterEndPattern));

      if (startMatch === -1 || endMatch === -1) {
        console.log(`Could not find boundaries for chapter ${chapterNumber}`);
        continue;
      }

      const chapterContent = originalContent.substring(startMatch, endMatch);
      
      // Extract verses from this chapter's content
      const verses = this.extractVersesFromChapterContent(chapterContent, bookCode, chapterNumber);
      
      if (verses.length > 0) {
        chapters.push({
          number: chapterNumber,
          verses
        });
        //console.log(`Chapter ${chapterNumber}: ${verses.length} verses`);
      }
    }

    return chapters.sort((a, b) => a.number - b.number);
  }

  /**
   * Extract verses from chapter content using regex patterns
   */
  private extractVersesFromChapterContent(chapterContent: string, bookCode: string, chapterNumber: number): ParsedVerse[] {
    const verses: ParsedVerse[] = [];
    
    // Find all verse markers in this chapter
    // USFX format: <v id="1" bcv="GEN.1.1" />text content<ve />
    // The actual structure is: <v id="1" bcv="GEN.1.1" />text with footnotes<ve />
    const versePattern = /<v[^>]*id="(\d+)"[^>]*bcv="[^"]*"[^>]*\/>(.*?)<ve[^>]*\/>/gs;
    let match;
    
    while ((match = versePattern.exec(chapterContent)) !== null) {
      const verseNumber = parseInt(match[1], 10);
      let verseText = match[2];
      
      // Extract the actual verse text by removing footnotes and other XML
      verseText = this.extractVerseTextFromOriginalXML(verseText, bookCode, chapterNumber, verseNumber);
      
      if (verseText && verseText.trim()) {
        verses.push({
          number: verseNumber,
          text: verseText.trim(),
          reference: `${bookCode} ${chapterNumber}:${verseNumber}`
        });
      }
    }
    
    return verses.sort((a, b) => a.number - b.number);
  }

  /**
   * Extract clean verse text from USFX format, removing footnotes and XML tags
   */
  private extractVerseTextFromOriginalXML(verseContent: string, bookCode: string, chapterNumber: number, verseNumber: number): string {
    if (!verseContent) return '';

    let text = verseContent;
    
    // Remove footnote tags and their content
    // USFX footnotes: <f caller="+"><fr>...</fr><fk>...</fk><ft>...</ft></f>
    text = text.replace(/<f[^>]*>.*?<\/f>/gs, '');
    
    // Remove any remaining XML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  /**
   * Clean and normalize verse text
   */
  private cleanVerseText(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove footnote markers and content
    if (!this.options.includeFootnotes) {
      cleaned = cleaned.replace(/<f[^>]*>.*?<\/f>/gs, '');
    }

    // Remove other XML tags
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // Normalize whitespace
    if (this.options.normalizeWhitespace) {
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
    }

    // Handle line breaks
    if (!this.options.preserveLineBreaks) {
      cleaned = cleaned.replace(/\n/g, ' ');
    }

    return cleaned;
  }

  /**
   * Get a specific verse by reference
   */
  getVerseByReference(book: ParsedBook, reference: string): ParsedVerse | null {
    const match = reference.match(/^(\w+)\s+(\d+):(\d+)$/);
    if (!match) return null;

    const [, bookCode, chapterNum, verseNum] = match;
    if (bookCode !== book.code) return null;

    const chapter = book.chapters.find(c => c.number === parseInt(chapterNum, 10));
    if (!chapter) return null;

    return chapter.verses.find(v => v.number === parseInt(verseNum, 10)) || null;
  }

  /**
   * Get a range of verses
   */
  getVerseRange(book: ParsedBook, startRef: string, endRef: string): ParsedVerse[] {
    const startVerse = this.getVerseByReference(book, startRef);
    const endVerse = this.getVerseByReference(book, endRef);
    
    if (!startVerse || !endVerse) return [];

    const verses: ParsedVerse[] = [];
    const startChapter = book.chapters.find(c => c.verses.some(v => v.reference === startRef));
    const endChapter = book.chapters.find(c => c.verses.some(v => v.reference === endRef));

    if (!startChapter || !endChapter) return [];

    // Handle single chapter range
    if (startChapter === endChapter) {
      return startChapter.verses.filter(v => 
        v.number >= startVerse.number && v.number <= endVerse.number
      );
    }

    // Handle multi-chapter range
    const startChapterIndex = book.chapters.indexOf(startChapter);
    const endChapterIndex = book.chapters.indexOf(endChapter);

    for (let i = startChapterIndex; i <= endChapterIndex; i++) {
      const chapter = book.chapters[i];
      
      if (i === startChapterIndex) {
        // First chapter: from start verse to end
        verses.push(...chapter.verses.filter(v => v.number >= startVerse.number));
      } else if (i === endChapterIndex) {
        // Last chapter: from beginning to end verse
        verses.push(...chapter.verses.filter(v => v.number <= endVerse.number));
      } else {
        // Middle chapters: all verses
        verses.push(...chapter.verses);
      }
    }

    return verses;
  }

  /**
   * Search for text within a book
   */
  searchInBook(book: ParsedBook, searchText: string, caseSensitive: boolean = false): ParsedVerse[] {
    const results: ParsedVerse[] = [];
    const search = caseSensitive ? searchText : searchText.toLowerCase();

    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        const text = caseSensitive ? verse.text : verse.text.toLowerCase();
        if (text.includes(search)) {
          results.push(verse);
        }
      }
    }

    return results;
  }

  /**
   * Get book statistics
   */
  getBookStats(book: ParsedBook): {
    totalChapters: number;
    totalVerses: number;
    totalWords: number;
    totalCharacters: number;
  } {
    let totalVerses = 0;
    let totalWords = 0;
    let totalCharacters = 0;

    for (const chapter of book.chapters) {
      totalVerses += chapter.verses.length;
      
      for (const verse of chapter.verses) {
        totalWords += verse.text.split(/\s+/).length;
        totalCharacters += verse.text.length;
      }
    }

    return {
      totalChapters: book.chapters.length,
      totalVerses,
      totalWords,
      totalCharacters
    };
  }
}

// Export a default instance
export const usfxParser = new USFXParser();
