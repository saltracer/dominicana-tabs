import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs, usePathname } from 'expo-router';
import { Pressable, View, StyleSheet, Image, Text, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/styles/GlobalStyles';
import { useTheme } from '@/components/ThemeProvider';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useCalendar } from '@/components/CalendarContext';
import { useScrollContext, ScrollProvider } from '@/contexts/ScrollContext';
import FeastBanner from '@/components/FeastBanner';
import { ReadingProvider, useReading } from '@/contexts/ReadingContext';
import { getTabBarStyle } from '@/utils/tabBarStyles';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function IoniconsTabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

function TabLayoutContent() {
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { liturgicalDay } = useCalendar();
  const pathname = usePathname();
  const { isReading } = useReading();
  const { shouldHideUI, bottomNavTranslateY, feastBannerTranslateY } = useScrollContext();
  
  // Check if we're in a book reader (hide feast banner when reading)
  const isInBookReader = isReading;
  
  // Check if we're in liturgy hours (where scroll-based UI hiding applies)
  const isInLiturgyHours = pathname.includes('/prayer/liturgy-hours/');
  
  

  return (
    <View style={styles.container}>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].text,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].textMuted,
        tabBarStyle: {
          ...getTabBarStyle({
            colorScheme: colorScheme ?? 'light',
            insets,
          }),
          // Apply scroll-based animation only in liturgy hours
          ...(isInLiturgyHours && {
            transform: [{ translateY: bottomNavTranslateY }],
          })
        },
        tabBarLabelStyle: {
          fontFamily: 'System',
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].surface,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        headerTitleStyle: {
          fontFamily: 'System',
          fontWeight: '700',
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="prayer"
        options={{
          title: 'Prayer',
          headerShown: false, // Stack navigator handles headers for prayer screens
          tabBarIcon: ({ color, focused }) => (
            <IoniconsTabBarIcon 
              name={focused ? "heart" : "heart-outline"} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          headerShown: false, // Stack navigator handles headers for study screens
          tabBarIcon: ({ color, focused }) => (
            <IoniconsTabBarIcon 
              name={focused ? "library" : "library-outline"} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          headerShown: false, // Stack navigator handles headers for community screens
          tabBarIcon: ({ color, focused }) => (
            <IoniconsTabBarIcon 
              name={focused ? "people" : "people-outline"} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="preaching"
        options={{
          title: 'Preaching',
          headerShown: false, // Stack navigator handles headers for preaching screens
          tabBarIcon: ({ color, focused }) => (
            <IoniconsTabBarIcon 
              name={focused ? "chatbubble" : "chatbubble-outline"} 
              color={color} 
            />
          ),
        }}
      />

      </Tabs>
      
      {/* Feast Banner positioned above tab bar - hide when in book reader */}
      {liturgicalDay && !isInBookReader && (
        <Animated.View 
          style={[
            styles.feastBannerContainer, 
            { bottom: 60 + Math.max(insets.bottom, 10) },
            // Apply scroll-based animation only in liturgy hours
            isInLiturgyHours && {
              transform: [{ translateY: feastBannerTranslateY }],
            }
          ]}
        >
          <FeastBanner liturgicalDay={liturgicalDay} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  // container: {
  //   flex: 1,
  // },
  feastBannerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999, // Lower than tab bar
  },
  headerLogoContainer: {
    marginLeft: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerLogo: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
  },
});

export default function TabLayout() {
  return (
    <ReadingProvider>
      <ScrollProvider>
        <TabLayoutContent />
      </ScrollProvider>
    </ReadingProvider>
  );
}
