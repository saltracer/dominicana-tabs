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
 * Resolves all DayOfWeekVariations components in ComplineData to their actual component types
 * based on the target date.
 * 
 * @param data - Raw ComplineData that may contain DayOfWeekVariations
 * @param targetDate - Date to use for resolving day-of-week variations
 * @returns ResolvedComplineData with all components resolved to actual types
 */
export function resolveComplineComponents(data: ComplineData, targetDate: Date): ResolvedComplineData {
  const dayOfWeek = getDayOfWeekFromDate(targetDate);
  
  return {
    ...data,
    components: {
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
    }
  };
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
