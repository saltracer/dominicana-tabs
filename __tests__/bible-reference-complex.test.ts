import { parseBibleReferenceWithRanges } from '../utils/bibleReference';

describe('Complex Bible Reference Parsing', () => {
  describe('parseBibleReferenceWithRanges', () => {
    it('should parse simple comma-separated verses', () => {
      const result = parseBibleReferenceWithRanges('Col 3:17, 23');
      
      expect(result).not.toBeNull();
      expect(result?.bookCode).toBe('COL');
      expect(result?.ranges).toHaveLength(2);
      expect(result?.ranges[0]).toEqual({
        startChapter: 3,
        startVerse: 17,
        endChapter: 3,
        endVerse: 17
      });
      expect(result?.ranges[1]).toEqual({
        startChapter: 3,
        startVerse: 23,
        endChapter: 3,
        endVerse: 23
      });
      expect(result?.original).toBe('Col 3:17, 23');
    });

    it('should parse mixed single verses and ranges', () => {
      const result = parseBibleReferenceWithRanges('Col 3:17, 23-24');
      
      expect(result).not.toBeNull();
      expect(result?.bookCode).toBe('COL');
      expect(result?.ranges).toHaveLength(2);
      expect(result?.ranges[0]).toEqual({
        startChapter: 3,
        startVerse: 17,
        endChapter: 3,
        endVerse: 17
      });
      expect(result?.ranges[1]).toEqual({
        startChapter: 3,
        startVerse: 23,
        endChapter: 3,
        endVerse: 24
      });
      expect(result?.original).toBe('Col 3:17, 23-24');
    });

    it('should parse multiple ranges', () => {
      const result = parseBibleReferenceWithRanges('Col 3:17-18, 23-24');
      
      expect(result).not.toBeNull();
      expect(result?.bookCode).toBe('COL');
      expect(result?.ranges).toHaveLength(2);
      expect(result?.ranges[0]).toEqual({
        startChapter: 3,
        startVerse: 17,
        endChapter: 3,
        endVerse: 18
      });
      expect(result?.ranges[1]).toEqual({
        startChapter: 3,
        startVerse: 23,
        endChapter: 3,
        endVerse: 24
      });
    });

    it('should parse three or more verse references', () => {
      const result = parseBibleReferenceWithRanges('Col 3:17, 23, 25-26');
      
      expect(result).not.toBeNull();
      expect(result?.bookCode).toBe('COL');
      expect(result?.ranges).toHaveLength(3);
      expect(result?.ranges[0]).toEqual({
        startChapter: 3,
        startVerse: 17,
        endChapter: 3,
        endVerse: 17
      });
      expect(result?.ranges[1]).toEqual({
        startChapter: 3,
        startVerse: 23,
        endChapter: 3,
        endVerse: 23
      });
      expect(result?.ranges[2]).toEqual({
        startChapter: 3,
        startVerse: 25,
        endChapter: 3,
        endVerse: 26
      });
    });

    it('should handle different book names', () => {
      const result = parseBibleReferenceWithRanges('Romans 8:28, 31-32');
      
      expect(result).not.toBeNull();
      expect(result?.bookCode).toBe('ROM');
      expect(result?.ranges).toHaveLength(2);
    });

    it('should return null for non-complex references', () => {
      const result = parseBibleReferenceWithRanges('Col 3:17');
      expect(result).toBeNull();
    });

    it('should return null for invalid references', () => {
      const result = parseBibleReferenceWithRanges('Invalid 3:17, 23');
      expect(result).toBeNull();
    });

    it('should handle extra spaces', () => {
      const result = parseBibleReferenceWithRanges('Col  3:17 , 23-24 ');
      
      expect(result).not.toBeNull();
      expect(result?.bookCode).toBe('COL');
      expect(result?.ranges).toHaveLength(2);
    });
  });
});
