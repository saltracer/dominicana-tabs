import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { HighlightColor } from '../types';

interface HighlightColorPickerProps {
  visible: boolean;
  selectedColor?: HighlightColor;
  onSelectColor: (color: HighlightColor) => void;
  onClose: () => void;
}

const HIGHLIGHT_COLORS: { color: HighlightColor; label: string }[] = [
  { color: 'yellow', label: 'Yellow' },
  { color: 'green', label: 'Green' },
  { color: 'blue', label: 'Blue' },
  { color: 'pink', label: 'Pink' },
  { color: 'red', label: 'Red' },
];

export const HighlightColorPicker: React.FC<HighlightColorPickerProps> = ({
  visible,
  selectedColor,
  onSelectColor,
  onClose,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSelectColor = (color: HighlightColor) => {
    onSelectColor(color);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Choose Highlight Color
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Color Options */}
            <ScrollView 
              style={styles.colorList}
              showsVerticalScrollIndicator={false}
            >
              {HIGHLIGHT_COLORS.map(({ color, label }) => {
                const isSelected = selectedColor === color;
                const highlightColor = colors.highlight[color];
                const highlightBg = colors.highlight[`${color}Bg` as keyof typeof colors.highlight];

                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { 
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      }
                    ]}
                    onPress={() => handleSelectColor(color)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.colorInfo}>
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: highlightBg as string }
                        ]}
                      >
                        <View
                          style={[
                            styles.colorSwatchInner,
                            { backgroundColor: highlightColor as string }
                          ]}
                        />
                      </View>
                      <Text style={[styles.colorLabel, { color: colors.text }]}>
                        {label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    maxHeight: '70%',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  closeButton: {
    padding: 4,
  },
  colorList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  colorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatchInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Georgia',
  },
});

