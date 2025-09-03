import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner';
import CommunityNavigation from '../../../components/CommunityNavigation';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { LiturgicalDay } from '../../../types';

export default function CalendarScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay, selectedDate, updateCalendarSelection } = useCalendar();
  const [markedDates, setMarkedDates] = useState<any>({});



  useEffect(() => {
    generateMarkedDates();
  }, [colorScheme, liturgicalDay]);

  const generateMarkedDates = () => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const marked: any = {};
    
    // Generate feast days for the current year
    const currentYear = new Date().getFullYear();
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day);
        const liturgicalDay = calendarService.getLiturgicalDay(date);
        
        if (liturgicalDay.feasts.length > 0) {
          const dateString = date.toISOString().split('T')[0];
          
          // Check if any feast is Dominican
          const hasDominicanFeast = liturgicalDay.feasts.some(feast => feast.isDominican);
          
          marked[dateString] = {
            marked: true,
            dotColor: hasDominicanFeast ? Colors[colorScheme ?? 'light'].primary : liturgicalDay.feasts[0].color,
            textColor: hasDominicanFeast ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].text,
          };
        }
      }
    }
    
    // Mark the selected date
    if (liturgicalDay) {
      const selectedDateString = new Date(liturgicalDay.date).toISOString().split('T')[0];
      marked[selectedDateString] = {
        ...marked[selectedDateString],
        selected: true,
        selectedColor: Colors[colorScheme ?? 'light'].primary,
        selectedTextColor: Colors[colorScheme ?? 'light'].dominicanWhite,
      };
    }
    
    setMarkedDates(marked);
  };

  const handleDayPress = (day: any) => {
    // Use dateString to avoid timezone issues - it represents the local date
    const [year, month, dayOfMonth] = day.dateString.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, dayOfMonth); // month is 0-indexed
    updateCalendarSelection(selectedDate);
    
    // Update marked dates to show new selection
    const newMarkedDates = { ...markedDates };
    Object.keys(newMarkedDates).forEach(key => {
      if (newMarkedDates[key].selected) {
        delete newMarkedDates[key].selected;
        delete newMarkedDates[key].selectedColor;
        delete newMarkedDates[key].selectedTextColor;
      }
    });
    
    const dateString = day.dateString;
    newMarkedDates[dateString] = {
      ...newMarkedDates[dateString],
      selected: true,
      selectedColor: Colors[colorScheme ?? 'light'].primary,
      selectedTextColor: Colors[colorScheme ?? 'light'].dominicanWhite,
    };
    
    setMarkedDates(newMarkedDates);
  };



  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <CommunityNavigation activeTab="calendar" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <CommunityNavigation activeTab="calendar" />
        
        {/* Liturgical Calendar */}
        <View style={[styles.calendarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Text style={[styles.calendarTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Liturgical Calendar
          </Text>
          
          {/* Calendar Component */}
          <Calendar
            current={liturgicalDay?.date || new Date().toISOString().split('T')[0]}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: Colors[colorScheme ?? 'light'].card,
              calendarBackground: Colors[colorScheme ?? 'light'].card,
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
            key={colorScheme}
          />

          {/* Calendar Legend */}
          <View style={[styles.calendarLegend, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.legendTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Calendar Legend
            </Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#8B0000' }]} />
                <Text style={[styles.legendText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Regular Feast
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} />
                <Text style={[styles.legendText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Dominican Feast
                </Text>
              </View>
            </View>
          </View>

          {/* Selected Date Info */}
          <View style={[styles.selectedDateInfo, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.selectedDateLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Selected Date
            </Text>
            <Text style={[styles.selectedDateText, { color: Colors[colorScheme ?? 'light'].text }]}>
              {new Date(liturgicalDay.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            
            {/* Liturgical Season */}
            <View style={[styles.seasonInfo, { backgroundColor: liturgicalDay.color }]}>
              <Text style={[styles.seasonName, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                {liturgicalDay.season.name}
              </Text>
              <Text style={[styles.seasonWeek, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                Week {liturgicalDay.week}
              </Text>
            </View>

            {/* Feasts for Selected Date */}
            {liturgicalDay.feasts.length > 0 && (
              <View style={styles.selectedFeasts}>
                <Text style={[styles.feastsLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Feasts
                </Text>
                {liturgicalDay.feasts.map((feast, index) => (
                  <View key={index} style={styles.selectedFeast}>
                    <View style={[styles.feastRank, { backgroundColor: feast.color }]}>
                      <Text style={[styles.feastRankText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                        {feast.rank.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.feastName, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {feast.name}
                    </Text>
                    {feast.isDominican && (
                      <Text style={[styles.dominicanIndicator, { color: Colors[colorScheme ?? 'light'].primary }]}>
                        ⚫⚪
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  calendarContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    fontFamily: 'Georgia',
  },
  calendarLegend: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  selectedDateInfo: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  selectedDateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  seasonInfo: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  seasonName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  seasonWeek: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  selectedFeasts: {
    marginTop: 16,
  },
  feastsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedFeast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feastRank: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  feastRankText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  feastName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'Georgia',
  },
  dominicanIndicator: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
});
