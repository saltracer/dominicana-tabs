/**
 * Bible Navigation Helper Functions
 * 
 * Centralized navigation functions for Bible-related screens
 */

import { router } from 'expo-router';

export interface BibleNavigationParams {
  bookCode: string;
  chapter?: number;
  verse?: number;
}

/**
 * Navigate to Bible book selection screen
 */
export function navigateToBibleBooks() {
  router.push('/(tabs)/study/bible');
}

/**
 * Navigate to a specific Bible book
 */
export function navigateToBibleBook(bookCode: string) {
  router.push(`/(tabs)/study/bible/${bookCode}`);
}

/**
 * Navigate to a specific Bible chapter
 */
export function navigateToBibleChapter(bookCode: string, chapter: number) {
  router.push(`/(tabs)/study/bible/${bookCode}?chapter=${chapter}`);
}

/**
 * Navigate to a specific Bible verse
 */
export function navigateToBibleVerse(bookCode: string, chapter: number, verse: number) {
  router.push(`/(tabs)/study/bible/${bookCode}?chapter=${chapter}&verse=${verse}`);
}

/**
 * Navigate to Bible search with optional book filter
 */
export function navigateToBibleSearch(bookCode?: string) {
  const url = bookCode 
    ? `/(tabs)/study/bible/search?bookCode=${bookCode}`
    : '/(tabs)/study/bible/search';
  router.push(url);
}

/**
 * Navigate back to previous screen
 */
export function navigateBack() {
  router.back();
}

/**
 * Navigate to study main screen
 */
export function navigateToStudy() {
  router.push('/(tabs)/study');
}

/**
 * Parse Bible reference string (e.g., "GEN 1:1") into navigation parameters
 */
export function parseBibleReference(reference: string): BibleNavigationParams | null {
  const match = reference.match(/^(\w+)\s+(\d+)(?::(\d+))?$/);
  if (!match) return null;

  const [, bookCode, chapterStr, verseStr] = match;
  const chapter = parseInt(chapterStr, 10);
  const verse = verseStr ? parseInt(verseStr, 10) : undefined;

  return {
    bookCode,
    chapter,
    verse
  };
}

/**
 * Navigate to Bible reference string
 */
export function navigateToBibleReference(reference: string) {
  const params = parseBibleReference(reference);
  if (!params) {
    console.error('Invalid Bible reference:', reference);
    return;
  }

  if (params.verse) {
    navigateToBibleVerse(params.bookCode, params.chapter!, params.verse);
  } else {
    navigateToBibleChapter(params.bookCode, params.chapter!);
  }
}

/**
 * Get current Bible navigation state from route parameters
 */
export function getBibleNavigationState(searchParams: any): BibleNavigationParams | null {
  const { bookCode, chapter, verse } = searchParams;
  
  if (!bookCode) return null;

  return {
    bookCode: bookCode as string,
    chapter: chapter ? parseInt(chapter as string, 10) : undefined,
    verse: verse ? parseInt(verse as string, 10) : undefined
  };
}
