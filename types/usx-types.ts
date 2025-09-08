/**
 * TypeScript types for USX (Unified Scripture XML) format
 * Based on analysis of Douay-Rheims Bible USX files
 */

// Base USX element with attributes
export interface USXElement {
  '@_style'?: string;
  '@_number'?: string;
  '@_sid'?: string;
  '@_eid'?: string;
  '@_code'?: string;
  '@_version'?: string;
  '#text'?: string;
}

// Book identification element
export interface USXBook extends USXElement {
  '@_code': string; // Book code (e.g., 'GEN', 'MAT', 'PSA')
  '@_style': 'id';
}

// Chapter element
export interface USXChapter extends USXElement {
  '@_number': string;
  '@_style': 'c';
  '@_sid': string; // Chapter start ID (e.g., 'GEN 1')
  '@_eid'?: string; // Chapter end ID (e.g., 'GEN 1')
}

// Verse element
export interface USXVerse extends USXElement {
  '@_number': string;
  '@_style': 'v';
  '@_sid': string; // Verse start ID (e.g., 'GEN 1:1')
  '@_eid'?: string; // Verse end ID (e.g., 'GEN 1:1')
  '#text': string; // Verse text content
}

// Paragraph element (contains verses and other content)
export interface USXPara extends USXElement {
  '@_style': string; // Style type (e.g., 'p', 'q1', 'q2', 'h', 'mt1', 'toc1', etc.)
  '#text'?: string; // Paragraph text content
  verse?: USXVerse | USXVerse[]; // Nested verses
}

// Main USX document structure
export interface USXDocument {
  usx: {
    '@_version': string;
    book: USXBook;
    para?: USXPara | USXPara[];
    chapter?: USXChapter | USXChapter[];
  };
}

// Parsed book structure for easier access
export interface ParsedBook {
  code: string;
  title: string;
  shortTitle: string;
  abbreviation: string;
  chapters: ParsedChapter[];
}

// Parsed chapter structure
export interface ParsedChapter {
  number: number;
  verses: ParsedVerse[];
}

// Parsed verse structure
export interface ParsedVerse {
  number: number;
  text: string;
  reference: string; // e.g., "GEN 1:1"
}

// Book metadata from USX headers
export interface BookMetadata {
  code: string;
  title: string;
  shortTitle: string;
  abbreviation: string;
  longTitle?: string;
  category?: string; // e.g., 'Psalm' for Psalms
}

