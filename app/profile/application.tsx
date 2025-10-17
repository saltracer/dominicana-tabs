import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';

// Native users should use the main profile modal
// This redirects to the parent profile route
export default function ApplicationSettingsNative() {
  useEffect(() => {
    router.replace('/profile');
  }, []);

  return (
    <View style={styles.container}>
      <Text>Redirecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

