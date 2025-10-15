import { Stack, router } from 'expo-router';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { ReadingProgressProvider } from '../../../contexts/ReadingProgressContext';

export default function StudyLayout() {
  const { colorScheme } = useTheme();
  
  // Memoize header components to prevent re-renders
  const headerLeftComponent = useMemo(() => (
    <View style={{ 
      // marginLeft: 15, 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: 'transparent',
      borderWidth: 0,
    }}>
      <Image 
        source={require('../../../assets/images/dominicana_logo.png')} 
        style={{ 
          width: 32, 
          height: 32,
          backgroundColor: 'transparent',
        }}
        resizeMode="contain"
      />
    </View>
  ), []);

  const headerRightComponent = useMemo(() => (
    <TouchableOpacity 
      onPress={() => router.push('/profile')}
      style={{ /* marginRight: 15 */ }}
      activeOpacity={0.6}
    >
      <Ionicons
        name="person-circle"
        size={28}
        color={Colors[colorScheme ?? 'light'].text}
      />
    </TouchableOpacity>
  ), [colorScheme]);
  
  return (
    <ReadingProgressProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackTitle: '', // Remove back button text globally
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
          headerTitleStyle: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          contentStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background }
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{
            headerTitle: 'Study', // Use headerTitle for the actual display
            headerBackButtonDisplayMode: "minimal",
            headerLeft: () => headerLeftComponent,
            headerRight: () => headerRightComponent,
          }}
        />
        <Stack.Screen 
          name="bible" 
          options={{
            headerShown: false, // Bible has its own header handling
          }}
        />
        <Stack.Screen 
          name="book/[id]" 
          options={{
            headerShown: true,
            headerBackTitle: '', // Just show back arrow, no text
            headerBackTitleStyle: { fontSize: 0 }, // Force hide if text persists
            presentation: 'card',
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
    </ReadingProgressProvider>
  );
}
