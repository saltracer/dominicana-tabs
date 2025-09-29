import { ComplineData, ComplineDataByDay, LanguageCode, getDayOfWeekFromDate } from '@/types/compline-types';
import { ordinaryTimeCompline } from './seasons/ordinary-time/compline';

// Export all Compline data
export { ordinaryTimeCompline };

// Helper function to get Compline data by season and date
export function getComplineForDate(date: Date, language: LanguageCode = 'en'): ComplineData {
  // For now, return ordinary time Compline with day-of-week variations applied
  // In a full implementation, this would determine the season and return appropriate data
  const dayOfWeek = getDayOfWeekFromDate(date);
  
  // Get the day-specific components from the new structure
  const dayComponents = ordinaryTimeCompline.days[dayOfWeek];
  
  // Create a ComplineData structure that matches the old interface
  const complineData: ComplineData = {
    id: ordinaryTimeCompline.id,
    version: ordinaryTimeCompline.version,
    lastUpdated: ordinaryTimeCompline.lastUpdated,
    season: ordinaryTimeCompline.season,
    rank: ordinaryTimeCompline.rank,
    components: {
      examinationOfConscience: ordinaryTimeCompline.sharedComponents.examinationOfConscience,
      opening: ordinaryTimeCompline.sharedComponents.opening,
      hymn: dayComponents.hymn,
      psalmody: dayComponents.psalmody,
      reading: dayComponents.reading,
      responsory: ordinaryTimeCompline.sharedComponents.responsory,
      canticle: ordinaryTimeCompline.sharedComponents.canticle,
      concludingPrayer: dayComponents.concludingPrayer,
      finalBlessing: ordinaryTimeCompline.sharedComponents.finalBlessing,
    },
    metadata: ordinaryTimeCompline.metadata
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
