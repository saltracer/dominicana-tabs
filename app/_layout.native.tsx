import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { CalendarProvider } from '@/components/CalendarContext';
import { BibleProvider } from '@/contexts/BibleContext';
import { AuthProvider } from '@/contexts/AuthContext';

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
    'Neuton-Regular': require('../assets/fonts/Neuton/Neuton-Regular.ttf'),
    'Neuton-Bold': require('../assets/fonts/Neuton/Neuton-Bold.ttf'),
    'Neuton-Italic': require('../assets/fonts/Neuton/Neuton-Italic.ttf'),
    'Neuton-Light': require('../assets/fonts/Neuton/Neuton-Light.ttf'),
    Georgia: require('../assets/fonts/Neuton/Neuton-Regular.ttf'),
    'Georgia-Bold': require('../assets/fonts/Neuton/Neuton-Bold.ttf'),
    'Georgia-Italic': require('../assets/fonts/Neuton/Neuton-Italic.ttf'),
    'Georgia-Light': require('../assets/fonts/Neuton/Neuton-Light.ttf'),
    //equire('../assets/fonts/Neuton/Neuton-Regular.ttf'),
    //'Georgia-Bold': require('../assets/fonts/Neuton/Neuton-Bold.ttf'),
    //'Georgia-Italic': require('../assets/fonts/Neuton/Neuton-Italic.ttf'),
    //'Georgia-Light': require('../assets/fonts/Neuton/Neuton-Light.ttf'),
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

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <CalendarProvider>
          <BibleProvider>
            <RootLayoutNav />
          </BibleProvider>
        </CalendarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { colorScheme } = useTheme();

  return (
    <SafeAreaProvider>
      <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false,
            headerBackButtonDisplayMode: "minimal", }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="auth" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
      </NavigationThemeProvider>
    </SafeAreaProvider>
  );
}
