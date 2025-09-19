/**
 * USFX Parser Test Service
 * 
 * This service tests the USFX parser against the Vulgate Bible files
 * to ensure proper parsing and functionality.
 */

import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import { USFXParser } from './USFXParser';

export class USFXTestService {
  private parser: USFXParser;

  constructor() {
    this.parser = new USFXParser({
      normalizeWhitespace: true,
      includeFormatting: false,
      preserveLineBreaks: false,
      includeFootnotes: false
    });
  }

  /**
   * Test loading and parsing a single USFX file
   */
  async testSingleBook(bookCode: string): Promise<{
    success: boolean;
    error?: string;
    book?: any;
    stats?: any;
  }> {
    try {
      console.log(`Testing USFX parsing for book: ${bookCode}`);
      
      // Load the USFX file content
      const usfxContent = await this.loadUSFXFile(bookCode);
      console.log(`USFX content loaded for ${bookCode}, length:`, usfxContent.length);
      
      // Parse the content
      const result = this.parser.parseUSFXContent(usfxContent);
      console.log(`Parse result for ${bookCode}:`, result.success ? 'SUCCESS' : 'FAILED', result.error);
      
      if (result.success && result.book) {
        console.log(`Book ${bookCode} parsed successfully, chapters:`, result.book.chapters.length);
        
        // Get book statistics
        const stats = this.parser.getBookStats(result.book);
        console.log(`Book ${bookCode} stats:`, stats);
        
        // Test verse retrieval
        const firstChapter = result.book.chapters[0];
        if (firstChapter && firstChapter.verses.length > 0) {
          const firstVerse = firstChapter.verses[0];
          console.log(`First verse in ${bookCode}:`, firstVerse);
          
          // Test verse by reference
          const verseByRef = this.parser.getVerseByReference(result.book, firstVerse.reference);
          console.log(`Verse by reference test:`, verseByRef ? 'SUCCESS' : 'FAILED');
        }
        
        // Test search functionality
        const searchResults = this.parser.searchInBook(result.book, 'Deus', false);
        console.log(`Search for 'Deus' in ${bookCode}: ${searchResults.length} results`);
        
        return {
          success: true,
          book: result.book,
          stats
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to parse book'
        };
      }
    } catch (error) {
      console.error(`Error testing book ${bookCode}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test multiple books from the Vulgate
   */
  async testMultipleBooks(): Promise<{
    totalBooks: number;
    successfulBooks: number;
    failedBooks: string[];
    results: any[];
  }> {
    const testBooks = ['GEN', 'PSA', 'MAT', 'JHN']; // Test a few key books
    const results: any[] = [];
    const failedBooks: string[] = [];
    let successfulBooks = 0;

    console.log('Starting USFX parser test for multiple books...');

    for (const bookCode of testBooks) {
      const result = await this.testSingleBook(bookCode);
      results.push({ bookCode, ...result });
      
      if (result.success) {
        successfulBooks++;
      } else {
        failedBooks.push(bookCode);
      }
    }

    console.log(`USFX Test Results: ${successfulBooks}/${testBooks.length} books parsed successfully`);
    if (failedBooks.length > 0) {
      console.log('Failed books:', failedBooks);
    }

    return {
      totalBooks: testBooks.length,
      successfulBooks,
      failedBooks,
      results
    };
  }

  /**
   * Load a USFX file from the bundled assets
   */
  private async loadUSFXFile(bookCode: string): Promise<string> {
    try {
      console.log(`Loading USFX file for book: ${bookCode}`);
      
      // For now, we'll load the entire Vulgate file and extract the specific book
      // In a real implementation, you'd want individual book files
      const asset = Asset.fromModule(require('../assets/bibles/vulgate/latVUC_usfx.xml'));
      await asset.downloadAsync();
      
      if (asset.localUri) {
        const file = new File(asset.localUri);
        const fileContents = await file.text();
        console.log(`Vulgate file loaded, length:`, fileContents.length);
        
        // Extract the specific book from the large file
        return this.extractBookFromVulgate(fileContents, bookCode);
      } else {
        throw new Error(`Local URI not available for Vulgate USFX file`);
      }
    } catch (error) {
      console.error(`Error reading Vulgate USFX file:`, error);
      throw new Error(`Failed to load Vulgate USFX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract a specific book from the large Vulgate USFX file
   */
  private extractBookFromVulgate(vulgateContent: string, bookCode: string): string {
    // Find the start of the book
    const bookStartPattern = `<book id="${bookCode}">`;
    const bookStartIndex = vulgateContent.indexOf(bookStartPattern);
    
    if (bookStartIndex === -1) {
      throw new Error(`Book ${bookCode} not found in Vulgate file`);
    }

    // Find the end of the book (next book or end of file)
    const nextBookPattern = /<book id="[^"]+">/g;
    nextBookPattern.lastIndex = bookStartIndex + bookStartPattern.length;
    const nextBookMatch = nextBookPattern.exec(vulgateContent);
    
    const bookEndIndex = nextBookMatch ? nextBookMatch.index : vulgateContent.length;
    
    // Extract the book content and wrap it in a proper USFX structure
    const bookContent = vulgateContent.substring(bookStartIndex, bookEndIndex);
    
    // Create a proper USFX document structure
    const usfxDocument = `<?xml version="1.0" encoding="utf-8"?>
<usfx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://eBible.org/usfx.xsd">
<languageCode>lat</languageCode>
${bookContent}
</usfx>`;

    console.log(`Extracted book ${bookCode}, length:`, usfxDocument.length);
    return usfxDocument;
  }

  /**
   * Run comprehensive tests
   */
  async runComprehensiveTest(): Promise<void> {
    console.log('=== USFX Parser Comprehensive Test ===');
    
    try {
      // Test single book
      console.log('\n--- Testing Genesis ---');
      const genesisResult = await this.testSingleBook('GEN');
      console.log('Genesis test result:', genesisResult.success ? 'PASSED' : 'FAILED');
      
      if (genesisResult.success && genesisResult.book) {
        console.log('Genesis metadata:', {
          code: genesisResult.book.code,
          title: genesisResult.book.title,
          shortTitle: genesisResult.book.shortTitle,
          chapters: genesisResult.book.chapters.length
        });
        
        console.log('Genesis stats:', genesisResult.stats);
        
        // Show first few verses
        const firstChapter = genesisResult.book.chapters[0];
        if (firstChapter && firstChapter.verses.length > 0) {
          console.log('First 3 verses of Genesis 1:');
          firstChapter.verses.slice(0, 3).forEach(verse => {
            console.log(`  ${verse.reference}: ${verse.text.substring(0, 100)}...`);
          });
        }
      }
      
      // Test multiple books
      console.log('\n--- Testing Multiple Books ---');
      const multiResult = await this.testMultipleBooks();
      console.log('Multiple books test result:', multiResult);
      
      console.log('\n=== USFX Parser Test Complete ===');
      
    } catch (error) {
      console.error('Comprehensive test failed:', error);
    }
  }
}

// Export a default instance
export const usfxTestService = new USFXTestService();

// Convenience function for testing
export async function testUSFXParser(): Promise<void> {
  await usfxTestService.runComprehensiveTest();
}
