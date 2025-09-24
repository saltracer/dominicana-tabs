import { MultiVersionBibleService } from '../MultiVersionBibleService';
import type { ParsedBook } from '../../types/usx-types';

function makeBook(code: string, chapters: Array<{ number: number; verses: Array<[number, string]> }>): ParsedBook {
  return {
    code,
    title: code,
    shortTitle: code,
    abbreviation: code,
    chapters: chapters.map(ch => ({
      number: ch.number,
      verses: ch.verses.map(v => ({ number: v[0], text: v[1], reference: `${code} ${ch.number}:${v[0]}` }))
    }))
  } as unknown as ParsedBook;
}

describe('MultiVersionBibleService getPassageByReference', () => {
  it('returns OT range (GEN 1:1-2) using mocked loadBook', async () => {
    const svc = new MultiVersionBibleService();
    jest.spyOn(svc as any, 'loadBook').mockImplementation(async (_code: string) => {
      return makeBook('GEN', [
        { number: 1, verses: [ [1, 'In the beginning'], [2, 'The earth was without form'] ] }
      ]);
    });

    const res = await svc.getPassageByReference('Genesis 1:1-2');
    expect(res).not.toBeNull();
    expect(res!.bookCode).toBe('GEN');
    expect(res!.verses.map(v => v.reference)).toEqual(['GEN 1:1', 'GEN 1:2']);
  });

  it('returns NT single verse (Jn 1:1) using mocked loadBook', async () => {
    const svc = new MultiVersionBibleService();
    jest.spyOn(svc as any, 'loadBook').mockImplementation(async (code: string) => {
      if (code === 'JHN') {
        return makeBook('JHN', [ { number: 1, verses: [ [1, 'In the beginning was the Word'] ] } ]);
      }
      return makeBook(code, []);
    });

    const res = await svc.getPassageByReference('Jn 1:1');
    expect(res).not.toBeNull();
    expect(res!.bookCode).toBe('JHN');
    expect(res!.verses[0].reference).toBe('JHN 1:1');
  });

  it('returns null for invalid book reference', async () => {
    const svc = new MultiVersionBibleService();
    const res = await svc.getPassageByReference('NotABook 1:1');
    expect(res).toBeNull();
  });

  it('returns empty verses for out-of-range verse numbers on mocked data', async () => {
    const svc = new MultiVersionBibleService();
    jest.spyOn(svc as any, 'loadBook').mockResolvedValue(makeBook('GEN', [ { number: 1, verses: [ [1, 'a'] ] } ]));
    const res = await svc.getPassageByReference('Gen 1:2-10');
    expect(res).not.toBeNull();
    expect(res!.verses.length).toBe(0);
  });
});

