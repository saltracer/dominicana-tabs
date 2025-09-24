import { parseBibleReference, resolveBookCode, formatNormalizedReference } from '../../utils/bibleReference';

describe('bibleReference utils', () => {
  it('resolves common book names and abbreviations', () => {
    expect(resolveBookCode('Genesis')).toBe('GEN');
    expect(resolveBookCode('Gen')).toBe('GEN');
    expect(resolveBookCode('Gn')).toBe('GEN');
    expect(resolveBookCode('Mat')).toBe('MAT');
    expect(resolveBookCode('Mt')).toBe('MAT');
    expect(resolveBookCode('1 Samuel')).toBe('1SA');
  });

  it('parses single verse references', () => {
    const p = parseBibleReference('Genesis 1:1');
    expect(p).not.toBeNull();
    expect(p!.bookCode).toBe('GEN');
    expect(p!.startChapter).toBe(1);
    expect(p!.startVerse).toBe(1);
    expect(p!.endChapter).toBe(1);
    expect(p!.endVerse).toBe(1);
    expect(formatNormalizedReference(p!)).toBe('GEN 1:1');
  });

  it('parses intra-chapter ranges', () => {
    const p = parseBibleReference('Mat 5:3-9');
    expect(p).not.toBeNull();
    expect(p!.bookCode).toBe('MAT');
    expect(p!.startChapter).toBe(5);
    expect(p!.startVerse).toBe(3);
    expect(p!.endChapter).toBe(5);
    expect(p!.endVerse).toBe(9);
    expect(formatNormalizedReference(p!)).toBe('MAT 5:3-9');
  });

  it('parses cross-chapter ranges', () => {
    const p = parseBibleReference('Genesis 1:1-2:7');
    expect(p).not.toBeNull();
    expect(p!.bookCode).toBe('GEN');
    expect(p!.startChapter).toBe(1);
    expect(p!.startVerse).toBe(1);
    expect(p!.endChapter).toBe(2);
    expect(p!.endVerse).toBe(7);
    expect(formatNormalizedReference(p!)).toBe('GEN 1:1-2:7');
  });

  it('returns null for invalid inputs', () => {
    expect(parseBibleReference('NotABook 1:1')).toBeNull();
    expect(parseBibleReference('Genesis')).toBeNull();
    expect(parseBibleReference('Genesis1:1')).toBeNull();
    expect(parseBibleReference('')).toBeNull();
  });

  it('supports common NT abbreviations', () => {
    const jn = parseBibleReference('Jn 3:16');
    expect(jn).not.toBeNull();
    expect(jn!.bookCode).toBe('JHN');
    expect(formatNormalizedReference(jn!)).toBe('JHN 3:16');

    const mt = parseBibleReference('Mt 5:3-9');
    expect(mt).not.toBeNull();
    expect(mt!.bookCode).toBe('MAT');
    expect(formatNormalizedReference(mt!)).toBe('MAT 5:3-9');
  });

  it('returns a parsed object even if range order is reversed (logical invalid)', () => {
    const p = parseBibleReference('Gen 1:5-1:2');
    expect(p).not.toBeNull();
    expect(p!.bookCode).toBe('GEN');
    expect(p!.startChapter).toBe(1);
    expect(p!.startVerse).toBe(5);
    expect(p!.endChapter).toBe(1);
    expect(p!.endVerse).toBe(2);
  });
});

