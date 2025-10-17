import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeProvider';
import { Colors } from '@/constants/Colors';

export default function ProfileLayout() {
  const { colorScheme } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].surface,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Profile',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 15 }}
              activeOpacity={0.6}
            >
              <Ionicons name="chevron-back" size={28} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          ),
        }} 
      />
      <Stack.Screen 
        name="quick" 
        options={{ title: 'Quick Settings' }} 
      />
      <Stack.Screen 
        name="prayer" 
        options={{ title: 'Prayer Settings' }} 
      />
      <Stack.Screen 
        name="study" 
        options={{ title: 'Study Settings' }} 
      />
      <Stack.Screen 
        name="community" 
        options={{ title: 'Community Settings' }} 
      />
      <Stack.Screen 
        name="preaching" 
        options={{ title: 'Preaching Settings' }} 
      />
      <Stack.Screen 
        name="application" 
        options={{ title: 'Application Settings' }} 
      />
      <Stack.Screen 
        name="account" 
        options={{ title: 'Account' }} 
      />
    </Stack>
  );
}

