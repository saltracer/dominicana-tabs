import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
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
  const [showModal, setShowModal] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleOptionSelect = (optionValue: string | number) => {
    onValueChange(optionValue);
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderColor: Colors[colorScheme ?? 'light'].border,
            opacity: disabled ? 0.6 : 1,
          }
        ]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
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
          <View style={styles.rightContent}>
            <Text style={[styles.value, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {selectedOption?.label || 'Select...'}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color={Colors[colorScheme ?? 'light'].textSecondary} 
              style={styles.chevron}
            />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                {label}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
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
        </View>
      </Modal>
    </>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
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