// Import Celebration type for use in this file
import { Celebration } from './celebrations-types';

// Liturgical Calendar Types
export interface LiturgicalDay {
  date: string;
  season: LiturgicalSeason;
  week: number;
  weekString?: string; // Full liturgical week text (e.g., "The Monday after Epiphany")
  dayOfWeek: number;
  feasts: Celebration[];
  color: string;
  readings?: Reading[];
}

export interface LiturgicalSeason {
  name: string;
  color: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Feast {
  id: string;
  name: string;
  rank: FeastRank;
  type: FeastType;
  color: string;
  description: string;
  saint?: Saint;
  isDominican: boolean;
  date: string;
}

export type FeastRank = 'solemnity' | 'feast' | 'memorial' | 'optional' | 'ferial';
export type FeastType = 'universal' | 'national' | 'diocesan' | 'religious' | 'dominican';

// Saints Types
export interface Saint {
  id: string;
  name: string;
  feastDay: string;
  birthDate?: string;
  deathDate?: string;
  canonizationDate?: string;
  patronages: string[];
  biography: string;
  isDominican: boolean;
  order: string;
  images?: string[];
  prayers?: Prayer[];
}

// Prayer Types
export interface Prayer {
  id: string;
  title: string;
  type: PrayerType;
  content: string;
  language: string;
  source: string;
  isDominican: boolean;
}

export type PrayerType = 'liturgy_hours' | 'rosary' | 'novena' | 'litany' | 'hymn' | 'meditation';

// Liturgy of the Hours Types
export interface LiturgyHours {
  id: string;
  hour: HourType;
  date: string;
  season: string;
  psalms: Psalm[];
  readings: Reading[];
  prayers: Prayer[];
  antiphons: Antiphon[];
}

export type HourType = 'office_of_readings' | 'lauds' | 'terce' | 'sext' | 'none' | 'vespers' | 'compline';

export interface Psalm {
  id: string;
  number: number;
  title: string;
  content: string;
  antiphon: string;
  refrain?: string;
}

export interface Reading {
  id: string;
  title: string;
  source: string;
  content: string;
  author?: string;
  type: 'scripture' | 'patristic' | 'spiritual' | 'dominican';
}

export interface Antiphon {
  id: string;
  text: string;
  type: 'invitatory' | 'psalm' | 'gospel' | 'magnificat' | 'benedictus';
}

// Rosary Types
export interface RosaryMystery {
  id: string;
  name: string;
  type: RosaryType;
  day: string;
  meditation: string;
  scripture: string;
  fruit: string;
  image?: string;
}

export type RosaryType = 'joyful' | 'sorrowful' | 'glorious' | 'luminous';

export interface RosaryPrayer {
  id: string;
  type: RosaryType;
  mysteries: RosaryMystery[];
  date: string;
  isDominican: boolean;
}

export interface Province {
  id: string
  name: string
  latinName?: string
  patronSaint?: string
  formation_date: string | number
  region: string
  region_expanded?: string
  province_saint?: string
  province_saint_feast_day?: string
  countries: string[]
  website: string
  lay_website?: string
  short_description: string
  description: string
  description_array: string[]
  coordinates: [number, number] // [longitude, latitude]
  boundaries: {
    type: string
    coordinates?: any
    properties?: any
    geometry?: {
      type: string
      coordinates?: any
    }
  }
  color: string
  notable_dominicans?: {
    name: string
    dates: string
    description: string
  }[]
  priories?: {
    name: string
    location: string
    coordinates?: [number, number]
    founded?: number
    description?: string
    isProvincialHouse?: boolean
  }[]
  apostolates?: string[]
}

// Study/Library Types - Updated to match your actual database schema
export interface Book {
  id: number;
  title: string;
  author: string;
  year?: string | null;
  category: string; // Your categories: Philosophy, Theology, Mysticism, Science, Natural History, Spiritual
  coverImage?: string | null;
  description: string;
  epubPath?: string | null;
  epubSamplePath?: string | null;
  createdAt: string;
  updatedAt: string;
  // App-specific fields (not in database)
  bookmarks?: Bookmark[];
  readingProgress?: ReadingProgress;
}

export type BookCategory = 'Philosophy' | 'Theology' | 'Mysticism' | 'Science' | 'Natural History' | 'Spiritual';

export interface Bookmark {
  id: string;
  bookId: number; // Updated to match your database (number instead of string)
  position: number;
  note?: string;
  createdAt: string;
}

export interface ReadingProgress {
  bookId: number; // Updated to match your database (number instead of string)
  currentPosition: number;
  totalPages: number;
  lastRead: string;
  timeSpent: number;
}

export interface EbookAccess {
  canRead: boolean;
  reason?: 'not_authenticated' | 'no_entitlement' | 'restricted_region';
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  preferences: UserPreferences;
  subscription: Subscription;
  createdAt: string;
  lastLogin: string;
}

export type UserRole = 'anonymous' | 'user' | 'friar' | 'admin';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  liturgicalCalendar: CalendarPreferences;
  prayerReminders: PrayerReminder[];
}

