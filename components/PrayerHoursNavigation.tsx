import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { HourType } from '../types';

interface PrayerHoursNavigationProps {
  currentHour: HourType;
}

const prayerHours = [
  { route: 'office-of-readings', name: 'Office', fullName: 'Office of Readings', icon: 'book', type: 'office_of_readings' as HourType, time: 'Any time', canonicalHour: 0 },
  { route: 'lauds', name: 'Lauds', fullName: 'Lauds (Morning Prayer)', icon: 'sunny', type: 'lauds' as HourType, time: '6:00 AM', canonicalHour: 6 },
  { route: 'terce', name: 'Terce', fullName: 'Terce (Mid-Morning)', icon: 'time', type: 'terce' as HourType, time: '9:00 AM', canonicalHour: 9 },
  { route: 'sext', name: 'Sext', fullName: 'Sext (Midday)', icon: 'sunny', type: 'sext' as HourType, time: '12:00 PM', canonicalHour: 12 },
  { route: 'none', name: 'None', fullName: 'None (Mid-Afternoon)', icon: 'time', type: 'none' as HourType, time: '3:00 PM', canonicalHour: 15 },
  { route: 'vespers', name: 'Vespers', fullName: 'Vespers (Evening Prayer)', icon: 'moon', type: 'vespers' as HourType, time: '6:00 PM', canonicalHour: 18 },
  { route: 'compline', name: 'Compline', fullName: 'Compline (Night Prayer)', icon: 'moon', type: 'compline' as HourType, time: '9:00 PM', canonicalHour: 21 },
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

export default function PrayerHoursNavigation({ currentHour }: PrayerHoursNavigationProps) {
  const { colorScheme } = useTheme();
  const [showQuickPicker, setShowQuickPicker] = useState(false);
  const currentCanonicalHour = getCurrentCanonicalHour();

  // No auto-scroll - let the user manually scroll if needed

  const getHourStatus = (hourType: HourType) => {
    const isActive = hourType === currentHour;
    const isCompleted = mockProgress[hourType];
    const isCurrent = hourType === currentCanonicalHour;
    const now = new Date().getHours();
    const hourData = prayerHours.find(h => h.type === hourType);
    const isPast = hourData && hourData.canonicalHour > 0 && now > hourData.canonicalHour + 3; // 3 hour grace period
    
    return { isActive, isCompleted, isCurrent, isPast };
  };

  const handleLongPress = (hour: typeof prayerHours[0]) => {
    Alert.alert(
      hour.fullName,
      `Traditional time: ${hour.time}\n\nTap to navigate to this prayer hour.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Prayer', onPress: () => router.replace(`/(tabs)/prayer/liturgy-hours/${hour.route}` as any) },
      ]
    );
  };

  return (
    <View style={[styles.prayerHoursNav, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
      {/* Time indicator */}
      <View style={styles.timeIndicator}>
        <Text style={[styles.timeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Current Hour: {prayerHours.find(h => h.type === currentCanonicalHour)?.fullName}
        </Text>
      </View>

      <View style={styles.navContainer}>
        {prayerHours.map((hour) => {
          const { isActive, isCompleted, isCurrent, isPast } = getHourStatus(hour.type);
          
          return (
            <TouchableOpacity
              key={hour.route}
              style={[
                styles.navHour,
                { 
                  backgroundColor: isActive 
                    ? Colors[colorScheme ?? 'light'].primary 
                    : Colors[colorScheme ?? 'light'].card,
                  borderColor: isCurrent && !isActive
                    ? Colors[colorScheme ?? 'light'].secondary
                    : Colors[colorScheme ?? 'light'].border,
                  borderWidth: isCurrent && !isActive ? 2 : 1,
                  opacity: isPast && !isActive ? 0.6 : 1,
                  transform: [{ scale: isActive ? 1.05 : isCurrent ? 1.02 : 1 }],
                }
              ]}
              onPress={() => router.replace(`/(tabs)/prayer/liturgy-hours/${hour.route}` as any)}
              onLongPress={() => handleLongPress(hour)}
              activeOpacity={0.7}
            >
              {/* Progress indicator dot */}
              {isCompleted && (
                <View style={[styles.progressDot, { backgroundColor: Colors[colorScheme ?? 'light'].success || '#4CAF50' }]} />
              )}
              
              {/* Current hour badge */}
              {isCurrent && !isActive && (
                <View style={[styles.currentBadge, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}>
                  <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].background }]}>Now</Text>
                </View>
              )}

              <Ionicons 
                name={hour.icon as any} 
                size={16} 
                color={isActive 
                  ? Colors[colorScheme ?? 'light'].background 
                  : Colors[colorScheme ?? 'light'].primary
                }
              />
              <Text style={[
                styles.navHourText,
                { 
                  color: isActive 
                    ? Colors[colorScheme ?? 'light'].background 
                    : Colors[colorScheme ?? 'light'].text,
                  fontWeight: isCurrent ? '700' : '600',
                }
              ]}>
                {hour.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick picker button */}
      <TouchableOpacity 
        style={[styles.quickPickerButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
        onPress={() => setShowQuickPicker(true)}
      >
        <Ionicons name="list" size={16} color={Colors[colorScheme ?? 'light'].primary} />
      </TouchableOpacity>

      {/* Quick picker modal */}
      <Modal
        visible={showQuickPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuickPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowQuickPicker(false)}
        >
          <View style={[styles.quickPickerModal, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Choose Prayer Hour
            </Text>
            {prayerHours.map((hour) => {
              const { isActive, isCompleted, isCurrent } = getHourStatus(hour.type);
              return (
                <TouchableOpacity
                  key={hour.route}
                  style={[styles.modalHourItem, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}
                  onPress={() => {
                    setShowQuickPicker(false);
                    router.push(`/(tabs)/prayer/liturgy-hours/${hour.route}` as any);
                  }}
                >
                  <View style={styles.modalHourContent}>
                    <Ionicons name={hour.icon as any} size={20} color={Colors[colorScheme ?? 'light'].primary} />
                    <View style={styles.modalHourText}>
                      <Text style={[styles.modalHourName, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {hour.fullName}
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
    </View>
  );
}

const styles = StyleSheet.create({
  prayerHoursNav: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
    position: 'relative',
  },
  timeIndicator: {
    marginBottom: 8,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  navContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    gap: 8,
    justifyContent: 'center',
  },
  navHour: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    position: 'relative',
    minWidth: 75,
  },
  navHourText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  progressDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -12 }],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  quickPickerButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
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
