import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, Link } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';
import Footer from '@/components/Footer.web';
import FeastBanner from '@/components/FeastBanner.web';
import LiturgicalCalendarService from '@/services/LiturgicalCalendar';
import { LiturgicalDay } from '@/types';

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
      <RootLayoutNav />
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { colorScheme } = useTheme();
  const [liturgicalDay, setLiturgicalDay] = useState<LiturgicalDay | null>(null);

  useEffect(() => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const today = new Date();
    const day = calendarService.getLiturgicalDay(today);
    setLiturgicalDay(day);
  }, []);

  const handleDateChange = (date: Date) => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const day = calendarService.getLiturgicalDay(date);
    setLiturgicalDay(day);
  };

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          {/* Top Navigation Bar */}
          <View style={styles.topNav}>
            <Link href="/" asChild>
              <TouchableOpacity style={styles.logoSection}>
                <View style={[styles.logoIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                  <Text style={[styles.logoIconText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>✝</Text>
                </View>
                <Text style={[styles.logoText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  Dominicana
                </Text>
              </TouchableOpacity>
            </Link>
            
            <View style={styles.navLinks}>
              <Link href="/(tabs)/prayer" asChild>
                <TouchableOpacity style={styles.navLink}>
                  <Text style={[styles.navLinkText, { color: Colors[colorScheme ?? 'light'].text }]}>Prayer</Text>
                  <Ionicons name="chevron-down" size={12} color={Colors[colorScheme ?? 'light'].text} />
                </TouchableOpacity>
              </Link>
              <Link href="/(tabs)/study" asChild>
                <TouchableOpacity style={styles.navLink}>
                  <Text style={[styles.navLinkText, { color: Colors[colorScheme ?? 'light'].text }]}>Study</Text>
                  <Ionicons name="chevron-down" size={12} color={Colors[colorScheme ?? 'light'].text} />
                </TouchableOpacity>
              </Link>
              <Link href="/(tabs)/community" asChild>
                <TouchableOpacity style={styles.navLink}>
                  <Text style={[styles.navLinkText, { color: Colors[colorScheme ?? 'light'].text }]}>Community</Text>
                  <Ionicons name="chevron-down" size={12} color={Colors[colorScheme ?? 'light'].text} />
                </TouchableOpacity>
              </Link>
              <Link href="/(tabs)/preaching" asChild>
                <TouchableOpacity style={styles.navLink}>
                  <Text style={[styles.navLinkText, { color: Colors[colorScheme ?? 'light'].text }]}>Preaching</Text>
                  <Ionicons name="chevron-down" size={12} color={Colors[colorScheme ?? 'light'].text} />
                </TouchableOpacity>
              </Link>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionIcon}>
                <Ionicons name="chatbubble-outline" size={20} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.signInButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Text style={[styles.signInText, { color: Colors[colorScheme ?? 'light'].text }]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Feast Banner */}
        {liturgicalDay && (
          <View style={styles.feastBannerContainer}>
            <FeastBanner 
              liturgicalDay={liturgicalDay} 
              onDateChange={handleDateChange}
            />
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
        </View>

        {/* Footer */}
        <Footer />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 64,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 32,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navLinkText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    padding: 8,
    marginRight: 16,
  },
  signInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  signInText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateArrow: {
    padding: 4,
    marginHorizontal: 6,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 6,
  },
  feastInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feastLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  feastName: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  feastInfoIcon: {
    padding: 2,
  },
  mainContent: {
    flex: 1,
  },
  feastBannerContainer: {
    paddingTop: 0,
    paddingBottom: 16,
  },
});
