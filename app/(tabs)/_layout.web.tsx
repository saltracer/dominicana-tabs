import React from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';

export default function TabLayout() {
  const { colorScheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
        }}>
        <Stack.Screen
          name="prayer"
          options={{
            title: 'Prayer',
          }}
        />
        <Stack.Screen
          name="study"
          options={{
            title: 'Study',
          }}
        />
        <Stack.Screen
          name="community"
          options={{
            title: 'Community',
          }}
        />
        <Stack.Screen
          name="preaching"
          options={{
            title: 'Preaching',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    //paddingVertical: 32,
  },
});
