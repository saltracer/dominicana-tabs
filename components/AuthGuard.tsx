import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { colorScheme } = useTheme();
  
  try {
    const { loading } = useAuth();
    
    if (loading) {
      return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <Text style={[styles.text, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading...
          </Text>
        </View>
      );
    }
    
    return <>{children}</>;
  } catch (error) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Authentication Error: {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    color: 'red',
  },
});
