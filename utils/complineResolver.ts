import {
  ComplineData,
  getComponentForDay,
  isDayOfWeekVariations,
  getDayOfWeekFromDate,
  HymnComponent,
  PsalmodyComponent,
  ReadingComponent,
  ResponsoryComponent,
  CanticleComponent,
  PrayerComponent,
  OpeningComponent,
  ExaminationComponent,
  BlessingComponent
} from '../types/compline-types';
import { bibleService } from '../services/BibleService';

// Type for resolved components (no DayOfWeekVariations)
export interface ResolvedComplineComponents {
  examinationOfConscience: ExaminationComponent;
  opening: OpeningComponent;
  hymn: HymnComponent;
  psalmody: PsalmodyComponent;
  reading: ReadingComponent;
  responsory: ResponsoryComponent;
  canticle: CanticleComponent;
  concludingPrayer: PrayerComponent;
  finalBlessing: BlessingComponent;
}

// Type for resolved ComplineData
export interface ResolvedComplineData extends Omit<ComplineData, 'components'> {
  components: ResolvedComplineComponents;
}

/**
 * Helper function to resolve scripture references to actual content
 * @param component - Component that may have a scriptureRef
 * @returns Component with resolved scripture content
 */
async function resolveScriptureContent(component: any): Promise<any> {
  if (!component || !component.scriptureRef) {
    return component;
  }

  try {
    // Format the scripture reference for the bible service
    const { book, chapter, verse } = component.scriptureRef;
    const reference = `${book} ${chapter}:${verse}`;
    
    console.log(`Resolving scripture reference: ${reference} for component type: ${component.type}`);
    
    // Fetch scripture content from bible service
    const passage = await bibleService.getPassageByReference(reference);
    
    console.log(`Passage result for ${reference}:`, passage);
    
    if (passage && passage.verses && passage.verses.length > 0) {
      // Convert verses to a single text string
      const scriptureText = passage.verses
        .map((v: any) => v.text)
        .join(' ');
      
      // Return component with resolved content
      // Always use 'verses' field for consistency
      return {
        ...component,
        verses: {
          en: { text: scriptureText }
        }
      };
    } else {
      console.warn(`Failed to fetch scripture for reference: ${reference}`);
      // Return component with fallback content
      return {
        ...component,
        verses: {
          en: { text: `[Scripture not found: ${reference}]` }
        }
      };
    }
  } catch (error) {
    console.error('Error resolving scripture reference:', error);
    // Return component with error message
    return {
      ...component,
      verses: {
        en: { text: `[Error loading scripture: ${component.scriptureRef.book} ${component.scriptureRef.chapter}:${component.scriptureRef.verse}]` }
      }
    };
  }
}

/**
 * Resolves all DayOfWeekVariations components in ComplineData to their actual component types
 * based on the target date. Also resolves scripture references to actual content.
 * 
 * @param data - Raw ComplineData that may contain DayOfWeekVariations and scriptureRef
 * @param targetDate - Date to use for resolving day-of-week variations
 * @returns ResolvedComplineData with all components resolved to actual types and scripture content
 */
