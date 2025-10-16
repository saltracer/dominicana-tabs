import React, { useEffect, useRef } from 'react';
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
 * Component to protect admin routes (Web version)
 * Redirects non-admin users to profile page
 * Only shows loading screen on initial verification
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading, error } = useAdminAuth();
  const { colorScheme } = useTheme();
  const hasRenderedContentRef = useRef(false);

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
      } else {
        // User is admin - mark that we've rendered content
        hasRenderedContentRef.current = true;
      }
    }
  }, [user, isAdmin, loading]);

  // Show loading state ONLY on initial load
  // Once content has been rendered, keep showing it even during re-verification
  if (loading && !hasRenderedContentRef.current) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Verifying admin access...
        </Text>
      </View>
    );
  }

  // Show error state only if we haven't rendered content yet
  if (error && !hasRenderedContentRef.current) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
          {error}
        </Text>
        <Text style={[styles.errorSubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Please contact your administrator if you believe this is an error.
        </Text>
      </View>
    );
  }

  // User is admin - render children
  // Keep rendering even if re-verifying to prevent form data loss
  if (user && (isAdmin || hasRenderedContentRef.current)) {
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
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
});

