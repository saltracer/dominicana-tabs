import { ComplineData, LanguageCode, getDayOfWeekFromDate, getComponentForDay } from '@/types/compline-types';
import { ordinaryTimeCompline } from './seasons/ordinary-time/compline';

// Export all Compline data
export { ordinaryTimeCompline };

// Helper function to get Compline data by season and date
export function getComplineForDate(date: Date, language: LanguageCode = 'en'): ComplineData {
  // For now, return ordinary time Compline with day-of-week variations applied
  // In a full implementation, this would determine the season and return appropriate data
  const dayOfWeek = getDayOfWeekFromDate(date);
  
  // Create a copy of the compline data with day-of-week variations resolved
  const complineData: ComplineData = {
    ...ordinaryTimeCompline,
    components: {
      ...ordinaryTimeCompline.components,
      hymn: getComponentForDay(ordinaryTimeCompline.components.hymn, dayOfWeek),
      psalmody: getComponentForDay(ordinaryTimeCompline.components.psalmody, dayOfWeek),
      reading: getComponentForDay(ordinaryTimeCompline.components.reading, dayOfWeek),
      responsory: getComponentForDay(ordinaryTimeCompline.components.responsory, dayOfWeek),
      canticle: getComponentForDay(ordinaryTimeCompline.components.canticle, dayOfWeek),
      concludingPrayer: getComponentForDay(ordinaryTimeCompline.components.concludingPrayer, dayOfWeek),
    }
  };
  
  return complineData;
}

// Helper function to get available seasons
export function getAvailableSeasons(): string[] {
  return ['ordinary-time', 'advent', 'christmastide', 'lent', 'easter'];
}

// Helper function to get available languages
export function getAvailableLanguages(): LanguageCode[] {
  return ['en', 'la', 'es', 'fr', 'de', 'it'];
}
