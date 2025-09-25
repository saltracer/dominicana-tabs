import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface LiturgyPreferencesToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: string;
  disabled?: boolean;
}

export default function LiturgyPreferencesToggle({
  label,
  description,
  value,
  onValueChange,
  icon,
  disabled = false,
}: LiturgyPreferencesToggleProps) {
  const { colorScheme } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: Colors[colorScheme ?? 'light'].card,
        borderColor: Colors[colorScheme ?? 'light'].border,
        opacity: disabled ? 0.6 : 1,
      }
    ]}>
      <View style={styles.content}>
        <View style={styles.leftContent}>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={20} 
              color={Colors[colorScheme ?? 'light'].primary} 
              style={styles.icon}
            />
          )}
          <View style={styles.textContent}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              {label}
            </Text>
            {description && (
              <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {description}
              </Text>
            )}
          </View>
        </View>
        <Switch
          testID="switch"
          value={value}
          onValueChange={onValueChange}
          trackColor={{ 
            false: Colors[colorScheme ?? 'light'].border, 
            true: Colors[colorScheme ?? 'light'].primary 
          }}
          thumbColor={Colors[colorScheme ?? 'light'].dominicanWhite}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});