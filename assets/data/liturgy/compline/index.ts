import { ComplineData, ComplineDataByDay, LanguageCode, getDayOfWeekFromDate } from '@/types/compline-types';
import { ordinaryTimeCompline } from './seasons/ordinary-time/compline';
import { getMarianHymnForDate } from './seasonal-marian-hymns';

// Export all Compline data
export { ordinaryTimeCompline };

// Helper function to get Compline data by season and date
export function getComplineForDate(date: Date, language: LanguageCode = 'en'): ComplineData {
  // For now, return ordinary time Compline with day-of-week variations applied
  // In a full implementation, this would determine the season and return appropriate data
  
  console.warn('🚀 getComplineForDate called with date:', date.toString());
  const dayOfWeek = getDayOfWeekFromDate(date);
  console.warn('🎯 Final day of week determined:', dayOfWeek);
  
  // Get the appropriate Marian hymn for this date
  const seasonalMarianHymn = getMarianHymnForDate(date);
  console.warn('🎵 Marian hymn selected:', seasonalMarianHymn.id);
  
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
      hymn: ordinaryTimeCompline.sharedComponents.hymn,
      psalmody: dayComponents.psalmody,
      reading: dayComponents.reading,
      responsory: ordinaryTimeCompline.sharedComponents.responsory,
      canticle: ordinaryTimeCompline.sharedComponents.canticle,
      concludingPrayer: dayComponents.concludingPrayer,
      finalBlessing: ordinaryTimeCompline.sharedComponents.finalBlessing,
      marianHymn: seasonalMarianHymn,
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
