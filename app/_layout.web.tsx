import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, Link } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { CalendarProvider, useCalendar } from '@/components/CalendarContext';
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
      <CalendarProvider>
        <RootLayoutNav />
      </CalendarProvider>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
  const [preachingDropdownOpen, setPreachingDropdownOpen] = useState(false);
  const [studyDropdownOpen, setStudyDropdownOpen] = useState(false);
  const [prayerDropdownOpen, setPrayerDropdownOpen] = useState(false);
  const communityDropdownRef = useRef<View>(null);
  const preachingDropdownRef = useRef<View>(null);
  const studyDropdownRef = useRef<View>(null);
  const prayerDropdownRef = useRef<View>(null);



  useEffect(() => {
    const handleGlobalClick = () => {
      setCommunityDropdownOpen(false);
      setPreachingDropdownOpen(false);
      setStudyDropdownOpen(false);
      setPrayerDropdownOpen(false);
    };

    if (communityDropdownOpen || preachingDropdownOpen || studyDropdownOpen || prayerDropdownOpen) {
      // Add a small delay to prevent immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('click', handleGlobalClick);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleGlobalClick);
      };
    }
  }, [communityDropdownOpen, preachingDropdownOpen, studyDropdownOpen, prayerDropdownOpen]);



  const toggleCommunityDropdown = () => {
    setCommunityDropdownOpen(!communityDropdownOpen);
    // Close other dropdowns
    if (!communityDropdownOpen) {
      setPreachingDropdownOpen(false);
      setStudyDropdownOpen(false);
      setPrayerDropdownOpen(false);
    }
  };

  const closeCommunityDropdown = () => {
    setCommunityDropdownOpen(false);
  };

  const togglePreachingDropdown = () => {
    setPreachingDropdownOpen(!preachingDropdownOpen);
    // Close other dropdowns
    if (!preachingDropdownOpen) {
      setCommunityDropdownOpen(false);
      setStudyDropdownOpen(false);
      setPrayerDropdownOpen(false);
    }
  };

  const closePreachingDropdown = () => {
    setPreachingDropdownOpen(false);
  };

  const toggleStudyDropdown = () => {
    setStudyDropdownOpen(!studyDropdownOpen);
    // Close other dropdowns
    if (!studyDropdownOpen) {
      setCommunityDropdownOpen(false);
      setPreachingDropdownOpen(false);
      setPrayerDropdownOpen(false);
    }
  };

  const closeStudyDropdown = () => {
    setStudyDropdownOpen(false);
  };

  const togglePrayerDropdown = () => {
    setPrayerDropdownOpen(!prayerDropdownOpen);
    // Close other dropdowns
    if (!prayerDropdownOpen) {
      setCommunityDropdownOpen(false);
      setPreachingDropdownOpen(false);
      setStudyDropdownOpen(false);
    }
  };

  const closePrayerDropdown = () => {
    setPrayerDropdownOpen(false);
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
              {/* Prayer Dropdown */}
              <View style={styles.dropdownContainer} ref={prayerDropdownRef}>
                <TouchableOpacity 
                  style={styles.navLink}
                  onPress={togglePrayerDropdown}
                >
                  <Text style={[styles.navLinkText, { color: Colors[colorScheme ?? 'light'].text }]}>Prayer</Text>
                  <Ionicons 
                    name={prayerDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={12} 
                    color={Colors[colorScheme ?? 'light'].text} 
                  />
                </TouchableOpacity>
                
                {prayerDropdownOpen && (
                  <View style={[styles.dropdownMenu, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
                    
                    <Link href="/(tabs)/prayer/liturgy" asChild>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closePrayerDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Liturgy of the Hours</Text>
                      </div>
                    </Link>
                    <Link href="/(tabs)/prayer/rosary" asChild>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closePrayerDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Rosary</Text>
                      </div>
                    </Link>
                    <Link href="/(tabs)/prayer/devotions" asChild>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closePrayerDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Devotions</Text>
                      </div>
                    </Link>
                  </View>
                )}
              </View>
              {/* Study Dropdown */}
              <View style={styles.dropdownContainer} ref={studyDropdownRef}>
                <TouchableOpacity 
                  style={styles.navLink}
                  onPress={toggleStudyDropdown}
                >
                  <Text style={[styles.navLinkText, { color: Colors[colorScheme ?? 'light'].text }]}>Study</Text>
                  <Ionicons 
                    name={studyDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={12} 
                    color={Colors[colorScheme ?? 'light'].text} 
                  />
                </TouchableOpacity>
                
                {studyDropdownOpen && (
                  <View style={[styles.dropdownMenu, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
                    <Link href="/(tabs)/study" asChild>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closeStudyDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Courses</Text>
                      </div>
                    </Link>
                    <Link href="/(tabs)/study" asChild>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closeStudyDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Library</Text>
                      </div>
                    </Link>
                  </View>
                )}
              </View>
              {/* Community Dropdown */}
              <View style={styles.dropdownContainer} ref={communityDropdownRef}>
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
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closeCommunityDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Calendar</Text>
                      </div>
                    </Link>
                    <Link href="/(tabs)/community/saints" asChild>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closeCommunityDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Saints</Text>
                      </div>
                    </Link>
                    <Link href="/(tabs)/community/provinces" asChild>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closeCommunityDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Provinces</Text>
                      </div>
                    </Link>
                  </View>
                )}
              </View>
              {/* Preaching Dropdown */}
              <View style={styles.dropdownContainer} ref={preachingDropdownRef}>
                <TouchableOpacity 
                  style={styles.navLink}
                  onPress={togglePreachingDropdown}
                >
                  <Text style={[styles.navLinkText, { color: Colors[colorScheme ?? 'light'].text }]}>Preaching</Text>
                  <Ionicons 
                    name={preachingDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={12} 
                    color={Colors[colorScheme ?? 'light'].text} 
                  />
                </TouchableOpacity>
                
                {preachingDropdownOpen && (
                  <View style={[styles.dropdownMenu, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
                    <Link href="/(tabs)/preaching" asChild>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closePreachingDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Sermons</Text>
                      </div>
                    </Link>
                    <Link href="/(tabs)/preaching" asChild>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closePreachingDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Reflections</Text>
                      </div>
                    </Link>
                    <Link href="/(tabs)/preaching" asChild>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={closePreachingDropdown}
                      >
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Blog</Text>
                      </div>
                    </Link>
                  </View>
                )}
              </View>
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
    backgroundColor: 'transparent',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
