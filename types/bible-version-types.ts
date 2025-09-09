/**
 * Bible Version Types
 * 
 * Types for supporting multiple Bible versions and formats
 */

import { BibleBook, BibleChapter, BibleVerse, BibleSearchResult } from './index';

// Bible version information
export interface BibleVersion {
  id: string;
  name: string;
  shortName: string;
  language: string;
  format: 'usx' | 'usfx';
  description: string;
  isDefault: boolean;
  bookNames: BibleBookNames;
}

// Book names for different versions
export interface BibleBookNames {
  [bookCode: string]: {
    title: string;
    shortTitle: string;
    abbreviation: string;
  };
}

// Bible service configuration
export interface BibleServiceConfig {
  defaultVersion: string;
  availableVersions: BibleVersion[];
  cacheSize: number;
  enableOfflineMode: boolean;
}

// Version-specific book information
export interface VersionBibleBook extends BibleBook {
  versionId: string;
  available: boolean;
}

// Multi-version search result
export interface MultiVersionSearchResult extends BibleSearchResult {
  versionId: string;
  versionName: string;
}

// Bible service state
export interface BibleServiceState {
  currentVersion: string;
  loadedBooks: Map<string, Map<string, any>>; // version -> bookCode -> parsedBook
  loadingStates: Map<string, boolean>; // bookCode -> loading
  errorStates: Map<string, string>; // bookCode -> error
}

// Parser interface for different formats
export interface BibleParser {
  parseUSXContent?(content: string): any;
  parseUSFXContent?(content: string): any;
  getVerseByReference(book: any, reference: string): any;
  searchInBook(book: any, searchText: string, caseSensitive?: boolean): any[];
  getBookStats(book: any): any;
}

// Asset loader interface
export interface BibleAssetLoader {
  loadBook(versionId: string, bookCode: string): Promise<string>;
  getAvailableBooks(versionId: string): string[];
  isBookAvailable(versionId: string, bookCode: string): boolean;
}
