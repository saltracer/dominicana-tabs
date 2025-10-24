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
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ProfileHeader from './ProfileHeader';
import SettingsNavigation from './SettingsNavigation';
import SettingsContent from './SettingsContent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfilePanelContainerWeb() {
  const { colorScheme } = useTheme();
  const { isPanelOpen, closePanel, activeCategory, setActiveCategory } = useProfilePanel();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isMobile = useMediaQuery(768);
  const isTablet = useMediaQuery(1024);
  
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const getPanelWidth = () => {
    if (isMobile) return '100%';
    if (isTablet) return '90%';
    return 480; // Desktop fixed width
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

  if (!isPanelOpen && opacity.__getValue() === 0) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        onTouchStart={handleBackdropClick}
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
          <View style={styles.contentContainer}>
            <SettingsNavigation
              activeCategory={activeCategory}
              onNavigate={handleNavigate}
            />
            
            <SettingsContent activeCategory={activeCategory} />
          </View>

          {/* Logout Button */}
          <View style={[styles.footer, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: Colors[colorScheme ?? 'light'].error }]}
              onPress={() => {
                closePanel();
                // TODO: Handle logout
              }}
              accessibilityLabel="Logout"
              accessibilityRole="button"
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <View style={styles.logoutButtonText}>
                <Text style={styles.logoutText}>Logout</Text>
              </View>
            </TouchableOpacity>
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
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  logoutButtonText: {
    flex: 1,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