export async function resolveComplineComponents(data: ComplineData, targetDate: Date): Promise<ResolvedComplineData> {
  try {
    const dayOfWeek = getDayOfWeekFromDate(targetDate);
    
    // Resolve day-of-week variations first
    const resolvedComponents = {
      opening: isDayOfWeekVariations(data.components.opening) 
        ? getComponentForDay(data.components.opening, dayOfWeek)
        : data.components.opening,
      examinationOfConscience: isDayOfWeekVariations(data.components.examinationOfConscience)
        ? getComponentForDay(data.components.examinationOfConscience, dayOfWeek)
        : data.components.examinationOfConscience,
      hymn: isDayOfWeekVariations(data.components.hymn)
        ? getComponentForDay(data.components.hymn, dayOfWeek)
        : data.components.hymn,
      psalmody: isDayOfWeekVariations(data.components.psalmody)
        ? getComponentForDay(data.components.psalmody, dayOfWeek)
        : data.components.psalmody,
      reading: isDayOfWeekVariations(data.components.reading)
        ? getComponentForDay(data.components.reading, dayOfWeek)
        : data.components.reading,
      responsory: isDayOfWeekVariations(data.components.responsory)
        ? getComponentForDay(data.components.responsory, dayOfWeek)
        : data.components.responsory,
      canticle: isDayOfWeekVariations(data.components.canticle)
        ? getComponentForDay(data.components.canticle, dayOfWeek)
        : data.components.canticle,
      concludingPrayer: isDayOfWeekVariations(data.components.concludingPrayer)
        ? getComponentForDay(data.components.concludingPrayer, dayOfWeek)
        : data.components.concludingPrayer,
      finalBlessing: isDayOfWeekVariations(data.components.finalBlessing)
        ? getComponentForDay(data.components.finalBlessing, dayOfWeek)
        : data.components.finalBlessing,
    };

    // Resolve scripture references for components that may have them
    const componentsWithScripture = {
      ...resolvedComponents,
      reading: await resolveScriptureContent(resolvedComponents.reading),
      psalmody: await resolveScriptureContent(resolvedComponents.psalmody),
      // Add other components that might have scripture references in the future
    };

    return {
      ...data,
      components: componentsWithScripture
    };
  } catch (error) {
    console.error('Error in resolveComplineComponents:', error);
    // Return the original data without scripture resolution as fallback
    return {
      ...data,
      components: {
        opening: isDayOfWeekVariations(data.components.opening) 
          ? getComponentForDay(data.components.opening, getDayOfWeekFromDate(targetDate))
          : data.components.opening,
        examinationOfConscience: isDayOfWeekVariations(data.components.examinationOfConscience)
          ? getComponentForDay(data.components.examinationOfConscience, getDayOfWeekFromDate(targetDate))
          : data.components.examinationOfConscience,
        hymn: isDayOfWeekVariations(data.components.hymn)
          ? getComponentForDay(data.components.hymn, getDayOfWeekFromDate(targetDate))
          : data.components.hymn,
        psalmody: isDayOfWeekVariations(data.components.psalmody)
          ? getComponentForDay(data.components.psalmody, getDayOfWeekFromDate(targetDate))
          : data.components.psalmody,
        reading: isDayOfWeekVariations(data.components.reading)
          ? getComponentForDay(data.components.reading, getDayOfWeekFromDate(targetDate))
          : data.components.reading,
        responsory: isDayOfWeekVariations(data.components.responsory)
          ? getComponentForDay(data.components.responsory, getDayOfWeekFromDate(targetDate))
          : data.components.responsory,
        canticle: isDayOfWeekVariations(data.components.canticle)
          ? getComponentForDay(data.components.canticle, getDayOfWeekFromDate(targetDate))
          : data.components.canticle,
        concludingPrayer: isDayOfWeekVariations(data.components.concludingPrayer)
          ? getComponentForDay(data.components.concludingPrayer, getDayOfWeekFromDate(targetDate))
          : data.components.concludingPrayer,
        finalBlessing: isDayOfWeekVariations(data.components.finalBlessing)
          ? getComponentForDay(data.components.finalBlessing, getDayOfWeekFromDate(targetDate))
          : data.components.finalBlessing,
      }
    };
  }
}

/**
 * Generic helper to resolve a single component that might be a DayOfWeekVariations
 * 
 * @param component - Component that might be a DayOfWeekVariations
 * @param targetDate - Date to use for resolving day-of-week variations
 * @returns Resolved component of the actual type
 */
export function resolveComponent<T>(
  component: T | import('../types/compline-types').DayOfWeekVariations<T>,
  targetDate: Date
): T {
  if (isDayOfWeekVariations(component)) {
    const dayOfWeek = getDayOfWeekFromDate(targetDate);
    return getComponentForDay(component, dayOfWeek);
  }
  return component;
}