// USX style types found in the files
export type USXStyleType = 
  | 'id'      // Book identification
  | 'h'       // Heading
  | 'toc1'    // Table of contents level 1
  | 'toc2'    // Table of contents level 2
  | 'toc3'    // Table of contents level 3
  | 'mt1'     // Main title level 1
  | 'mt2'     // Main title level 2
  | 'mt3'     // Main title level 3
  | 'cl'      // Category label
  | 'c'       // Chapter
  | 'v'       // Verse
  | 'p'       // Paragraph
  | 'q1'      // Poetry level 1
  | 'q2'      // Poetry level 2
  | 'q3'      // Poetry level 3
  | 'q4'      // Poetry level 4
  | 'b'       // Blank line
  | 'nb'      // No break
  | 'm'       // Margin
  | 'mi'      // Margin inline
  | 'li1'     // List item level 1
  | 'li2'     // List item level 2
  | 'li3'     // List item level 3
  | 'li4'     // List item level 4
  | 'pc'      // Poetry center
  | 'pi1'     // Poetry indent level 1
  | 'pi2'     // Poetry indent level 2
  | 'pi3'     // Poetry indent level 3
  | 'pi4'     // Poetry indent level 4
  | 'pm'      // Poetry margin
  | 'pmc'     // Poetry margin center
  | 'pmo'     // Poetry margin outside
  | 'pmr'     // Poetry margin right
  | 'pr'      // Poetry right
  | 'cls'     // Closure
  | 'pmo'     // Poetry margin outside
  | 'pmr'     // Poetry margin right
  | 'pr'      // Poetry right
  | 'cls'     // Closure
  | 'tr'      // Table row
  | 'th1'     // Table header level 1
  | 'th2'     // Table header level 2
  | 'th3'     // Table header level 3
  | 'th4'     // Table header level 4
  | 'th5'     // Table header level 5
  | 'thr1'    // Table header row level 1
  | 'thr2'    // Table header row level 2
  | 'thr3'    // Table header row level 3
  | 'thr4'    // Table header row level 4
  | 'thr5'    // Table header row level 5
  | 'tc1'     // Table cell level 1
  | 'tc2'     // Table cell level 2
  | 'tc3'     // Table cell level 3
  | 'tc4'     // Table cell level 4
  | 'tc5'     // Table cell level 5
  | 'tcr1'    // Table cell row level 1
  | 'tcr2'    // Table cell row level 2
  | 'tcr3'    // Table cell row level 3
  | 'tcr4'    // Table cell row level 4
  | 'tcr5'    // Table cell row level 5
  | 'k'       // Keyword
  | 'add'     // Addition
  | 'bk'      // Book name
  | 'bd'      // Bold
  | 'it'      // Italic
  | 'nd'      // Name of deity
  | 'pn'      // Proper name
  | 'pnx'     // Proper name (extended)
  | 'qt'      // Quote
  | 'sig'     // Signature
  | 'sls'     // Selah
  | 'tl'      // Transliterated
  | 'wj'      // Words of Jesus
  | 'ca'      // Caption
  | 'cl'      // Closure
  | 'cp'      // Chapter
  | 'fr'      // Footnote reference
  | 'f'       // Footnote
  | 'fe'      // Footnote end
  | 'fk'      // Footnote keyword
  | 'fl'      // Footnote label
  | 'fm'      // Footnote marker
  | 'fp'      // Footnote paragraph
  | 'fq'      // Footnote quotation
  | 'fqa'     // Footnote quotation alternative
  | 'fqb'     // Footnote quotation break
  | 'fqc'     // Footnote quotation center
  | 'fqd'     // Footnote quotation double indent
  | 'fqi'     // Footnote quotation indent
  | 'fqj'     // Footnote quotation justify
  | 'fqk'     // Footnote quotation keep
  | 'fql'     // Footnote quotation left
  | 'fqm'     // Footnote quotation margin
  | 'fqn'     // Footnote quotation no indent
  | 'fqo'     // Footnote quotation outside
  | 'fqp'     // Footnote quotation paragraph
  | 'fqr'     // Footnote quotation right
  | 'fqs'     // Footnote quotation single indent
  | 'fqt'     // Footnote quotation triple indent
  | 'fqu'     // Footnote quotation unindent
  | 'fqv'     // Footnote quotation verse
  | 'fqw'     // Footnote quotation wrap
  | 'fqx'     // Footnote quotation extended
  | 'fqy'     // Footnote quotation extended
  | 'fqz'     // Footnote quotation extended
  | 'ft'      // Footnote text
  | 'fv'      // Footnote verse
  | 'fqa'     // Footnote quotation alternative
  | 'fqb'     // Footnote quotation break
  | 'fqc'     // Footnote quotation center
  | 'fqd'     // Footnote quotation double indent
  | 'fqi'     // Footnote quotation indent
  | 'fqj'     // Footnote quotation justify
  | 'fqk'     // Footnote quotation keep
  | 'fql'     // Footnote quotation left
  | 'fqm'     // Footnote quotation margin
  | 'fqn'     // Footnote quotation no indent
  | 'fqo'     // Footnote quotation outside
  | 'fqp'     // Footnote quotation paragraph
  | 'fqr'     // Footnote quotation right
  | 'fqs'     // Footnote quotation single indent
  | 'fqt'     // Footnote quotation triple indent
  | 'fqu'     // Footnote quotation unindent
  | 'fqv'     // Footnote quotation verse
  | 'fqw'     // Footnote quotation wrap
  | 'fqx'     // Footnote quotation extended
  | 'fqy'     // Footnote quotation extended
  | 'fqz'     // Footnote quotation extended
  | 'ft'      // Footnote text
  | 'fv'      // Footnote verse
  | 'x'       // Cross reference
  | 'xo'      // Cross reference origin
  | 'xt'      // Cross reference target
  | 'xq'      // Cross reference quotation
  | 'xot'     // Cross reference origin target
  | 'xnt'     // Cross reference note target
  | 'xop'     // Cross reference origin paragraph
  | 'xnp'     // Cross reference note paragraph
  | 'xr'      // Cross reference range
  | 'xrq'     // Cross reference range quotation
  | 'xrqt'    // Cross reference range quotation target
  | 'xrqo'    // Cross reference range quotation origin
  | 'xrqn'    // Cross reference range quotation note
  | 'xrqp'    // Cross reference range quotation paragraph
  | 'xrqr'    // Cross reference range quotation range
  | 'xrqs'    // Cross reference range quotation single
  | 'xrqt'    // Cross reference range quotation triple
  | 'xrqu'    // Cross reference range quotation unindent
  | 'xrqv'    // Cross reference range quotation verse
  | 'xrqw'    // Cross reference range quotation wrap
  | 'xrqx'    // Cross reference range quotation extended
  | 'xrqy'    // Cross reference range quotation extended
  | 'xrqz'    // Cross reference range quotation extended
  | 'xrt'     // Cross reference range target
  | 'xro'     // Cross reference range origin
  | 'xrn'     // Cross reference range note
  | 'xrp'     // Cross reference range paragraph
  | 'xrr'     // Cross reference range range
  | 'xrs'     // Cross reference range single
  | 'xrt'     // Cross reference range triple
  | 'xru'     // Cross reference range unindent
  | 'xrv'     // Cross reference range verse
  | 'xrw'     // Cross reference range wrap
  | 'xrx'     // Cross reference range extended
  | 'xry'     // Cross reference range extended
  | 'xrz'     // Cross reference range extended
  | 'xt'      // Cross reference target
  | 'xo'      // Cross reference origin
  | 'xq'      // Cross reference quotation
  | 'xot'     // Cross reference origin target
  | 'xnt'     // Cross reference note target
  | 'xop'     // Cross reference origin paragraph
  | 'xnp'     // Cross reference note paragraph
  | 'xr'      // Cross reference range
  | 'xrq'     // Cross reference range quotation
  | 'xrqt'    // Cross reference range quotation target
  | 'xrqo'    // Cross reference range quotation origin
  | 'xrqn'    // Cross reference range quotation note
  | 'xrqp'    // Cross reference range quotation paragraph
  | 'xrqr'    // Cross reference range quotation range
  | 'xrqs'    // Cross reference range quotation single
  | 'xrqt'    // Cross reference range quotation triple
  | 'xrqu'    // Cross reference range quotation unindent
  | 'xrqv'    // Cross reference range quotation verse
  | 'xrqw'    // Cross reference range quotation wrap
  | 'xrqx'    // Cross reference range quotation extended
  | 'xrqy'    // Cross reference range quotation extended
  | 'xrqz'    // Cross reference range quotation extended
  | 'xrt'     // Cross reference range target
  | 'xro'     // Cross reference range origin
  | 'xrn'     // Cross reference range note
  | 'xrp'     // Cross reference range paragraph
  | 'xrr'     // Cross reference range range
  | 'xrs'     // Cross reference range single
  | 'xrt'     // Cross reference range triple
  | 'xru'     // Cross reference range unindent
  | 'xrv'     // Cross reference range verse
  | 'xrw'     // Cross reference range wrap
  | 'xrx'     // Cross reference range extended
  | 'xry'     // Cross reference range extended
  | 'xrz';    // Cross reference range extended

// Parser configuration options
export interface USXParserOptions {
  includeFootnotes?: boolean;
  includeCrossReferences?: boolean;
  includeFormatting?: boolean;
  normalizeWhitespace?: boolean;
  preserveLineBreaks?: boolean;
}

// Parser result
export interface USXParseResult {
  success: boolean;
  book?: ParsedBook;
  error?: string;
  metadata?: BookMetadata;
}
