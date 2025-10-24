import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';
import { useProfilePanel } from '@/contexts/ProfilePanelContext';
import ProfileHeader from './ProfileHeader';
import SettingsContentNative from './SettingsContentNative';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfilePanelContainer() {
  const { colorScheme } = useTheme();
  const { isPanelOpen, closePanel, activeCategory, setActiveCategory } = useProfilePanel();
  const router = useRouter();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes
        return gestureState.dy > 0 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Close the panel
          closePanel();
        } else {
          // Snap back to open position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isPanelOpen) {
      // Slide up animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isPanelOpen]);

  const handleNavigate = (category: string) => {
    if (category === 'admin') {
      closePanel();
      router.push('/admin');
    } else {
      setActiveCategory(category);
    }
  };

  if (!isPanelOpen) return null;

  return (
    <Modal
      visible={isPanelOpen}
      transparent
      animationType="none"
      onRequestClose={closePanel}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity }]} activeOpacity={1} onPress={closePanel} />

      {/* Modal Sheet */}
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Drag Handle */}
          <View style={[styles.dragHandle, { backgroundColor: Colors[colorScheme ?? 'light'].border }]} />

          {/* Header */}
          <ProfileHeader onClose={closePanel} />

          {/* Settings Content */}
          <View style={styles.settingsContainer}>
            <SettingsContentNative 
              activeCategory={activeCategory} 
              onNavigate={handleNavigate}
            />
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
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '90%', // 90% of screen height
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
  },
  settingsContainer: {
    flex: 1,
    minHeight: 0, // Important for flex scrolling
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
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
