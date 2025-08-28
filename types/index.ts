// Liturgical Calendar Types
export interface LiturgicalDay {
  date: string;
  season: LiturgicalSeason;
  week: number;
  dayOfWeek: number;
  feasts: Feast[];
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

export type FeastRank = 'solemnity' | 'feast' | 'memorial' | 'optional';
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

// Dominican Province Types
export interface DominicanProvince {
  id: string;
  name: string;
  country: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  founded: string;
  description: string;
  website?: string;
  contact: ContactInfo;
  communities: Community[];
}

export interface Community {
  id: string;
  name: string;
  type: 'priory' | 'convent' | 'house' | 'mission';
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contact: ContactInfo;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  address: string;
}

// Study/Library Types
export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  language: string;
  filePath: string;
  coverImage?: string;
  description: string;
  isDominican: boolean;
  tags: string[];
  bookmarks: Bookmark[];
  readingProgress: ReadingProgress;
}

export type BookCategory = 'theology' | 'philosophy' | 'spirituality' | 'history' | 'liturgy' | 'dominican' | 'patristic' | 'medieval';

export interface Bookmark {
  id: string;
  bookId: string;
  position: number;
  note?: string;
  createdAt: string;
}

export interface ReadingProgress {
  bookId: string;
  currentPosition: number;
  totalPages: number;
  lastRead: string;
  timeSpent: number;
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

// Database Types
export interface DatabaseSchema {
  users: User[];
  saints: Saint[];
  feasts: Feast[];
  provinces: DominicanProvince[];
  books: Book[];
  reflections: Reflection[];
  blogPosts: BlogPost[];
  audioContent: AudioContent[];
  userBookmarks: Bookmark[];
  readingProgress: ReadingProgress[];
}

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
