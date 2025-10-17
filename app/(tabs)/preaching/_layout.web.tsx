import { Stack } from 'expo-router';

export default function PreachingLayoutWeb() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide headers on web - web layout handles navigation
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}

