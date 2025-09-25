import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface SettingsCardProps {
  title: string;
  description?: string;
  preview?: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function SettingsCard({
  title,
  description,
  preview,
  icon,
  onPress,
  disabled = false,
}: SettingsCardProps) {
  const { colorScheme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme ?? 'light'].card,
          borderColor: Colors[colorScheme ?? 'light'].border,
          opacity: disabled ? 0.6 : 1,
        }
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: Colors[colorScheme ?? 'light'].primary + '15' }
          ]}>
            <Ionicons 
              name={icon as any} 
              size={20} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              {title}
            </Text>
            {description && (
              <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {description}
              </Text>
            )}
            {preview && (
              <Text style={[styles.preview, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {preview}
              </Text>
            )}
          </View>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={Colors[colorScheme ?? 'light'].textSecondary} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  preview: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
