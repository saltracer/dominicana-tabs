import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * useMediaQuery Hook
 * 
 * A hook to check if the current viewport matches a media query.
 * Only works on web platform.
 * 
 * @param minWidth - Minimum width in pixels for the media query
 * @returns boolean - true if viewport width is >= minWidth
 * 
 * @example
 * const isMobile = useMediaQuery(768); // true if width < 768px
 * const isDesktop = useMediaQuery(992); // true if width >= 992px
 */
export function useMediaQuery(minWidth: number): boolean {
  // Default to true on non-web platforms
  const [matches, setMatches] = useState<boolean>(
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.innerWidth >= minWidth
      : true
  );

  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    // Create media query
    const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);
    
    // Update state
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    // Use addEventListener for better browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [minWidth]);

  return matches;
}

/**
 * Hook to check if viewport is mobile size
 * @returns boolean - true if width < 768px
 */
export function useIsMobile(): boolean {
  return !useMediaQuery(768);
}

/**
 * Hook to check if viewport is tablet size
 * @returns boolean - true if width >= 768px and < 992px
 */
export function useIsTablet(): boolean {
  const isAtLeastTablet = useMediaQuery(768);
  const isDesktop = useMediaQuery(992);
  return isAtLeastTablet && !isDesktop;
}

/**
 * Hook to check if viewport is desktop size
 * @returns boolean - true if width >= 992px
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(992);
}

/**
 * Hook to get current breakpoint name
 * @returns string - Current breakpoint ('mobile' | 'tablet' | 'desktop')
 */
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

export default useMediaQuery;

