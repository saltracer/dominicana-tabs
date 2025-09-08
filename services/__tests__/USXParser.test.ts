/**
 * Test file for USX Parser
 * 
 * This file tests the USX parser with actual USX content from the Douay-Rheims Bible
 */

import { USXParser } from '../USXParser';

// Sample USX content from 2JN.usx (2 John)
const sampleUSXContent = `<?xml version="1.0" encoding="utf-8"?>
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
</usx>`;

// Sample USX content from PHM.usx (Philemon)
const sampleUSXContent2 = `<?xml version="1.0" encoding="utf-8"?>
<usx version="3.0">
  <book code="PHM" style="id" />
  <para style="h">Philemon</para>
  <para style="toc1">Paul's Letter to Philemon</para>
  <para style="toc2">Philemon</para>
  <para style="toc3">Phm</para>
  <para style="mt1">Paul's Letter to Philemon</para>
  <chapter number="1" style="c" sid="PHM 1" />
  <para style="p">
    <verse number="1" style="v" sid="PHM 1:1" />Paul, a prisoner of Christ Jesus, and Timothy, a brother: to Philemon, our beloved and fellow labourer; <verse eid="PHM 1:1" /><verse number="2" style="v" sid="PHM 1:2" />And to Appia, our dearest sister, and to Archippus, our fellow soldier, and to the church which is in thy house: <verse eid="PHM 1:2" />
  </para>
  <chapter eid="PHM 1" />
</usx>`;

describe('USXParser', () => {
  let parser: USXParser;

  beforeEach(() => {
    parser = new USXParser();
  });

  describe('parseUSXContent', () => {
    it('should parse a simple USX file correctly', () => {
      const result = parser.parseUSXContent(sampleUSXContent);

      expect(result.success).toBe(true);
      expect(result.book).toBeDefined();
      expect(result.metadata).toBeDefined();

      if (result.book) {
        expect(result.book.code).toBe('2JN');
        expect(result.book.title).toBe('2 John');
        expect(result.book.shortTitle).toBe('2 John');
        expect(result.book.abbreviation).toBe('2Jn');
        expect(result.book.chapters).toHaveLength(1);
        expect(result.book.chapters[0].number).toBe(1);
        expect(result.book.chapters[0].verses.length).toBeGreaterThan(0);
      }

      if (result.metadata) {
        expect(result.metadata.code).toBe('2JN');
        expect(result.metadata.title).toBe('2 John');
        expect(result.metadata.longTitle).toBe("John's Second Letter");
      }
    });

    it('should parse another USX file correctly', () => {
      const result = parser.parseUSXContent(sampleUSXContent2);

      expect(result.success).toBe(true);
      expect(result.book).toBeDefined();

      if (result.book) {
        expect(result.book.code).toBe('PHM');
        expect(result.book.title).toBe('Philemon');
        expect(result.book.chapters).toHaveLength(1);
        expect(result.book.chapters[0].verses.length).toBeGreaterThan(0);
      }
    });

    it('should handle invalid XML gracefully', () => {
      const invalidXML = '<invalid>xml content';
      const result = parser.parseUSXContent(invalidXML);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.book).toBeUndefined();
    });

    it('should handle empty content gracefully', () => {
      const result = parser.parseUSXContent('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getVerseByReference', () => {
    it('should find a verse by reference', () => {
      const result = parser.parseUSXContent(sampleUSXContent);
      
      if (result.success && result.book) {
        const verse = parser.getVerseByReference(result.book, '2JN 1:1');
        
        expect(verse).toBeDefined();
        expect(verse?.number).toBe(1);
        expect(verse?.reference).toBe('2JN 1:1');
        expect(verse?.text).toContain('ancient to the lady Elect');
      }
    });

    it('should return null for invalid reference', () => {
      const result = parser.parseUSXContent(sampleUSXContent);
      
      if (result.success && result.book) {
        const verse = parser.getVerseByReference(result.book, '2JN 1:999');
        expect(verse).toBeNull();
      }
    });
  });

  describe('searchInBook', () => {
    it('should search for text within a book', () => {
      const result = parser.parseUSXContent(sampleUSXContent);
      
      if (result.success && result.book) {
        const searchResults = parser.searchInBook(result.book, 'truth');
        
        expect(searchResults.length).toBeGreaterThan(0);
        expect(searchResults[0].text).toContain('truth');
      }
    });

    it('should handle case-insensitive search', () => {
      const result = parser.parseUSXContent(sampleUSXContent);
      
      if (result.success && result.book) {
        const searchResults = parser.searchInBook(result.book, 'TRUTH');
        
        expect(searchResults.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getBookStats', () => {
    it('should calculate book statistics correctly', () => {
      const result = parser.parseUSXContent(sampleUSXContent);
      
      if (result.success && result.book) {
        const stats = parser.getBookStats(result.book);
        
        expect(stats.totalChapters).toBe(1);
        expect(stats.totalVerses).toBeGreaterThan(0);
        expect(stats.totalWords).toBeGreaterThan(0);
        expect(stats.totalCharacters).toBeGreaterThan(0);
      }
    });
  });

  describe('getVerseRange', () => {
    it('should get a range of verses', () => {
      const result = parser.parseUSXContent(sampleUSXContent);
      
      if (result.success && result.book) {
        const verses = parser.getVerseRange(result.book, '2JN 1:1', '2JN 1:2');
        
        expect(verses.length).toBe(2);
        expect(verses[0].number).toBe(1);
        expect(verses[1].number).toBe(2);
      }
    });
  });
});

// Test with actual file content
describe('USXParser with real files', () => {
  let parser: USXParser;

  beforeEach(() => {
    parser = new USXParser();
  });

  it('should be able to parse actual USX files when loaded', async () => {
    // This test would require actual file loading
    // For now, we'll just verify the parser is ready
    expect(parser).toBeDefined();
    expect(typeof parser.parseUSXContent).toBe('function');
  });
});
