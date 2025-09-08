/**
 * Example usage of the USX Parser
 * 
 * This file demonstrates how to use the USX parser with the bundled Bible files
 */

import { USXParser } from './USXParser';

// Example of how to load and parse a USX file
export async function loadAndParseUSXFile(bookCode: string): Promise<void> {
  const parser = new USXParser();
  
  try {
    // In a real application, you would load the file like this:
    // const usxContent = require(`../assets/bibles/douay-rheims/release/USX_1/${bookCode}.usx`);
    
    // For demonstration, we'll use a sample content
    const sampleContent = getSampleUSXContent(bookCode);
    
    if (sampleContent) {
      const result = parser.parseUSXContent(sampleContent);
      
      if (result.success && result.book) {
        console.log(`\n=== ${result.book.title} ===`);
        console.log(`Code: ${result.book.code}`);
        console.log(`Chapters: ${result.book.chapters.length}`);
        
        // Show first few verses
        const firstChapter = result.book.chapters[0];
        if (firstChapter && firstChapter.verses.length > 0) {
          console.log(`\nFirst few verses of Chapter ${firstChapter.number}:`);
          firstChapter.verses.slice(0, 3).forEach(verse => {
            console.log(`${verse.reference}: ${verse.text.substring(0, 100)}...`);
          });
        }
        
        // Get statistics
        const stats = parser.getBookStats(result.book);
        console.log(`\nStatistics:`);
        console.log(`- Total verses: ${stats.totalVerses}`);
        console.log(`- Total words: ${stats.totalWords}`);
        console.log(`- Total characters: ${stats.totalCharacters}`);
        
        // Search example
        const searchResults = parser.searchInBook(result.book, 'Lord');
        console.log(`\nFound ${searchResults.length} verses containing "Lord"`);
        
      } else {
        console.error('Failed to parse USX:', result.error);
      }
    } else {
      console.log(`No sample content available for ${bookCode}`);
    }
    
  } catch (error) {
    console.error('Error loading USX file:', error);
  }
}

// Sample USX content for demonstration
function getSampleUSXContent(bookCode: string): string | null {
  const samples: Record<string, string> = {
    '2JN': `<?xml version="1.0" encoding="utf-8"?>
<usx version="3.0">
  <book code="2JN" style="id" />
  <para style="h">2 John</para>
  <para style="toc1">John's Second Letter</para>
  <para style="toc2">2 John</para>
  <para style="toc3">2Jn</para>
  <para style="mt1">John's Second Letter</para>
  <chapter number="1" style="c" sid="2JN 1" />
  <para style="p">
    <verse number="1" style="v" sid="2JN 1:1" />The ancient to the lady Elect, and her children, whom I love in the truth, and not I only, but also all they that have known the truth, <verse eid="2JN 1:1" /><verse number="2" style="v" sid="2JN 1:2" />For the sake of the truth which dwelleth in us, and shall be with us for ever. <verse eid="2JN 1:2" /><verse number="3" style="v" sid="2JN 1:3" />Grace be with you, mercy, and peace from God the Father, and from Christ Jesus the Son of the Father; in truth and charity. <verse eid="2JN 1:3" />
  </para>
  <chapter eid="2JN 1" />
</usx>`,
    
    'PHM': `<?xml version="1.0" encoding="utf-8"?>
<usx version="3.0">
  <book code="PHM" style="id" />
  <para style="h">Philemon</para>
  <para style="toc1">Paul's Letter to Philemon</para>
  <para style="toc2">Philemon</para>
  <para style="toc3">Phm</para>
  <para style="mt1">Paul's Letter to Philemon</para>
  <chapter number="1" style="c" sid="PHM 1" />
  <para style="p">
    <verse number="1" style="v" sid="PHM 1:1" />Paul, a prisoner of Christ Jesus, and Timothy, a brother: to Philemon, our beloved and fellow labourer; <verse eid="PHM 1:1" /><verse number="2" style="v" sid="PHM 1:2" />And to Appia, our dearest sister, and to Archippus, our fellow soldier, and to the church which is in thy house: <verse eid="PHM 1:2" /><verse number="3" style="v" sid="PHM 1:3" />Grace to you and peace from God our Father, and from the Lord Jesus Christ. <verse eid="PHM 1:3" />
  </para>
  <chapter eid="PHM 1" />
</usx>`,
    
    'PSA': `<?xml version="1.0" encoding="utf-8"?>
<usx version="3.0">
  <book code="PSA" style="id" />
  <para style="h">Psalms</para>
  <para style="toc1">The Psalms</para>
  <para style="toc2">Psalms</para>
  <para style="toc3">Psa</para>
  <para style="mt1">The Psalms</para>
  <para style="cl">Psalm</para>
  <chapter number="1" style="c" sid="PSA 1" />
  <para style="q1">
    <verse number="1" style="v" sid="PSA 1:1" />Blessed is the man who hath not walked in the counsel of the ungodly, nor stood in the way of sinners, nor sat in the chair of pestilence.<verse eid="PSA 1:1" /></para>
  <para style="q1">
    <verse number="2" style="v" sid="PSA 1:2" />But his will is in the law of the Lord, and on his law he shall meditate day and night.<verse eid="PSA 1:2" /></para>
  <para style="q1">
    <verse number="3" style="v" sid="PSA 1:3" />And he shall be like a tree which is planted near the running waters, which shall bring forth its fruit, in due season. And his leaf shall not fall off: and all whatsoever he shall do shall prosper.<verse eid="PSA 1:3" /></para>
  <chapter eid="PSA 1" />
</usx>`
  };
  
  return samples[bookCode] || null;
}

// Example of how to use the parser in a React component or service
export class BibleService {
  private parser: USXParser;
  private loadedBooks: Map<string, any> = new Map();

  constructor() {
    this.parser = new USXParser({
      normalizeWhitespace: true,
      includeFormatting: false
    });
  }

  /**
   * Load a book from the bundled USX files
   */
  async loadBook(bookCode: string): Promise<any> {
    if (this.loadedBooks.has(bookCode)) {
      return this.loadedBooks.get(bookCode);
    }

    try {
      // In a real application, you would load the file like this:
      // const usxContent = require(`../assets/bibles/douay-rheims/release/USX_1/${bookCode}.usx`);
      
      // For demonstration, we'll use sample content
      const usxContent = getSampleUSXContent(bookCode);
      
      if (!usxContent) {
        throw new Error(`Book ${bookCode} not found`);
      }

      const result = this.parser.parseUSXContent(usxContent);
      
      if (result.success && result.book) {
        this.loadedBooks.set(bookCode, result.book);
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
  async getVerse(bookCode: string, chapter: number, verse: number): Promise<string | null> {
    const book = await this.loadBook(bookCode);
    const reference = `${bookCode} ${chapter}:${verse}`;
    const verseObj = this.parser.getVerseByReference(book, reference);
    return verseObj?.text || null;
  }

  /**
   * Search for text in a book
   */
  async searchInBook(bookCode: string, searchText: string): Promise<any[]> {
    const book = await this.loadBook(bookCode);
    return this.parser.searchInBook(book, searchText);
  }

  /**
   * Get book information
   */
  async getBookInfo(bookCode: string): Promise<any> {
    const book = await this.loadBook(bookCode);
    const stats = this.parser.getBookStats(book);
    
    return {
      code: book.code,
      title: book.title,
      shortTitle: book.shortTitle,
      abbreviation: book.abbreviation,
      stats
    };
  }
}

// Export a default instance
export const bibleService = new BibleService();
