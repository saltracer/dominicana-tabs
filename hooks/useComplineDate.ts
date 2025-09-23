import { useMemo } from 'react';

export interface UseComplineDateReturn {
  currentDate: Date;
  targetDate: Date;
}

/**
 * Hook to manage date logic for Compline
 * Handles date memoization and target date calculation
 */
export function useComplineDate(date?: Date): UseComplineDateReturn {
  // Memoize current date to prevent infinite loops
  const currentDate = useMemo(() => new Date(), []);
  
  // Use provided date or memoized current date
  const targetDate = useMemo(() => {
    return date || currentDate;
  }, [date, currentDate]);

  return {
    currentDate,
    targetDate
  };
}
