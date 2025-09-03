import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { useCalendar } from './CalendarContext';
import { LiturgicalDay } from '../types';
import { parseISO, format } from 'date-fns';

interface FeastBannerProps {
  liturgicalDay: LiturgicalDay;
  showDatePicker?: boolean;
}

export default function FeastBanner({
  liturgicalDay,
  showDatePicker = true
}: FeastBannerProps) {
  const { colorScheme } = useTheme();
  const { selectedDate, setSelectedDate } = useCalendar();
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const navigateToPreviousDay = () => {
    const currentDate = parseISO(liturgicalDay.date);
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    setSelectedDate(previousDate);
  };

  const navigateToNextDay = () => {
    const currentDate = parseISO(liturgicalDay.date);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // const getSeasonEmoji = (season: string) => {
  //   switch (season.toLowerCase()) {
  //     case 'advent':
  //       return '🕯️';
  //     case 'christmas':
  //       return '⭐';
  //     case 'lent':
  //       return '🕊️';
  //     case 'easter':
  //       return '🌅';
  //     case 'pentecost':
  //       return '🔥';
  //     case 'ordinary':
  //       return '🌿';
  //     default:
  //       return '📖';
  //   }
  // };

  // const getFeastEmoji = (feast: Feast) => {
  //   if (feast.isDominican) return '⚫⚪';
  //   if (feast.rank === 'solemnity') return '👑';
  //   if (feast.rank === 'feast') return '⭐';
  //   if (feast.rank === 'memorial') return '🌹';
  //   return '📖';
  // };

  const getSeasonColor = (season: string) => {
    switch (season.toLowerCase()) {
      case 'advent':
        return '#4B0082'; // Purple
      case 'christmas':
        return '#FFFFFF'; // White
      case 'lent':
        return '#800080'; // Purple
      case 'easter':
        return '#FFFFFF'; // White
      case 'pentecost':
        return '#FF0000'; // Red
      case 'ordinary':
        return '#228B22'; // Green
      default:
        return '#228B22'; // Green
    }
  };

  const handleDateChange = (day: any) => {
    if (day) {
      // Use date-fns parseISO for clean date parsing
      const selectedDate = parseISO(day.dateString);
      setSelectedDate(selectedDate);
      setIsDatePickerVisible(false);
    }
  };

  const showDatePickerModal = () => {
    if (showDatePicker) {
      setIsDatePickerVisible(true);
    }
  };

  const primaryFeast = liturgicalDay.feasts.find(f => f.rank === 'Solemnity' || f.rank === 'Feast') || liturgicalDay.feasts[0];

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
      <View style={styles.bannerContent}>
        {/* Date/Feast Section with Navigation */}
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={navigateToPreviousDay}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={showDatePickerModal}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {format(parseISO(liturgicalDay.date), 'EEEE, MMM d, yyyy')}
              </Text>
            </TouchableOpacity>
            
            {/* Reset to Today Button - Only show if not on today's date */}
            {format(parseISO(liturgicalDay.date), 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => setSelectedDate(new Date())}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-undo" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={navigateToNextDay}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          </View>
          
          {primaryFeast && (
            <View style={styles.rightSection}>
              <Text style={[styles.feastName, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={1}>
                {primaryFeast.name}
              </Text>
              <Text style={[styles.feastRank, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {primaryFeast.rank}
                {primaryFeast.isDominican && ' • Dominican'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Liturgical Season Color Bar */}
      <View style={[
        styles.seasonColorBar,
        { backgroundColor: getSeasonColor(liturgicalDay.season.name) }
      ]} />

            {isDatePickerVisible && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
        >
          <View style={[
            styles.modalOverlay,
            { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }
          ]}>
            <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Select Date</Text>
                <TouchableOpacity
                  onPress={() => setIsDatePickerVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
                </TouchableOpacity>
              </View>

              <Calendar
                current={format(selectedDate, 'yyyy-MM-dd')}
                onDayPress={handleDateChange}
                markedDates={{
                  [selectedDate.toISOString().split('T')[0]]: {
                    selected: true,
                    selectedColor: Colors[colorScheme ?? 'light'].primary,
                  }
                }}
                theme={{
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  calendarBackground: Colors[colorScheme ?? 'light'].surface,
                  textSectionTitleColor: Colors[colorScheme ?? 'light'].text,
                  selectedDayBackgroundColor: Colors[colorScheme ?? 'light'].primary,
                  selectedDayTextColor: Colors[colorScheme ?? 'light'].dominicanWhite,
                  todayTextColor: Colors[colorScheme ?? 'light'].primary,
                  dayTextColor: Colors[colorScheme ?? 'light'].text,
                  textDisabledColor: Colors[colorScheme ?? 'light'].textMuted,
                  dotColor: Colors[colorScheme ?? 'light'].primary,
                  selectedDotColor: Colors[colorScheme ?? 'light'].dominicanWhite,
                  arrowColor: Colors[colorScheme ?? 'light'].primary,
                  monthTextColor: Colors[colorScheme ?? 'light'].text,
                  indicatorColor: Colors[colorScheme ?? 'light'].primary,
                  textDayFontFamily: 'Georgia',
                  textMonthFontFamily: 'Georgia',
                  textDayHeaderFontFamily: 'Georgia',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
                minDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />

              <View style={styles.modalFooter}>
                                  <TouchableOpacity
                    style={[styles.todayButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                    onPress={() => {
                      const today = new Date();
                      setSelectedDate(today);
                      setIsDatePickerVisible(false);
                    }}
                  >
                  <Text style={[styles.todayButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>Today</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerContent: {
    padding: 16,
  },
  seasonColorBar: {
    height: 4,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    flex: 1,
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  dateAndFeastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  seasonEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  seasonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  feastSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  feastInfo: {
    alignItems: 'center',
    marginTop: 4,
  },
  feastEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  feastTextContainer: {
    flex: 1,
  },
  feastName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  feastRank: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  additionalFeasts: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  additionalFeastsText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  closeButton: {
    padding: 4,
  },
  modalFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  todayButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
