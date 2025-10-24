import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, Link, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/components/ThemeProvider';
import { CalendarProvider, useCalendar } from '@/components/CalendarContext';
import { BibleProvider } from '@/contexts/BibleContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import FeastBanner from '@/components/FeastBanner.web';
import MobileMenu from '@/components/MobileMenu.web';
import LiturgicalCalendarService from '@/services/LiturgicalCalendar';
import { LiturgicalDay } from '@/types';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useIsMobile, useIsTablet, useIsDesktop, useMediaQuery } from '@/hooks/useMediaQuery';
import { useIsScrolled } from '@/hooks/useScrollPosition';

// Import web-specific CSS
if (Platform.OS === 'web') {
  require('./global.web.css');
}

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
  const { liturgicalDay } = useCalendar();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isCompactDesktop = !useMediaQuery(1100); // < 1100px gets tighter spacing
  const isNarrowTablet = useMediaQuery(820); // >= 820px shows logo text
  const isScrolled = useIsScrolled(10);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
  const [preachingDropdownOpen, setPreachingDropdownOpen] = useState(false);
  const [studyDropdownOpen, setStudyDropdownOpen] = useState(false);
  const [prayerDropdownOpen, setPrayerDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const communityDropdownRef = useRef<View>(null);
  const preachingDropdownRef = useRef<View>(null);
  const studyDropdownRef = useRef<View>(null);
  const prayerDropdownRef = useRef<View>(null);
  const userDropdownRef = useRef<View>(null);



  useEffect(() => {
    const handleGlobalClick = () => {
      setCommunityDropdownOpen(false);
      setPreachingDropdownOpen(false);
      setStudyDropdownOpen(false);
      setPrayerDropdownOpen(false);
      setUserDropdownOpen(false);
    };

    if (communityDropdownOpen || preachingDropdownOpen || studyDropdownOpen || prayerDropdownOpen || userDropdownOpen) {
      // Add a small delay to prevent immediate closure
      const timer = setTimeout(() => {
        document.addEventListener('click', handleGlobalClick);
      }, 100);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleGlobalClick);
      };
    }
  }, [communityDropdownOpen, preachingDropdownOpen, studyDropdownOpen, prayerDropdownOpen, userDropdownOpen]);



  const toggleCommunityDropdown = () => {
    setCommunityDropdownOpen(!communityDropdownOpen);
    // Close other dropdowns
    if (!communityDropdownOpen) {
      setPreachingDropdownOpen(false);
      setStudyDropdownOpen(false);
      setPrayerDropdownOpen(false);
      setUserDropdownOpen(false);
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
      setUserDropdownOpen(false);
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
      setUserDropdownOpen(false);
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
      setUserDropdownOpen(false);
    }
  };

  const closePrayerDropdown = () => {
    setPrayerDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    // Close other dropdowns
    if (!userDropdownOpen) {
      setCommunityDropdownOpen(false);
      setPreachingDropdownOpen(false);
      setStudyDropdownOpen(false);
      setPrayerDropdownOpen(false);
    }
  };

  const closeUserDropdown = () => {
    setUserDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      closeUserDropdown();
      // Navigation will happen automatically via auth state change
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        {/* Mobile Menu */}
        <MobileMenu visible={mobileMenuVisible} onClose={() => setMobileMenuVisible(false)} />

        {/* Header */}
        <View
          // @ts-ignore - className is web-only
          className={`header-sticky ${isScrolled ? 'header-scrolled' : ''}`}
          style={[
            styles.header,
            { backgroundColor: Colors[colorScheme ?? 'light'].surface },
            isScrolled && styles.headerScrolled,
          ]}
        >
          {/* Top Navigation Bar */}
          <View style={[styles.topNav, isScrolled && styles.topNavScrolled, isMobile && styles.topNavMobile, isTablet && styles.topNavTablet]}>
            {/* Mobile: Hamburger + Logo */}
            {isMobile && (
              <>
                <TouchableOpacity
                  style={styles.hamburgerButton}
                  onPress={() => setMobileMenuVisible(true)}
                  accessibilityLabel="Open navigation menu"
                  accessibilityRole="button"
                >
                  <Ionicons name="menu" size={28} color={Colors[colorScheme ?? 'light'].text} />
                </TouchableOpacity>
                <Link href="/" asChild>
                  <TouchableOpacity style={styles.logoSection}>
                    <View style={styles.logoIcon}>
                      <Image
                        source={require('../assets/images/dominicana_logo.png')}
                        style={[styles.logoImage, styles.logoImageMobile]}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={[styles.logoText, styles.logoTextMobile, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      Dominicana
                    </Text>
                  </TouchableOpacity>
                </Link>
              </>
            )}

            {/* Desktop/Tablet: Logo */}
            {!isMobile && (
              <Link href="/" asChild>
                <TouchableOpacity style={styles.logoSection}>
                  <View style={styles.logoIcon}>
                    <Image
                      source={require('../assets/images/dominicana_logo.png')}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  </View>
                  {/* Hide "Dominicana" text on narrow tablets (< 820px) */}
                  {isNarrowTablet && (
                    <Text style={[styles.logoText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      Dominicana
                    </Text>
                  )}
                </TouchableOpacity>
              </Link>
            )}

            {/* Desktop/Tablet: Navigation Links */}
            {!isMobile && <View style={Object.assign(
              {}, 
              styles.navLinks,
              isCompactDesktop ? styles.navLinksCompact : {},
              isTablet ? styles.navLinksTablet : {}
            )}>
              {/* Prayer Dropdown */}
              <View style={styles.dropdownContainer} ref={prayerDropdownRef}>
                <TouchableOpacity 
                  style={Object.assign(
                    {}, 
                    styles.navLink,
                    isCompactDesktop ? styles.navLinkCompact : {},
                    isTablet ? styles.navLinkTablet : {}
                  )}
                  onPress={togglePrayerDropdown}
                  accessibilityLabel="Prayer menu"
                  accessibilityRole="button"
                  accessibilityState={{ expanded: prayerDropdownOpen }}
                >
                  <Text style={Object.assign({}, styles.navLinkText, isTablet ? styles.navLinkTextTablet : {}, { color: Colors[colorScheme ?? 'light'].text })}>Prayer</Text>
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
                  style={Object.assign(
                    {}, 
                    styles.navLink,
                    isCompactDesktop ? styles.navLinkCompact : {},
                    isTablet ? styles.navLinkTablet : {}
                  )}
                  onPress={toggleStudyDropdown}
                  accessibilityLabel="Study menu"
                  accessibilityRole="button"
                  accessibilityState={{ expanded: studyDropdownOpen }}
                >
                  <Text style={Object.assign({}, styles.navLinkText, isTablet ? styles.navLinkTextTablet : {}, { color: Colors[colorScheme ?? 'light'].text })}>Study</Text>
                  <Ionicons 
                    name={studyDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={12} 
                    color={Colors[colorScheme ?? 'light'].text} 
                  />
                </TouchableOpacity>
                
                {studyDropdownOpen && (
                  <View style={[styles.dropdownMenu, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
                    <Link href="/(tabs)/study/bible" asChild>
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
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Bible</Text>
                      </div>
                    </Link>
                    <Link href="/(tabs)/study/library" asChild>
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
                  style={Object.assign(
                    {}, 
                    styles.navLink,
                    isCompactDesktop ? styles.navLinkCompact : {},
                    isTablet ? styles.navLinkTablet : {}
                  )}
                  onPress={toggleCommunityDropdown}
                  accessibilityLabel="Community menu"
                  accessibilityRole="button"
                  accessibilityState={{ expanded: communityDropdownOpen }}
                >
                  <Text style={Object.assign({}, styles.navLinkText, isTablet ? styles.navLinkTextTablet : {}, { color: Colors[colorScheme ?? 'light'].text })}>Community</Text>
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
                  style={Object.assign(
                    {}, 
                    styles.navLink,
                    isCompactDesktop ? styles.navLinkCompact : {},
                    isTablet ? styles.navLinkTablet : {}
                  )}
                  onPress={togglePreachingDropdown}
                  accessibilityLabel="Preaching menu"
                  accessibilityRole="button"
                  accessibilityState={{ expanded: preachingDropdownOpen }}
                >
                  <Text style={Object.assign({}, styles.navLinkText, isTablet ? styles.navLinkTextTablet : {}, { color: Colors[colorScheme ?? 'light'].text })}>Preaching</Text>
                  <Ionicons 
                    name={preachingDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={12} 
                    color={Colors[colorScheme ?? 'light'].text} 
                  />
                </TouchableOpacity>
                
                {preachingDropdownOpen && (
                  <View style={[styles.dropdownMenu, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
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
                      onClick={() => {
                        closePreachingDropdown();
                        router.push('/(tabs)/preaching/podcasts' as any);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Podcasts</Text>
                    </div>
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
                      onClick={() => {
                        closePreachingDropdown();
                        router.push('/(tabs)/preaching/blogs' as any);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Blog & Reflections</Text>
                    </div>
                  </View>
                )}
              </View>
            </View>}
            
            {/* Header Actions */}
            <View style={styles.headerActions}>
              {user ? (
                <View style={styles.dropdownContainer} ref={userDropdownRef}>
                  <TouchableOpacity 
                    style={[styles.signInButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                    onPress={toggleUserDropdown}
                    accessibilityLabel="User menu"
                    accessibilityRole="button"
                    accessibilityState={{ expanded: userDropdownOpen }}
                  >
                    <Ionicons name="person-circle-outline" size={20} color={Colors[colorScheme ?? 'light'].text} />
                    {/* Full Desktop only (≥ 1100px): Show name + chevron */}
                    {!isCompactDesktop && (
                      <>
                        <Text style={[styles.signInText, styles.profileButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                          {profile?.name || user.email?.split('@')[0] || 'Profile'}
                        </Text>
                        <Ionicons 
                          name={userDropdownOpen ? "chevron-up" : "chevron-down"} 
                          size={12} 
                          color={Colors[colorScheme ?? 'light'].text} 
                        />
                      </>
                    )}
                  </TouchableOpacity>
                  
                  {userDropdownOpen && (
                    <View style={[styles.dropdownMenu, styles.userDropdownMenu, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => {
                          closeUserDropdown();
                          router.push('/profile/quick' as any);
                        }}
                      >
                        <Ionicons name="settings-outline" size={18} color={Colors[colorScheme ?? 'light'].text} />
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Quick Settings</Text>
                      </div>
                      <div 
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid #F0F0F0',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => {
                          closeUserDropdown();
                          router.push('/profile/account' as any);
                        }}
                      >
                        <Ionicons name="person-outline" size={18} color={Colors[colorScheme ?? 'light'].text} />
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>View Profile</Text>
                      </div>
                      {isAdmin && (
                        <Link href="/admin" asChild>
                          <div 
                            style={{
                              padding: '12px 16px',
                              borderBottom: '2px solid #E0E0E0',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              transition: 'background-color 0.15s ease',
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: '10px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#F5F5F5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={closeUserDropdown}
                          >
                            <Ionicons name="shield-checkmark-outline" size={18} color={Colors[colorScheme ?? 'light'].text} />
                            <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Admin</Text>
                          </div>
                        </Link>
                      )}
                      <div 
                        style={{
                          padding: '12px 16px',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F5F5F5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={handleLogout}
                      >
                        <Ionicons name="log-out-outline" size={18} color={Colors[colorScheme ?? 'light'].text} />
                        <Text style={[styles.dropdownItemText, { color: Colors[colorScheme ?? 'light'].text }]}>Logout</Text>
                      </div>
                    </View>
                  )}
                </View>
              ) : (
                <Link href="/auth">
                  <View style={[styles.signInButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                    <Text style={[styles.signInText, { color: Colors[colorScheme ?? 'light'].text }]}>Sign In</Text>
                  </View>
                </Link>
              )}
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
          </Stack>
        </View>

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
    position: 'sticky',
    top: 0,
  },
  headerScrolled: {
    paddingVertical: 0,
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
  topNavScrolled: {
    paddingVertical: 12,
    minHeight: 56,
  },
  topNavTablet: {
    paddingHorizontal: 16, // Reduce from 24px to save space
  },
  topNavMobile: {
    paddingHorizontal: 16,
    minHeight: 56,
  },
  hamburgerButton: {
    padding: 8,
    marginRight: 8,
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
    overflow: 'hidden',
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  logoTextMobile: {
    fontSize: 20,
  },
  logoImageMobile: {
    width: 24,
    height: 24,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 32,
    zIndex: 10000,
    position: 'relative',
  },
  navLinksCompact: {
    marginHorizontal: 20, // Reduce from 32px for 997-1100px range
  },
  navLinksTablet: {
    marginHorizontal: 12, // Further reduce for tablets
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navLinkCompact: {
    marginHorizontal: 10, // Reduce from 16px for 997-1100px range
    paddingHorizontal: 8, // Reduce from 12px
  },
  navLinkTablet: {
    marginHorizontal: 8, // Further reduce for tablets
    paddingHorizontal: 6,
  },
  navLinkText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  navLinkTextTablet: {
    fontSize: 15, // Slightly smaller on tablet
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  profileButtonText: {
    marginLeft: 8,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    zIndex: 9999,
    marginTop: 8,
  },
  userDropdownMenu: {
    right: 0,
    left: 'auto',
    minWidth: 200,
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
