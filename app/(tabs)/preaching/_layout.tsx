import { Stack } from 'expo-router';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { useTheme } from '../../../components/ThemeProvider';
import { useProfilePanel } from '../../../contexts/ProfilePanelContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Colors } from '../../../constants/Colors';

export default function PreachingLayout() {
  const { colorScheme } = useTheme();
  const { openPanel } = useProfilePanel();
  const { user } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  
  // Memoize header components to prevent re-renders
  const headerLeftComponent = useMemo(() => (
    <TouchableOpacity 
      style={{ 
        marginLeft: 15,
        alignItems: 'center', 
        backgroundColor: 'transparent',
      }}
      onPress={() => {
        // Navigate to prayer tab - use router to switch tabs
        router.replace('/(tabs)/prayer' as any);
      }}
      activeOpacity={0.6}
      accessibilityLabel="Go to home"
      accessibilityRole="button"
    >
      <Image 
        source={require('../../../assets/images/dominicana_logo.png')} 
        style={{ 
          width: 24, 
          height: 24,
          backgroundColor: 'transparent',
        }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  ), [router, navigation]);

  const headerRightComponent = useMemo(() => (
    <TouchableOpacity 
      onPress={() => {
        if (user) {
          openPanel('quick');
        } else {
          router.push('/auth');
        }
      }}
      style={{ marginRight: 15 }}
      activeOpacity={0.6}
    >
      <Ionicons
        name="person-circle"
        size={28}
        color={user ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].text}
      />
    </TouchableOpacity>
  ), [colorScheme, openPanel, user, router]);
  
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
          headerTitle: 'Preaching',
          headerLeft: () => headerLeftComponent,
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="podcasts" 
        options={{
          headerTitle: 'Podcasts',
          headerBackTitle: '',
          headerLeft: () => headerLeftComponent,
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="blogs" 
        options={{
          headerTitle: 'Blogs',
          headerBackTitle: '',
          headerLeft: () => headerLeftComponent,
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="podcast/[id]" 
        options={{
          headerTitle: 'Podcast',
          headerBackTitle: '',
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="episode/[id]" 
        options={{
          headerTitle: 'Episode',
          headerBackTitle: '',
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="queue" 
        options={{
          headerTitle: 'Queue',
          headerBackTitle: '',
          headerLeft: () => headerLeftComponent,
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="playlists" 
        options={{
          headerTitle: 'Playlists',
          headerBackTitle: '',
          headerLeft: () => headerLeftComponent,
          headerRight: () => headerRightComponent,
        }}
      />
      <Stack.Screen 
        name="playlists/[id]" 
        options={{
          headerBackTitle: '',
          headerRight: () => headerRightComponent,
        }}
      />
    </Stack>
  );
}

