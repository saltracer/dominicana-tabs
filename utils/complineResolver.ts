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
      // Format verses with proper structure and verse numbers
      const scriptureText = passage.verses
        .map((v: any) => `${v.number} ${v.text}`)
        .join('\n\n');
      
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
 * Resolves scripture references to actual content in ComplineData.
 * Since the new structure already resolves day-of-week variations, this function
 * now focuses on resolving scripture references.
 * 
 * @param data - ComplineData with components already resolved for the specific day
 * @param targetDate - Date to use for any additional processing
 * @returns ResolvedComplineData with scripture content resolved
 */
export async function resolveComplineComponents(data: ComplineData, targetDate: Date): Promise<ResolvedComplineData> {
  try {
    // Since the new structure already resolves day-of-week variations,
    // we just need to resolve scripture references
    const componentsWithScripture = {
      ...data.components,
      reading: await resolveScriptureContent(data.components.reading),
      psalmody: await resolveScriptureContent(data.components.psalmody),
      canticle: await resolveScriptureContent(data.components.canticle),
    };

    return {
      ...data,
      components: componentsWithScripture as ResolvedComplineComponents
    };
  } catch (error) {
    console.error('Error in resolveComplineComponents:', error);
    // Return the original data without scripture resolution as fallback
    return {
      ...data,
      components: data.components as ResolvedComplineComponents
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
