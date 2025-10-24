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

  // Determine panel width based on screen size
  const getPanelWidth = () => {
    if (isMobile) return SCREEN_WIDTH;
    if (isTablet) return SCREEN_WIDTH * 0.7;
    return 480; // Desktop fixed width
  };

  const panelWidth = getPanelWidth();

  useEffect(() => {
    if (isPanelOpen) {
      // Slide in animation
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out animation
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: panelWidth,
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
      // Prevent body scroll when panel is open
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
      // Navigate to admin page
      closePanel();
      router.push('/admin');
    } else {
      setActiveCategory(category);
    }
  };

  if (!isPanelOpen) return null;

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBackdropClick}
        />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // Add backdrop blur effect for modern browsers
    // backdropFilter: 'blur(4px)', // Uncomment if supported
  },
  backdropTouchable: {
    flex: 1,
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
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
