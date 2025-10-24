import { useRef, useCallback } from 'react';
import { useScrollContext } from '../contexts/ScrollContext';
import { useScrollPositionNative } from './useScrollPosition';

/**
 * Custom hook for handling scroll-based UI behavior in liturgy hours screens
 * 
 * @param threshold - Scroll threshold for hiding UI (default: 50px)
 * @returns scroll handler and refs for ScrollView
 */
export function useLiturgyScroll(threshold: number = 50) {
  const { setScrollingDown, setNearBottom } = useScrollContext();
  const scrollViewRef = useRef<any>(null);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Scroll position tracking
  const { scrollY, onScroll } = useScrollPositionNative(threshold);
  
  // Enhanced scroll handler for UI hiding/showing
  const handleScroll = useCallback((event: any) => {
    // Call the original onScroll handler
    onScroll(event);
    
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    
    // Clear existing timeout (if any)
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = null;
    }
    
    // Determine scroll direction
    const isScrollingDown = currentScrollY > lastScrollY.current;
    const isScrollingUp = currentScrollY < lastScrollY.current;
    
    // Check if near bottom (within 100px of bottom)
    const isNearBottom = currentScrollY + layoutHeight >= contentHeight - 100;
    
    // Update scroll context
    setNearBottom(isNearBottom);
    
    // Handle scrolling down (hide UI)
    if (isScrollingDown && currentScrollY > threshold) {
      setScrollingDown(true);
    }
    
    // Handle scrolling up (show UI)
    if (isScrollingUp || isNearBottom) {
      setScrollingDown(false);
    }
    
    // Note: Removed timeout behavior - UI should only show when scrolling up or near bottom
    
    lastScrollY.current = currentScrollY;
  }, [onScroll, setScrollingDown, setNearBottom, threshold]);
  
  return {
    scrollViewRef,
    handleScroll,
    scrollY,
  };
}
