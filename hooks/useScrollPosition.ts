import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * useScrollPosition Hook
 * 
 * A hook to track the current scroll position of the window.
 * Only works on web platform.
 * 
 * @returns object with scroll position (x, y) and scrolled state
 * 
 * @example
 * const { scrollY, isScrolled } = useScrollPosition();
 * // isScrolled is true when scrollY > 10
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState({
    scrollX: 0,
    scrollY: 0,
    isScrolled: false,
  });

  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    // Handler to update scroll position
    const handleScroll = () => {
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      
      setScrollPosition({
        scrollX,
        scrollY,
        isScrolled: scrollY > 10, // Consider scrolled after 10px
      });
    };

    // Set initial position
    handleScroll();

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollPosition;
}

/**
 * Hook to check if page is scrolled (scrollY > threshold)
 * @param threshold - Scroll threshold in pixels (default: 10)
 * @returns boolean - true if scrolled past threshold
 */
export function useIsScrolled(threshold: number = 10): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Only run on web platform
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollY > threshold);
    };

    // Set initial state
    handleScroll();

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return isScrolled;
}

export default useScrollPosition;

