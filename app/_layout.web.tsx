import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, Link } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
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
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
  const dropdownRef = useRef<View>(null);

  useEffect(() => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const today = new Date();
    const day = calendarService.getLiturgicalDay(today);
    setLiturgicalDay(day);
  }, []);

  useEffect(() => {
    const handleGlobalClick = () => {
      setCommunityDropdownOpen(false);
    };

    if (communityDropdownOpen) {
      // Add a small delay to prevent immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('click', handleGlobalClick);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleGlobalClick);
      };
    }
  }, [communityDropdownOpen]);

  const handleDateChange = (date: Date) => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const day = calendarService.getLiturgicalDay(date);
    setLiturgicalDay(day);
  };

  const toggleCommunityDropdown = () => {
    setCommunityDropdownOpen(!communityDropdownOpen);
  };

  const closeCommunityDropdown = () => {
    setCommunityDropdownOpen(false);
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
              {/* Community Dropdown */}
              <View style={styles.dropdownContainer} ref={dropdownRef}>
                <TouchableOpacity 
                  style={styles.navLink}
                  onPress={toggleCommunityDropdown}
                >
                  <Text style={[styles.navLinkText, { color: Colors[colorScheme ?? 'light'].text }]}>Community</Text>
                  <Ionicons 
                    name={communityDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={12} 
                    color={Colors[colorScheme ?? 'light'].text} 
                  />
                </TouchableOpacity>
                
                {communityDropdownOpen && (
                  <View style={[styles.dropdownMenu, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
                    <Link href="/(tabs)/community/calendar" asChild>
                      <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={closeCommunityDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Calendar</Text>
                      </TouchableOpacity>
                    </Link>
                    <Link href="/(tabs)/community/saints" asChild>
                      <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={closeCommunityDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Saints</Text>
                      </TouchableOpacity>
                    </Link>
                    <Link href="/(tabs)/community/provinces" asChild>
                      <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={closeCommunityDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Provinces</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                )}
              </View>
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
          <Stack
            screenOptions={{
              headerShown: false,
            }}>
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
    zIndex: 10000,
    position: 'relative',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 64,
    zIndex: 10000,
    position: 'relative',
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
    zIndex: 10000,
    position: 'relative',
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
    zIndex: 1,
    position: 'relative',
  },
  dropdownContainer: {
    position: 'relative',
    marginHorizontal: 16,
    zIndex: 10001,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    minWidth: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 9999,
    marginTop: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
