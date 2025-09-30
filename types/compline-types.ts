import { LiturgicalSeason, FeastRank } from './index';

export type LanguageCode = 'en' | 'la' | 'es' | 'fr' | 'de' | 'it';
export type ChantNotation = 'gabc' | 'mei' | 'xml';
export type AudioFormat = 'mp3' | 'wav' | 'm4a' | 'aac';
export type AudioQuality = 'low' | 'medium' | 'high';
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface MultiLanguageContent {
  [languageCode: string]: {
    text: string;
    audio?: AudioResource;
    chant?: ChantResource;
  };
}

export interface AudioResource {
  id: string;
  url: string;
  duration: number;
  format: AudioFormat;
  quality: AudioQuality;
  language: string;
  size?: number; // in bytes
  checksum?: string; // for integrity verification
}

export interface ChantResource {
  id: string;
  notation: ChantNotation;
  data: string; // GABC, MEI, or XML notation
  metadata: {
    composer?: string;
    century?: string;
    source?: string;
    gregobase_id?: string;
    mode?: number; // Gregorian mode
    clef?: string;
  };
}

export interface DayOfWeekVariations<T> {
  type: 'day-of-week-variations';
  default: T;
  variations: {
    [key in DayOfWeek]?: T;
  };
}

export interface ComplineData {
  id: string;
  version: string;
  lastUpdated: string;
  season: LiturgicalSeason;
  rank: FeastRank;
  components: ComplineComponents;
  metadata: ComplineMetadata;
}

export interface ComplineComponents {
  examinationOfConscience: ExaminationComponent;
  opening: OpeningComponent;
  hymn: HymnComponent | DayOfWeekVariations<HymnComponent>;
  psalmody: PsalmodyComponent | DayOfWeekVariations<PsalmodyComponent>;
  reading: ReadingComponent | DayOfWeekVariations<ReadingComponent>;
  responsory: ResponsoryComponent | DayOfWeekVariations<ResponsoryComponent>;
  canticle: CanticleComponent | DayOfWeekVariations<CanticleComponent>;
  concludingPrayer: PrayerComponent | DayOfWeekVariations<PrayerComponent>;
  finalBlessing: BlessingComponent;
}

export interface ExaminationComponent {
  id: string;
  type: 'examination';
  content: MultiLanguageContent;
  rubric?: MultiLanguageContent;
  audio?: AudioResource[];
  chant?: ChantResource[];
}

export interface OpeningComponent {
  id: string;
  type: 'opening';
  content: MultiLanguageContent;
  audio?: AudioResource[];
  chant?: ChantResource[];
}

export interface HymnComponent {
  id: string;
  type: 'hymn';
  title: MultiLanguageContent;
  content: MultiLanguageContent;
  melody?: ChantResource;
  audio?: AudioResource[];
  metadata: {
    composer?: string;
    century?: string;
    meter?: string;
    tune?: string;
  };
}

export interface PsalmodyComponent {
  id: string;
  type: 'psalm';
  psalmNumber: number;
  antiphon: MultiLanguageContent;
  verses?: MultiLanguageContent;
  scriptureRef?: ScriptureReference;
  refrain?: MultiLanguageContent;
  chant?: ChantResource;
  audio?: AudioResource[];
  // Optional second psalm for Saturday compline
  secondPsalm?: {
    psalmNumber: number;
    antiphon: MultiLanguageContent;
    verses?: MultiLanguageContent;
    scriptureRef?: ScriptureReference;
    refrain?: MultiLanguageContent;
    chant?: ChantResource;
    audio?: AudioResource[];
    metadata?: {
      tone?: string;
      mode?: number;
    };
  };
  metadata: {
    tone?: string;
    mode?: number;
  };
}

export interface ScriptureReference {
  book: string;
  chapter: number;
  verse: string;
  translation?: string;
}

export interface ReadingComponent {
  id: string;
  type: 'reading';
  title: MultiLanguageContent;
  verses?: MultiLanguageContent; // Changed from content to verses for consistency
  scriptureRef?: ScriptureReference;
  source: MultiLanguageContent;
  audio?: AudioResource[];
  metadata: {
    book?: string;
    chapter?: number;
    verse?: string;
    author?: string;
  };
}

export interface ResponsoryComponent {
  id: string;
  type: 'responsory';
  content: MultiLanguageContent;
  audio?: AudioResource[];
  chant?: ChantResource[];
}

export interface CanticleComponent {
  id: string;
  type: 'canticle';
  name: string; // e.g., "Canticle of Simeon"
  antiphon: MultiLanguageContent;
  scriptureRef?: ScriptureReference;
  verses?: MultiLanguageContent;
  content: MultiLanguageContent;
  chant?: ChantResource;
  audio?: AudioResource[];
  metadata: {
    biblical_reference?: string;
    mode?: number;
  };
}

export interface PrayerComponent {
  id: string;
  type: 'prayer';
  title: MultiLanguageContent;
  content: MultiLanguageContent;
  audio?: AudioResource[];
  chant?: ChantResource[];
}

export interface BlessingComponent {
  id: string;
  type: 'blessing';
  content: MultiLanguageContent;
  audio?: AudioResource[];
  chant?: ChantResource[];
}

export interface ComplineMetadata {
  created: string;
  lastModified: string;
  version: string;
  contributors?: string[];
  sources?: string[];
  notes?: string;
}

export interface ComplinePreferences {
  primaryLanguage: LanguageCode;
  secondaryLanguage?: LanguageCode;
  displayMode: 'primary-only' | 'bilingual' | 'secondary-only';
  audioEnabled: boolean;
  audioQuality: AudioQuality;
  chantEnabled: boolean;
  chantNotation: ChantNotation;
  fontSize: 'small' | 'medium' | 'large';
  showRubrics: boolean;
  autoPlay: boolean;
}

export interface ComplineCacheEntry {
  data: ComplineData;
  timestamp: number;
  language: LanguageCode;
  date: string;
}

export interface OfflineComplineData {
  [key: string]: ComplineData; // key format: "YYYY-MM-DD-language"
}

export interface ComplineServiceConfig {
  cacheSize: number; // maximum number of entries to cache
  offlineStorageKey: string;
  apiEndpoint?: string;
  enableOfflineMode: boolean;
  preloadDays: number; // days to preload for offline use
}

// Helper functions for day-of-week variations
export function getDayOfWeekFromDate(date: Date): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

export function getComponentForDay<T>(
  component: T | DayOfWeekVariations<T>,
  dayOfWeek: DayOfWeek
): T {
  if (isDayOfWeekVariations(component)) {
    return component.variations[dayOfWeek] || component.default;
  }
  return component;
}

export function isDayOfWeekVariations<T>(component: T | DayOfWeekVariations<T>): component is DayOfWeekVariations<T> {
  return typeof component === 'object' && component !== null && 'type' in component && component.type === 'day-of-week-variations';
}

// New day-based structure interfaces
export interface DaySpecificCompline {
  psalmody: PsalmodyComponent;
  reading: ReadingComponent;
  concludingPrayer: PrayerComponent;
}

export interface ComplineDataByDay {
  id: string;
  version: string;
  lastUpdated: string;
  season: LiturgicalSeason;
  rank: FeastRank;
  sharedComponents: {
    examinationOfConscience: ExaminationComponent;
    opening: OpeningComponent;
    hymn: HymnComponent;
    responsory: ResponsoryComponent;
    canticle: CanticleComponent;
    finalBlessing: BlessingComponent;
  };
  days: {
    [key in DayOfWeek]: DaySpecificCompline;
  };
  metadata: ComplineMetadata;
}
