import { Stack } from 'expo-router';
import { ReadingProgressProvider } from '../../../contexts/ReadingProgressContext';

export default function StudyLayoutWeb() {
  return (
    <ReadingProgressProvider>
      <Stack
        screenOptions={{
          headerShown: false, // Hide headers on web - web layout handles navigation
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="library" />
        <Stack.Screen name="bible" />
        <Stack.Screen name="book/[id]" />
      </Stack>
    </ReadingProgressProvider>
  );
}

