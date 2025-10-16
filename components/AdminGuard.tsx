import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from './ThemeProvider';
import { Colors } from '../constants/Colors';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Component to protect admin routes
 * Redirects non-admin users to profile page
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, error } = useAdminAuth();
  const { colorScheme } = useTheme();

  const loading = authLoading || adminLoading;

  useEffect(() => {
    // Only redirect after loading is complete
    if (!loading) {
      if (!user) {
        // Not logged in - redirect to auth
        router.replace('/auth');
      } else if (!isAdmin) {
        // Logged in but not admin - redirect to profile
        router.replace('/profile');
      }
    }
  }, [user, isAdmin, loading]);

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Verifying admin access...
        </Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
          {error}
        </Text>
      </View>
    );
  }

  // User is admin - render children
  if (user && isAdmin) {
    return <>{children}</>;
  }

  // Default: show nothing while redirecting
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
});

