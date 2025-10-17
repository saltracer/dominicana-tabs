import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
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