export interface NotificationSettings {
  enabled: boolean;
  prayerReminders: boolean;
  feastDayAlerts: boolean;
  dailyReadings: boolean;
  communityUpdates: boolean;
}

export interface CalendarPreferences {
  showDominicanFeasts: boolean;
  showUniversalFeasts: boolean;
  preferredRite: 'roman' | 'dominican';
  timezone: string;
}

export interface PrayerReminder {
  id: string;
  type: PrayerType;
  time: string;
  days: string[];
  enabled: boolean;
}

export interface Subscription {
  type: 'free' | 'basic' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  features: string[];
}

// Preaching Types
export interface Reflection {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
  liturgicalDay?: string;
  tags: string[];
  isDominican: boolean;
  audioUrl?: string;
  imageUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  content: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  category: string;
  isDominican: boolean;
  featuredImage?: string;
  audioUrl?: string;
}

// Audio Types
export interface AudioContent {
  id: string;
  title: string;
  type: AudioType;
  url: string;
  duration: number;
  description: string;
  isDominican: boolean;
  requiresSubscription: boolean;
  tags: string[];
}

export type AudioType = 'prayer' | 'meditation' | 'homily' | 'lecture' | 'music' | 'chant';


// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'modal': undefined;
  'auth': undefined;
  'prayer': { screen?: string; params?: any };
  'study': { screen?: string; params?: any };
  'community': { screen?: string; params?: any };
  'preaching': { screen?: string; params?: any };
};

export type TabParamList = {
  prayer: undefined;
  study: undefined;
  community: undefined;
  preaching: undefined;
};

// Export liturgical types
export * from './liturgical-types';

// Export celebration types
export * from './celebrations-types';

// Export saint types
export * from './saint-types';

// Export liturgy types
export * from './liturgy-types';

// Bible Types
export interface BibleBook {
  code: string;
  title: string;
  shortTitle: string;
  abbreviation: string;
  category: 'old-testament' | 'new-testament' | 'deuterocanonical';
  order: number;
  chapters?: number;
}

export interface BibleVerse {
  number: number;
  text: string;
  reference: string;
}

export interface BibleChapter {
  number: number;
  verses: BibleVerse[];
}

export interface BiblePassage {
  bookCode: string;
  startChapter: number;
  startVerse: number;
  endChapter: number;
  endVerse: number;
  verses: BibleVerse[];
  reference: string;
}

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface BibleReadingSession {
  id: string;
  bookCode: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
  startTime: string;
  endTime?: string;
  notes?: string;
  bookmarks?: BibleBookmark[];
}

export interface BibleBookmark {
  id: string;
  bookCode: string;
  chapter: number;
  verse: number;
  note?: string;
  createdAt: string;
  tags?: string[];
}

export interface BibleReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: number; // days
  readings: BibleReadingPlanDay[];
  isActive: boolean;
  startDate?: string;
}

export interface BibleReadingPlanDay {
  day: number;
  readings: {
    bookCode: string;
    chapter: number;
    startVerse?: number;
    endVerse?: number;
  }[];
}

// Export compline types (selective export to avoid conflicts)
export type { 
  ComplineData, 
  ComplineComponents, 
  ComplineMetadata,
  ComplinePreferences,
  ComplineCacheEntry,
  OfflineComplineData,
  ComplineServiceConfig,
  DayOfWeekVariations,
  DayOfWeek,
  ExaminationComponent,
  OpeningComponent,
  HymnComponent,
  PsalmodyComponent,
  ReadingComponent,
  ResponsoryComponent,
  CanticleComponent,
  PrayerComponent,
  BlessingComponent
} from './compline-types';

export { 
  getDayOfWeekFromDate,
  getComponentForDay,
  isDayOfWeekVariations
} from './compline-types';
