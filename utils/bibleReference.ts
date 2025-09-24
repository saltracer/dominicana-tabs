/**
 * Bible Reference Utilities
 *
 * Provides parsing and normalization for Bible references like:
 * - "Genesis 1:1-2:7"
 * - "Gen 1:1-3"
 * - "Mat 5:3-9"
 * - "MAT 5:3"
 */

export interface ParsedBibleReference {
  bookCode: string;
  startChapter: number;
  startVerse: number;
  endChapter: number;
  endVerse: number;
  original: string;
}

/**
 * Normalizes a book key for matching in the map
 */
function normalizeBookKey(input: string): string {
  // Remove punctuation, periods, and extra spaces, uppercase everything
  return input
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

/**
 * Map of various book names/abbreviations to USX/USFX 3-letter book codes
 * Includes common English names and typical abbreviations.
 */
const BOOK_NAME_TO_CODE: Record<string, string> = (() => {
  const map: Record<string, string> = {};

  function add(code: string, names: string[]) {
    for (const name of names) {
      map[normalizeBookKey(name)] = code;
    }
  }

  // Old Testament
  add('GEN', ['GEN', 'GENESIS', 'GEN', 'GN']);
  add('EXO', ['EXO', 'EXODUS', 'EX', 'EXOD']);
  add('LEV', ['LEV', 'LEVITICUS', 'LE', 'LV']);
  add('NUM', ['NUM', 'NUMBERS', 'NU', 'NM']);
  add('DEU', ['DEU', 'DEUTERONOMY', 'DEUT', 'DT']);
  add('JOS', ['JOS', 'JOSHUA', 'JOSH']);
  add('JDG', ['JDG', 'JUDGES', 'JUDG', 'JGS']);
  add('RUT', ['RUT', 'RUTH']);
  add('1SA', ['1SA', '1 SAMUEL', '1 SAM', 'I SAMUEL', 'I SAM', '1SM', '1 SA']);
  add('2SA', ['2SA', '2 SAMUEL', '2 SAM', 'II SAMUEL', 'II SAM', '2SM', '2 SA']);
  add('1KI', ['1KI', '1 KINGS', '1 KGS', 'I KINGS', 'I KGS', '1 KNGS', '1 KI']);
  add('2KI', ['2KI', '2 KINGS', '2 KGS', 'II KINGS', 'II KGS', '2 KNGS', '2 KI']);
  add('1CH', ['1CH', '1 CHRONICLES', '1 CHR', 'I CHRONICLES', 'I CHR', '1 CH']);
  add('2CH', ['2CH', '2 CHRONICLES', '2 CHR', 'II CHRONICLES', 'II CHR', '2 CH']);
  add('EZR', ['EZR', 'EZRA']);
  add('NEH', ['NEH', 'NEHEMIAH']);
  add('TOB', ['TOB', 'TOBIT', 'TB']);
  add('JDT', ['JDT', 'JUDITH', 'JUDITH']);
  add('EST', ['EST', 'ESTHER', 'ESTH']);
  add('1MA', ['1MA', '1 MACCABEES', '1 MACC']);
  add('2MA', ['2MA', '2 MACCABEES', '2 MACC']);
  add('JOB', ['JOB']);
  add('PSA', ['PSA', 'PSALMS', 'PSALM', 'PS', 'PSS']);
  add('PRO', ['PRO', 'PROVERBS', 'PROV', 'PRV']);
  add('ECC', ['ECC', 'ECCLESIASTES', 'ECCL', 'QOH']);
  add('SNG', ['SNG', 'SONG OF SONGS', 'SONG', 'CANTICLE OF CANTICLES', 'CANTICLES', 'CANT']);
  add('WIS', ['WIS', 'WISDOM']);
  add('SIR', ['SIR', 'SIRACH', 'ECCLESIASTICUS']);
  add('ISA', ['ISA', 'ISAIAH']);
  add('JER', ['JER', 'JEREMIAH']);
  add('LAM', ['LAM', 'LAMENTATIONS']);
  add('BAR_LjeInBar', ['BAR', 'BARUCH']);
  add('EZK', ['EZK', 'EZEKIEL', 'EZEK']);
  add('DAN', ['DAN', 'DANIEL']);
  add('HOS', ['HOS', 'HOSEA']);
  add('JOL', ['JOL', 'JOEL']);
  add('AMO', ['AMO', 'AMOS']);
  add('OBA', ['OBA', 'OBADIAH', 'OBAD']);
  add('JON', ['JON', 'JONAH']);
  add('MIC', ['MIC', 'MICAH']);
  add('NAM', ['NAM', 'NAHUM', 'NAH']);
  add('HAB', ['HAB', 'HABAKKUK']);
  add('ZEP', ['ZEP', 'ZEPHANIAH', 'ZEPH']);
  add('HAG', ['HAG', 'HAGGAI']);
  add('ZEC', ['ZEC', 'ZECHARIAH', 'ZECH']);
  add('MAL', ['MAL', 'MALACHI']);

  // New Testament
  add('MAT', ['MAT', 'MATTHEW', 'MATT', 'MT']);
  add('MRK', ['MRK', 'MARK', 'MK']);
  add('LUK', ['LUK', 'LUKE', 'LK']);
  add('JHN', ['JHN', 'JOHN', 'JN']);
  add('ACT', ['ACT', 'ACTS', 'ACTS OF THE APOSTLES']);
  add('ROM', ['ROM', 'ROMANS', 'RM']);
  add('1CO', ['1CO', '1 CORINTHIANS', '1 COR', 'I CORINTHIANS', 'I COR']);
  add('2CO', ['2CO', '2 CORINTHIANS', '2 COR', 'II CORINTHIANS', 'II COR']);
  add('GAL', ['GAL', 'GALATIANS']);
  add('EPH', ['EPH', 'EPHESIANS']);
  add('PHP', ['PHP', 'PHILIPPIANS', 'PHIL']);
  add('COL', ['COL', 'COLOSSIANS']);
  add('1TH', ['1TH', '1 THESSALONIANS', '1 THESS', 'I THESSALONIANS', 'I THESS']);
  add('2TH', ['2TH', '2 THESSALONIANS', '2 THESS', 'II THESSALONIANS', 'II THESS']);
  add('1TI', ['1TI', '1 TIMOTHY', '1 TIM', 'I TIMOTHY', 'I TIM']);
  add('2TI', ['2TI', '2 TIMOTHY', '2 TIM', 'II TIMOTHY', 'II TIM']);
  add('TIT', ['TIT', 'TITUS']);
  add('PHM', ['PHM', 'PHILEMON', 'PHLM']);
  add('HEB', ['HEB', 'HEBREWS']);
  add('JAS', ['JAS', 'JAMES', 'JAS']);
  add('1PE', ['1PE', '1 PETER', '1 PET', 'I PETER', 'I PET']);
  add('2PE', ['2PE', '2 PETER', '2 PET', 'II PETER', 'II PET']);
  add('1JN', ['1JN', '1 JOHN', '1 JN', 'I JOHN', 'I JN']);
  add('2JN', ['2JN', '2 JOHN', '2 JN', 'II JOHN', 'II JN']);
  add('3JN', ['3JN', '3 JOHN', '3 JN', 'III JOHN', 'III JN']);
  add('JUD', ['JUD', 'JUDE']);
  add('REV', ['REV', 'REVELATION', 'APOCALYPSE', 'RV']);

  return map;
})();

/**
 * Resolve a book code (e.g., GEN) from a name or code string.
 */
export function resolveBookCode(book: string): string | null {
  const key = normalizeBookKey(book);
  if (BOOK_NAME_TO_CODE[key]) return BOOK_NAME_TO_CODE[key];
  // If already a valid 3-letter code present in mapping values, allow it
  const maybeCode = key;
  if (BOOK_NAME_TO_CODE[maybeCode]) return BOOK_NAME_TO_CODE[maybeCode];
  // Try removing spaces (e.g., "1SAMUEL")
  const noSpace = key.replace(/\s+/g, '');
  if (BOOK_NAME_TO_CODE[noSpace]) return BOOK_NAME_TO_CODE[noSpace];
  return null;
}

/**
 * Parse a Bible reference string into structured parts.
 * Supports intra-chapter and cross-chapter ranges.
 */
export function parseBibleReference(input: string): ParsedBibleReference | null {
  if (!input || typeof input !== 'string') return null;
  const ref = input.replace(/\u2013|\u2014/g, '-') // normalize en dash/em dash
                   .replace(/\s+/g, ' ')
                   .trim();

  // Cross-chapter: Book 1:2-3:4
  let m = ref.match(/^(.*?)\s+(\d+):(\d+)\s*-\s*(?:(\d+):)?(\d+)$/);
  if (m) {
    const [, bookName, sc, sv, ecMaybe, ev] = m;
    const bookCode = resolveBookCode(bookName);
    if (!bookCode) return null;
    const startChapter = parseInt(sc, 10);
    const startVerse = parseInt(sv, 10);
    const endChapter = ecMaybe ? parseInt(ecMaybe, 10) : startChapter;
    const endVerse = parseInt(ev, 10);
    return { bookCode, startChapter, startVerse, endChapter, endVerse, original: ref };
  }

  // Intra-chapter range: Book 1:2-10
  m = ref.match(/^(.*?)\s+(\d+):(\d+)\s*-\s*(\d+)$/);
  if (m) {
    const [, bookName, sc, sv, ev] = m;
    const bookCode = resolveBookCode(bookName);
    if (!bookCode) return null;
    const startChapter = parseInt(sc, 10);
    const startVerse = parseInt(sv, 10);
    const endVerse = parseInt(ev, 10);
    return { bookCode, startChapter, startVerse, endChapter: startChapter, endVerse, original: ref };
  }

  // Single verse: Book 1:2
  m = ref.match(/^(.*?)\s+(\d+):(\d+)$/);
  if (m) {
    const [, bookName, sc, sv] = m;
    const bookCode = resolveBookCode(bookName);
    if (!bookCode) return null;
    const startChapter = parseInt(sc, 10);
    const startVerse = parseInt(sv, 10);
    return { bookCode, startChapter, startVerse, endChapter: startChapter, endVerse: startVerse, original: ref };
  }

  return null;
}

/**
 * Format a normalized reference string using a book code.
 */
export function formatNormalizedReference(parsed: ParsedBibleReference): string {
  const { bookCode, startChapter, startVerse, endChapter, endVerse } = parsed;
  if (startChapter === endChapter && startVerse === endVerse) {
    return `${bookCode} ${startChapter}:${startVerse}`;
  }
  if (startChapter === endChapter) {
    return `${bookCode} ${startChapter}:${startVerse}-${endVerse}`;
  }
  return `${bookCode} ${startChapter}:${startVerse}-${endChapter}:${endVerse}`;
}

