import { Stack } from 'expo-router';

export default function CommunityLayoutWeb() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide headers on web - web layout handles navigation
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="saints" />
      <Stack.Screen name="provinces" />
    </Stack>
  );
}

