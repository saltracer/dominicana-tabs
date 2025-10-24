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
      // Navigate to admin page
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
      <Animated.View
        style={[
          styles.backdrop,
          { opacity },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={closePanel}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            transform: [{ translateY }],
          },
        ]}
      >
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            {/* Drag Handle */}
            <View style={[styles.dragHandle, { backgroundColor: Colors[colorScheme ?? 'light'].border }]} />

            {/* Header */}
            <ProfileHeader onClose={closePanel} />

            {/* Settings Content */}
            <SettingsContentNative 
              activeCategory={activeCategory} 
              onNavigate={handleNavigate}
            />

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
  backdropTouchable: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  safeArea: {
    flex: 1,
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
