import { BibleService } from '../services/BibleService';

// Mock the USXParser and other dependencies
jest.mock('../services/USXParser');
jest.mock('expo-asset');
jest.mock('expo-file-system');

describe('BibleService Complex References', () => {
  let bibleService: BibleService;

  beforeEach(() => {
    bibleService = new BibleService();
    
    // Mock the loadBook method to return a mock book
    jest.spyOn(bibleService, 'loadBook').mockImplementation(async (bookCode: string) => {
      return {
        chapters: [
          {
            number: 3,
            verses: [
              { number: 17, text: 'And whatsoever ye do in word or deed, do all in the name of the Lord Jesus, giving thanks to God and the Father by him.', reference: 'COL 3:17' },
              { number: 18, text: 'Wives, submit yourselves unto your own husbands, as it is fit in the Lord.', reference: 'COL 3:18' },
              { number: 19, text: 'Husbands, love your wives, and be not bitter against them.', reference: 'COL 3:19' },
              { number: 20, text: 'Children, obey your parents in all things: for this is well pleasing unto the Lord.', reference: 'COL 3:20' },
              { number: 21, text: 'Fathers, provoke not your children to anger, lest they be discouraged.', reference: 'COL 3:21' },
              { number: 22, text: 'Servants, obey in all things your masters according to the flesh; not with eyeservice, as menpleasers; but in singleness of heart, fearing God:', reference: 'COL 3:22' },
              { number: 23, text: 'And whatsoever ye do, do it heartily, as to the Lord, and not unto men;', reference: 'COL 3:23' },
              { number: 24, text: 'Knowing that of the Lord ye shall receive the reward of the inheritance: for ye serve the Lord Christ.', reference: 'COL 3:24' },
              { number: 25, text: 'But he that doeth wrong shall receive for the wrong which he hath done: and there is no respect of persons.', reference: 'COL 3:25' }
            ]
          }
        ]
      };
    });

    // Mock the fallbackCollectRange method
    jest.spyOn(bibleService as any, 'fallbackCollectRange').mockImplementation((book: any, sc: number, sv: number, ec: number, ev: number) => {
      const results: any[] = [];
      for (const chapter of book.chapters) {
        if (chapter.number < sc || chapter.number > ec) continue;
        for (const verse of chapter.verses) {
          if (chapter.number === sc && verse.number < sv) continue;
          if (chapter.number === ec && verse.number > ev) continue;
          results.push(verse);
        }
      }
      return results;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle complex reference with single verse and range', async () => {
    const result = await bibleService.getPassageByReference('Col 3:17, 23-24');
    
    expect(result).not.toBeNull();
    expect(result?.bookCode).toBe('COL');
    expect(result?.verses).toHaveLength(3);
    expect(result?.verses[0].number).toBe(17);
    expect(result?.verses[0].text).toContain('whatsoever ye do in word or deed');
    expect(result?.verses[1].number).toBe(23);
    expect(result?.verses[1].text).toContain('whatsoever ye do, do it heartily');
    expect(result?.verses[2].number).toBe(24);
    expect(result?.verses[2].text).toContain('Knowing that of the Lord');
    expect(result?.reference).toBe('Col 3:17, 23-24');
  });

  it('should handle complex reference with multiple single verses', async () => {
    const result = await bibleService.getPassageByReference('Col 3:17, 23, 25');
    
    expect(result).not.toBeNull();
    expect(result?.bookCode).toBe('COL');
    expect(result?.verses).toHaveLength(3);
    expect(result?.verses[0].number).toBe(17);
    expect(result?.verses[1].number).toBe(23);
    expect(result?.verses[2].number).toBe(25);
  });

  it('should handle complex reference with multiple ranges', async () => {
    const result = await bibleService.getPassageByReference('Col 3:17-18, 23-24');
    
    expect(result).not.toBeNull();
    expect(result?.bookCode).toBe('COL');
    expect(result?.verses).toHaveLength(4);
    expect(result?.verses[0].number).toBe(17);
    expect(result?.verses[1].number).toBe(18);
    expect(result?.verses[2].number).toBe(23);
    expect(result?.verses[3].number).toBe(24);
  });

  it('should fall back to simple parsing for non-complex references', async () => {
    const result = await bibleService.getPassageByReference('Col 3:17-24');
    
    expect(result).not.toBeNull();
    expect(result?.bookCode).toBe('COL');
    expect(result?.verses).toHaveLength(8);
    expect(result?.reference).toBe('COL 3:17-24');
  });

  it('should return null for invalid complex references', async () => {
    const result = await bibleService.getPassageByReference('Invalid 3:17, 23');
    
    expect(result).toBeNull();
  });
});
