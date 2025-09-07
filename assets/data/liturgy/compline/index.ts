import { ComplineData, LanguageCode } from '../../../types/compline-types';
import { ordinaryTimeCompline } from './seasons/ordinary-time/compline';

// Export all Compline data
export { ordinaryTimeCompline };

// Helper function to get Compline data by season and date
export function getComplineForDate(date: Date, language: LanguageCode = 'en'): ComplineData {
  // For now, return ordinary time Compline
  // In a full implementation, this would determine the season and return appropriate data
  return ordinaryTimeCompline;
}

// Helper function to get available seasons
export function getAvailableSeasons(): string[] {
  return ['ordinary-time', 'advent', 'christmastide', 'lent', 'easter'];
}

// Helper function to get available languages
export function getAvailableLanguages(): LanguageCode[] {
  return ['en', 'la', 'es', 'fr', 'de', 'it'];
}
