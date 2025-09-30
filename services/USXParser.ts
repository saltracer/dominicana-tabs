/**
 * USX (Unified Scripture XML) Parser Service
 * 
 * This service parses USX files using fast-xml-parser and provides
 * structured access to biblical text content.
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
  USXPara,
  USXVerse,
  USXChapter,
  USXBook
} from '../types/usx-types';

export class USXParser {
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
   * Parse a USX file from raw XML content
   */
  parseUSXContent(usxContent: string): USXParseResult {
    try {
      const parsedXML = this.parser.parse(usxContent) as USXDocument;
      return this.processUSXDocument(parsedXML, usxContent);
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse USX content: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Process the parsed USX document into a structured format
   */
  private processUSXDocument(doc: USXDocument, originalContent: string): USXParseResult {
    try {
      const book = doc.usx.book;
      const metadata = this.extractBookMetadata(doc);
      const chapters = this.extractChapters(doc, originalContent);

      const parsedBook: ParsedBook = {
        code: book['@_code'],
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
        error: `Failed to process USX document: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Extract book metadata from USX headers
   */
  private extractBookMetadata(doc: USXDocument): BookMetadata {
    const book = doc.usx.book;
    const paras = Array.isArray(doc.usx.para) ? doc.usx.para : [doc.usx.para].filter(Boolean);

    let title = '';
    let shortTitle = '';
    let abbreviation = '';
    let longTitle = '';
    let category = '';

    // Extract metadata from para elements
    for (const para of paras) {
      if (!para || !para['@_style']) continue;

      switch (para['@_style']) {
        case 'h':
          title = para['#text'] || '';
          break;
        case 'toc1':
          longTitle = para['#text'] || '';
          break;
        case 'toc2':
          shortTitle = para['#text'] || '';
          break;
        case 'toc3':
          abbreviation = para['#text'] || '';
          break;
        case 'mt1':
          if (!title) title = para['#text'] || '';
          break;
        case 'cl':
          category = para['#text'] || '';
          break;
      }
    }

    // Fallback values if not found
    if (!title) title = book['@_code'];
    if (!shortTitle) shortTitle = title;
    if (!abbreviation) abbreviation = book['@_code'];

    return {
      code: book['@_code'],
      title,
      shortTitle,
      abbreviation,
      longTitle: longTitle || title,
      category
    };
  }

  /**
   * Extract chapters and verses from the USX document
   */
  private extractChapters(doc: USXDocument, originalContent: string): ParsedChapter[] {
    const chapters: ParsedChapter[] = [];
    const bookCode = doc.usx.book['@_code'];
    
    // Parse the original XML content directly to get proper chapter structure
    // This is more reliable than relying on the flattened XML parser output
    const chapterMatches = originalContent.match(/<chapter[^>]*number="(\d+)"[^>]*>/g);
    
    if (!chapterMatches) {
      console.log('No chapter markers found in USX content');
      return chapters;
    }

    console.log(`Found ${chapterMatches.length} chapter markers in ${bookCode}`);

    // Extract each chapter by finding its content between chapter markers
    for (let i = 0; i < chapterMatches.length; i++) {
      const chapterMatch = chapterMatches[i];
      const chapterNumber = parseInt(chapterMatch.match(/number="(\d+)"/)?.[1] || '0', 10);
      
      if (chapterNumber === 0) continue;

      // Find the start and end of this chapter's content
      const chapterStartPattern = `<chapter[^>]*number="${chapterNumber}"[^>]*>`;
      const chapterEndPattern = i < chapterMatches.length - 1 
        ? `<chapter[^>]*number="${chapterNumber + 1}"[^>]*>`
        : '</usx>';

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
    const versePattern = /<verse[^>]*number="(\d+)"[^>]*>([^<]*)<verse[^>]*eid="[^"]*"[^>]*>/g;
    let match;
    
    while ((match = versePattern.exec(chapterContent)) !== null) {
      const verseNumber = parseInt(match[1], 10);
      const verseText = match[2].trim();
      
      if (verseText) {
        verses.push({
          number: verseNumber,
          text: verseText,
          reference: `${bookCode} ${chapterNumber}:${verseNumber}`
        });
      }
    }
    
    return verses.sort((a, b) => a.number - b.number);
  }

  /**
   * Extract verses from elements (paragraphs and other content)
   */
  private extractVersesFromElements(elements: any[], bookCode: string, chapterNumber: number, originalContent: string): ParsedVerse[] {
    const verses: ParsedVerse[] = [];

    for (const element of elements) {
      if (!element || !element['@_style']) continue;

      // Skip non-content elements
      if (['h', 'toc1', 'toc2', 'toc3', 'mt1', 'mt2', 'mt3', 'cl', 'c'].includes(element['@_style'])) {
        continue;
      }

      // Extract verses from element
      const elementVerses = this.extractVersesFromPara(element, bookCode, chapterNumber, originalContent);
      verses.push(...elementVerses);
    }

    return verses.sort((a, b) => a.number - b.number);
  }

  /**
   * Extract verses from a single paragraph element
   */
  private extractVersesFromPara(para: any, bookCode: string, chapterNumber: number, originalContent: string): ParsedVerse[] {
    const verses: ParsedVerse[] = [];

    // Handle paragraphs with verse markers
    if (para.verse) {
      const verseArray = Array.isArray(para.verse) ? para.verse : [para.verse];
      
      // Find all verse start markers (those with @_number)
      const verseStarts = verseArray.filter(v => v['@_number'] && v['@_style'] === 'v');
      
      // Sort by verse number
      verseStarts.sort((a, b) => parseInt(a['@_number'], 10) - parseInt(b['@_number'], 10));
      
      // Extract verses from original XML content
      for (const verseStart of verseStarts) {
        const verseNumber = parseInt(verseStart['@_number'], 10);
        const verseText = this.extractVerseTextFromOriginalXML(originalContent, bookCode, chapterNumber, verseNumber);
        
        verses.push({
          number: verseNumber,
          text: this.cleanVerseText(verseText),
          reference: `${bookCode} ${chapterNumber}:${verseNumber}`
        });
      }
    }

    return verses;
  }

  /**
   * Extract verse text from original XML content
   */
  private extractVerseTextFromOriginalXML(originalContent: string, bookCode: string, chapterNumber: number, verseNumber: number): string {
    // Look for the verse pattern in the original XML
    const versePattern = new RegExp(
      `<verse[^>]*number="${verseNumber}"[^>]*>([^<]*)<verse[^>]*eid="${bookCode} ${chapterNumber}:${verseNumber}"[^>]*>`,
      'g'
    );
    
    const match = versePattern.exec(originalContent);
    if (match && match[1]) {
      return match[1].trim();
    }
    
    // Fallback: try a more flexible pattern
    const flexiblePattern = new RegExp(
      `<verse[^>]*number="${verseNumber}"[^>]*>([^<]*?)<verse[^>]*eid="[^"]*${verseNumber}"[^>]*>`,
      'g'
    );
    
    const flexibleMatch = flexiblePattern.exec(originalContent);
    if (flexibleMatch && flexibleMatch[1]) {
      return flexibleMatch[1].trim();
    }
    
    return '';
  }

  /**
   * Clean and normalize verse text
   */
  private cleanVerseText(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove XML tags
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
export const usxParser = new USXParser();
