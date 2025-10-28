import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';
import TrackPlayer, { 
  IOSCategory, 
  IOSCategoryMode, 
  IOSCategoryOptions,
  AndroidAudioContentType 
} from 'react-native-track-player';

import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { CalendarProvider } from '@/components/CalendarContext';
import { BibleProvider } from '@/contexts/BibleContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { PodcastPlayerProvider } from '@/contexts/PodcastPlayerContext';
import { RosaryPlaybackService } from '@/services/RosaryPlaybackService';
import { AudioVersionService } from '@/services/AudioVersionService';
import { RosaryAudioDownloadService } from '@/services/RosaryAudioDownloadService';

// Initialize TrackPlayer immediately at module level (before any component renders)
let trackPlayerInitialized = false;

const initializeTrackPlayer = async () => {
  if (trackPlayerInitialized) return;
  
  try {
    TrackPlayer.registerPlaybackService(() => RosaryPlaybackService);
    
    await TrackPlayer.setupPlayer({
      autoUpdateMetadata: true,
      autoHandleInterruptions: true,
      waitForBuffer: true, // Wait for buffering before playing (prevents stops)
      // iOS-specific configuration for background audio
      iosCategory: IOSCategory.Playback, // Required for background audio on iOS
      iosCategoryMode: IOSCategoryMode.SpokenAudio, // Optimized for speech/prayer audio
      iosCategoryOptions: [
        IOSCategoryOptions.AllowBluetooth, // Support Bluetooth headphones
        IOSCategoryOptions.AllowBluetoothA2DP, // High-quality Bluetooth audio
        IOSCategoryOptions.AllowAirPlay, // Support AirPlay
        IOSCategoryOptions.DuckOthers, // Lower other audio when playing
      ],
      // Android-specific configuration
      androidAudioContentType: AndroidAudioContentType.Speech, // Optimized for spoken content
    });
    
    trackPlayerInitialized = true;
    console.log('[App] TrackPlayer initialized successfully with background audio support');
  } catch (error) {
    // If already set up, this is fine
    if (error instanceof Error && error.message.includes('already initialized')) {
      trackPlayerInitialized = true;
      console.log('[App] TrackPlayer was already initialized');
    } else {
      console.error('[App] Failed to initialize TrackPlayer:', error);
    }
  }
};

// Start initialization immediately
initializeTrackPlayer();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Georgia: require('../assets/fonts/Neuton/Neuton-Regular.ttf'),
    'Georgia-Bold': require('../assets/fonts/Neuton/Neuton-Bold.ttf'),
    'Georgia-Italic': require('../assets/fonts/Neuton/Neuton-Italic.ttf'),
    'Georgia-Light': require('../assets/fonts/Neuton/Neuton-Light.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Check for audio file updates in background (non-blocking)
  useEffect(() => {
    const checkAudioUpdates = async () => {
      try {
        console.log('[App] Checking for audio updates...');
        
        const result = await AudioVersionService.checkForUpdates();
        
        if (result.hasUpdates && (result.updatedFiles.length > 0 || result.newFiles.length > 0)) {
          const totalUpdates = result.updatedFiles.length + result.newFiles.length;
          console.log('[App] Audio updates found:', totalUpdates, 'files');
          
          // Show user notification
          Alert.alert(
            'Audio Updates Available',
            `Downloading ${totalUpdates} updated audio file${totalUpdates > 1 ? 's' : ''} in the background. New files will be ready for your next rosary.`,
            [{ text: 'OK' }],
            { cancelable: true }
          );
          
          // Trigger background downloads for updated files
          // Downloads happen automatically next time files are accessed
          console.log('[App] Background downloads will occur on next use');
        } else {
          console.log('[App] No audio updates available');
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.warn('[App] Audio update check failed (this is OK):', error);
      }
    };

    // Run check 3 seconds after app loads (avoid startup delay)
    const timer = setTimeout(checkAudioUpdates, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <PodcastPlayerProvider>
          <CalendarProvider>
            <BibleProvider>
              <ThemedNavigation />
            </BibleProvider>
          </CalendarProvider>
        </PodcastPlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}

function ThemedNavigation() {
  const { colorScheme } = useTheme();
  
  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootLayoutNav />
    </NavigationThemeProvider>
  );
}
