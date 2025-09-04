
export type LanguageCode = 'en' | 'la' | 'fr' | 'es' | 'de' | 'it';
export type AudioType = 'spoken' | 'chant' | 'organ';
export type ChantNotation = 'modern' | 'gregorian' | 'solesmes';
export type BibleTranslation = 'NRSV' | 'NAB' | 'RSV' | 'DRA' | 'VULGATE';

/**
 * Represents content in multiple languages, where each language maps to an array of paragraphs.
 * Each paragraph is an array of strings, where each string represents a line of text.
 * Empty strings can be used to create additional vertical space between lines within a paragraph.
 */
export interface MultiLanguageContent {
  [key: string]: string[][];
}

export interface AudioResource {
  id: string;
  type: AudioType;
  url: string;
  duration?: number;
  description?: string;
}

export interface ChantResource {
  id: string;
  notation: ChantNotation;
  gregobase_id: string | number | null;
  data: string; // Could be GABC, MEI, or other notation format
  description?: string;
}

export interface MultiLanguageChantResource {
  [key: string]: ChantResource;
}

export interface ScriptureReference {
  book: string;
  chapter: number;
  verse: string;
  translation: BibleTranslation;
  content: MultiLanguageContent;
}

export interface LiturgyComponent {
  id: string;
  type: 'psalm' | 'hymn' | 'examen' | 'reading' | 'prayer' | 'responsory' | 'canticle' | 'antiphon' | 'introduction' | 'conclusion';
  title?: MultiLanguageContent;
  content: MultiLanguageContent;
  rubric?: MultiLanguageContent;
  antiphon?: {
    before?: MultiLanguageContent;
    after?: MultiLanguageContent;
  };
  scriptureRef?: ScriptureReference;
  audio?: AudioResource[];
  chant?: MultiLanguageChantResource;
  metadata?: {
    composer?: string;
    century?: string;
    feast?: string;
    season?: string[];
  };
}

export interface LiturgyTemplate {
  id: string;
  type: 'compline' | 'lauds' | 'vespers' | 'terce' | 'sext' | 'none' | 'office-readings';
  dayOfWeek?: number;
  title: MultiLanguageContent;
  season?: string[];
  rank?: 'ferial' | 'memorial' | 'feast' | 'solemnity';
  components: {
    introduction?: string; // component ID
    opening?: string[];
    examen?: string;
    hymn?: string;
    psalmody?: string[];
    reading?: string;
    responsory?: string;
    canticle?: string;
    prayer?: string;
    conclusion?: string;
    marian?: string;
  };
  metadata?: {
    created: string;
    lastModified: string;
    version: string;
  };
}

export interface UserLiturgyPreferences {
  primaryLanguage: LanguageCode;
  secondaryLanguage?: LanguageCode;
  displayMode: 'primary-only' | 'bilingual' | 'secondary-only';
  bibleTranslation: BibleTranslation;
  audioEnabled: boolean;
  audioTypes: AudioType[];
  chantNotation: ChantNotation;
  chantNotationEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  showRubrics: boolean;
}
