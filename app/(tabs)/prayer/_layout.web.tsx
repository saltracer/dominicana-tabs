import { Stack } from 'expo-router';

export default function PrayerLayoutWeb() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide headers on web - web layout handles navigation
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="liturgy" />
      <Stack.Screen name="rosary" />
      <Stack.Screen name="devotions" />
      <Stack.Screen name="liturgy-hours" />
    </Stack>
  );
}

