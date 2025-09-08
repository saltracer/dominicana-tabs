import { Stack } from 'expo-router';
import { useTheme } from '../../../../components/ThemeProvider';
import { Colors } from '../../../../constants/Colors';

export default function BibleLayout() {
  const { colorScheme } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background }
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[bookCode]" />
      <Stack.Screen name="search" />
    </Stack>
  );
}
