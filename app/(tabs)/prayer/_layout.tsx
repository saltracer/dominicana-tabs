import { Stack } from 'expo-router';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { useTheme } from '../../../components/ThemeProvider';
import { useProfilePanel } from '../../../contexts/ProfilePanelContext';
import { Colors } from '../../../constants/Colors';

export default function PrayerLayout() {
  const { colorScheme } = useTheme();
  const { openPanel } = useProfilePanel();
  
  // Memoize header components to prevent re-renders
  const headerLeftComponent = useMemo(() => (
    <View style={{ 
      marginLeft: 15,
      alignItems: 'center', 
      backgroundColor: 'transparent',
    }}>
      <Image 
        source={require('../../../assets/images/dominicana_logo.png')} 
        style={{ 
          width: 24, 
          height: 24,
          backgroundColor: 'transparent',
        }}
        resizeMode="contain"
      />
    </View>
  ), []);

  const headerRightComponent = useMemo(() => (
    <TouchableOpacity 
      onPress={() => openPanel('quick')}
      style={{ marginRight: 15 }}
      activeOpacity={0.6}
    >
      <Ionicons
        name="person-circle"
        size={28}
        color={Colors[colorScheme ?? 'light'].text}
      />
    </TouchableOpacity>
  ), [colorScheme, openPanel]);
  
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].surface,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        headerTitleStyle: {
          fontFamily: 'System',
          fontWeight: '700',
        },
        contentStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
        // Disable default animations - we'll handle them with custom wrapper
        animation: 'none',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          headerTitle: 'Prayer',
          headerLeft: () => headerLeftComponent,
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="liturgy" 
        options={{
          headerTitle: 'Liturgy of the Hours',
          headerBackTitle: '',
          headerLeft: () => headerLeftComponent,
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="rosary" 
        options={{
          headerTitle: 'Holy Rosary',
          headerBackTitle: '',
          headerLeft: () => headerLeftComponent,
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="devotions" 
        options={{
          headerTitle: 'Devotions',
          headerBackTitle: '',
          headerLeft: () => headerLeftComponent,
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="liturgy-hours" 
        options={{
          headerShown: false, // Nested Stack handles its own headers
        }}
      />
    </Stack>
  );
}
