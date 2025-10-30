import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface SpeedSelectorModalProps {
  visible: boolean;
  currentSpeed: number;
  onSelectSpeed: (speed: number) => void;
  onClose: () => void;
}

const SPEED_OPTIONS = [
  { value: 0.75, label: '0.75x - Slow' },
  { value: 1.0, label: '1.0x - Normal' },
  { value: 1.25, label: '1.25x - Slightly faster' },
  { value: 1.5, label: '1.5x - Fast' },
  { value: 1.75, label: '1.75x - Very fast' },
  { value: 2.0, label: '2.0x - Faster' },
  { value: 2.5, label: '2.5x - Very fast' },
  { value: 3.0, label: '3.0x - Fastest' },
];

export default function SpeedSelectorModal({ 
  visible, 
  currentSpeed, 
  onSelectSpeed, 
  onClose 
}: SpeedSelectorModalProps) {
  const { colorScheme } = useTheme();

  const handleSpeedSelect = (speed: number) => {
    onSelectSpeed(speed);
    onClose();
  };

  const renderSpeedOption = ({ item }: { item: typeof SPEED_OPTIONS[0] }) => {
    const isSelected = item.value === currentSpeed;
    
    return (
      <TouchableOpacity
        style={[
          styles.speedOption,
          { 
            backgroundColor: isSelected 
              ? Colors[colorScheme ?? 'light'].primary + '20'
              : Colors[colorScheme ?? 'light'].surface,
            borderColor: isSelected 
              ? Colors[colorScheme ?? 'light'].primary
              : Colors[colorScheme ?? 'light'].border,
          }
        ]}
        onPress={() => handleSpeedSelect(item.value)}
      >
        <Text style={[
          styles.speedOptionText,
          { 
            color: isSelected 
              ? Colors[colorScheme ?? 'light'].primary
              : Colors[colorScheme ?? 'light'].text
          }
        ]}>
          {item.label}
        </Text>
        {isSelected && (
          <Ionicons 
            name="checkmark" 
            size={20} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade" 
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[
          styles.modalContent,
          { backgroundColor: Colors[colorScheme ?? 'light'].surface }
        ]}>
          <View style={[
            styles.modalHeader,
            { borderBottomColor: Colors[colorScheme ?? 'light'].border }
          ]}>
            <Text style={[
              styles.modalTitle,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              Playback Speed
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons 
                name="close" 
                size={24} 
                color={Colors[colorScheme ?? 'light'].textSecondary} 
              />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={SPEED_OPTIONS}
            keyExtractor={(item) => item.value.toString()}
            renderItem={renderSpeedOption}
            style={styles.speedList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  closeButton: {
    padding: 4,
  },
  speedList: {
    maxHeight: 400,
  },
  speedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  speedOptionText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    flex: 1,
  },
});
