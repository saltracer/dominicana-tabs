import React, { useRef, useState } from 'react';
import { View, PanResponder, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { HourType } from '../types';

interface SwipeNavigationWrapperProps {
  children: React.ReactNode;
  currentHour: HourType;
  onSwipe?: (direction: 'left' | 'right') => void;
}

const prayerHours = [
  { route: 'office-of-readings', type: 'office_of_readings' as HourType },
  { route: 'lauds', type: 'lauds' as HourType },
  { route: 'terce', type: 'terce' as HourType },
  { route: 'sext', type: 'sext' as HourType },
  { route: 'none', type: 'none' as HourType },
  { route: 'vespers', type: 'vespers' as HourType },
  { route: 'compline', type: 'compline' as HourType },
];

const { width: screenWidth } = Dimensions.get('window');

export default function SwipeNavigationWrapper({ children, currentHour, onSwipe }: SwipeNavigationWrapperProps) {
  const currentIndex = prayerHours.findIndex(hour => hour.type === currentHour);
  const [isAnimating, setIsAnimating] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const handleSwipe = (direction: 'left' | 'right') => {
    if (onSwipe) {
      onSwipe(direction);
      return;
    }

    let targetIndex = -1;
    
    if (direction === 'left' && currentIndex < prayerHours.length - 1) {
      // Swipe left = next hour
      targetIndex = currentIndex + 1;
    } else if (direction === 'right' && currentIndex > 0) {
      // Swipe right = previous hour  
      targetIndex = currentIndex - 1;
    }

    if (targetIndex >= 0 && !isAnimating) {
      setIsAnimating(true);
      
      // Start the slide animation
      const slideDirection = direction === 'left' ? 1 : -1;
      slideAnim.setValue(slideDirection * screenWidth);
      
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
        slideAnim.setValue(0);
      });
      
      // Navigate after a short delay to allow animation to start
      setTimeout(() => {
        const targetHour = prayerHours[targetIndex];
        router.push(`/(tabs)/prayer/liturgy-hours/${targetHour.route}` as any);
      }, 50);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: () => {
        // We can add visual feedback here if needed
      },
      onPanResponderRelease: (evt, gestureState) => {
        const swipeThreshold = screenWidth * 0.25; // 25% of screen width
        const velocityThreshold = 0.5;
        
        if (Math.abs(gestureState.dx) > swipeThreshold || Math.abs(gestureState.vx) > velocityThreshold) {
          if (gestureState.dx > 0) {
            handleSwipe('right'); // Swipe right = previous hour
          } else {
            handleSwipe('left'); // Swipe left = next hour
          }
        }
      },
    })
  ).current;

  return (
    <Animated.View 
      style={{ 
        flex: 1,
        transform: [{ translateX: slideAnim }]
      }} 
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
}
