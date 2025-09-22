import { Stack } from 'expo-router';
import { useTheme } from '../../../../components/ThemeProvider';
import { Colors } from '../../../../constants/Colors';

export default function LiturgyHoursLayout() {
  const { colorScheme } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
        animation: 'none', // Disable slide transitions
        gestureEnabled: true, // Disable swipe gestures
      }}
    >
      <Stack.Screen name="office-of-readings" />
      <Stack.Screen name="lauds" />
      <Stack.Screen name="terce" />
      <Stack.Screen name="sext" />
      <Stack.Screen name="none" />
      <Stack.Screen name="vespers" />
      <Stack.Screen name="compline" />
    </Stack>
  );
}
