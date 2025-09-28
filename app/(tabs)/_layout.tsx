import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs, usePathname } from 'expo-router';
import { Pressable, View, StyleSheet, Image, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/Colors';
import { GlobalStyles } from '@/styles/GlobalStyles';
import { useTheme } from '@/components/ThemeProvider';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useCalendar } from '@/components/CalendarContext';
import FeastBanner from '@/components/FeastBanner';
import { ReadingProvider, useReading } from '@/contexts/ReadingContext';

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
  
  // Check if we're in a book reader (hide feast banner when reading)
  const isInBookReader = isReading;

  return (
    <View style={styles.container}>
      <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].text,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].textMuted,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].surface,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
          height: 60 + Math.max(insets.bottom, 10),
          paddingHorizontal: 10,
          //marginBottom: liturgicalDay ? 60 : 0, // Add space for FeastBanner
          zIndex: 1001, // Ensure tab bar is above FeastBanner
          // iOS 26 specific fix: ensure tab bar stays within safe bounds
          ...(Platform.OS === 'ios' && {
           marginBottom: -1, // Add margin to position tab bar correctly
          }),
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
          tabBarIcon: ({ color, focused }) => (
            <IoniconsTabBarIcon 
              name={focused ? "heart" : "heart-outline"} 
              color={color} 
            />
          ),
          headerLeft: () => (
            <View style={styles.headerLogoContainer}>
              <Image 
                source={require('../../assets/images/dominicana_logo.png')} 
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          ),
          headerRight: () => (
            <Link href="/profile" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name="person-circle"
                    size={28}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Study',
          headerShown: !isInBookReader, // Hide header when in book reader
          tabBarIcon: ({ color, focused }) => (
            <IoniconsTabBarIcon 
              name={focused ? "library" : "library-outline"} 
              color={color} 
            />
          ),
          headerLeft: () => (
            <View style={styles.headerLogoContainer}>
              <Image 
                source={require('../../assets/images/dominicana_logo.png')} 
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          ),
          headerRight: () => (
            <Link href="/profile" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name="person-circle"
                    size={28}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <IoniconsTabBarIcon 
              name={focused ? "people" : "people-outline"} 
              color={color} 
            />
          ),
          headerLeft: () => (
            <View style={styles.headerLogoContainer}>
              <Image 
                source={require('../../assets/images/dominicana_logo.png')} 
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          ),
          headerRight: () => (
            <Link href="/profile" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name="person-circle"
                    size={28}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="preaching"
        options={{
          title: 'Preaching',
          tabBarIcon: ({ color, focused }) => (
            <IoniconsTabBarIcon 
              name={focused ? "chatbubble" : "chatbubble-outline"} 
              color={color} 
            />
          ),
          headerLeft: () => (
            <View style={styles.headerLogoContainer}>
              <Image 
                source={require('../../assets/images/dominicana_logo.png')} 
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>
          ),
          headerRight: () => (
            <Link href="/profile" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name="person-circle"
                    size={28}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      </Tabs>
      
      {/* Feast Banner positioned above tab bar - hide when in book reader */}
      {liturgicalDay && !isInBookReader && (
        <View style={[styles.feastBannerContainer, { bottom: 60 + Math.max(insets.bottom, 10) }]}>
          <FeastBanner liturgicalDay={liturgicalDay} />
        </View>
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
      <TabLayoutContent />
    </ReadingProvider>
  );
}
