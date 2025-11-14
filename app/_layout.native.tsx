import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { CalendarProvider } from '@/components/CalendarContext';
import { BibleProvider } from '@/contexts/BibleContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { RosaryPlayerProvider } from '@/contexts/RosaryPlayerContext';
import { PodcastPlayerProvider } from '@/contexts/PodcastPlayerContext';
import { ProfilePanelProvider } from '@/contexts/ProfilePanelContext';
import ProfilePanelContainer from '@/components/ProfilePanel/ProfilePanelContainer';
import { Provider as PaperProvider } from 'react-native-paper';

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
    <PaperProvider>
      <ThemeProvider>
        <AuthProvider>
          <CalendarProvider>
            <RosaryPlayerProvider>
              <PodcastPlayerProvider>
                <BibleProvider>
                  <ProfilePanelProvider>
                    <RootLayoutNav />
                    <ProfilePanelContainer />
                  </ProfilePanelProvider>
                </BibleProvider>
              </PodcastPlayerProvider>
            </RosaryPlayerProvider>
          </CalendarProvider>
        </AuthProvider>
      </ThemeProvider>
    </PaperProvider>
  );
}

function RootLayoutNav() {
  const { colorScheme } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false,
              headerBackButtonDisplayMode: "minimal", }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="auth" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </NavigationThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
