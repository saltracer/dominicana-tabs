import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Animated } from 'react-native';

interface ScrollContextType {
  // State
  isScrollingDown: boolean;
  isNearBottom: boolean;
  shouldHideUI: boolean;
  
  // Actions
  setScrollingDown: (scrolling: boolean) => void;
  setNearBottom: (nearBottom: boolean) => void;
  resetScrollState: () => void;
  
  // Animation values
  bottomNavTranslateY: Animated.Value;
  feastBannerTranslateY: Animated.Value;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

interface ScrollProviderProps {
  children: ReactNode;
}

export function ScrollProvider({ children }: ScrollProviderProps) {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  
  // Animation values for smooth transitions
  const bottomNavTranslateY = React.useRef(new Animated.Value(0)).current;
  const feastBannerTranslateY = React.useRef(new Animated.Value(0)).current;
  
  // Determine if UI should be hidden
  const shouldHideUI = isScrollingDown && !isNearBottom;
  
  const setScrollingDown = useCallback((scrolling: boolean) => {
    setIsScrollingDown(scrolling);
    
    // Animate UI elements
    const targetValue = scrolling ? 175 : 0; // Hide by moving down 150px (increased from 100px)
    const duration = 150;
    
    Animated.parallel([
      Animated.timing(bottomNavTranslateY, {
        toValue: targetValue,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(feastBannerTranslateY, {
        toValue: targetValue,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bottomNavTranslateY, feastBannerTranslateY, isScrollingDown]);
  
  const setNearBottom = useCallback((nearBottom: boolean) => {
    setIsNearBottom(false);
    
    // // If near bottom, show UI regardless of scroll direction
    // if (nearBottom) {
    //   Animated.parallel([
    //     Animated.timing(bottomNavTranslateY, {
    //       toValue: 0,
    //       duration: 300,
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(feastBannerTranslateY, {
    //       toValue: 0,
    //       duration: 300,
    //       useNativeDriver: true,
    //     }),
    //   ]).start();
    // }
  }, [bottomNavTranslateY, feastBannerTranslateY]);
  
  const resetScrollState = useCallback(() => {
    setIsScrollingDown(false);
    setIsNearBottom(false);
    
    // Reset animations
    Animated.parallel([
      Animated.timing(bottomNavTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(feastBannerTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bottomNavTranslateY, feastBannerTranslateY]);
  
  const value: ScrollContextType = {
    isScrollingDown,
    isNearBottom,
    shouldHideUI,
    setScrollingDown,
    setNearBottom,
    resetScrollState,
    bottomNavTranslateY,
    feastBannerTranslateY,
  };
  
  return (
    <ScrollContext.Provider value={value}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScrollContext() {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
}
