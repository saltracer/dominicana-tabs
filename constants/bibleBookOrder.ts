/**
 * Canonical Bible Book Order
 * Catholic Bible with Deuterocanonical books integrated into Old Testament
 */

export interface BibleBookInfo {
  code: string;
  abbreviation: string;
  chapters: number;
  order: number;
  testament: 'old-testament' | 'new-testament';
  isDeuterocanonical?: boolean;
}

// Old Testament - 46 books (includes 7 Deuterocanonical books in canonical positions)
export const OLD_TESTAMENT_BOOKS: BibleBookInfo[] = [
  // Pentateuch
  { code: 'GEN', abbreviation: 'GEN', chapters: 50, order: 1, testament: 'old-testament' },
  { code: 'EXO', abbreviation: 'EXO', chapters: 40, order: 2, testament: 'old-testament' },
  { code: 'LEV', abbreviation: 'LEV', chapters: 27, order: 3, testament: 'old-testament' },
  { code: 'NUM', abbreviation: 'NUM', chapters: 36, order: 4, testament: 'old-testament' },
  { code: 'DEU', abbreviation: 'DEU', chapters: 34, order: 5, testament: 'old-testament' },
  
  // Historical Books
  { code: 'JOS', abbreviation: 'JOS', chapters: 24, order: 6, testament: 'old-testament' },
  { code: 'JDG', abbreviation: 'JDG', chapters: 21, order: 7, testament: 'old-testament' },
  { code: 'RUT', abbreviation: 'RUT', chapters: 4, order: 8, testament: 'old-testament' },
  { code: '1SA', abbreviation: '1SA', chapters: 31, order: 9, testament: 'old-testament' },
  { code: '2SA', abbreviation: '2SA', chapters: 24, order: 10, testament: 'old-testament' },
  { code: '1KI', abbreviation: '1KI', chapters: 22, order: 11, testament: 'old-testament' },
  { code: '2KI', abbreviation: '2KI', chapters: 25, order: 12, testament: 'old-testament' },
  { code: '1CH', abbreviation: '1CH', chapters: 29, order: 13, testament: 'old-testament' },
  { code: '2CH', abbreviation: '2CH', chapters: 36, order: 14, testament: 'old-testament' },
  { code: 'EZR', abbreviation: 'EZR', chapters: 10, order: 15, testament: 'old-testament' },
  { code: 'NEH', abbreviation: 'NEH', chapters: 13, order: 16, testament: 'old-testament' },
  { code: 'TOB', abbreviation: 'TOB', chapters: 14, order: 17, testament: 'old-testament', isDeuterocanonical: true },
  { code: 'JDT', abbreviation: 'JDT', chapters: 16, order: 18, testament: 'old-testament', isDeuterocanonical: true },
  { code: 'EST', abbreviation: 'EST', chapters: 10, order: 19, testament: 'old-testament' },
  { code: '1MA', abbreviation: '1MA', chapters: 16, order: 20, testament: 'old-testament', isDeuterocanonical: true },
  { code: '2MA', abbreviation: '2MA', chapters: 15, order: 21, testament: 'old-testament', isDeuterocanonical: true },
  
  // Wisdom Books
  { code: 'JOB', abbreviation: 'JOB', chapters: 42, order: 22, testament: 'old-testament' },
  { code: 'PSA', abbreviation: 'PSA', chapters: 150, order: 23, testament: 'old-testament' },
  { code: 'PRO', abbreviation: 'PRO', chapters: 31, order: 24, testament: 'old-testament' },
  { code: 'ECC', abbreviation: 'ECC', chapters: 12, order: 25, testament: 'old-testament' },
  { code: 'SNG', abbreviation: 'SNG', chapters: 8, order: 26, testament: 'old-testament' },
  { code: 'WIS', abbreviation: 'WIS', chapters: 19, order: 27, testament: 'old-testament', isDeuterocanonical: true },
  { code: 'SIR', abbreviation: 'SIR', chapters: 51, order: 28, testament: 'old-testament', isDeuterocanonical: true },
  
  // Major Prophets
  { code: 'ISA', abbreviation: 'ISA', chapters: 66, order: 29, testament: 'old-testament' },
  { code: 'JER', abbreviation: 'JER', chapters: 52, order: 30, testament: 'old-testament' },
  { code: 'LAM', abbreviation: 'LAM', chapters: 5, order: 31, testament: 'old-testament' },
  { code: 'BAR', abbreviation: 'BAR', chapters: 6, order: 32, testament: 'old-testament', isDeuterocanonical: true },
  { code: 'EZK', abbreviation: 'EZK', chapters: 48, order: 33, testament: 'old-testament' },
  { code: 'DAN', abbreviation: 'DAN', chapters: 12, order: 34, testament: 'old-testament' },
  
  // Minor Prophets
  { code: 'HOS', abbreviation: 'HOS', chapters: 14, order: 35, testament: 'old-testament' },
  { code: 'JOL', abbreviation: 'JOL', chapters: 3, order: 36, testament: 'old-testament' },
  { code: 'AMO', abbreviation: 'AMO', chapters: 9, order: 37, testament: 'old-testament' },
  { code: 'OBA', abbreviation: 'OBA', chapters: 1, order: 38, testament: 'old-testament' },
  { code: 'JON', abbreviation: 'JON', chapters: 4, order: 39, testament: 'old-testament' },
  { code: 'MIC', abbreviation: 'MIC', chapters: 7, order: 40, testament: 'old-testament' },
  { code: 'NAM', abbreviation: 'NAM', chapters: 3, order: 41, testament: 'old-testament' },
  { code: 'HAB', abbreviation: 'HAB', chapters: 3, order: 42, testament: 'old-testament' },
  { code: 'ZEP', abbreviation: 'ZEP', chapters: 3, order: 43, testament: 'old-testament' },
  { code: 'HAG', abbreviation: 'HAG', chapters: 2, order: 44, testament: 'old-testament' },
  { code: 'ZEC', abbreviation: 'ZEC', chapters: 14, order: 45, testament: 'old-testament' },
  { code: 'MAL', abbreviation: 'MAL', chapters: 4, order: 46, testament: 'old-testament' },
];

