import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          onRetry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const { colorScheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={[styles.errorCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <Ionicons 
          name="warning-outline" 
          size={48} 
          color={Colors[colorScheme ?? 'light'].error || '#FF6B6B'} 
          style={styles.errorIcon}
        />
        
        <Text style={[styles.errorTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Something went wrong
        </Text>
        
        <Text style={[styles.errorMessage, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          {error?.message || 'An unexpected error occurred while loading the content.'}
        </Text>
        
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Georgia',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: 'Georgia',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});

export default ErrorBoundaryClass;
