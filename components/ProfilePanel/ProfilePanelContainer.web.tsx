import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';
import { useProfilePanel } from '@/contexts/ProfilePanelContext';
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery';
import ProfileHeader from './ProfileHeader';
import SettingsNavigation from './SettingsNavigation';
import SettingsContent from './SettingsContent.web';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfilePanelContainerWeb() {
  const { colorScheme } = useTheme();
  const { isPanelOpen, closePanel, activeCategory, setActiveCategory } = useProfilePanel();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const getPanelWidth = () => {
    if (isMobile) return '100%';
    if (isTablet) return '90%';
    return 800; // Desktop fixed width - wider for better content display
  };

  const panelWidth = getPanelWidth();

  useEffect(() => {
    if (isPanelOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: typeof panelWidth === 'number' ? panelWidth : SCREEN_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isPanelOpen, panelWidth]);

  // Handle backdrop click
  const handleBackdropClick = (event: any) => {
    if (event.target === event.currentTarget) {
      closePanel();
    }
  };

  // Handle ESC key
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPanelOpen) {
        event.preventDefault();
        closePanel();
      }
    };

    if (isPanelOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isPanelOpen]);

  const handleNavigate = (category: string) => {
    if (category === 'admin') {
      closePanel();
      router.push('/admin');
    } else {
      setActiveCategory(category);
    }
  };

  // Don't render the container at all when closed and animation is complete
  // @ts-ignore - __getValue() exists in React Native Animated but isn't in types
  if (!isPanelOpen && opacity.__getValue() === 0) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        onTouchStart={handleBackdropClick}
        pointerEvents={isPanelOpen ? 'auto' : 'none'}
      />

      {/* Slide-over Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            width: panelWidth,
            transform: [{ translateX }],
            opacity,
          },
        ]}
      >
        <View style={[styles.safeArea, { paddingTop: insets.top, paddingRight: insets.right }]}>
          {/* Header */}
          <ProfileHeader onClose={closePanel} />

          {/* Navigation and Content */}
          <View style={[
            styles.contentContainer,
            isMobile && styles.contentContainerMobile
          ]}>
            {!isMobile && (
              <SettingsNavigation
                activeCategory={activeCategory}
                onNavigate={handleNavigate}
              />
            )}
            
            <SettingsContent 
              activeCategory={activeCategory} 
              isMobile={isMobile}
              onNavigate={handleNavigate}
            />
          </View>

        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed', // Use 'fixed' for web to cover entire viewport
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000, // Ensure it's above other content
    pointerEvents: 'box-none', // Allow clicks to pass through unless on panel/backdrop
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    pointerEvents: 'auto', // Clicks on backdrop are handled
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    pointerEvents: 'auto', // Clicks on panel are handled
    overflow: 'hidden', // Prevent content from overflowing
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0, // Important for flex scrolling
  },
  contentContainerMobile: {
    flexDirection: 'column',
  },
});