// New Testament - 27 books
export const NEW_TESTAMENT_BOOKS: BibleBookInfo[] = [
  // Gospels
  { code: 'MAT', abbreviation: 'MAT', chapters: 28, order: 47, testament: 'new-testament' },
  { code: 'MRK', abbreviation: 'MRK', chapters: 16, order: 48, testament: 'new-testament' },
  { code: 'LUK', abbreviation: 'LUK', chapters: 24, order: 49, testament: 'new-testament' },
  { code: 'JHN', abbreviation: 'JHN', chapters: 21, order: 50, testament: 'new-testament' },
  
  // Acts
  { code: 'ACT', abbreviation: 'ACT', chapters: 28, order: 51, testament: 'new-testament' },
  
  // Pauline Epistles
  { code: 'ROM', abbreviation: 'ROM', chapters: 16, order: 52, testament: 'new-testament' },
  { code: '1CO', abbreviation: '1CO', chapters: 16, order: 53, testament: 'new-testament' },
  { code: '2CO', abbreviation: '2CO', chapters: 13, order: 54, testament: 'new-testament' },
  { code: 'GAL', abbreviation: 'GAL', chapters: 6, order: 55, testament: 'new-testament' },
  { code: 'EPH', abbreviation: 'EPH', chapters: 6, order: 56, testament: 'new-testament' },
  { code: 'PHP', abbreviation: 'PHP', chapters: 4, order: 57, testament: 'new-testament' },
  { code: 'COL', abbreviation: 'COL', chapters: 4, order: 58, testament: 'new-testament' },
  { code: '1TH', abbreviation: '1TH', chapters: 5, order: 59, testament: 'new-testament' },
  { code: '2TH', abbreviation: '2TH', chapters: 3, order: 60, testament: 'new-testament' },
  { code: '1TI', abbreviation: '1TI', chapters: 6, order: 61, testament: 'new-testament' },
  { code: '2TI', abbreviation: '2TI', chapters: 4, order: 62, testament: 'new-testament' },
  { code: 'TIT', abbreviation: 'TIT', chapters: 3, order: 63, testament: 'new-testament' },
  { code: 'PHM', abbreviation: 'PHM', chapters: 1, order: 64, testament: 'new-testament' },
  
  // Hebrews
  { code: 'HEB', abbreviation: 'HEB', chapters: 13, order: 65, testament: 'new-testament' },
  
  // Catholic Epistles
  { code: 'JAS', abbreviation: 'JAS', chapters: 5, order: 66, testament: 'new-testament' },
  { code: '1PE', abbreviation: '1PE', chapters: 5, order: 67, testament: 'new-testament' },
  { code: '2PE', abbreviation: '2PE', chapters: 3, order: 68, testament: 'new-testament' },
  { code: '1JN', abbreviation: '1JN', chapters: 5, order: 69, testament: 'new-testament' },
  { code: '2JN', abbreviation: '2JN', chapters: 1, order: 70, testament: 'new-testament' },
  { code: '3JN', abbreviation: '3JN', chapters: 1, order: 71, testament: 'new-testament' },
  { code: 'JUD', abbreviation: 'JUD', chapters: 1, order: 72, testament: 'new-testament' },
  
  // Revelation
  { code: 'REV', abbreviation: 'REV', chapters: 22, order: 73, testament: 'new-testament' },
];

export const ALL_BOOKS = [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS];

// Helper function to get book info by code
export function getBookInfo(code: string): BibleBookInfo | undefined {
  return ALL_BOOKS.find(book => book.code === code);
}

// Helper function to get testament color
export function getTestamentColor(testament: 'old-testament' | 'new-testament'): string {
  return testament === 'old-testament' ? '#8B7355' : '#1976D2';
}

