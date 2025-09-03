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
import { LiturgicalDay, Feast } from '../types';
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSeasonEmoji = (season: string) => {
    switch (season.toLowerCase()) {
      case 'advent':
        return '🕯️';
      case 'christmas':
        return '⭐';
      case 'lent':
        return '🕊️';
      case 'easter':
        return '🌅';
      case 'pentecost':
        return '🔥';
      case 'ordinary':
        return '🌿';
      default:
        return '📖';
    }
  };

  const getFeastEmoji = (feast: Feast) => {
    if (feast.isDominican) return '⚫⚪';
    if (feast.rank === 'solemnity') return '👑';
    if (feast.rank === 'feast') return '⭐';
    if (feast.rank === 'memorial') return '🌹';
    return '📖';
  };

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

  // Get the primary feast (first feast in the array)
  const primaryFeast = liturgicalDay.feasts.length > 0 ? liturgicalDay.feasts[0] : null;

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

  const getFeastDisplayName = (feast: Feast) => {
    if (feast.isDominican) {
      return `${feast.name}, OP`;
    }
    return feast.name;
  };

  const getFeastRankText = (feast: Feast) => {
    if (feast.isDominican) {
      return 'Dominican Saint';
    }
    return feast.rank.charAt(0).toUpperCase() + feast.rank.slice(1);
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
        {/* Date Section */}
        <View style={styles.dateSection}>
          <Text style={styles.seasonEmoji}>
            {getSeasonEmoji(liturgicalDay.season.name)}
          </Text>
          <View style={styles.dateTextContainer}>
            <Text style={[
              styles.dateText, 
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              {format(parseISO(liturgicalDay.date), 'EEEE, MMMM d, yyyy')}
            </Text>
            <Text style={[
              styles.seasonText, 
              { color: Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              {liturgicalDay.season.name} • Week {liturgicalDay.week}
            </Text>
          </View>
          {showDatePicker && (
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={showDatePickerModal}
            >
              <Ionicons 
                name="calendar-outline" 
                size={24} 
                color={Colors[colorScheme ?? 'light'].primary} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Feast Section */}
        {primaryFeast && (
          <View style={styles.feastSection}>
            <Text style={styles.feastEmoji}>
              {getFeastEmoji(primaryFeast)}
            </Text>
            <View style={styles.feastTextContainer}>
              <Text style={[
                styles.feastName, 
                { color: Colors[colorScheme ?? 'light'].text }
              ]}>
                {getFeastDisplayName(primaryFeast)}
              </Text>
              <Text style={[
                styles.feastRank, 
                { color: Colors[colorScheme ?? 'light'].textSecondary }
              ]}>
                {getFeastRankText(primaryFeast)}
              </Text>
            </View>
          </View>
        )}

        {/* Additional Feasts */}
        {liturgicalDay.feasts.length > 1 && (
          <View style={styles.additionalFeasts}>
            <Text style={[
              styles.additionalFeastsText, 
              { color: Colors[colorScheme ?? 'light'].textSecondary }
            ]}>
              +{liturgicalDay.feasts.length - 1} more feasts
            </Text>
          </View>
        )}
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
    fontSize: 16,
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
