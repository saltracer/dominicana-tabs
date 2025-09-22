import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { HourType } from '../types';

interface PrayerHourPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentHour: HourType;
}

const prayerHours = [
  { route: 'office-of-readings', name: 'Office of Readings', icon: 'book', type: 'office_of_readings' as HourType, time: 'Any time', canonicalHour: 0 },
  { route: 'lauds', name: 'Lauds', icon: 'sunny', type: 'lauds' as HourType, time: '6:00 AM', canonicalHour: 6 },
  { route: 'terce', name: 'Terce', icon: 'time', type: 'terce' as HourType, time: '9:00 AM', canonicalHour: 9 },
  { route: 'sext', name: 'Sext', icon: 'sunny', type: 'sext' as HourType, time: '12:00 PM', canonicalHour: 12 },
  { route: 'none', name: 'None', icon: 'time', type: 'none' as HourType, time: '3:00 PM', canonicalHour: 15 },
  { route: 'vespers', name: 'Vespers', icon: 'moon', type: 'vespers' as HourType, time: '6:00 PM', canonicalHour: 18 },
  { route: 'compline', name: 'Compline', icon: 'moon', type: 'compline' as HourType, time: '9:00 PM', canonicalHour: 21 },
];

// Get current canonical hour based on time
const getCurrentCanonicalHour = (): HourType => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 6 && hour < 12) return 'lauds';
  if (hour >= 12 && hour < 15) return 'sext';
  if (hour >= 15 && hour < 18) return 'none';
  if (hour >= 18 && hour < 21) return 'vespers';
  return 'compline';
};

// Mock progress data - in real app, this would come from storage/context
const mockProgress = {
  'office_of_readings': false,
  'lauds': true,
  'terce': false,
  'sext': false,
  'none': false,
  'vespers': false,
  'compline': false,
};

export default function PrayerHourPickerModal({ visible, onClose, currentHour }: PrayerHourPickerModalProps) {
  const { colorScheme } = useTheme();
  const currentCanonicalHour = getCurrentCanonicalHour();

  const getHourStatus = (hourType: HourType) => {
    const isActive = hourType === currentHour;
    const isCompleted = mockProgress[hourType];
    const isCurrent = hourType === currentCanonicalHour;
    const now = new Date().getHours();
    const hourData = prayerHours.find(h => h.type === hourType);
    const isPast = hourData && hourData.canonicalHour > 0 && now > hourData.canonicalHour + 3; // 3 hour grace period
    
    return { isActive, isCompleted, isCurrent, isPast };
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <View style={[styles.quickPickerModal, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          {/* <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Choose Prayer Hour
          </Text> */}
          {prayerHours.map((hour) => {
            const { isActive, isCompleted, isCurrent, isPast } = getHourStatus(hour.type);
            return (
              <TouchableOpacity
                key={hour.route}
                style={[
                  styles.modalHourItem, 
                  { 
                    borderBottomColor: Colors[colorScheme ?? 'light'].border,
                    backgroundColor: isActive ? Colors[colorScheme ?? 'light'].primary + '10' : 'transparent',
                  }
                ]}
                onPress={() => {
                  onClose();
                  router.push(`/(tabs)/prayer/liturgy-hours/${hour.route}` as any);
                }}
              >
                <View style={styles.modalHourContent}>
                  <Ionicons 
                    name={hour.icon as any} 
                    size={20} 
                    color={isActive 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].primary
                    } 
                  />
                  <View style={styles.modalHourText}>
                    <Text style={[
                      styles.modalHourName, 
                      { 
                        color: isActive 
                          ? Colors[colorScheme ?? 'light'].primary 
                          : Colors[colorScheme ?? 'light'].text,
                        fontWeight: isActive ? '700' : '600',
                      }
                    ]}>
                      {hour.name}
                    </Text>
                    <Text style={[styles.modalHourTime, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {hour.time}
                    </Text>
                  </View>
                  <View style={styles.modalHourBadges}>
                    {isCompleted && (
                      <Ionicons name="checkmark-circle" size={16} color={Colors[colorScheme ?? 'light'].success || '#4CAF50'} />
                    )}
                    {isCurrent && (
                      <Text style={[styles.modalCurrentBadge, { color: Colors[colorScheme ?? 'light'].secondary }]}>Now</Text>
                    )}
                    {isActive && (
                      <Text style={[styles.modalActiveBadge, { color: Colors[colorScheme ?? 'light'].primary }]}>Active</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickPickerModal: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalHourItem: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  modalHourContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHourText: {
    flex: 1,
    marginLeft: 12,
  },
  modalHourName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  modalHourTime: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 2,
  },
  modalHourBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalCurrentBadge: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  modalActiveBadge: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
});
