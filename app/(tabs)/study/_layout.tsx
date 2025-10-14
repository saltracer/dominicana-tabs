import { Stack } from 'expo-router';
import { View, Image, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { ReadingProgressProvider } from '../../../contexts/ReadingProgressContext';

export default function StudyLayout() {
  const { colorScheme } = useTheme();
  
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
            headerLeft: () => (
              <View style={{ marginLeft: 15, flexDirection: 'row', alignItems: 'center' }}>
                <Image 
                  source={require('../../../assets/images/dominicana_logo.png')} 
                  style={{ width: 32, height: 32 }}
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
