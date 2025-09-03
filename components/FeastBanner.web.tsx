import React, { useState, useEffect } from 'react';
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
import { Celebration } from '../types/celebrations-types';
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

  // Get the primary feast (highest rank feast)
  const primaryFeast = liturgicalDay.feasts.find(f => f.rank === 'Solemnity' || f.rank === 'Feast') || liturgicalDay.feasts[0];

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

  const getFeastDisplayName = (feast: Celebration) => {
    if (feast.isDominican) {
      return `${feast.name}, OP`;
    }
    return feast.name;
  };

  const getFeastRankText = (feast: Celebration) => {
    if (feast.isDominican) {
      return 'Dominican Saint';
    }
    return feast.rank;
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: Colors[colorScheme ?? 'light'].surface,
        borderColor: Colors[colorScheme ?? 'light'].border,
      }
    ]}>
              {/* Season Color Bar */}
        <View 
          style={[
            styles.seasonColorBar, 
            { backgroundColor: getSeasonColor(liturgicalDay.season.name) }
          ]} 
        />
      
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
              <Text style={[
                styles.dateText, 
                { color: Colors[colorScheme ?? 'light'].text }
              ]}>
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
              <View style={styles.feastRow}>
                <View style={[
                  styles.rankContainer, 
                  { 
                    backgroundColor: primaryFeast.color || '#2E7D32',
                    borderWidth: (primaryFeast.color === '#FFFFFF' || primaryFeast.color === 'white') ? 1 : 0,
                    borderColor: (primaryFeast.color === '#FFFFFF' || primaryFeast.color === 'white') ? '#000000' : 'transparent'
                  }
                ]}>
                  <Text style={[
                    styles.rankText, 
                    { 
                      color: (primaryFeast.color === '#FFFFFF' || primaryFeast.color === 'white') 
                        ? '#000000' 
                        : Colors[colorScheme ?? 'light'].dominicanWhite 
                    }
                  ]}>
                    {primaryFeast.rank}
                  </Text>
                </View>
                <View style={styles.feastTextContainer}>
                  <Text style={[
                    styles.feastName, 
                    { color: Colors[colorScheme ?? 'light'].text }
                  ]} numberOfLines={1}>
                    {getFeastDisplayName(primaryFeast)}
                  </Text>
                  {primaryFeast.isDominican && (
                    <Text style={[styles.dominicanIndicator, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      Dominican
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Date Picker Modal */}
      {isDatePickerVisible && (
        <Modal
          visible={isDatePickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDatePickerVisible(false)}
        >
          <View style={[
            styles.modalOverlay, 
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
          ]}>
            <View style={[
              styles.modalContent, 
              { backgroundColor: Colors[colorScheme ?? 'light'].surface }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={[
                  styles.modalTitle, 
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  Select Date
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsDatePickerVisible(false)}
                >
                  <Ionicons 
                    name="close" 
                    size={24} 
                    color={Colors[colorScheme ?? 'light'].text} 
                  />
                </TouchableOpacity>
              </View>
              
              <Calendar
                onDayPress={handleDateChange}
                markedDates={{
                  [format(selectedDate, 'yyyy-MM-dd')]: {
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
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '300',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
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
  datePickerButton: {
    padding: 8,
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
  feastRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  dominicanIndicator: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    marginTop: 2,
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
});
