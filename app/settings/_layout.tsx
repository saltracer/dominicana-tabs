import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="quick" options={{ headerShown: false, title: 'Quick Settings' }} />
      <Stack.Screen name="language" options={{ headerShown: true, title: 'Language & Display' }} />
      <Stack.Screen name="audio" options={{ headerShown: true, title: 'Audio & Media' }} />
      <Stack.Screen name="calendar" options={{ headerShown: true, title: 'Calendar & Liturgy' }} />
      <Stack.Screen name="app" options={{ headerShown: true, title: 'App Settings' }} />
    </Stack>
  );
}
