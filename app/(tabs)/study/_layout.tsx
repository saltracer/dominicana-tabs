import { Stack } from 'expo-router';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { ReadingProgressProvider } from '../../../contexts/ReadingProgressContext';

export default function StudyLayout() {
  const { colorScheme } = useTheme();
  
  return (
    <ReadingProgressProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="bible" />
        <Stack.Screen 
          name="book/[id]" 
          options={{
            headerBackTitle: '', // Remove back button text
          }}
        />
      </Stack>
    </ReadingProgressProvider>
  );
}
