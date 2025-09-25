import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

export interface DropdownOption {
  value: string | number;
  label: string;
  description?: string;
}

interface LiturgyPreferencesDropdownProps {
  label: string;
  description?: string;
  value: string | number;
  options: DropdownOption[];
  onValueChange: (value: string | number) => void;
  icon?: string;
  disabled?: boolean;
}

export default function LiturgyPreferencesDropdown({
  label,
  description,
  value,
  options,
  onValueChange,
  icon,
  disabled = false,
}: LiturgyPreferencesDropdownProps) {
  const { colorScheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<View>(null);

  const selectedOption = options.find(option => option.value === value);

  const handleOptionSelect = (optionValue: string | number) => {
    onValueChange(optionValue);
    setShowDropdown(false);
  };

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: Colors[colorScheme ?? 'light'].card,
        borderColor: Colors[colorScheme ?? 'light'].border,
        opacity: disabled ? 0.6 : 1,
      }
    ]} ref={dropdownRef}>
      <TouchableOpacity
        style={styles.content}
        onPress={() => !disabled && setShowDropdown(!showDropdown)}
        disabled={disabled}
      >
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
        <View style={styles.rightContent}>
          <Text style={[styles.value, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {selectedOption?.label || 'Select...'}
          </Text>
          <Ionicons 
            name={showDropdown ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={Colors[colorScheme ?? 'light'].textSecondary} 
            style={styles.chevron}
          />
        </View>
      </TouchableOpacity>

      {showDropdown && (
        <View style={[styles.dropdown, { 
          backgroundColor: Colors[colorScheme ?? 'light'].surface,
          borderColor: Colors[colorScheme ?? 'light'].border,
          shadowColor: Colors[colorScheme ?? 'light'].text,
        }]}>
          <ScrollView style={styles.optionsList} nestedScrollEnabled>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value.toString()}
                style={[
                  styles.optionItem,
                  {
                    backgroundColor: value === option.value 
                      ? Colors[colorScheme ?? 'light'].primary + '20'
                      : 'transparent',
                    borderLeftColor: value === option.value 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : 'transparent'
                  }
                ]}
                onPress={() => handleOptionSelect(option.value)}
                onMouseEnter={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.backgroundColor = Colors[colorScheme ?? 'light'].border + '40';
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== option.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionHeader}>
                    <Text style={[
                      styles.optionLabel,
                      { 
                        color: value === option.value 
                          ? Colors[colorScheme ?? 'light'].primary 
                          : Colors[colorScheme ?? 'light'].text 
                      }
                    ]}>
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color={Colors[colorScheme ?? 'light'].primary} 
                      />
                    )}
                  </View>
                  {option.description && (
                    <Text style={[styles.optionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {option.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
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
    position: 'relative',
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
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginRight: 8,
  },
  chevron: {
    marginLeft: 4,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    maxHeight: 300,
    zIndex: 1000,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderLeftWidth: 4,
    cursor: 'pointer',
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});